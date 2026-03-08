"use client";

import { useState, useRef, useEffect } from "react";
import type { AgentConfig } from "@/lib/agents";
import type { Transaction } from "./TransactionFlow";
import { sanitizeText } from "@/lib/sanitize";
import { EmptyState } from "./chat/EmptyState";
import { MessageBubble } from "./chat/MessageBubble";
import { LoadingIndicator } from "./chat/LoadingIndicator";
import { ChatInput } from "./chat/ChatInput";

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

interface ChatInterfaceProps {
  agent: AgentConfig;
  onTransaction: (tx: Transaction) => void;
}

function getApiErrorMessage(response: Response, payload: unknown): string {
  const fallback = `Agent responded with ${response.status}`;
  if (!payload || typeof payload !== "object") return fallback;

  const error = (payload as Record<string, unknown>).error;
  if (typeof error !== "string" || error.trim().length === 0) return fallback;

  if (response.status === 429) {
    const retryAfter = response.headers.get("retry-after");
    if (retryAfter && Number.parseInt(retryAfter, 10) > 0) {
      return `${error} Retry after ${retryAfter}s.`;
    }
  }

  return error;
}

export function ChatInterface({ agent, onTransaction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isCode = agent.id === "code";
  const accentClass = isCode ? "text-code" : "text-crypto";
  const accentBg = isCode ? "bg-code" : "bg-crypto";
  const accentBgSoft = isCode ? "bg-code/10" : "bg-crypto/10";
  const btnGradient = isCode ? "from-code to-code/80" : "from-crypto to-crypto/80";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSelectPrompt(prompt: string) {
    setInput(prompt);
    inputRef.current?.focus();
  }

  function handleClear() {
    setMessages([]);
    setInput("");
    inputRef.current?.focus();
  }

  async function handleSubmit() {
    if (!input.trim() || isLoading) return;

    const sanitizedInput = sanitizeText(input.trim());
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: sanitizedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    setIsLoading(true);

    try {
      const response = await fetch(agent.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sanitizedInput }),
      });

      const payload = (await response.json().catch(() => null)) as {
        reply?: unknown;
        agent?: unknown;
        collaboration?: {
          from: string;
          to: string;
          reason: string;
          price: string;
          failed?: boolean;
        };
      } | null;

      if (!response.ok) {
        throw new Error(getApiErrorMessage(response, payload));
      }

      if (!payload || typeof payload.reply !== "string" || typeof payload.agent !== "string") {
        throw new Error("Invalid response payload");
      }

      const userTx: Transaction = {
        id: crypto.randomUUID(),
        from: "You",
        to: agent.name,
        amount: agent.price,
        timestamp: Date.now(),
        type: "user-to-agent",
      };
      onTransaction(userTx);

      if (payload.collaboration && !payload.collaboration.failed) {
        const agentTx: Transaction = {
          id: crypto.randomUUID(),
          from: payload.collaboration.from,
          to: payload.collaboration.to,
          amount: payload.collaboration.price,
          timestamp: Date.now(),
          type: "agent-to-agent",
        };
        onTransaction(agentTx);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: sanitizeText(payload.reply),
        agentName: payload.agent,
        collaboration: payload.collaboration,
        paid: agent.price,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: sanitizeText(`Error: ${error instanceof Error ? error.message : "Failed to get response"}`),
        agentName: agent.name,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Messages */}
      <div className="relative flex-1 overflow-y-auto">
        {/* Clear button — only visible when there are messages */}
        {messages.length > 0 && (
          <div className="sticky top-0 z-10 flex justify-end px-5 pt-3">
            <button
              onClick={handleClear}
              className="rounded-full border border-glass-border bg-background/80 px-3 py-1 text-xs text-text-tertiary backdrop-blur-sm transition-all duration-200 hover:border-glass-border-hover hover:text-text-secondary"
            >
              Clear chat
            </button>
          </div>
        )}

        <div className="space-y-4 p-5">
          {messages.length === 0 ? (
            <EmptyState
              agent={agent}
              accentBgSoft={accentBgSoft}
              accentClass={accentClass}
              onSelectPrompt={handleSelectPrompt}
            />
          ) : (
            messages.map((msg, i) => (
              <MessageBubble key={msg.id} message={msg} accentBg={accentBg} index={i} />
            ))
          )}

          {isLoading && (
            <LoadingIndicator agentName={agent.name} accentBg={accentBg} accentClass={accentClass} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        inputRef={inputRef}
        agentName={agent.name}
        price={agent.price}
        btnGradient={btnGradient}
      />
    </div>
  );
}
