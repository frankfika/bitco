import { CollaborationBanner } from "./CollaborationBanner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  collaboration?: {
    from: string;
    to: string;
    reason: string;
    price: string;
    failed?: boolean;
  };
  paid?: string;
}

interface MessageBubbleProps {
  message: Message;
  accentBg: string;
  index: number;
}

export function MessageBubble({ message, accentBg, index }: MessageBubbleProps) {
  return (
    <div
      className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
      style={{
        animation: "fadeInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards",
        animationDelay: `${index * 0.05}s`,
      }}
    >
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          message.role === "user"
            ? "bg-white/10 backdrop-blur-sm border border-white/10 text-text-primary"
            : "glass-panel-sm text-text-primary"
        }`}
      >
        {/* Collaboration banner */}
        {message.collaboration && (
          <CollaborationBanner collaboration={message.collaboration} />
        )}

        {/* Message content */}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content}
        </div>

        {/* Payment badge */}
        {message.paid && message.role === "assistant" && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-text-tertiary">
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${accentBg}`} />
            Paid {message.paid}
          </div>
        )}
      </div>
    </div>
  );
}
