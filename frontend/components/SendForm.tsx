"use client";

import { useState } from "react";
import { useAccount, useChainId } from "wagmi";
import { DIASPORA_FLOW_ADDRESS } from "@/lib/contracts";

export default function SendForm() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");

  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <p className="text-sm text-gray-400">Loading...</p>
    </div>
  );
}
