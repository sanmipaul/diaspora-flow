"use client";

import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

export default function TransactionHistory() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];

  const { data: sentIds } = useReadContract({
    address: contractAddress || undefined,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getSentTransfers",
    args: address ? [address] : undefined,
  });

  const { data: receivedIds } = useReadContract({
    address: contractAddress || undefined,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getReceivedTransfers",
    args: address ? [address] : undefined,
  });

  const allIds = [...(sentIds ?? []), ...(receivedIds ?? [])].filter((v, i, a) => a.indexOf(v) === i);

  if (allIds.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">No transactions yet.</div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="font-semibold text-gray-800">Transaction History</h2>
      {allIds.map((id) => (
        <TransferRow key={id.toString()} transferId={id} contractAddress={contractAddress} userAddress={address!} />
      ))}
    </div>
  );
}

function TransferRow({ transferId, contractAddress, userAddress }: { transferId: bigint; contractAddress: `0x${string}`; userAddress: string }) {
  const { data } = useReadContract({
    address: contractAddress || undefined,
    abi: DIASPORA_FLOW_ABI,
    functionName: "transfers",
    args: [transferId],
  });

  if (!data) return null;

  const isSent = data[0].toLowerCase() === userAddress.toLowerCase();
  const amount = Number(formatUnits(data[2], 18)).toFixed(2);
  const date = new Date(Number(data[3]) * 1000).toLocaleDateString();
  const memo = data[4] as string | undefined;
  const counterparty = isSent ? data[1] : data[0];

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-800">
          {isSent ? "Sent to" : "Received from"}{" "}
          <span className="text-gray-500">{counterparty.slice(0, 6)}...{counterparty.slice(-4)}</span>
        </p>
        {memo && <p className="text-xs text-gray-400">{memo}</p>}
        <p className="text-xs text-gray-400">{date}</p>
      </div>
      <p className={`font-semibold ${isSent ? "text-red-500" : "text-brand-600"}`}>
        {isSent ? "-" : "+"}{amount} cUSD
      </p>
    </div>
  );
}
