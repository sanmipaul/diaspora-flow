"use client";

import { useAccount, useChainId } from "wagmi";
import { DIASPORA_FLOW_ADDRESS } from "@/lib/contracts";

export default function FamilyProfiles() {
  const { address } = useAccount();
  const chainId = useChainId() as 42220 | 44787;
  const contractAddress = DIASPORA_FLOW_ADDRESS[chainId];

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-800">Family Members</h2>
    </div>
  );
}
