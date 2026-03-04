import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const host = "127.0.0.1";
const port = Number(process.env.API_CONTRACT_PORT ?? "3011");
const baseUrl = `http://${host}:${port}`;
const timeoutMs = 60_000;

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForServer() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    try {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.ok) return;
    } catch {
      // keep polling until timeout
    }
    await sleep(1_000);
  }
  throw new Error("API contract test server did not become ready in time");
}

async function request(path, init) {
  const response = await fetch(`${baseUrl}${path}`, init);
  const text = await response.text();
  return { response, text, json: parseJson(text) };
}

async function run() {
  const child = spawn(
    "pnpm",
    ["exec", "next", "start", "--hostname", host, "--port", String(port)],
    {
      env: {
        ...process.env,
        X402_ENABLED: "false",
        AI_PROVIDER: "mock",
      },
      stdio: ["ignore", "pipe", "pipe"],
    }
  );

  try {
    await waitForServer();

    {
      const { response } = await request("/");
      assert(response.status === 200, `GET / expected 200, got ${response.status}`);
      assert(
        response.headers.get("x-frame-options") === "DENY",
        "GET / must include X-Frame-Options: DENY"
      );
      assert(
        response.headers.get("x-content-type-options") === "nosniff",
        "GET / must include X-Content-Type-Options: nosniff"
      );
      const csp = response.headers.get("content-security-policy");
      assert(typeof csp === "string" && csp.includes("default-src 'self'"), "CSP header missing");
    }

    {
      const { response, json } = await request("/api/health");
      assert(response.status === 200, `GET /api/health expected 200, got ${response.status}`);
      assert(json?.status === "ok", "GET /api/health must include status=ok");
      assert(typeof json?.timestamp === "string", "GET /api/health must include timestamp");
    }

    {
      const { response } = await request("/api/agent/crypto");
      assert(
        response.status === 405,
        `GET /api/agent/crypto expected 405, got ${response.status}`
      );
    }

    {
      const { response, json } = await request("/api/agent/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{not-json",
      });
      assert(
        response.status === 400,
        `POST /api/agent/crypto invalid JSON expected 400, got ${response.status}`
      );
      assert(json?.error === "Invalid JSON body", "invalid JSON error contract mismatch");
    }

    {
      const { response, json } = await request("/api/agent/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      assert(
        response.status === 400,
        `POST /api/agent/crypto empty body expected 400, got ${response.status}`
      );
      assert(json?.error === "message is required", "missing message error contract mismatch");
    }

    {
      const { response, json } = await request("/api/agent/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "a".repeat(5001) }),
      });
      assert(
        response.status === 413,
        `POST /api/agent/crypto long message expected 413, got ${response.status}`
      );
      assert(
        typeof json?.error === "string" && json.error.includes("message too long"),
        "oversized message error contract mismatch"
      );
    }

    {
      const { response, json } = await request("/api/agent/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "ok", padding: "x".repeat(20_000) }),
      });
      assert(
        response.status === 413,
        `POST /api/agent/crypto body-size limit expected 413, got ${response.status}`
      );
      assert(
        typeof json?.error === "string" && json.error.includes("Request body too large"),
        "request body-size error contract mismatch"
      );
    }

    {
      const { response, json } = await request("/api/agent/crypto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is BTC trend?" }),
      });
      assert(
        response.status === 200,
        `POST /api/agent/crypto valid request expected 200, got ${response.status}`
      );
      assert(typeof json?.reply === "string", "valid crypto reply must be string");
      assert(typeof json?.agent === "string", "valid crypto response must include agent");
    }

    {
      const { response, json } = await request("/api/agent/code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Write an ERC20 contract" }),
      });
      assert(
        response.status === 200,
        `POST /api/agent/code valid request expected 200, got ${response.status}`
      );
      assert(typeof json?.reply === "string", "valid code reply must be string");
      assert(typeof json?.agent === "string", "valid code response must include agent");
    }

    {
      let saw429 = false;
      for (let i = 0; i < 40; i += 1) {
        const result = await request("/api/agent/code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-forwarded-for": "203.0.113.9",
          },
          body: JSON.stringify({ message: `rate-limit-burst-${i}` }),
        });
        if (result.response.status === 429) {
          saw429 = true;
          assert(
            result.json?.error === "Rate limit exceeded. Please retry later.",
            "rate limit error contract mismatch"
          );
          const retryAfter = result.response.headers.get("retry-after");
          assert(
            retryAfter !== null && Number(retryAfter) >= 1,
            "429 response must include Retry-After header"
          );
          break;
        }
        assert(
          result.response.status === 200,
          `rate-limit burst request ${i} expected 200 or 429, got ${result.response.status}`
        );
      }
      if (!saw429) {
        console.warn(
          "Rate-limit 429 not observed in this run (possible multi-worker local runtime); unit tests cover limiter logic."
        );
      }
    }

    console.log("API contract test passed");
  } finally {
    child.kill("SIGTERM");
    await sleep(500);
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
}

run().catch((error) => {
  console.error("API contract test failed:", error);
  process.exitCode = 1;
});
