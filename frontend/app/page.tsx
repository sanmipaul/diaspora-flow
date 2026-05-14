"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import SendForm from "@/components/SendForm";
import FamilyProfiles from "@/components/FamilyProfiles";
import RecurringSchedules from "@/components/RecurringSchedules";
import TransactionHistory from "@/components/TransactionHistory";

type Tab = "send" | "family" | "recurring" | "history";

export default function Home() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<Tab>("send");

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-sm">Opening in MiniPay...</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "send", label: "Send" },
    { id: "family", label: "Family" },
    { id: "recurring", label: "Recurring" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto px-4 pb-8">
      <header className="pt-6 pb-4">
        <span className="text-2xl font-bold text-brand-700">DiasporaFlow</span>
        <p className="text-xs text-gray-500">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </p>
      </header>

      <div className="bg-brand-50 rounded-2xl p-4 mb-5 text-center">
        <p className="text-xs text-brand-700 font-medium uppercase tracking-wide mb-1">Our fee vs traditional</p>
        <div className="flex justify-around">
          <div><p className="text-2xl font-bold text-brand-600">0.3%</p><p className="text-xs text-gray-500">DiasporaFlow</p></div>
          <div className="border-l border-brand-200" />
          <div><p className="text-2xl font-bold text-red-400">8–9%</p><p className="text-xs text-gray-500">Traditional</p></div>
        </div>
      </div>

      <nav className="flex bg-white rounded-xl p-1 shadow-sm mb-5 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-1 py-2 text-xs font-medium rounded-lg transition-colors ${
              activeTab === t.id ? "bg-brand-600 text-white" : "text-gray-500 hover:text-gray-700"
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
    </div>
  );
}
