"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
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
  const [intervalIdx, setIntervalIdx] = useState(2);

  const { data: scheduleIds } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getUserSchedules",
    args: address ? [address] : undefined,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Recurring Transfers</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm text-brand-600 font-medium">
          {adding ? "Cancel" : "+ New"}
        </button>
      </div>
      {(!scheduleIds || scheduleIds.length === 0) && !adding && (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">
          No recurring schedules set up.
        </div>
      )}
    </div>
  );
}
