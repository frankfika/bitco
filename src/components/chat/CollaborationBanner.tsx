interface CollaborationBannerProps {
  collaboration: {
    from: string;
    to: string;
    reason: string;
    price: string;
    failed?: boolean;
  };
}

export function CollaborationBanner({ collaboration }: CollaborationBannerProps) {
  return (
    <div
      className={`mb-3 rounded-xl px-3 py-2.5 text-xs ${
        collaboration.failed
          ? "bg-danger/10 border border-danger/20 text-danger"
          : "bg-bitcoin/10 border border-bitcoin/20 text-bitcoin"
      }`}
    >
      {collaboration.failed ? (
        <span>Failed to consult {collaboration.to}</span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-bitcoin" />
          {collaboration.from} paid{" "}
          <span className="font-mono font-bold">{collaboration.price}</span> to
          consult {collaboration.to}
        </span>
      )}
    </div>
  );
}
