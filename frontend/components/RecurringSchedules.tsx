"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

const INTERVALS = [
  { label: "Weekly", seconds: 7 * 24 * 3600 },
  { label: "Bi-weekly", seconds: 14 * 24 * 3600 },
  { label: "Monthly", seconds: 30 * 24 * 3600 },
];

export default function RecurringSchedules() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];
  const [adding, setAdding] = useState(false);
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [label, setLabel] = useState("");
  const [intervalIdx, setIntervalIdx] = useState(2);

  const { data: scheduleIds } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getUserSchedules",
    args: address ? [address] : undefined,
  });

  const { writeContract: schedule } = useWriteContract();
  const { writeContract: cancel } = useWriteContract();

  function handleCreate() {
    if (!recipient || !amount || !contractAddress) return;
    setAdding(false);
    schedule({ address: contractAddress, abi: DIASPORA_FLOW_ABI, functionName: "scheduleRecurring", args: [recipient as `0x${string}`, parseUnits(amount, 18), BigInt(INTERVALS[intervalIdx].seconds), label] });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Recurring Transfers</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm text-brand-600 font-medium">{adding ? "Cancel" : "+ New"}</button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <input value={recipient} onChange={(e) => setRecipient(e.target.value)} placeholder="Recipient address (0x...)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount in cUSD" type="number"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Label (e.g. Mum's allowance)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <div className="flex gap-2">
            {INTERVALS.map((iv, i) => (
              <button key={i} onClick={() => setIntervalIdx(i)}
                className={`flex-1 py-2 text-xs rounded-lg font-medium border transition-colors ${intervalIdx === i ? "bg-brand-600 text-white border-brand-600" : "border-gray-200 text-gray-600"}`}>
                {iv.label}
              </button>
            ))}
          </div>
          <button onClick={handleCreate} className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">Create schedule</button>
        </div>
      )}

      {(!scheduleIds || scheduleIds.length === 0) && !adding && (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">No recurring schedules set up.</div>
      )}

      {scheduleIds?.map((id) => (
        <ScheduleCard key={id.toString()} scheduleId={id} contractAddress={contractAddress}
          onCancel={() => contractAddress && cancel({ address: contractAddress, abi: DIASPORA_FLOW_ABI, functionName: "cancelRecurring", args: [id] })} />
      ))}
    </div>
  );
}

function ScheduleCard({ scheduleId, contractAddress, onCancel }: { scheduleId: bigint; contractAddress: `0x${string}`; onCancel: () => void }) {
  const { data } = useReadContract({ address: contractAddress, abi: DIASPORA_FLOW_ABI, functionName: "schedules", args: [scheduleId] });

  if (!data || !data[5]) return null;

  const nextDate = new Date(Number(data[4]) * 1000).toLocaleDateString();
  const amountDisplay = (Number(data[2]) / 1e18).toFixed(2);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-800">{data[6] || "Unnamed"}</p>
        <p className="text-xs text-gray-400">{amountDisplay} cUSD</p>
        <p className="text-xs text-gray-400">Next: {nextDate}</p>
      </div>
      <button onClick={onCancel} className="text-xs text-red-400">Cancel</button>
    </div>
  );
}
