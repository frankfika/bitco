import { NextRequest } from "next/server";
import { withPayment } from "@/lib/x402";
import { AGENTS } from "@/lib/agents";
import { handleAgentRequest } from "@/lib/agent-handler";

const agent = AGENTS.code;

export const POST = withPayment(
  (request: NextRequest) => handleAgentRequest(request, agent),
  agent.price
);
