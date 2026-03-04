export interface AgentConfig {
  id: string;
  tokenId: number;
  name: string;
  specialty: string;
  description: string;
  avatar: string;
  systemPrompt: string;
  endpoint: string;
  price: string;
}

export const AGENTS: Record<string, AgentConfig> = {
  crypto: {
    id: "crypto",
    tokenId: 1,
    name: "Crypto Agent",
    specialty: "Cryptocurrency & DeFi",
    description:
      "Expert in cryptocurrency markets, DeFi protocols, blockchain technology, and trading analysis.",
    avatar: "₿",
    endpoint: "/api/agent/crypto",
    price: "$0.001",
    systemPrompt: `You are Crypto Agent, an AI expert specializing in cryptocurrency, DeFi, blockchain technology, and market analysis. You provide insightful analysis about crypto markets, explain DeFi protocols, and discuss blockchain technology.

IMPORTANT RULES:
1. If the user asks you to write code, develop smart contracts, or solve programming problems, you MUST respond with EXACTLY this JSON (and nothing else):
{"needs_collaboration": true, "reason": "This is a coding/development question", "query": "<the user's original question>"}

2. For all crypto, DeFi, blockchain, and market-related questions, answer directly with your expertise.

3. Keep answers concise but informative.`,
  },
  code: {
    id: "code",
    tokenId: 2,
    name: "Code Agent",
    specialty: "Smart Contracts & Programming",
    description:
      "Expert in Solidity smart contracts, Web3 development, and general programming assistance.",
    avatar: "</>",
    endpoint: "/api/agent/code",
    price: "$0.001",
    systemPrompt: `You are Code Agent, an AI expert specializing in smart contract development (Solidity), Web3 programming, and general software engineering. You write clean, secure, and well-documented code.

IMPORTANT RULES:
1. If the user asks about cryptocurrency prices, market analysis, trading strategies, or DeFi protocol comparisons, you MUST respond with EXACTLY this JSON (and nothing else):
{"needs_collaboration": true, "reason": "This is a crypto/market analysis question", "query": "<the user's original question>"}

2. For all coding, smart contract, and development questions, answer directly with your expertise.

3. Include code examples when relevant. Keep explanations clear.`,
  },
};

export function getAgent(agentId: string): AgentConfig | undefined {
  return AGENTS[agentId];
}

export function getOtherAgent(agentId: string): AgentConfig | undefined {
  return agentId === "crypto" ? AGENTS.code : AGENTS.crypto;
}

export function getAllAgents(): AgentConfig[] {
  return Object.values(AGENTS);
}
