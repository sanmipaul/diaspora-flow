"use client";

import { useState, useEffect } from "react";
import { usePublicClient, useReadContract, useChainId } from "wagmi";
import { parseAbiItem, formatUnits } from "viem";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

const TRANSFER_SENT_EVENT = parseAbiItem(
  "event TransferSent(uint256 indexed transferId, address indexed sender, address indexed recipient, uint256 amount, uint256 fee, string memo)"
);

const DEPLOY_FROM_BLOCK = 37800000n;

// ERC-8004 Identity Registry on Celo mainnet
const ERC8004_REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;
const ERC8004_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

// Self Agent Registry on Celo mainnet
const SELF_REGISTRY = "0xaC3DF9ABf80d0F5c020C06B04Cced27763355944" as const;
const SELF_ABI = [
  {
    name: "isVerifiedAgent",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "agentKey", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;

// The agent wallet address — update this after running: cd agent && npm run register:8004
const AGENT_WALLET = (process.env.NEXT_PUBLIC_AGENT_WALLET ?? "") as `0x${string}`;

export default function Stats() {
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];
  const client = usePublicClient();
  const isMainnet = chainId === 42220;

  const [loading, setLoading] = useState(true);
  const [totalTransfers, setTotalTransfers] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0n);
  const [uniqueSenders, setUniqueSenders] = useState(0);

  // Protocol stats
  const { data: collectedFees } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "collectedFees",
  });

  // Agent ERC-8004 registration
  const { data: agentNftBalance } = useReadContract({
    address: ERC8004_REGISTRY,
    abi: ERC8004_ABI,
    functionName: "balanceOf",
    args: AGENT_WALLET ? [AGENT_WALLET] : undefined,
    query: { enabled: isMainnet && !!AGENT_WALLET },
  });

  const { data: agentNftId } = useReadContract({
    address: ERC8004_REGISTRY,
    abi: ERC8004_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: AGENT_WALLET ? [AGENT_WALLET, 0n] : undefined,
    query: { enabled: isMainnet && !!AGENT_WALLET && (agentNftBalance ?? 0n) > 0n },
  });

  // Agent Self Agent ID verification
  const { data: selfVerified } = useReadContract({
    address: SELF_REGISTRY,
    abi: SELF_ABI,
    functionName: "isVerifiedAgent",
    args: AGENT_WALLET ? [AGENT_WALLET] : undefined,
    query: { enabled: isMainnet && !!AGENT_WALLET },
  });

  useEffect(() => {
    if (!client || !contractAddress) return;
    setLoading(true);
    client
      .getLogs({
        address: contractAddress,
        event: TRANSFER_SENT_EVENT,
        fromBlock: DEPLOY_FROM_BLOCK,
      })
      .then((logs) => {
        const senders = new Set(logs.map((l) => l.args.sender?.toLowerCase()));
        const volume = logs.reduce((sum, l) => sum + (l.args.amount ?? 0n), 0n);
        setTotalTransfers(logs.length);
        setTotalVolume(volume);
        setUniqueSenders(senders.size);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [client, contractAddress]);

  const formattedFees = collectedFees
    ? Number(formatUnits(collectedFees, 18)).toFixed(4)
    : "0.0000";
  const formattedVolume = Number(formatUnits(totalVolume, 18)).toFixed(2);

  const stats = [
    { label: "Total Transfers", value: loading ? "..." : totalTransfers.toString() },
    { label: "Volume Sent", value: loading ? "..." : `${formattedVolume} cUSD` },
    { label: "Fees Collected", value: collectedFees === undefined ? "..." : `${formattedFees} cUSD` },
    { label: "Unique Senders", value: loading ? "..." : uniqueSenders.toString() },
  ];

  const agentRegistered = isMainnet && (agentNftBalance ?? 0n) > 0n;
  const agentSelfVerified = isMainnet && selfVerified === true;
  const shortWallet = AGENT_WALLET
    ? `${AGENT_WALLET.slice(0, 6)}...${AGENT_WALLET.slice(-4)}`
    : "—";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-800">Protocol Stats</h2>
        <span className="text-xs text-gray-400">Celo mainnet</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-50 rounded-2xl p-4 text-center">
        <p className="text-xs text-brand-700 font-medium mb-1">Why DiasporaFlow?</p>
        <p className="text-xs text-gray-500">
          Every transfer saves senders{" "}
          <span className="font-semibold text-brand-600">7.7–8.7%</span> vs
          traditional remittance services.
        </p>
      </div>

      {/* AI Agent Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">AI Agent</p>
          <span className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium">
            Recurring Executor
          </span>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          An on-chain AI agent automatically triggers your recurring remittances
          when they become due — no manual action needed.
        </p>

        <div className="space-y-2">
          <AgentRow
            label="Agent wallet"
            value={shortWallet || "Not configured"}
            href={
              AGENT_WALLET
                ? `https://celoscan.io/address/${AGENT_WALLET}`
                : undefined
            }
          />
          <AgentRow
            label="ERC-8004"
            value={
              !AGENT_WALLET
                ? "Pending setup"
                : agentRegistered
                ? `ID #${agentNftId ?? "..."}`
                : "Not registered"
            }
            href={
              agentRegistered && agentNftId !== undefined
                ? `https://8004scan.io/agents/celo/${agentNftId}`
                : undefined
            }
            ok={agentRegistered}
          />
          <AgentRow
            label="Self Agent ID"
            value={
              !AGENT_WALLET
                ? "Pending setup"
                : agentSelfVerified
                ? "Verified"
                : "Not verified"
            }
            ok={agentSelfVerified}
          />
        </div>
      </div>
    </div>
  );
}

function AgentRow({
  label,
  value,
  href,
  ok,
}: {
  label: string;
  value: string;
  href?: string;
  ok?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-brand-600 underline underline-offset-2"
        >
          {value}
        </a>
      ) : (
        <span
          className={`font-medium ${
            ok === true
              ? "text-green-600"
              : ok === false
              ? "text-red-400"
              : "text-gray-400"
          }`}
        >
          {value}
        </span>
      )}
    </div>
  );
}
