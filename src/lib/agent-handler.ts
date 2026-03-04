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

const MAX_REQUEST_BYTES = Number(process.env.MAX_REQUEST_BYTES ?? "16384");
const MAX_MESSAGE_CHARS = Number(process.env.MAX_MESSAGE_CHARS ?? "4000");

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

  try {
    let reply: string;

    if (x402Enabled) {
      // Production: call other agent's API via x402 payment (real HTTP call)
      const baseUrl = getBaseUrl(request);
      const { getAgentFetch } = await import("./x402-client");
      const agentFetch = getAgentFetch();
      const res = await agentFetch(`${baseUrl}${otherAgent.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: collaboration.query }),
      });
      const data = (await res.json()) as { reply: string };
      reply = data.reply;
    } else {
      // Dev/demo: call other agent's handler directly (avoids HTTP deadlock)
      const { text } = await generateAgentResponse(
        otherAgent,
        sanitizeAgentInput(collaboration.query)
      );
      reply = text;
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
      reply: `I tried to consult ${otherAgent.name} but couldn't reach them. The question "${collaboration.query}" is outside my core expertise.`,
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

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  return `${protocol}://${host}`;
}
