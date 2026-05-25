"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useConnect } from "wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { useEffect } from "react";

const queryClient = new QueryClient();

function MiniPayAutoConnect() {
  const { connect, connectors } = useConnect();
  useEffect(() => {
    // Only auto-connect inside MiniPay — detected by the injected ethereum provider
    const isMiniPay =
      typeof window !== "undefined" &&
      (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum?.isMiniPay === true;
    if (isMiniPay && connectors[0]) connect({ connector: connectors[0] });
  }, [connect, connectors]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <MiniPayAutoConnect />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
