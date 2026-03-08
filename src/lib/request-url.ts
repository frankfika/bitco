import type { NextRequest } from "next/server";

const APP_BASE_URL_ENV = "APP_BASE_URL";

function firstHeaderValue(raw: string): string {
  return raw.split(",")[0]?.trim() ?? "";
}

function normalizeHost(host: string): string {
  const first = firstHeaderValue(host).toLowerCase();
  if (first.startsWith("[")) {
    const idx = first.indexOf("]");
    return idx >= 0 ? first.slice(1, idx) : first;
  }
  return first.split(":")[0] ?? first;
}

function isLocalHost(host: string): boolean {
  const normalized = normalizeHost(host);
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized === "::1"
  );
}

function getForwardedProtocol(request: NextRequest): "http" | "https" | null {
  const raw = request.headers.get("x-forwarded-proto");
  if (!raw) return null;

  const first = firstHeaderValue(raw).toLowerCase();
  if (first === "http" || first === "https") return first;
  return null;
}

function getConfiguredBaseUrl(): string | null {
  const configured = process.env[APP_BASE_URL_ENV]?.trim();
  if (!configured) return null;

  try {
    const parsed = new URL(configured);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }
    return parsed.origin;
  } catch {
    return null;
  }
}

function sanitizeHost(host: string | null): string | null {
  if (!host) return null;
  const first = firstHeaderValue(host);
  if (!first || /[\/\\\s@]/.test(first) || first.includes("://")) return null;

  try {
    // Validate and normalize host/port without trusting arbitrary URL parts.
    const parsed = new URL(`http://${first}`);
    if (parsed.username || parsed.password) return null;
    return parsed.host || null;
  } catch {
    return null;
  }
}

export function getRequestBaseUrl(request: NextRequest): string {
  const configuredBaseUrl = getConfiguredBaseUrl();
  if (configuredBaseUrl) return configuredBaseUrl;

  const host =
    sanitizeHost(request.headers.get("x-forwarded-host")) ??
    sanitizeHost(request.headers.get("host")) ??
    "localhost:3000";

  const protocol = getForwardedProtocol(request) ?? (isLocalHost(host) ? "http" : "https");
  return `${protocol}://${host}`;
}
