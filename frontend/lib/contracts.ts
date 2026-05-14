export const CUSD_ADDRESS = {
  42220: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  44787: "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1",
} as const;

export const DIASPORA_FLOW_ADDRESS = {
  42220: "" as `0x${string}`,
  44787: "" as `0x${string}`,
} as const;

export const DIASPORA_FLOW_ABI = [
  {
    name: "send",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "memo", type: "string" },
    ],
    outputs: [{ name: "transferId", type: "uint256" }],
  },
  {
    name: "scheduleRecurring",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interval", type: "uint256" },
      { name: "label", type: "string" },
    ],
    outputs: [{ name: "scheduleId", type: "uint256" }],
  },
  {
    name: "cancelRecurring",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "scheduleId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "executeRecurring",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "scheduleId", type: "uint256" }],
    outputs: [],
  },
] as const;
