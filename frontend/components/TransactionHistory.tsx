"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

export default function TransactionHistory() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];

  const { data: sentIds } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getSentTransfers",
    args: address ? [address] : undefined,
  });

  const { data: receivedIds } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getReceivedTransfers",
    args: address ? [address] : undefined,
  });

  const allIds = [...(sentIds ?? []), ...(receivedIds ?? [])].filter((v, i, a) => a.indexOf(v) === i);

  if (allIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-800">Transaction History</h2>
    </div>
  );
}
