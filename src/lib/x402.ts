import { NextRequest, NextResponse } from "next/server";
import { GOAT_NETWORK } from "./chains";

// x402 server-side configuration for protecting API routes
export const X402_FACILITATOR_URL =
  process.env.X402_FACILITATOR_URL ?? "https://facilitator.x402.org";

export const X402_PAY_TO =
  (process.env.X402_PAY_TO as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const X402_NETWORK = GOAT_NETWORK;

export function createRouteConfig(price: string) {
  return {
    accepts: {
      scheme: "exact" as const,
      price,
      network: X402_NETWORK,
      payTo: X402_PAY_TO,
      maxTimeoutSeconds: 300,
    },
    description: "Pay to chat with this AI Agent",
  };
}

// Lazy-init x402 server — only when X402_ENABLED=true
let _x402Server: unknown | null = null;
let _x402InitFailed = false;

async function getX402Server() {
  if (_x402InitFailed) return null;
  if (_x402Server) return _x402Server;

  try {
    const { x402ResourceServer } = await import("@x402/next");
    const { HTTPFacilitatorClient } = await import("@x402/core/server");
    const { registerExactEvmScheme } = await import("@x402/evm/exact/server");

    const facilitatorClient = new HTTPFacilitatorClient({
      url: X402_FACILITATOR_URL,
    });
    const server = new x402ResourceServer(facilitatorClient);
    registerExactEvmScheme(server);
    _x402Server = server;
    return server;
  } catch (e) {
    console.warn("[x402] Failed to initialize x402 server:", e);
    _x402InitFailed = true;
    return null;
  }
}

/**
 * Wrap a handler with x402 payment protection.
 * Falls back to direct execution if x402 facilitator is unavailable.
 */
export function withPayment(
  handler: (request: NextRequest) => Promise<NextResponse>,
  price: string
) {
  const routeConfig = createRouteConfig(price);
  let _wrappedHandler: ((request: NextRequest) => Promise<NextResponse>) | null =
    null;

  return async (request: NextRequest): Promise<NextResponse> => {
    // Check if x402 is enabled and available
    const x402Enabled = process.env.X402_ENABLED === "true";

    if (x402Enabled) {
      if (!_wrappedHandler) {
        const server = await getX402Server();
        if (server) {
          const { withX402 } = await import("@x402/next");
          _wrappedHandler = withX402(
            handler,
            routeConfig,
            server as import("@x402/next").x402ResourceServer,
            undefined,
            undefined,
            false
          );
        }
      }
      if (_wrappedHandler) {
        return _wrappedHandler(request);
      }
    }

    // Fallback: run handler directly (demo mode without real payment)
    return handler(request);
  };
}
