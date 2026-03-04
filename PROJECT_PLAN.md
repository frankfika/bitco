# Bitco Project Plan

Last updated: 2026-03-04

## Objective

Complete the project to a stable, runnable state with repeatable verification and a clear optimization roadmap.

## Definition of Done

- `pnpm verify` passes locally (lint + typecheck + build + smoke test).
- App can start successfully and return valid responses for:
  - `/`
  - `/api/agent/crypto`
  - `/api/agent/code`
- Build and runtime are not blocked by external font fetches or unstable default build mode.
- Team has a documented plan for continued optimization.

## Current Status

- [x] Fixed lint-blocking React hook issue in `Providers`.
- [x] Removed Google font network dependency to unblock offline/restricted builds.
- [x] Stabilized Next.js scripts on webpack mode.
- [x] Added `typecheck`, `test`, `test:smoke`, and `verify` scripts.
- [x] Added automated smoke test script at `scripts/smoke-test.mjs`.
- [x] Unified Next.js config to a single `next.config.js` source.
- [x] Added `GET /api/health` health-check endpoint.
- [x] Added API request-size and message-length guardrails.
- [x] Added GitHub Actions workflow to run `pnpm verify` on PR/push.
- [x] Added scheduled `Verify` workflow run for dependency-drift detection.
- [x] Added unit tests for input validation and mock AI routing.
- [x] Added API contract test for success and error branches.
- [x] `pnpm verify` is passing.

## Next 7-Day Optimization Plan

1. Testing Expansion
- Add tests for x402-enabled collaboration branch with mocked facilitator client.
- Add browser E2E flow for connect-wallet and chat interactions.

2. Security Hardening
- Review and tighten CSP (`script-src` currently allows inline/eval).
- Add rate limiting for agent endpoints.

3. Runtime Robustness
- Add structured logging for API failures and collaboration fallback cases.
- Add request correlation ID across API logs.

4. CI Automation
- Add branch protection rules requiring `Verify` workflow to pass.
- Ensure CODEOWNERS coverage for critical paths (`src/app/api`, `src/lib`).

## Execution Rhythm

- Daily: run `pnpm test` during development.
- Before merge: run `pnpm verify`.
- Weekly: review warnings, dependency updates, and test gaps.
