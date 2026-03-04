<div align="center">

# BitMind Lite
> A dual-agent paid collaboration demo on Bitcoin L2 with x402

![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)

[简体中文](./README.md) | __English__

</div>

## Introduction

BitMind Lite demonstrates a minimal Agent Economy loop: a user asks one agent, and when needed that agent can pay and consult another agent through the x402 protocol.

- Agent 1: `Crypto Agent` (crypto market / DeFi)
- Agent 2: `Code Agent` (Solidity / programming)
- Main flow: `User -> Crypto Agent -> Code Agent`

## Screenshots (With Descriptions)

> All screenshots are captured from the real running localhost app, not mocked content.

| Page | Screenshot | Description |
|------|------------|-------------|
| Home | ![BitMind home page showing two agent cards and collaboration flow](./docs/assets/home.png) | Figure 1: Entry page with two agent identity cards, project highlights, and collaboration path. |
| Crypto Chat | ![Crypto Agent chat page with message area and input box](./docs/assets/chat-crypto.png) | Figure 2: `/chat/crypto` page where users ask crypto questions and receive collaboration-aware responses. |
| Code Chat | ![Code Agent chat page with message area and input box](./docs/assets/chat-code.png) | Figure 3: `/chat/code` page for coding-focused queries and code-style outputs. |

## Core Features

1. Automatic dual-agent collaboration
- The primary agent can detect out-of-scope questions and delegate to the other agent.

2. x402 payment protection
- API routes support x402 resource protection with configurable demo/payment modes.

3. Security and robustness
- Input sanitization, message length limits, and request body size limits.
- Agent API rate limiting (`429` when exceeded, with `Retry-After` header).
- Unified health endpoint: `GET /api/health`.

4. Executable quality gates
- Full validation pipeline: `lint + typecheck + unit + build + smoke + api contract`.

## Tech Stack

- Next.js 16 + TypeScript + Tailwind CSS
- RainbowKit + wagmi + viem
- x402 (`@x402/next`, `@x402/fetch`)
- Vercel AI SDK (OpenAI / Anthropic / Mock)

## Quick Start

```bash
pnpm install
cp .env.local.example .env.local
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Testing and Quality Gates

```bash
# Static checks
pnpm run lint
pnpm run typecheck

# Unit tests
pnpm run test:unit

# Build
pnpm run build

# Smoke tests (home + core APIs)
pnpm run test:smoke

# API contract tests (success + failure branches)
pnpm run test:api

# One-command full verification
pnpm run verify
```

## Refresh README Screenshots

```bash
# 1) Start local app
pnpm dev

# 2) In another terminal, capture README screenshots
pnpm run docs:screenshots
```

Output directory: `docs/assets/`

## Key Endpoints

- `POST /api/agent/crypto`
- `POST /api/agent/code`
- `GET /api/health`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `OPENAI_API_KEY` | OpenAI API key |
| `ANTHROPIC_API_KEY` | Anthropic API key |
| `X402_ENABLED` | Enable x402 route protection (`true/false`) |
| `X402_PAY_TO` | x402 payout address |
| `MAX_REQUEST_BYTES` | Request body size limit (default `16384`) |
| `MAX_MESSAGE_CHARS` | Message length limit (default `4000`) |
| `AGENT_RATE_LIMIT_MAX_REQUESTS` | Max requests per `agent + client` in one window (default `30`) |
| `AGENT_RATE_LIMIT_WINDOW_MS` | Rate-limit window in milliseconds (default `60000`) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID |
