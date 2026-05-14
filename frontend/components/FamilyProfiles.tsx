"use client";

import { useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

export default function FamilyProfiles() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];
  const [adding, setAdding] = useState(false);
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");

  const { data: members } = useReadContract({
    address: contractAddress,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getFamilyMembers",
    args: address ? [address] : undefined,
  });

  const active = members?.filter((m) => m.active) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Family Members</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm text-brand-600 font-medium">
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Wallet address (0x...)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Mum)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation (e.g. Mother)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      )}

      {active.length === 0 && !adding && (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">No family members added yet.</div>
      )}
    </div>
  );
}
