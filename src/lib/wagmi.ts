import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { goatTestnet3 } from "./chains";

export const wagmiConfig = getDefaultConfig({
  appName: "BitMind",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "demo",
  chains: [goatTestnet3],
  ssr: true,
});
