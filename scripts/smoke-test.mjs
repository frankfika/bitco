import { spawn } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const host = "127.0.0.1";
const port = Number(process.env.SMOKE_PORT ?? "3010");
const baseUrl = `http://${host}:${port}`;
const timeoutMs = 60_000;

function safeParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function waitForServer(url, timeout) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeout) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // ignore until timeout
    }
    await sleep(1_000);
  }
  throw new Error(`Server did not become ready in ${timeout}ms`);
}

async function expectJsonEndpoint(path, body) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Expected 2xx from ${path}, got ${response.status}: ${text}`);
  }

  const text = await response.text();
  const json = safeParseJson(text);
  if (!json || typeof json.reply !== "string") {
    throw new Error(`Invalid JSON reply from ${path}: ${text}`);
  }
}

async function expectStatus(path, expectedStatus, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, options);
  if (response.status !== expectedStatus) {
    const text = await response.text();
    throw new Error(
      `Expected ${expectedStatus} from ${path}, got ${response.status}: ${text}`
    );
  }
  return response;
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

  let logs = "";
  child.stdout.on("data", (chunk) => {
    logs += chunk.toString();
    if (logs.length > 8_000) logs = logs.slice(-8_000);
  });
  child.stderr.on("data", (chunk) => {
    logs += chunk.toString();
    if (logs.length > 8_000) logs = logs.slice(-8_000);
  });

  try {
    await waitForServer(baseUrl, timeoutMs);

    const home = await fetch(baseUrl);
    if (!home.ok) {
      throw new Error(`GET / failed with ${home.status}`);
    }

    const health = await expectStatus("/api/health", 200);
    const healthJson = safeParseJson(await health.text());
    if (!healthJson || healthJson.status !== "ok") {
      throw new Error("GET /api/health returned unexpected payload");
    }

    await expectJsonEndpoint("/api/agent/crypto", { message: "what is btc trend?" });
    await expectJsonEndpoint("/api/agent/code", { message: "write an ERC20 contract" });
    await expectStatus("/api/agent/crypto", 400, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "   " }),
    });

    console.log("Smoke test passed:");
    console.log(`- ${baseUrl}/`);
    console.log(`- ${baseUrl}/api/health`);
    console.log(`- ${baseUrl}/api/agent/crypto`);
    console.log(`- ${baseUrl}/api/agent/code`);
  } finally {
    child.kill("SIGTERM");
    await sleep(500);
    if (!child.killed) {
      child.kill("SIGKILL");
    }
  }
}

run().catch((error) => {
  console.error("Smoke test failed:", error);
  process.exitCode = 1;
});
