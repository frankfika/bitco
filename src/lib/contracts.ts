import { GOAT_EXPLORER } from "./chains";

export const AGENT_REGISTRY_ADDRESS =
  (process.env.NEXT_PUBLIC_AGENT_REGISTRY_ADDRESS as `0x${string}`) ??
  "0x0000000000000000000000000000000000000000";

export const AGENT_REGISTRY_ABI = [
  {
    type: "function",
    name: "getAgent",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "name", type: "string" },
          { name: "endpoint", type: "string" },
          { name: "specialty", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "ownerOf",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ type: "address" }],
    stateMutability: "view",
  },
] as const;

export function getExplorerTokenUrl(tokenId: number): string {
  return `${GOAT_EXPLORER}/token/${AGENT_REGISTRY_ADDRESS}/instance/${tokenId}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${GOAT_EXPLORER}/address/${address}`;
}
