<div align="center">

# BitMind Lite

> AI Agents that Pay Each Other — Bitcoin L2 × x402 Protocol

![Home Screenshot](./docs/assets/home.png)

### Two AI agents. Automatic paid collaboration. One answer.

![Version](https://img.shields.io/badge/version-0.1.0-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square)
![Build](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square)

[Features](#core-capabilities) · [Screenshots](#screenshots) · [Quick Start](#quick-start) · [Env Vars](#environment-variables) · [API](#api-contract)

[简体中文](./README.md) | **English**

---

</div>

## What Is This?

BitMind Lite demonstrates a complete **Agent Economy** loop: two specialized AI agents automatically collaborate on Bitcoin L2, paying each other via the [x402 protocol](https://x402.org) to answer your questions.

| Agent | Specialty | On-chain Token |
|-------|-----------|----------------|
| **Crypto Agent** | Crypto markets, DeFi, blockchain trends | ERC-721 #1 |
| **Code Agent** | Solidity, smart contracts, Web3 development | ERC-721 #2 |

---

## Collaboration Flow

```
User
 │
 │  $0.001 via x402
 ▼
Crypto Agent ──── out of scope? ──── yes ──▶ pay & delegate to Code Agent
 │                                                   │  $0.001 (A2A)
 │  (direct answer)                                  ▼
 └──────────────────── merge answer ◀──── Code Agent replies
                              │
                              ▼
                   Final answer + payment flow sidebar
```

When a cross-domain question is detected (e.g. a coding question sent to Crypto Agent), the primary agent automatically fires an x402 paid request to the other agent. The user always receives one merged answer.

---

## Screenshots

| Home | Crypto Chat | Code Chat |
|------|-------------|-----------|
| ![Home](./docs/assets/home.png) | ![Crypto Agent](./docs/assets/chat-crypto.png) | ![Code Agent](./docs/assets/chat-code.png) |
| Two agent cards with how-it-works | Market/DeFi chat + suggested prompts | Solidity/dev chat + suggested prompts |

---

## Quick Start

**Prerequisites:** Node.js 18+, pnpm, at least one AI API key (OpenAI or Anthropic)

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment
cp .env.local.example .env.local
# Edit .env.local and add OPENAI_API_KEY or ANTHROPIC_API_KEY

# 3. Start
pnpm dev
```

Open `http://127.0.0.1:3000`

### Try Asking

**Crypto Agent (market / DeFi questions)**
- "What is DeFi liquidity mining?"
- "Explain Bitcoin L2 networks"
- "How does the x402 payment protocol work?"

**Code Agent (contract / dev questions)**
- "Write a simple ERC-20 token in Solidity"
- "How do I deploy a contract with Foundry?"
- "What's the difference between memory and storage in Solidity?"

> Ask Crypto Agent a coding question (or vice versa) to trigger the auto A2A payment collaboration flow.

---

## Project Plan Template (Proposal-ready)

You can copy this structure directly into a project proposal and replace org names/dates.

### 1) Project Objectives

- Goal: deliver a demo-ready and extensible dual-agent collaboration system with paid agent-to-agent interaction via x402
- Business value: specialized agents can collaborate and monetize independently instead of forcing one "do-everything" model
- Success criteria:
  - Cross-domain delegation triggers with expected accuracy
  - API reliability baseline met (health and contract tests stable)
  - Repeatable demo flow (local demo mode + optional payment mode)

### 2) Scope

- In Scope:
  - Crypto/Code dual agents
  - Automatic delegation + recursive delegation guard
  - x402 route protection + A2A paid fetch
  - Baseline security hardening (sanitization, rate limit, size/length caps)
- Out of Scope (phase 1):
  - Multi-agent orchestration platform (>2 agents)
  - Production-grade distributed rate limiting/observability platform
  - Multi-chain settlement and advanced reconciliation

### 3) Milestones (Sample 3 Weeks)

| Timeline | Milestone | Key Deliverables |
|----------|-----------|------------------|
| Week 1 | MVP Usable | Dual-agent chat, delegation trigger, stable mock mode |
| Week 2 | Payment Loop | `X402_ENABLED=true` route protection + A2A paid fetch |
| Week 3 | Engineering Sign-off | `verify` green, README/screenshots/demo scripts ready |

### 4) Deliverables

- Source repository and deployment guide
- API contract and test reports (unit/smoke/contract)
- Demo environment setup (`.env` template)
- Project documentation (bilingual README + architecture flow)

---

## Runtime Modes

| Mode | Switch | Behavior |
|------|--------|----------|
| Demo (default) | `X402_ENABLED=false` | No payment enforcement; collaboration uses local in-process logic |
| Payment | `X402_ENABLED=true` | Routes protected by x402; A2A calls use real HTTP with payment |

> If `X402_ENABLED=true` but x402 init fails, handlers fall back to direct execution to keep the service available.

---

## Core Capabilities

**Automatic dual-agent collaboration**
- Delegation driven by system prompts and collaboration payload detection
- Recursive delegation intercepted — prevents infinite delegation chains

**x402 resource protection**
- Route-level paid access via `@x402/next`
- Agent-to-agent paid fetch via `@x402/fetch`

**Security and robustness**
- Input sanitization (client + server) with message length limits (default 4000 chars)
- Request body size limit (default 16 KB)
- Fixed-window rate limiting keyed by `agent + client-ip` (default 30 req/min)
- Security response headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.)

**Executable quality gates**
- `lint + typecheck + unit + build + smoke + api contract`

---

## API Contract

| Endpoint | Method | Success | Common Failures |
|----------|--------|---------|-----------------|
| `/api/health` | `GET` | `200 {status:"ok"}` | — |
| `/api/agent/crypto` | `POST` | `200 {reply, agent[, collaboration]}` | `400` `413` `429` `500` |
| `/api/agent/code` | `POST` | `200 {reply, agent[, collaboration]}` | `400` `413` `429` `500` |

`GET /api/agent/*` returns `405` (Next Route Handler default).

---

## Testing & Quality Gates

```bash
pnpm run lint          # ESLint static checks
pnpm run typecheck     # TypeScript type checks
pnpm run test:unit     # Unit tests
pnpm run build         # Build verification
pnpm run test:smoke    # Smoke tests
pnpm run test:api      # API contract tests
pnpm run verify        # All of the above
```

---

## Tech Stack

- **Framework**: Next.js 16 + TypeScript + Tailwind CSS
- **Web3**: RainbowKit + wagmi + viem
- **Payments**: x402 (`@x402/next`, `@x402/fetch`)
- **AI**: Vercel AI SDK (OpenAI / Anthropic / Mock)
- **Contracts**: Foundry (Solidity ERC-721)

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `auto` | `auto/openai/anthropic/mock` |
| `OPENAI_API_KEY` | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `X402_ENABLED` | `false` | Enable x402 route protection |
| `X402_FACILITATOR_URL` | `https://facilitator.x402.org` | x402 facilitator URL |
| `X402_PAY_TO` | `0x000...000` | x402 payout address |
| `AGENT_PRIVATE_KEY` | — | Required for A2A payment signing when `X402_ENABLED=true` |
| `MAX_REQUEST_BYTES` | `16384` | Max request body size in bytes |
| `MAX_MESSAGE_CHARS` | `4000` | Max `message` length in characters |
| `AGENT_RATE_LIMIT_MAX_REQUESTS` | `30` | Max requests per window (keyed by `agent + client-ip`) |
| `AGENT_RATE_LIMIT_WINDOW_MS` | `60000` | Rate-limit window in milliseconds |
| `NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS` | `0x000...000` | AgentRegistry contract address |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `demo` | WalletConnect project ID |

---

## Usability Troubleshooting (5 minutes)

If the app "feels unusable", check these in order:

1. Start from Demo mode first (most stable local path)
   - `AI_PROVIDER=mock`
   - `X402_ENABLED=false`
2. Avoid placeholder keys triggering real-provider calls
   - With `AI_PROVIDER=auto`, invalid placeholder values in `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` can cause 500 errors
   - For local dev, prefer forcing `AI_PROVIDER=mock`
3. Before enabling x402, verify required payment env vars
   - With `X402_ENABLED=true`, provide a valid `AGENT_PRIVATE_KEY`
   - Also verify `X402_PAY_TO` and facilitator config
4. Run minimal backend checks
   - `curl http://127.0.0.1:3000/api/health`
   - `curl -X POST http://127.0.0.1:3000/api/agent/crypto -H 'content-type: application/json' -d '{"message":"hello"}'`
5. If you see intermittent `429`
   - Tune `AGENT_RATE_LIMIT_MAX_REQUESTS` / `AGENT_RATE_LIMIT_WINDOW_MS`

---

## Smart Contracts

Contract folder: `contracts/`

- `AgentRegistry.sol`: ERC-721 based registry for agent identity and metadata
- `Deploy.s.sol`: Foundry deploy script that mints two sample agents

---

## Known Limits

- The rate limiter is process-memory based — not shared across multiple instances
- For horizontally scaled production, replace with centralized storage (e.g. Redis)

---

## Refresh README Screenshots

```bash
# Terminal 1: start app
pnpm dev

# Terminal 2: capture
pnpm run docs:screenshots
```

Output: `docs/assets/`
