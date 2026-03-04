"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import type { AgentConfig } from "@/lib/agents";
import { getExplorerTokenUrl } from "@/lib/contracts";

export function AgentCard({ agent }: { agent: AgentConfig }) {
  const isCode = agent.id === "code";
  const ref = useRef<HTMLDivElement>(null);
  const [glowPos, setGlowPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});

  const accentClass = isCode ? "text-code" : "text-crypto";
  const glowColor = isCode
    ? "oklch(0.70 0.19 160 / 0.12)"
    : "oklch(0.63 0.24 290 / 0.12)";
  const accentBg = isCode
    ? "bg-code/10"
    : "bg-crypto/10";
  const btnGradient = isCode
    ? "from-code to-code/80"
    : "from-crypto to-crypto/80";

  function handleMouseMove(e: React.MouseEvent) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setGlowPos({ x, y });
    // 3D tilt
    const rx = ((y / rect.height) - 0.5) * -8;
    const ry = ((x / rect.width) - 0.5) * 8;
    setTiltStyle({
      transform: `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.02)`,
      transition: "transform 0.15s ease-out",
    });
  }

  function handleMouseLeave() {
    setIsHovered(false);
    setTiltStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)",
      transition: "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
    });
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={tiltStyle}
      className="group relative overflow-hidden rounded-3xl border border-glass-border bg-surface backdrop-blur-xl p-6 shadow-glass transition-shadow duration-300 hover:border-glass-border-hover hover:shadow-glass-lg"
    >
      {/* Cursor glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${glowPos.x}px ${glowPos.y}px, ${glowColor}, transparent 70%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Avatar */}
        <div
          className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold ${accentBg} ${accentClass} transition-transform duration-300 group-hover:scale-110`}
        >
          {agent.avatar}
        </div>

        {/* Info */}
        <h2 className="mb-1 text-xl font-semibold text-text-primary">
          {agent.name}
        </h2>
        <p className={`mb-2 text-sm font-medium ${accentClass}`}>
          {agent.specialty}
        </p>
        <p className="mb-5 text-sm text-text-secondary leading-relaxed">
          {agent.description}
        </p>

        {/* Price + On-chain */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-bitcoin/10 px-3 py-1 font-mono text-xs font-semibold text-bitcoin">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse-glow rounded-full bg-bitcoin" />
            {agent.price} / msg
          </span>
          <a
            href={getExplorerTokenUrl(agent.tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-glass-border px-3 py-1 text-xs text-text-tertiary transition-all duration-200 hover:border-glass-border-hover hover:text-text-secondary"
          >
            On-chain #{agent.tokenId}
          </a>
        </div>

        {/* CTA */}
        <Link
          href={`/chat/${agent.id}`}
          className={`press-scale block w-full rounded-2xl bg-gradient-to-r ${btnGradient} py-3.5 text-center text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl`}
        >
          Chat with {agent.name}
        </Link>
      </div>
    </div>
  );
}
