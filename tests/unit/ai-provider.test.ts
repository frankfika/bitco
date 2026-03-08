import assert from "node:assert/strict";
import test from "node:test";
import { generateAgentResponse } from "../../src/lib/ai-provider";
import { AGENTS } from "../../src/lib/agents";

test("mock crypto agent requests collaboration for code questions", async () => {
  const previous = process.env.AI_PROVIDER;
  process.env.AI_PROVIDER = "mock";

  try {
    const response = await generateAgentResponse(
      AGENTS.crypto,
      "Please write a Solidity smart contract"
    );
    const parsed = JSON.parse(response.text) as {
      needs_collaboration: boolean;
      reason: string;
      query: string;
    };

    assert.equal(parsed.needs_collaboration, true);
    assert.equal(parsed.query, "Please write a Solidity smart contract");
  } finally {
    process.env.AI_PROVIDER = previous;
  }
});

test("mock code agent requests collaboration for crypto questions", async () => {
  const previous = process.env.AI_PROVIDER;
  process.env.AI_PROVIDER = "mock";

  try {
    const response = await generateAgentResponse(AGENTS.code, "What's BTC trend?");
    const parsed = JSON.parse(response.text) as {
      needs_collaboration: boolean;
      reason: string;
      query: string;
    };

    assert.equal(parsed.needs_collaboration, true);
    assert.equal(parsed.query, "What's BTC trend?");
  } finally {
    process.env.AI_PROVIDER = previous;
  }
});

test("mock crypto agent returns analysis text for crypto question", async () => {
  const previous = process.env.AI_PROVIDER;
  process.env.AI_PROVIDER = "mock";

  try {
    const response = await generateAgentResponse(AGENTS.crypto, "Share BTC outlook");
    assert.ok(response.text.includes("[Demo Mode] As Crypto Agent"));
    assert.ok(!response.text.trim().startsWith("{"));
  } finally {
    process.env.AI_PROVIDER = previous;
  }
});

test("mock code agent returns code answer for coding question", async () => {
  const previous = process.env.AI_PROVIDER;
  process.env.AI_PROVIDER = "mock";

  try {
    const response = await generateAgentResponse(AGENTS.code, "Write an ERC20");
    assert.ok(response.text.includes("[Demo Mode] As Code Agent"));
    assert.ok(response.text.includes("contract Example"));
  } finally {
    process.env.AI_PROVIDER = previous;
  }
});

test("auto provider treats placeholder OPENAI_API_KEY as missing and falls back to mock", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousOpenAI = process.env.OPENAI_API_KEY;
  const previousAnthropic = process.env.ANTHROPIC_API_KEY;

  process.env.AI_PROVIDER = "auto";
  process.env.OPENAI_API_KEY = "sk-xxx";
  process.env.ANTHROPIC_API_KEY = "";

  try {
    const response = await generateAgentResponse(AGENTS.crypto, "Share BTC outlook");
    assert.ok(response.text.includes("[Demo Mode] As Crypto Agent"));
  } finally {
    process.env.AI_PROVIDER = previousProvider;
    process.env.OPENAI_API_KEY = previousOpenAI;
    process.env.ANTHROPIC_API_KEY = previousAnthropic;
  }
});

test("openai provider requires a real OPENAI_API_KEY", async () => {
  const previousProvider = process.env.AI_PROVIDER;
  const previousOpenAI = process.env.OPENAI_API_KEY;

  process.env.AI_PROVIDER = "openai";
  process.env.OPENAI_API_KEY = "";

  try {
    await assert.rejects(
      () => generateAgentResponse(AGENTS.crypto, "Share BTC outlook"),
      /OPENAI_API_KEY is required when AI_PROVIDER=openai/i
    );
  } finally {
    process.env.AI_PROVIDER = previousProvider;
    process.env.OPENAI_API_KEY = previousOpenAI;
  }
});
