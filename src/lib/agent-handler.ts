import { NextRequest, NextResponse } from "next/server";
import type { AgentConfig } from "./agents";
import { getOtherAgent } from "./agents";
import { generateAgentResponse } from "./ai-provider";
import {
  isCollaborationPayload,
  sanitizeAgentInput,
  validateAgentMessage,
} from "./agent-utils";
import { checkAgentRateLimit } from "./rate-limit";
import { getRequestBaseUrl } from "./request-url";

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

const MAX_REQUEST_BYTES = parsePositiveInt(process.env.MAX_REQUEST_BYTES, 16384);
const MAX_MESSAGE_CHARS = parsePositiveInt(process.env.MAX_MESSAGE_CHARS, 4000);

function getContentLength(request: NextRequest): number | null {
  const raw = request.headers.get("content-length");
  if (!raw) return null;
  const length = Number(raw);
  return Number.isFinite(length) && length >= 0 ? length : null;
}

export async function handleAgentRequest(
  request: NextRequest,
  agent: AgentConfig
): Promise<NextResponse> {
  try {
    const rateLimit = checkAgentRateLimit(request, agent.id);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please retry later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    const contentLength = getContentLength(request);
    if (contentLength !== null && contentLength > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: `Request body too large (max ${MAX_REQUEST_BYTES} bytes)` },
        { status: 413 }
      );
    }

    let body: { message?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const validation = validateAgentMessage(body.message, MAX_MESSAGE_CHARS);
    if (!validation.ok) {
      return NextResponse.json(
        { error: validation.error },
        { status: validation.status }
      );
    }
    const sanitizedMessage = validation.sanitized;

    // Generate response from this agent
    const { text } = await generateAgentResponse(agent, sanitizedMessage);

    // Check if the agent wants to collaborate
    let collaboration = null;
    try {
      const parsed = JSON.parse(text);
      if (isCollaborationPayload(parsed)) {
        collaboration = parsed;
      }
    } catch {
      // Not JSON — normal response
    }

    if (collaboration) {
      return handleCollaboration(request, agent, collaboration);
    }

    return NextResponse.json({
      reply: text,
      agent: agent.name,
    });
  } catch (error) {
    console.error(`[${agent.name}] Error:`, error);
    return NextResponse.json(
      {
        error: "Agent processing failed",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

async function handleCollaboration(
  request: NextRequest,
  agent: AgentConfig,
  collaboration: { reason: string; query: string }
): Promise<NextResponse> {
  const otherAgent = getOtherAgent(agent.id)!;
  const x402Enabled = process.env.X402_ENABLED === "true";
  const delegatedQueryValidation = validateAgentMessage(
    collaboration.query,
    MAX_MESSAGE_CHARS
  );
  const safeQuery = delegatedQueryValidation.ok
    ? delegatedQueryValidation.sanitized
    : sanitizeAgentInput(collaboration.query).trim();

  if (!delegatedQueryValidation.ok) {
    return NextResponse.json({
      reply: `I couldn't delegate to ${otherAgent.name} because the generated collaboration query was invalid.`,
      agent: agent.name,
      collaboration: {
        from: agent.name,
        to: otherAgent.name,
        reason: collaboration.reason,
        price: otherAgent.price,
        failed: true,
        error: delegatedQueryValidation.error,
      },
    });
  }

  try {
    let reply: string;

    if (x402Enabled) {
      // Production: call other agent's API via x402 payment (real HTTP call)
      const baseUrl = getRequestBaseUrl(request);
      const { getAgentFetch } = await import("./x402-client");
      const agentFetch = getAgentFetch();
      const res = await agentFetch(`${baseUrl}${otherAgent.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: safeQuery }),
      });
      if (!res.ok) {
        throw new Error(
          `Collaboration call to ${otherAgent.name} failed with status ${res.status}`
        );
      }
      let data: { reply?: unknown };
      try {
        data = (await res.json()) as { reply?: unknown };
      } catch {
        throw new Error(
          `Collaboration response from ${otherAgent.name} was not valid JSON`
        );
      }
      reply = normalizeDelegatedReply(otherAgent, data.reply);
    } else {
      // Dev/demo: call other agent's handler directly (avoids HTTP deadlock)
      const { text } = await generateAgentResponse(otherAgent, safeQuery);
      reply = normalizeDelegatedReply(otherAgent, text);
    }

    return NextResponse.json({
      reply,
      agent: agent.name,
      collaboration: {
        from: agent.name,
        to: otherAgent.name,
        reason: collaboration.reason,
        price: otherAgent.price,
      },
    });
  } catch (error) {
    return NextResponse.json({
      reply: `I tried to consult ${otherAgent.name} but couldn't reach them. The question "${safeQuery}" is outside my core expertise.`,
      agent: agent.name,
      collaboration: {
        from: agent.name,
        to: otherAgent.name,
        reason: collaboration.reason,
        price: otherAgent.price,
        failed: true,
        error: String(error),
      },
    });
  }
}

function normalizeDelegatedReply(
  delegatedAgent: AgentConfig,
  candidate: unknown
): string {
  if (typeof candidate !== "string" || candidate.trim().length === 0) {
    throw new Error(
      `Collaboration response from ${delegatedAgent.name} is missing a valid reply`
    );
  }

  try {
    const parsed = JSON.parse(candidate);
    if (isCollaborationPayload(parsed)) {
      return `${delegatedAgent.name} requested an additional delegation hop. Recursive delegation is blocked; please ask a more specific question directly to ${delegatedAgent.name}.`;
    }
  } catch {
    // Normal text response.
  }

  return candidate;
}
