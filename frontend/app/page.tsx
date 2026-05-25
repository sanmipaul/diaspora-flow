"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContract, useConnect } from "wagmi";
import { formatUnits } from "viem";
import SendForm from "@/components/SendForm";
import FamilyProfiles from "@/components/FamilyProfiles";
import RecurringSchedules from "@/components/RecurringSchedules";
import TransactionHistory from "@/components/TransactionHistory";
import Stats from "@/components/Stats";
import { CUSD_ADDRESS, ERC20_ABI } from "@/lib/contracts";

type Tab = "send" | "family" | "recurring" | "history" | "stats";

function useIsMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  useEffect(() => {
    setIsMiniPay(
      (window as unknown as { ethereum?: { isMiniPay?: boolean } }).ethereum
        ?.isMiniPay === true
    );
  }, []);
  return isMiniPay;
}

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const [activeTab, setActiveTab] = useState<Tab>("send");
  const isMiniPay = useIsMiniPay();

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
    if (isMiniPay) return <MiniPayConnecting />;
    return <LandingPage />;
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

function MiniPayConnecting() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50">
      <div className="w-10 h-10 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin" />
      <p className="text-sm text-gray-500 font-medium">Connecting to MiniPay…</p>
    </div>
  );
}

function LandingPage() {
  const { connect, connectors, isPending } = useConnect();

  const features = [
    { icon: "⚡", title: "Instant transfers", body: "Send cUSD to family in seconds — no banks, no delays." },
    { icon: "🔁", title: "Recurring payments", body: "Schedule weekly or monthly remittances and let the agent handle execution." },
    { icon: "🤖", title: "Autonomous AI agent", body: "ERC-8004 registered agent monitors the chain 24/7 and executes due transfers automatically." },
    { icon: "🔒", title: "Non-custodial", body: "Your keys, your funds. The contract only moves money you explicitly approved." },
    { icon: "👨‍👩‍👧", title: "Family profiles", body: "Save recipient wallets with names and relationships for one-tap sending." },
    { icon: "📊", title: "Full history", body: "Every transfer and schedule is on-chain and visible in your personal dashboard." },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-5xl mx-auto">
        <span className="text-xl font-bold text-brand-700">DiasporaFlow</span>
        <a
          href="https://github.com/sanmipaul/diaspora-flow"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-brand-700 transition-colors"
        >
          GitHub
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
        <span className="inline-block bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wide">
          Built on Celo · Powered by cUSD
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
          Send money home —<br />
          <span className="text-brand-600">fast, cheap, automatic.</span>
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          DiasporaFlow lets you send cUSD remittances and schedule recurring payments to family abroad.
          An on-chain AI agent executes every transfer for you — no manual steps, no middlemen.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => connectors[0] && connect({ connector: connectors[0] })}
            disabled={isPending}
            className="bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-60"
          >
            {isPending ? "Connecting…" : "Connect Wallet"}
          </button>
          <a
            href="https://github.com/sanmipaul/diaspora-flow"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl font-semibold text-sm hover:border-brand-400 transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Fee comparison */}
      <section className="max-w-sm mx-auto px-6 mb-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-4">Fee comparison</p>
          <div className="flex justify-around items-center">
            <div>
              <p className="text-4xl font-extrabold text-brand-600">0.3%</p>
              <p className="text-xs text-gray-500 mt-1">DiasporaFlow</p>
            </div>
            <div className="text-gray-300 text-2xl font-light">vs</div>
            <div>
              <p className="text-4xl font-extrabold text-red-400">8–9%</p>
              <p className="text-xs text-gray-500 mt-1">Traditional remittance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="text-center text-2xl font-bold text-gray-800 mb-8">Everything you need to send money home</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="text-2xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent badge */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="bg-brand-50 border border-brand-200 rounded-2xl p-6 text-center">
          <p className="text-xs text-brand-700 font-semibold uppercase tracking-wide mb-2">Autonomous AI Agent</p>
          <p className="text-sm text-gray-600 mb-3">
            The DiasporaFlow agent is registered on ERC-8004 (Agent ID <strong>#9145</strong>) with a verified
            Self Agent ID — it executes recurring transfers on-chain without any human trigger.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-xs">
            <a
              href="https://8004scan.io/agents/celo/9145"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline"
            >
              View agent on 8004scan
            </a>
            <span className="hidden sm:inline text-gray-300">·</span>
            <a
              href="https://celoscan.io/address/0x96fbc86fCf4eAB5E94b7d74BE1f8D135E8b9BFC3"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-700 underline"
            >
              Agent wallet on Celoscan
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 pb-8">
        Built for Celo Proof of Ship · Contract{" "}
        <a
          href="https://celoscan.io/address/0x735983527295A6E15e7a9593ba52f3EE9aE648e3"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          0x7359...648e3
        </a>
      </footer>
    </div>
  );
}
