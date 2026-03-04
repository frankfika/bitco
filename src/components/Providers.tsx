"use client";

import { Component, useSyncExternalStore } from "react";
import type { ReactNode, ErrorInfo } from "react";
import dynamic from "next/dynamic";

class Web3ErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn(
      "[Web3ErrorBoundary] Wallet provider error caught:",
      error.message,
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Dynamically load WalletProviders — SSR renders children directly, no mismatch
const DynamicWalletProviders = dynamic(
  () => import("@/components/WalletProviders"),
  { ssr: false }
);

export function Providers({ children }: { children: ReactNode }) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  return (
    <Web3ErrorBoundary fallback={children}>
      {mounted ? (
        <DynamicWalletProviders>{children}</DynamicWalletProviders>
      ) : (
        <>{children}</>
      )}
    </Web3ErrorBoundary>
  );
}
