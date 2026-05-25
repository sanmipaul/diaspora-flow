import { parseAbiItem } from "viem";

// ── DiasporaFlow ────────────────────────────────────────────────────────────
export const DIASPORA_FLOW_ADDRESS =
  "0x735983527295A6E15e7a9593ba52f3EE9aE648e3" as const;

export const CUSD_ADDRESS =
  "0x765DE816845861e75A25fCA122bb6898B8B1282a" as const;

// Approximate Celo mainnet block where DiasporaFlow was deployed (May 2026)
export const DEPLOY_FROM_BLOCK = 66900000n;

export const DIASPORA_FLOW_ABI = [
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
  {
    name: "executeRecurring",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "scheduleId", type: "uint256" }],
    outputs: [],
  },
] as const;

export const RECURRING_SCHEDULED_EVENT = parseAbiItem(
  "event RecurringScheduled(uint256 indexed scheduleId, address indexed sender, address indexed recipient, uint256 amount, uint256 interval)"
);

export const RECURRING_CANCELLED_EVENT = parseAbiItem(
  "event RecurringCancelled(uint256 indexed scheduleId)"
);

// ── ERC-8004 Identity Registry ───────────────────────────────────────────────
// Deployed on Celo mainnet: https://8004scan.io
export const ERC8004_IDENTITY_REGISTRY =
  "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as const;

export const ERC8004_REGISTRY_ABI = [
  {
    name: "register",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "agentURI", type: "string" }],
    outputs: [{ name: "agentId", type: "uint256" }],
  },
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenOfOwnerByIndex",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "index", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "tokenURI",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

// ── Self Agent Registry ──────────────────────────────────────────────────────
// Celo mainnet: https://app.ai.self.xyz
export const SELF_AGENT_REGISTRY =
  "0xaC3DF9ABf80d0F5c020C06B04Cced27763355944" as const;

export const SELF_REGISTRY_ABI = [
  {
    name: "balanceOf",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "name",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
] as const;

export const CELO_RPC = "https://forno.celo.org";
