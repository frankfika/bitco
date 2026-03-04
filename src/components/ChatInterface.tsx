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

export function ChatInterface({ agent, onTransaction }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isCode = agent.id === "code";
  const accentClass = isCode ? "text-code" : "text-crypto";
  const accentBg = isCode ? "bg-code" : "bg-crypto";
  const accentBgSoft = isCode ? "bg-code/10" : "bg-crypto/10";
  const btnGradient = isCode ? "from-code to-code/80" : "from-crypto to-crypto/80";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const sanitizedInput = sanitizeText(input.trim());
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: sanitizedInput,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(agent.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sanitizedInput }),
      });

      if (!response.ok) {
        throw new Error(`Agent responded with ${response.status}`);
      }

      const data = (await response.json()) as {
        reply: string;
        agent: string;
        collaboration?: {
          from: string;
          to: string;
          reason: string;
          price: string;
          failed?: boolean;
        };
      };

      const userTx: Transaction = {
        id: crypto.randomUUID(),
        from: "You",
        to: agent.name,
        amount: agent.price,
        timestamp: Date.now(),
        type: "user-to-agent",
      };
      onTransaction(userTx);

      if (data.collaboration && !data.collaboration.failed) {
        const agentTx: Transaction = {
          id: crypto.randomUUID(),
          from: data.collaboration.from,
          to: data.collaboration.to,
          amount: data.collaboration.price,
          timestamp: Date.now(),
          type: "agent-to-agent",
        };
        onTransaction(agentTx);
      }

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: sanitizeText(data.reply), // Sanitize AI response to prevent XSS
        agentName: data.agent,
        collaboration: data.collaboration,
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
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <EmptyState agent={agent} accentBgSoft={accentBgSoft} accentClass={accentClass} />
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
