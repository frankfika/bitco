"use client";

import { useParams } from "next/navigation";
import { useState, useCallback } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ChatInterface } from "@/components/ChatInterface";
import {
  TransactionFlow,
  type Transaction,
} from "@/components/TransactionFlow";
import { getAgent } from "@/lib/agents";

export default function ChatPage() {
  const params = useParams();
  const agentId = params.agentId as string;
  const agent = getAgent(agentId);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTxPanel, setShowTxPanel] = useState(false);

  const handleTransaction = useCallback((tx: Transaction) => {
    setTransactions((prev) => [...prev, tx]);
    setShowTxPanel(true); // auto-reveal on mobile when a payment happens
  }, []);

  if (!agent) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="glass-panel p-10 text-center">
          <h1 className="mb-4 text-2xl font-bold text-text-primary">
            Agent not found
          </h1>
          <Link
            href="/"
            className="text-sm text-bitcoin hover:underline transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const isCode = agent.id === "code";
  const accentClass = isCode ? "text-code" : "text-crypto";
  const accentBg = isCode ? "bg-code/10" : "bg-crypto/10";

  return (
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-glass-border px-5 py-3 backdrop-blur-xl bg-background/60">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-text-tertiary transition-colors hover:text-text-primary text-sm"
          >
            &#8592; Back
          </Link>
          <div className="h-5 w-px bg-glass-border" />
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${accentBg} ${accentClass}`}
            >
              {agent.avatar}
            </div>
            <div>
              <h1 className="text-sm font-semibold text-text-primary">
                {agent.name}
              </h1>
              <p className="text-xs text-text-tertiary">{agent.specialty}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center rounded-full bg-bitcoin/10 px-3 py-1 font-mono text-xs text-bitcoin">
            {agent.price} / msg
          </span>
          {/* Mobile: toggle payment flow panel */}
          {transactions.length > 0 && (
            <button
              onClick={() => setShowTxPanel((v) => !v)}
              className="lg:hidden inline-flex items-center gap-1.5 rounded-full border border-bitcoin/30 bg-bitcoin/10 px-3 py-1 text-xs font-medium text-bitcoin"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-bitcoin" />
              {transactions.length} payment{transactions.length !== 1 ? "s" : ""}
            </button>
          )}
          <ConnectButton accountStatus="avatar" chainStatus="icon" />
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Chat */}
        <div className="flex flex-1 flex-col min-w-0">
          <ChatInterface agent={agent} onTransaction={handleTransaction} />
        </div>

        {/* Sidebar: Transaction Flow — always visible on lg, toggled on mobile */}
        <div
          className={`${
            showTxPanel ? "flex" : "hidden"
          } lg:flex w-80 shrink-0 flex-col border-l border-glass-border p-4 bg-background/40 backdrop-blur-sm`}
        >
          {/* Mobile close button */}
          <div className="mb-3 flex items-center justify-between lg:hidden">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-tertiary">
              Payment Flow
            </span>
            <button
              onClick={() => setShowTxPanel(false)}
              className="text-xs text-text-tertiary hover:text-text-secondary"
            >
              Close
            </button>
          </div>

          <TransactionFlow transactions={transactions} />
          {transactions.length === 0 && (
            <div className="glass-panel-sm flex h-40 items-center justify-center">
              <div className="text-center">
                <div className="mb-2 text-2xl opacity-40">&#9889;</div>
                <p className="text-xs text-text-tertiary">
                  Payments will appear here
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
