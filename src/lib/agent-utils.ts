export function sanitizeAgentInput(text: string): string {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*>/gi, "");
}

export type MessageValidationResult =
  | { ok: true; sanitized: string }
  | { ok: false; status: 400 | 413; error: string };

export function validateAgentMessage(
  message: unknown,
  maxChars: number
): MessageValidationResult {
  if (typeof message !== "string" || message.trim().length === 0) {
    return { ok: false, status: 400, error: "message is required" };
  }

  if (message.length > maxChars) {
    return {
      ok: false,
      status: 413,
      error: `message too long (max ${maxChars} characters)`,
    };
  }

  const sanitized = sanitizeAgentInput(message).trim();
  if (!sanitized) {
    return { ok: false, status: 400, error: "message is empty after sanitization" };
  }

  return { ok: true, sanitized };
}

export function isCollaborationPayload(
  value: unknown
): value is { needs_collaboration: true; reason: string; query: string } {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.needs_collaboration === true &&
    typeof payload.reason === "string" &&
    typeof payload.query === "string" &&
    payload.reason.trim().length > 0 &&
    payload.query.trim().length > 0
  );
}
