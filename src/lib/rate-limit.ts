import type { NextRequest } from "next/server";

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

interface Bucket {
  count: number;
  windowStartedAtMs: number;
}

export class FixedWindowRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number
  ) {}

  check(key: string, nowMs = Date.now()): RateLimitDecision {
    if (this.maxRequests <= 0 || this.windowMs <= 0) {
      return {
        allowed: true,
        remaining: Number.MAX_SAFE_INTEGER,
        retryAfterSeconds: 0,
      };
    }

    const existing = this.buckets.get(key);
    if (!existing || nowMs - existing.windowStartedAtMs >= this.windowMs) {
      this.buckets.set(key, { count: 1, windowStartedAtMs: nowMs });
      this.cleanup(nowMs);
      return {
        allowed: true,
        remaining: Math.max(this.maxRequests - 1, 0),
        retryAfterSeconds: 0,
      };
    }

    if (existing.count < this.maxRequests) {
      existing.count += 1;
      return {
        allowed: true,
        remaining: Math.max(this.maxRequests - existing.count, 0),
        retryAfterSeconds: 0,
      };
    }

    const msToReset = Math.max(
      existing.windowStartedAtMs + this.windowMs - nowMs,
      0
    );
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil(msToReset / 1000)),
    };
  }

  private cleanup(nowMs: number) {
    if (this.buckets.size <= 1000) return;
    for (const [key, bucket] of this.buckets.entries()) {
      if (nowMs - bucket.windowStartedAtMs > this.windowMs * 2) {
        this.buckets.delete(key);
      }
    }
  }
}

function getClientAddress(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function parseRateLimitNumber(raw: string | undefined, fallback: number): number {
  if (raw === undefined) return fallback;
  const normalized = raw.trim();
  if (normalized.length === 0) return fallback;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.trunc(parsed);
}

const AGENT_RATE_LIMIT_MAX_REQUESTS = parseRateLimitNumber(
  process.env.AGENT_RATE_LIMIT_MAX_REQUESTS,
  30
);
const AGENT_RATE_LIMIT_WINDOW_MS = parseRateLimitNumber(
  process.env.AGENT_RATE_LIMIT_WINDOW_MS,
  60_000
);

const agentLimiter = new FixedWindowRateLimiter(
  AGENT_RATE_LIMIT_MAX_REQUESTS,
  AGENT_RATE_LIMIT_WINDOW_MS
);

export function checkAgentRateLimit(
  request: NextRequest,
  agentId: string
): RateLimitDecision {
  const clientKey = getClientAddress(request);
  return agentLimiter.check(`${agentId}:${clientKey}`);
}
