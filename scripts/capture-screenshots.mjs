#!/usr/bin/env node

import { mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const assetsDir = join(rootDir, "docs", "assets");
const baseUrl = process.env.SCREENSHOT_BASE_URL ?? "http://127.0.0.1:3000";

const captures = [
  { path: "/", file: "home.png", waitMs: 4000 },
  { path: "/chat/crypto", file: "chat-crypto.png", waitMs: 5000 },
  { path: "/chat/code", file: "chat-code.png", waitMs: 5000 },
];

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: "inherit",
      env: process.env,
    });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) return resolve();
      reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
    });
  });
}

async function main() {
  await mkdir(assetsDir, { recursive: true });

  for (const capture of captures) {
    const url = `${baseUrl}${capture.path}`;
    const target = join(assetsDir, capture.file);
    await run("pnpm", [
      "exec",
      "playwright",
      "screenshot",
      "--browser",
      "chromium",
      "--viewport-size",
      "1280,800",
      "--wait-for-timeout",
      String(capture.waitMs),
      url,
      target,
    ]);
    console.log(`saved: ${target}`);
  }

  console.log(`all screenshots saved to: ${assetsDir}`);
}

main().catch((error) => {
  console.error("capture-screenshots failed:", error);
  process.exitCode = 1;
});
