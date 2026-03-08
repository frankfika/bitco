import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import type { NextRequest } from "next/server";
import { handleAgentRequest } from "../../src/lib/agent-handler";
import { AGENTS } from "../../src/lib/agents";

const nodeRequire = createRequire(__filename);

type X402ClientModule = {
  getAgentFetch: () => (input: string | URL | Request, init?: RequestInit) => Promise<Response>;
};

type AIProviderModule = {
  generateAgentResponse: (
    agent: unknown,
    message: string
  ) => Promise<{ text: string }>;
};

function getX402ClientModule(): X402ClientModule {
  return nodeRequire("../../src/lib/x402-client") as X402ClientModule;
}

function getAIProviderModule(): AIProviderModule {
  return nodeRequire("../../src/lib/ai-provider") as AIProviderModule;
}

function mockRequest(
  message: unknown,
  headers: Record<string, string | undefined>
): NextRequest {
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
    async json() {
      return { message };
    },
  } as unknown as NextRequest;
}

test("handleAgentRequest uses x402 fetch when collaboration is required", async (t) => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousX402 = process.env.X402_ENABLED;
  const previousBaseUrl = process.env.APP_BASE_URL;

  process.env.AI_PROVIDER = "mock";
  process.env.X402_ENABLED = "true";
  process.env.APP_BASE_URL = "https://agents.example.com/base-path";

  let calledUrl = "";
  let calledBody = "";
  const x402Client = getX402ClientModule();

  t.mock.method(x402Client, "getAgentFetch", () => {
    return async (
      input: string | URL | Request,
      init?: RequestInit
    ): Promise<Response> => {
      calledUrl = String(input);
      calledBody = String(init?.body ?? "");
      return new Response(
        JSON.stringify({ reply: "Delegated response from code agent" }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        }
      );
    };
  });

  try {
    const response = await handleAgentRequest(
      mockRequest("Please write a Solidity smart contract", {
        host: "localhost:3000",
        "x-forwarded-for": "198.51.100.10",
      }),
      AGENTS.crypto
    );

    assert.equal(response.status, 200);
    const payload = (await response.json()) as {
      reply: string;
      agent: string;
      collaboration?: {
        from: string;
        to: string;
        reason: string;
        failed?: boolean;
      };
    };

    assert.equal(calledUrl, "https://agents.example.com/api/agent/code");
    assert.deepEqual(JSON.parse(calledBody), {
      message: "Please write a Solidity smart contract",
    });
    assert.equal(payload.reply, "Delegated response from code agent");
    assert.equal(payload.agent, "Crypto Agent");
    assert.deepEqual(payload.collaboration, {
      from: "Crypto Agent",
      to: "Code Agent",
      reason: "This is a coding/development question",
      price: "$0.001",
    });
  } finally {
    process.env.AI_PROVIDER = previousProvider;
    process.env.X402_ENABLED = previousX402;
    process.env.APP_BASE_URL = previousBaseUrl;
  }
});

test("handleAgentRequest returns failed collaboration when x402 downstream is non-JSON", async (t) => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousX402 = process.env.X402_ENABLED;

  process.env.AI_PROVIDER = "mock";
  process.env.X402_ENABLED = "true";
  const x402Client = getX402ClientModule();

  t.mock.method(x402Client, "getAgentFetch", () => {
    return async (): Promise<Response> =>
      new Response("this is not json", {
        status: 200,
        headers: { "content-type": "text/plain" },
      });
  });

  try {
    const response = await handleAgentRequest(
      mockRequest("Please write a Solidity contract", {
        host: "localhost:3000",
        "x-forwarded-for": "198.51.100.11",
      }),
      AGENTS.crypto
    );

    assert.equal(response.status, 200);
    const payload = (await response.json()) as {
      reply: string;
      collaboration: { failed: boolean; error: string };
    };

    assert.equal(payload.collaboration.failed, true);
    assert.match(
      payload.collaboration.error,
      /not valid JSON/i
    );
    assert.match(payload.reply, /couldn't reach/i);
  } finally {
    process.env.AI_PROVIDER = previousProvider;
    process.env.X402_ENABLED = previousX402;
  }
});

test("handleAgentRequest blocks invalid generated collaboration query before x402 call", async (t) => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousX402 = process.env.X402_ENABLED;

  process.env.AI_PROVIDER = "mock";
  process.env.X402_ENABLED = "true";
  const aiProvider = getAIProviderModule();
  const x402Client = getX402ClientModule();
  let fetchCalled = false;

  t.mock.method(aiProvider, "generateAgentResponse", async () => {
    return {
      text: JSON.stringify({
        needs_collaboration: true,
        reason: "generated query needs delegation",
        query: "<script>alert(1)</script>",
      }),
    };
  });

  t.mock.method(x402Client, "getAgentFetch", () => {
    fetchCalled = true;
    return async (): Promise<Response> =>
      new Response(JSON.stringify({ reply: "should not be called" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
  });

  try {
    const response = await handleAgentRequest(
      mockRequest("anything valid", {
        host: "localhost:3000",
        "x-forwarded-for": "198.51.100.12",
      }),
      AGENTS.crypto
    );

    assert.equal(response.status, 200);
    const payload = (await response.json()) as {
      collaboration: { failed: boolean; error: string };
    };

    assert.equal(fetchCalled, false);
    assert.equal(payload.collaboration.failed, true);
    assert.match(payload.collaboration.error, /empty after sanitization/i);
  } finally {
    process.env.AI_PROVIDER = previousProvider;
    process.env.X402_ENABLED = previousX402;
  }
});
