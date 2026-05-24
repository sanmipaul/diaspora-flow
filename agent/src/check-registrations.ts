/**
 * Registration Status Checker
 *
 * Prints ERC-8004 and Self Agent ID status for the agent wallet.
 * Run this anytime to verify your registrations are live on-chain.
 *
 * Run: npm run check
 */

import { createPublicClient, http, type Address } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

import {
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REGISTRY_ABI,
  SELF_AGENT_REGISTRY,
  SELF_REGISTRY_ABI,
  CELO_RPC,
} from "./contracts.js";

dotenv.config();

const publicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

async function check8004(address: Address) {
  const balance = await publicClient.readContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_REGISTRY_ABI,
    functionName: "balanceOf",
    args: [address],
  });

  if (balance === 0n) return { registered: false };

  const agentIdFromEnv = process.env.AGENT_8004_ID
    ? BigInt(process.env.AGENT_8004_ID)
    : undefined;

  if (!agentIdFromEnv) return { registered: true };

  try {
    const uri = await publicClient.readContract({
      address: ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_REGISTRY_ABI,
      functionName: "tokenURI",
      args: [agentIdFromEnv],
    });
    return { registered: true, agentId: agentIdFromEnv, uri };
  } catch {
    return { registered: true, agentId: agentIdFromEnv };
  }
}

async function checkSelf(address: Address) {
  const isVerified = await publicClient.readContract({
    address: SELF_AGENT_REGISTRY,
    abi: SELF_REGISTRY_ABI,
    functionName: "isVerifiedAgent",
    args: [address],
  });

  if (!isVerified) return { registered: false };

  const agentId = await publicClient.readContract({
    address: SELF_AGENT_REGISTRY,
    abi: SELF_REGISTRY_ABI,
    functionName: "getAgentId",
    args: [address],
  });

  const proofFresh = await publicClient.readContract({
    address: SELF_AGENT_REGISTRY,
    abi: SELF_REGISTRY_ABI,
    functionName: "isProofFresh",
    args: [agentId],
  });

  return { registered: true, agentId, proofFresh };
}

async function main() {
  console.log("═".repeat(52));
  console.log("  DiasporaFlow Agent  |  Registration Status");
  console.log("═".repeat(52));

  const pk = process.env.AGENT_PRIVATE_KEY;
  if (!pk) throw new Error("AGENT_PRIVATE_KEY not set in .env");

  const account = privateKeyToAccount(`0x${pk.replace(/^0x/, "")}`);
  console.log(`\nAgent wallet: ${account.address}`);
  console.log(`Celoscan    : https://celoscan.io/address/${account.address}\n`);

  const [erc8004, self] = await Promise.all([
    check8004(account.address).catch(() => ({ registered: false, error: true })),
    checkSelf(account.address).catch(() => ({ registered: false, error: true })),
  ]);

  // ERC-8004
  if ("error" in erc8004) {
    console.log("ERC-8004  : ⚠  Could not query registry (RPC issue?)");
  } else if (erc8004.registered && "agentId" in erc8004) {
    console.log(`ERC-8004  : ✓  Agent ID #${erc8004.agentId}`);
    console.log(`             https://8004scan.io/agents/celo/${erc8004.agentId}`);
    console.log(`             URI: ${erc8004.uri}`);
  } else {
    console.log("ERC-8004  : ✗  Not registered");
    console.log("             Run: npm run register:8004");
  }

  console.log();

  // Self Agent ID
  if ("error" in self) {
    console.log("Self ID   : ⚠  Could not query registry (RPC issue?)");
  } else if (self.registered && "agentId" in self) {
    const freshLabel = "proofFresh" in self && self.proofFresh ? "proof fresh" : "proof expired — re-verify passport";
    console.log(`Self ID   : ✓  Agent ID #${self.agentId}  (${freshLabel})`);
  } else {
    console.log("Self ID   : ✗  Not registered");
    console.log("             Visit: https://app.ai.self.xyz");
    console.log("             Scan your passport with the Self mobile app");
    console.log(`             Use wallet: ${account.address}`);
  }

  console.log();

  const allGood = erc8004.registered && self.registered;
  if (allGood) {
    console.log("✓ All AI Track requirements met — you qualify for the $250 pool!");
  } else {
    const missing = [
      !erc8004.registered && "ERC-8004",
      !self.registered && "Self Agent ID",
    ]
      .filter(Boolean)
      .join(", ");
    console.log(`⚠  Missing: ${missing}`);
    console.log("   Complete these before May 25 to qualify for the AI Track.");
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
