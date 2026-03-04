"use client";

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
  type: "user-to-agent" | "agent-to-agent";
}

export function TransactionFlow({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) return null;

  return (
    <div className="glass-panel-sm p-5">
      <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-text-tertiary">
        <span className="inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-bitcoin" />
        Payment Flow
      </h3>
      <div className="space-y-2">
        {transactions.map((tx, i) => (
          <TransactionItem key={tx.id} tx={tx} index={i} />
        ))}
      </div>
      <div className="mt-4 border-t border-glass-border pt-3">
        <div className="flex items-center justify-between text-xs text-text-tertiary">
          <span>{transactions.length} payment(s)</span>
          <span className="font-mono font-semibold text-bitcoin">
            Total: $
            {transactions
              .reduce(
                (sum, tx) => sum + parseFloat(tx.amount.replace("$", "")),
                0
              )
              .toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ tx, index }: { tx: Transaction; index: number }) {
  const isAgentToAgent = tx.type === "agent-to-agent";

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
        isAgentToAgent
          ? "bg-bitcoin/5 border border-bitcoin/15"
          : "bg-white/[0.03] border border-white/[0.04]"
      }`}
      style={{
        animation: "slideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* From */}
      <span className="shrink-0 text-xs font-medium text-text-secondary">{tx.from}</span>

      {/* Arrow with amount */}
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div className="h-px flex-1 bg-gradient-to-r from-text-tertiary/30 to-bitcoin/40" />
        <span className="shrink-0 rounded-full bg-bitcoin/10 px-2 py-0.5 font-mono text-xs font-semibold text-bitcoin">
          {tx.amount}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-bitcoin/40 to-text-tertiary/30" />
        <span className="text-text-tertiary">&#8594;</span>
      </div>

      {/* To */}
      <span className="shrink-0 text-xs font-medium text-text-secondary">{tx.to}</span>

      {/* Badge */}
      {isAgentToAgent && (
        <span className="ml-1 shrink-0 rounded-full bg-gradient-to-r from-crypto/20 to-code/20 border border-crypto/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-crypto">
          A2A
        </span>
      )}
    </div>
  );
}
