import assert from "node:assert/strict";
import test from "node:test";
import {
  isCollaborationPayload,
  sanitizeAgentInput,
  validateAgentMessage,
} from "../../src/lib/agent-utils";

test("sanitizeAgentInput strips dangerous html patterns", () => {
  const input =
    '<script>alert(1)</script><img src="x" onerror="alert(2)">javascript:evil() hello';
  const sanitized = sanitizeAgentInput(input);

  assert.ok(!sanitized.toLowerCase().includes("<script"));
  assert.ok(!sanitized.toLowerCase().includes("onerror"));
  assert.ok(!sanitized.toLowerCase().includes("javascript:"));
  assert.ok(sanitized.includes("hello"));
});

test("validateAgentMessage rejects empty and non-string messages", () => {
  const empty = validateAgentMessage("   ", 100);
  const nonString = validateAgentMessage({ message: "x" }, 100);

  assert.deepEqual(empty, {
    ok: false,
    status: 400,
    error: "message is required",
  });
  assert.deepEqual(nonString, {
    ok: false,
    status: 400,
    error: "message is required",
  });
});

test("validateAgentMessage rejects oversized message", () => {
  const result = validateAgentMessage("a".repeat(11), 10);

  assert.deepEqual(result, {
    ok: false,
    status: 413,
    error: "message too long (max 10 characters)",
  });
});

test("validateAgentMessage rejects script-only payload after sanitization", () => {
  const result = validateAgentMessage("<script>alert(1)</script>", 200);

  assert.deepEqual(result, {
    ok: false,
    status: 400,
    error: "message is empty after sanitization",
  });
});

test("validateAgentMessage returns sanitized content for valid message", () => {
  const result = validateAgentMessage('Hello <img src=x onerror="x" /> world', 200);

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.sanitized, "Hello <img src=x  /> world");
  }
});

test("isCollaborationPayload validates expected structure", () => {
  const valid = {
    needs_collaboration: true,
    reason: "Need code help",
    query: "write solidity",
  };
  const invalid = {
    needs_collaboration: true,
    reason: "Need code help",
    query: 123,
  };

  assert.equal(isCollaborationPayload(valid), true);
  assert.equal(isCollaborationPayload(invalid), false);
  assert.equal(isCollaborationPayload(null), false);
});
