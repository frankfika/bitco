import type { AgentConfig } from "@/lib/agents";

interface EmptyStateProps {
  agent: AgentConfig;
  accentBgSoft: string;
  accentClass: string;
  onSelectPrompt?: (prompt: string) => void;
}

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  crypto: [
    "What is DeFi liquidity mining?",
    "Explain Bitcoin L2 networks",
    "How does the x402 payment protocol work?",
  ],
  code: [
    "Write a simple ERC-20 token in Solidity",
    "How do I deploy a contract with Foundry?",
    "What's the difference between memory and storage in Solidity?",
  ],
};

export function EmptyState({ agent, accentBgSoft, accentClass, onSelectPrompt }: EmptyStateProps) {
  const prompts = SUGGESTED_PROMPTS[agent.id] ?? [];

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-4">
      <div className="text-center">
        <div
          className={`mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl text-3xl ${accentBgSoft} ${accentClass} animate-float`}
        >
          {agent.avatar}
        </div>
        <h2 className="mb-2 text-lg font-semibold text-text-primary">
          {agent.name}
        </h2>
        <p className="text-sm text-text-secondary">{agent.specialty}</p>
        <p className="mt-3 inline-flex items-center rounded-full bg-bitcoin/10 px-3 py-1 text-xs font-mono text-bitcoin">
          {agent.price} per message via x402
        </p>
      </div>

      {prompts.length > 0 && onSelectPrompt && (
        <div className="w-full max-w-sm space-y-2">
          <p className="text-center text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Try asking
          </p>
          {prompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => onSelectPrompt(prompt)}
              className="w-full rounded-2xl border border-glass-border bg-glass-bg px-4 py-3 text-left text-sm text-text-secondary transition-all duration-200 hover:border-glass-border-hover hover:bg-white/[0.06] hover:text-text-primary"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
