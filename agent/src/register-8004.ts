/**
 * ERC-8004 Agent Registration Script
 *
 * Uploads registration.json to IPFS via Pinata, then calls the
 * ERC-8004 Identity Registry on Celo mainnet to mint an agent NFT.
 *
 * Run: npm run register:8004
 *
 * Prerequisites:
 *   1. AGENT_PRIVATE_KEY in .env
 *   2. PINATA_JWT in .env  (free tier at https://pinata.cloud)
 *   3. Edit registration.json: replace REPLACE_WITH_AGENT_WALLET_ADDRESS
 *      with your agent wallet address first
 *   4. Agent wallet funded with ~0.01 CELO for gas
 */

import { createPublicClient, createWalletClient, http } from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

import {
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REGISTRY_ABI,
  CELO_RPC,
} from "./contracts.js";

dotenv.config();

const REGISTRATION_JSON_PATH = path.resolve(
  new URL(".", import.meta.url).pathname,
  "../registration.json"
);

async function uploadToPinata(json: object): Promise<string> {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) throw new Error("PINATA_JWT not set in .env");

  const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      pinataContent: json,
      pinataMetadata: { name: "DiasporaFlow Agent Registration" },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Pinata upload failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { IpfsHash: string };
  return `ipfs://${data.IpfsHash}`;
}

async function main() {
  console.log("═".repeat(52));
  console.log("  DiasporaFlow  |  ERC-8004 Registration");
  console.log("═".repeat(52));

  // Load registration.json
  if (!fs.existsSync(REGISTRATION_JSON_PATH)) {
    throw new Error(`registration.json not found at ${REGISTRATION_JSON_PATH}`);
  }
  const registrationJson = JSON.parse(
    fs.readFileSync(REGISTRATION_JSON_PATH, "utf-8")
  );

  // Validate wallet placeholder is replaced
  const walletEndpoint = registrationJson.endpoints?.find(
    (e: { name: string }) => e.name === "wallet"
  );
  if (walletEndpoint?.address === "REPLACE_WITH_AGENT_WALLET_ADDRESS") {
    throw new Error(
      "Update registration.json: replace REPLACE_WITH_AGENT_WALLET_ADDRESS with your agent wallet address"
    );
  }

  const account = (() => {
    const pk = process.env.AGENT_PRIVATE_KEY;
    if (!pk) throw new Error("AGENT_PRIVATE_KEY not set in .env");
    return privateKeyToAccount(`0x${pk.replace(/^0x/, "")}`);
  })();

  console.log(`\nAgent wallet : ${account.address}`);
  console.log(`Registry     : ${ERC8004_IDENTITY_REGISTRY}`);

  const publicClient = createPublicClient({
    chain: celo,
    transport: http(CELO_RPC),
  });

  // Check if already registered
  const balance = await publicClient.readContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_REGISTRY_ABI,
    functionName: "balanceOf",
    args: [account.address],
  });

  if (balance > 0n) {
    const agentId = await publicClient.readContract({
      address: ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_REGISTRY_ABI,
      functionName: "tokenOfOwnerByIndex",
      args: [account.address, 0n],
    });
    console.log(`\n✓ Already registered!  Agent ID: ${agentId}`);
    console.log(
      `  View on 8004scan: https://8004scan.io/agents/celo/${agentId}`
    );
    return;
  }

  // Upload registration.json to IPFS
  console.log("\nUploading registration.json to IPFS via Pinata...");
  const agentURI = await uploadToPinata(registrationJson);
  console.log(`IPFS URI: ${agentURI}`);

  // Register on-chain
  console.log("\nCalling Identity Registry on Celo mainnet...");
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(CELO_RPC),
  });

  const hash = await walletClient.writeContract({
    address: ERC8004_IDENTITY_REGISTRY,
    abi: ERC8004_REGISTRY_ABI,
    functionName: "register",
    args: [agentURI],
  });

  console.log(`Transaction: https://celoscan.io/tx/${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  if (receipt.status === "success") {
    // Read back the new agent ID
    const newBalance = await publicClient.readContract({
      address: ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_REGISTRY_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });

    if (newBalance > 0n) {
      const agentId = await publicClient.readContract({
        address: ERC8004_IDENTITY_REGISTRY,
        abi: ERC8004_REGISTRY_ABI,
        functionName: "tokenOfOwnerByIndex",
        args: [account.address, 0n],
      });

      console.log(`\n✓ Registered!  Agent ID: ${agentId}`);
      console.log(
        `  View on 8004scan: https://8004scan.io/agents/celo/${agentId}`
      );
      console.log(`\nNext: add AGENT_8004_ID=${agentId} to your .env`);
    }
  } else {
    console.error("Transaction reverted. Check celoscan for details.");
  }
}

main().catch((err) => {
  console.error("Error:", err.message ?? err);
  process.exit(1);
});
