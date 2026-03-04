interface LoadingIndicatorProps {
  agentName: string;
  accentBg: string;
  accentClass: string;
}

export function LoadingIndicator({ agentName, accentBg, accentClass }: LoadingIndicatorProps) {
  return (
    <div className="flex justify-start" style={{ animation: "fadeInUp 0.3s ease forwards" }}>
      <div className="glass-panel-sm px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            <span className={`h-2 w-2 animate-bounce rounded-full ${accentBg}/60 [animation-delay:0ms]`} />
            <span className={`h-2 w-2 animate-bounce rounded-full ${accentBg}/60 [animation-delay:150ms]`} />
            <span className={`h-2 w-2 animate-bounce rounded-full ${accentBg}/60 [animation-delay:300ms]`} />
          </div>
          <span className={`text-xs ${accentClass}`}>
            {agentName} is thinking...
          </span>
        </div>
      </div>
    </div>
  );
}
