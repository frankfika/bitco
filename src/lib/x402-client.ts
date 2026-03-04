import { wrapFetchWithPayment } from "@x402/fetch";
import { x402Client } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { goatTestnet3 } from "./chains";

// Agent-to-Agent payment: agents use a server-side private key to pay each other
function createAgentFetch() {
  const privateKey = process.env.AGENT_PRIVATE_KEY as `0x${string}`;
  if (!privateKey) {
    throw new Error("AGENT_PRIVATE_KEY is required for Agent-to-Agent payments");
  }

  const account = privateKeyToAccount(privateKey);
  const publicClient = createPublicClient({
    chain: goatTestnet3,
    transport: http(),
  });

  const signer = toClientEvmSigner(account, publicClient);
  const client = new x402Client();
  registerExactEvmScheme(client, { signer });

  return wrapFetchWithPayment(fetch, client);
}

let _agentFetch: ReturnType<typeof createAgentFetch> | null = null;

export function getAgentFetch() {
  if (!_agentFetch) {
    _agentFetch = createAgentFetch();
  }
  return _agentFetch;
}
