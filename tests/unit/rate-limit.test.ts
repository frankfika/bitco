import assert from "node:assert/strict";
import test from "node:test";
import { FixedWindowRateLimiter } from "../../src/lib/rate-limit";

test("FixedWindowRateLimiter allows up to the configured limit", () => {
  const limiter = new FixedWindowRateLimiter(3, 60_000);
  const now = 1_000;

  assert.equal(limiter.check("agent:ip", now).allowed, true);
  assert.equal(limiter.check("agent:ip", now + 1).allowed, true);
  assert.equal(limiter.check("agent:ip", now + 2).allowed, true);

  const blocked = limiter.check("agent:ip", now + 3);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds > 0, true);
});

test("FixedWindowRateLimiter resets after window elapses", () => {
  const limiter = new FixedWindowRateLimiter(2, 1_000);
  const now = 2_000;

  assert.equal(limiter.check("k", now).allowed, true);
  assert.equal(limiter.check("k", now + 100).allowed, true);
  assert.equal(limiter.check("k", now + 200).allowed, false);

  const afterReset = limiter.check("k", now + 1_001);
  assert.equal(afterReset.allowed, true);
  assert.equal(afterReset.remaining, 1);
});

test("FixedWindowRateLimiter isolates different keys", () => {
  const limiter = new FixedWindowRateLimiter(1, 60_000);
  const now = 3_000;

  assert.equal(limiter.check("crypto:ipA", now).allowed, true);
  assert.equal(limiter.check("crypto:ipA", now + 1).allowed, false);
  assert.equal(limiter.check("crypto:ipB", now + 2).allowed, true);
  assert.equal(limiter.check("code:ipA", now + 3).allowed, true);
});

test("FixedWindowRateLimiter can be disabled with non-positive config", () => {
  const disabledByMax = new FixedWindowRateLimiter(0, 60_000);
  const disabledByWindow = new FixedWindowRateLimiter(2, 0);

  assert.equal(disabledByMax.check("k").allowed, true);
  assert.equal(disabledByWindow.check("k").allowed, true);
});
