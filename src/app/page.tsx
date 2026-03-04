"use client";

import dynamic from "next/dynamic";
import { AgentCard } from "@/components/AgentCard";
import { getAllAgents } from "@/lib/agents";
import { GOAT_EXPLORER } from "@/lib/chains";
import { AGENT_REGISTRY_ADDRESS } from "@/lib/contracts";

const SafeConnectButton = dynamic(
  () =>
    import("@rainbow-me/rainbowkit").then((m) => ({
      default: m.ConnectButton,
    })),
  {
    ssr: false,
    loading: () => (
      <button className="rounded-xl bg-glass-bg border border-glass-border px-4 py-2 text-sm text-text-secondary">
        Connect Wallet
      </button>
    ),
  }
);

export default function Home() {
  const agents = getAllAgents();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Aurora background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[600px] opacity-30"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% 0%, oklch(0.72 0.18 62 / 0.3), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 -right-20 w-[600px] h-[500px] opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 80% 100%, oklch(0.63 0.24 290 / 0.35), transparent)",
          }}
        />
        <div
          className="absolute top-1/3 -left-20 w-[400px] h-[400px] opacity-15"
          style={{
            background:
              "radial-gradient(ellipse 50% 50% at 20% 50%, oklch(0.70 0.19 160 / 0.3), transparent)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-glass-border px-6 py-4 backdrop-blur-xl bg-background/60">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold gradient-text">BitMind</span>
            <span className="hidden sm:inline-block text-xs text-text-tertiary border border-glass-border rounded-full px-3 py-1">
              Agent Economy on Bitcoin
            </span>
          </div>
          <SafeConnectButton />
        </header>

        {/* Main */}
        <main className="mx-auto max-w-4xl px-6 py-16">
          {/* Hero */}
          <div className="mb-20 text-center" style={{ animation: "fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) forwards" }}>
            <div className="mb-6 inline-flex items-center rounded-full bg-bitcoin/10 border border-bitcoin/20 px-4 py-1.5 text-xs font-medium text-bitcoin">
              <span className="mr-2 inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-bitcoin" />
              Powered by x402 on GOAT Network
            </div>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl text-balance leading-[1.1]">
              AI Agents that{" "}
              <span className="gradient-text">Pay Each Other</span>
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-text-secondary leading-relaxed">
              Two AI agents collaborating on Bitcoin L2. Ask a question — if the
              agent needs help, it automatically pays another agent for expertise.
              All payments via x402 protocol.
            </p>
          </div>

          {/* How it works */}
          <div
            className="glass-panel mb-14 p-8"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.15s forwards", opacity: 0 }}
          >
            <h3 className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              <span className="h-px w-6 bg-gradient-to-r from-bitcoin to-transparent" />
              How it works
            </h3>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Pay & Ask",
                  desc: "Send a message to an agent. x402 handles micropayment automatically.",
                },
                {
                  step: "2",
                  title: "Auto-Collaborate",
                  desc: "If the question is outside its expertise, the agent pays another agent for help.",
                },
                {
                  step: "3",
                  title: "See the Flow",
                  desc: "Watch funds flow in real-time: User \u2192 Agent A \u2192 Agent B, all on-chain.",
                },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bitcoin/10 text-sm font-bold text-bitcoin">
                    {item.step}
                  </span>
                  <div>
                    <p className="font-semibold text-text-primary mb-1">{item.title}</p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Cards */}
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.3s forwards", opacity: 0 }}
          >
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {/* Contract info */}
          <div
            className="mt-16 text-center"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1) 0.45s forwards", opacity: 0 }}
          >
            <p className="text-xs text-text-tertiary">
              Agent Registry Contract:{" "}
              <a
                href={`${GOAT_EXPLORER}/address/${AGENT_REGISTRY_ADDRESS}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary border-b border-dotted border-text-tertiary hover:text-bitcoin hover:border-bitcoin transition-colors"
              >
                {AGENT_REGISTRY_ADDRESS.slice(0, 6)}...
                {AGENT_REGISTRY_ADDRESS.slice(-4)}
              </a>{" "}
              on GOAT Testnet V3
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
