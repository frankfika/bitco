import type { AgentConfig } from "@/lib/agents";

interface EmptyStateProps {
  agent: AgentConfig;
  accentBgSoft: string;
  accentClass: string;
}

export function EmptyState({ agent, accentBgSoft, accentClass }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center">
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
    </div>
  );
}
