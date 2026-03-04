import type { AgentConfig } from "./agents";

interface AIResponse {
  text: string;
}

/**
 * Generate AI response using the configured provider.
 * Falls back to mock responses when no API key is available.
 */
export async function generateAgentResponse(
  agent: AgentConfig,
  message: string
): Promise<AIResponse> {
  const provider = process.env.AI_PROVIDER ?? "auto";

  if (provider === "openai" || (provider === "auto" && process.env.OPENAI_API_KEY)) {
    return generateWithOpenAI(agent, message);
  }

  if (provider === "anthropic" || (provider === "auto" && process.env.ANTHROPIC_API_KEY)) {
    return generateWithAnthropic(agent, message);
  }

  // Mock mode: simulate AI behavior for demo/testing
  return generateMock(agent, message);
}

async function generateWithOpenAI(
  agent: AgentConfig,
  message: string
): Promise<AIResponse> {
  const { openai } = await import("@ai-sdk/openai");
  const { generateText } = await import("ai");

  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    system: agent.systemPrompt,
    prompt: message,
  });

  return { text };
}

async function generateWithAnthropic(
  agent: AgentConfig,
  message: string
): Promise<AIResponse> {
  const { anthropic } = await import("@ai-sdk/anthropic");
  const { generateText } = await import("ai");

  const { text } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: agent.systemPrompt,
    prompt: message,
  });

  return { text };
}

/**
 * Mock AI for testing without API keys.
 * Simulates agent behavior including collaboration triggers.
 */
function generateMock(
  agent: AgentConfig,
  message: string
): AIResponse {
  const lowerMsg = message.toLowerCase();
  const isCryptoAgent = agent.id === "crypto";

  // Simulate collaboration detection
  if (isCryptoAgent && isCodeQuestion(lowerMsg)) {
    return {
      text: JSON.stringify({
        needs_collaboration: true,
        reason: "This is a coding/development question",
        query: message,
      }),
    };
  }

  if (!isCryptoAgent && isCryptoQuestion(lowerMsg)) {
    return {
      text: JSON.stringify({
        needs_collaboration: true,
        reason: "This is a crypto/market analysis question",
        query: message,
      }),
    };
  }

  // Normal mock responses
  if (isCryptoAgent) {
    return {
      text: `[Demo Mode] As Crypto Agent, here's my analysis on "${message}":\n\nBitcoin continues to demonstrate strong fundamentals. The current market shows interesting patterns with institutional adoption growing steadily. Key factors to watch include regulatory developments, ETF flows, and on-chain metrics showing healthy accumulation patterns.\n\n*Note: This is a mock response for demo purposes. Connect a real AI provider (OpenAI/Anthropic) for actual analysis.*`,
    };
  }

  return {
    text: `[Demo Mode] As Code Agent, here's my response to "${message}":\n\n\`\`\`solidity\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.20;\n\n// Example smart contract\ncontract Example {\n    mapping(address => uint256) public balances;\n    \n    function deposit() external payable {\n        balances[msg.sender] += msg.value;\n    }\n}\n\`\`\`\n\n*Note: This is a mock response for demo purposes. Connect a real AI provider for actual code generation.*`,
  };
}

function isCodeQuestion(msg: string): boolean {
  const codeKeywords = [
    "code", "solidity", "contract", "function", "program",
    "write", "implement", "develop", "bug", "error", "debug",
    "javascript", "typescript", "python", "rust", "代码", "合约",
    "编程", "开发", "写一个", "实现",
  ];
  return codeKeywords.some((kw) => msg.includes(kw));
}

function isCryptoQuestion(msg: string): boolean {
  const cryptoKeywords = [
    "bitcoin", "btc", "ethereum", "eth", "price", "market",
    "trading", "defi", "token", "crypto", "blockchain", "挖矿",
    "行情", "价格", "走势", "投资", "币",
  ];
  return cryptoKeywords.some((kw) => msg.includes(kw));
}
