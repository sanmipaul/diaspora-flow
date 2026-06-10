"use client";

import { useState, useEffect } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { toast } from "sonner";
import { DIASPORA_FLOW_ADDRESS, DIASPORA_FLOW_ABI } from "@/lib/contracts";

interface Props {
  onQuickSend?: (wallet: string) => void;
}

export default function FamilyProfiles({ onQuickSend }: Props) {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];
  const [adding, setAdding] = useState(false);
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");

  const { data: members, refetch } = useReadContract({
    address: contractAddress || undefined,
    abi: DIASPORA_FLOW_ABI,
    functionName: "getFamilyMembers",
    args: address ? [address] : undefined,
  });

  const { writeContract: addMember, data: addTx } = useWriteContract();
  const { writeContract: removeMember } = useWriteContract();
  const { isSuccess: addSuccess, isError: addError } = useWaitForTransactionReceipt({ hash: addTx });

  useEffect(() => {
    if (addSuccess) { refetch(); toast.success("Family member added!"); }
    if (addError) toast.error("Failed to add family member.");
  }, [addSuccess, addError, refetch]);

  function handleAdd() {
    if (!wallet || !name || !contractAddress) return;
    setAdding(false);
    addMember({ address: contractAddress, abi: DIASPORA_FLOW_ABI, functionName: "addFamilyMember", args: [wallet as `0x${string}`, name, relation] });
  }

  const active = members?.filter((m) => m.active) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">Family Members</h2>
        <button onClick={() => setAdding(!adding)} className="text-sm text-brand-600 font-medium">{adding ? "Cancel" : "+ Add"}</button>
      </div>

      {adding && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
          <input value={wallet} onChange={(e) => setWallet(e.target.value)} placeholder="Wallet address (0x...)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name (e.g. Mum)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation (e.g. Mother)"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
          <button onClick={handleAdd} className="w-full py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium">Save family member</button>
        </div>
      )}

      {active.length === 0 && !adding && (
        <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm shadow-sm">No family members added yet.</div>
      )}

      {active.map((m, i) => (
        <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{m.name}</p>
              <p className="text-xs text-gray-400">{m.relation}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.wallet.slice(0, 8)}...{m.wallet.slice(-6)}</p>
            </div>
            <div className="flex flex-col gap-1.5 items-end">
              {onQuickSend && (
                <button onClick={() => onQuickSend(m.wallet)}
                  className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-medium">
                  Send
                </button>
              )}
              <button onClick={() => contractAddress && removeMember({ address: contractAddress, abi: DIASPORA_FLOW_ABI, functionName: "removeFamilyMember", args: [BigInt(i)] })}
                className="text-xs text-red-400">Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
