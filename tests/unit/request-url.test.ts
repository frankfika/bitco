import assert from "node:assert/strict";
import test from "node:test";
import type { NextRequest } from "next/server";
import { getRequestBaseUrl } from "../../src/lib/request-url";

function mockRequest(headers: Record<string, string | undefined>): NextRequest {
  const map = new Map<string, string>();
  for (const [name, value] of Object.entries(headers)) {
    if (value !== undefined) {
      map.set(name.toLowerCase(), value);
    }
  }

  return {
    headers: {
      get(name: string) {
        return map.get(name.toLowerCase()) ?? null;
      },
    },
  } as unknown as NextRequest;
}

test("getRequestBaseUrl uses http for localhost and loopback hosts", () => {
  assert.equal(
    getRequestBaseUrl(mockRequest({ host: "localhost:3000" })),
    "http://localhost:3000"
  );
  assert.equal(
    getRequestBaseUrl(mockRequest({ host: "127.0.0.1:3000" })),
    "http://127.0.0.1:3000"
  );
  assert.equal(
    getRequestBaseUrl(mockRequest({ host: "[::1]:3000" })),
    "http://[::1]:3000"
  );
});

test("getRequestBaseUrl defaults to https for non-local hosts", () => {
  assert.equal(
    getRequestBaseUrl(mockRequest({ host: "bitmind.example.com" })),
    "https://bitmind.example.com"
  );
});

test("getRequestBaseUrl respects forwarded proto and forwarded host", () => {
  const req = mockRequest({
    host: "internal.service.local",
    "x-forwarded-host": "api.bitmind.example.com",
    "x-forwarded-proto": "https,http",
  });

  assert.equal(
    getRequestBaseUrl(req),
    "https://api.bitmind.example.com"
  );
});

test("getRequestBaseUrl uses the first forwarded host value", () => {
  const req = mockRequest({
    host: "internal.service.local",
    "x-forwarded-host": "api.bitmind.example.com, edge.node.local",
    "x-forwarded-proto": "https",
  });

  assert.equal(
    getRequestBaseUrl(req),
    "https://api.bitmind.example.com"
  );
});

test("getRequestBaseUrl prefers APP_BASE_URL when configured", () => {
  const previous = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = "https://agents.bitmind.example.com/path?x=1";

  try {
    const req = mockRequest({
      host: "localhost:3000",
      "x-forwarded-host": "api.bitmind.example.com",
      "x-forwarded-proto": "http",
    });
    assert.equal(
      getRequestBaseUrl(req),
      "https://agents.bitmind.example.com"
    );
  } finally {
    process.env.APP_BASE_URL = previous;
  }
});

test("getRequestBaseUrl ignores invalid APP_BASE_URL values", () => {
  const previous = process.env.APP_BASE_URL;
  process.env.APP_BASE_URL = "not-a-valid-url";

  try {
    const req = mockRequest({
      host: "localhost:3000",
    });
    assert.equal(
      getRequestBaseUrl(req),
      "http://localhost:3000"
    );
  } finally {
    process.env.APP_BASE_URL = previous;
  }
});
