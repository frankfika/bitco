import { defineChain } from "viem";

export const goatTestnet3 = defineChain({
  id: 48816,
  name: "GOAT Testnet3",
  nativeCurrency: {
    name: "Bitcoin",
    symbol: "BTC",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet3.goat.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "GOAT Explorer",
      url: "https://explorer.testnet3.goat.network",
    },
  },
  testnet: true,
});

export const GOAT_CHAIN_ID = 48816;
export const GOAT_NETWORK = `eip155:${GOAT_CHAIN_ID}` as const;
export const GOAT_EXPLORER = "https://explorer.testnet3.goat.network";
