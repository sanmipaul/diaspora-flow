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
  {
    name: "addFamilyMember",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "name", type: "string" },
      { name: "relation", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "removeFamilyMember",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [],
  },
  {
    name: "getFamilyMembers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "relation", type: "string" },
          { name: "active", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "getSentTransfers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getReceivedTransfers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "getUserSchedules",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "uint256[]" }],
  },
  {
    name: "transfers",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "timestamp", type: "uint256" },
      { name: "memo", type: "string" },
    ],
  },
  {
    name: "schedules",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "sender", type: "address" },
      { name: "recipient", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interval", type: "uint256" },
      { name: "nextExecution", type: "uint256" },
      { name: "active", type: "bool" },
      { name: "label", type: "string" },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "decimals",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
  },
] as const;
