"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import SendForm from "@/components/SendForm";
import FamilyProfiles from "@/components/FamilyProfiles";
import RecurringSchedules from "@/components/RecurringSchedules";
import TransactionHistory from "@/components/TransactionHistory";
import Stats from "@/components/Stats";
import { CUSD_ADDRESS, ERC20_ABI } from "@/lib/contracts";

type Tab = "send" | "family" | "recurring" | "history" | "stats";

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const [activeTab, setActiveTab] = useState<Tab>("send");

  const { data: cUsdBalance } = useReadContract({
    address: CUSD_ADDRESS[chainId] as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });
  const formattedCusd = cUsdBalance !== undefined
    ? Number(formatUnits(cUsdBalance, 18)).toFixed(2)
    : "—";

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Opening in MiniPay...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "send", label: "Send" },
    { id: "family", label: "Family" },
    { id: "recurring", label: "Recurring" },
    { id: "history", label: "History" },
    { id: "stats", label: "Stats" },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl font-bold text-brand-700">DiasporaFlow</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p className="text-xs font-semibold text-brand-700">{formattedCusd} cUSD</p>
        </div>
      </header>

      <div className="bg-brand-50 rounded-2xl p-4 mb-5 text-center">
        <p className="text-xs text-brand-700 font-medium uppercase tracking-wide mb-1">
          Our fee vs traditional
        </p>
        <div className="flex justify-around">
          <div>
            <p className="text-2xl font-bold text-brand-600">0.3%</p>
            <p className="text-xs text-gray-500">DiasporaFlow</p>
          </div>
          <div className="border-l border-brand-200" />
          <div>
            <p className="text-2xl font-bold text-red-400">8–9%</p>
            <p className="text-xs text-gray-500">Traditional</p>
          </div>
        </div>
      </div>

      <nav className="flex bg-white rounded-xl p-1 shadow-sm mb-5 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === t.id
                ? "bg-brand-600 text-white"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {activeTab === "send" && <SendForm />}
      {activeTab === "family" && <FamilyProfiles />}
      {activeTab === "recurring" && <RecurringSchedules />}
      {activeTab === "history" && <TransactionHistory />}
      {activeTab === "stats" && <Stats />}
    </div>
  );
}
