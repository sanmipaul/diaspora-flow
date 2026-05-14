"use client";

import { useAccount } from "wagmi";

export default function Home() {
  const { address, isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Opening in MiniPay...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold text-brand-700">DiasporaFlow</span>
        </div>
        <p className="text-xs text-gray-500">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </header>
    </div>
  );
}
