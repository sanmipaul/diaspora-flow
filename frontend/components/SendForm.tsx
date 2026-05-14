"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { DIASPORA_FLOW_ADDRESS, CUSD_ADDRESS, ERC20_ABI } from "@/lib/contracts";

export default function SendForm() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];
  const cUSD = CUSD_ADDRESS[chainId] as `0x${string}`;

  const { data: balance } = useReadContract({
    address: cUSD,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const formattedBalance = balance ? Number(formatUnits(balance, 18)).toFixed(2) : "0.00";

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Available balance</span>
        <span className="font-medium text-gray-800">{formattedBalance} cUSD</span>
      </div>
    </div>
  );
}
