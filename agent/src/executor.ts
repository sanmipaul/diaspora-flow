/**
 * DiasporaFlow Recurring Transfer Executor
 *
 * Scans the DiasporaFlow contract for recurring schedules that are due,
 * simulates each execution, and fires the transaction if it will succeed.
 *
 * Run:   npm run execute
 * Cron:  0 * * * * (every hour) or schedule via Railway / Render
 *
 * Prerequisites:
 *   1. AGENT_PRIVATE_KEY in .env — wallet registered with ERC-8004 + Self Agent ID
 *   2. Wallet funded with ~0.05 CELO for gas
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  formatUnits,
  type Address,
} from "viem";
import { celo } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import * as dotenv from "dotenv";

import {
  DIASPORA_FLOW_ADDRESS,
  DIASPORA_FLOW_ABI,
  RECURRING_SCHEDULED_EVENT,
  RECURRING_CANCELLED_EVENT,
  ERC8004_IDENTITY_REGISTRY,
  ERC8004_REGISTRY_ABI,
  SELF_AGENT_REGISTRY,
  SELF_REGISTRY_ABI,
  DEPLOY_FROM_BLOCK,
  CELO_RPC,
} from "./contracts.js";
import { celoscanTx, formatCUSD, secondsUntil } from "./utils.js";

dotenv.config();

const publicClient = createPublicClient({
  chain: celo,
  transport: http(CELO_RPC),
});

function getAccount() {
  const pk = process.env.AGENT_PRIVATE_KEY;
  if (!pk) throw new Error("AGENT_PRIVATE_KEY not set in .env");
  return privateKeyToAccount(`0x${pk.replace(/^0x/, "")}`);
}

// ── Registry checks ──────────────────────────────────────────────────────────

async function check8004Registration(address: Address): Promise<boolean> {
  try {
    const balance = await publicClient.readContract({
      address: ERC8004_IDENTITY_REGISTRY,
      abi: ERC8004_REGISTRY_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return balance > 0n;
  } catch {
    return false;
  }
}

async function checkSelfRegistration(address: Address): Promise<boolean> {
  try {
    const balance = await publicClient.readContract({
      address: SELF_AGENT_REGISTRY,
      abi: SELF_REGISTRY_ABI,
      functionName: "balanceOf",
      args: [address],
    });
    return balance > 0n;
  } catch {
    return false;
  }
}

// ── Schedule discovery ───────────────────────────────────────────────────────

const CHUNK_SIZE = 500000n;

async function getActiveScheduleIds(): Promise<Set<bigint>> {
  const latest = await publicClient.getBlockNumber();
  const scheduledLogs: Awaited<ReturnType<typeof publicClient.getLogs<typeof RECURRING_SCHEDULED_EVENT>>> = [];
  const cancelledLogs: Awaited<ReturnType<typeof publicClient.getLogs<typeof RECURRING_CANCELLED_EVENT>>> = [];

  for (let start = DEPLOY_FROM_BLOCK; start <= latest; start += CHUNK_SIZE) {
    const toBlock = start + CHUNK_SIZE - 1n < latest ? start + CHUNK_SIZE - 1n : latest;
    const [s, c] = await Promise.all([
      publicClient.getLogs({ address: DIASPORA_FLOW_ADDRESS, event: RECURRING_SCHEDULED_EVENT, fromBlock: start, toBlock }),
      publicClient.getLogs({ address: DIASPORA_FLOW_ADDRESS, event: RECURRING_CANCELLED_EVENT, fromBlock: start, toBlock }),
    ]);
    scheduledLogs.push(...s);
    cancelledLogs.push(...c);
  }

  const cancelled = new Set(
    cancelledLogs
      .map((l) => l.args.scheduleId)
      .filter((id): id is bigint => id !== undefined)
  );

  const active = new Set<bigint>();
  for (const log of scheduledLogs) {
    const id = log.args.scheduleId;
    if (id !== undefined && !cancelled.has(id)) active.add(id);
  }
  return active;
}

// ── Due schedule detection ───────────────────────────────────────────────────

async function getDueSchedules(ids: Set<bigint>): Promise<bigint[]> {
  const now = BigInt(Math.floor(Date.now() / 1000));
  const due: bigint[] = [];

  await Promise.all(
    [...ids].map(async (id) => {
      const s = await publicClient.readContract({
        address: DIASPORA_FLOW_ADDRESS,
        abi: DIASPORA_FLOW_ABI,
        functionName: "schedules",
        args: [id],
      });
      if (s.active && s.nextExecution <= now) due.push(id);
    })
  );

  return due;
}

// ── Execution ────────────────────────────────────────────────────────────────

async function executeSchedule(
  walletClient: ReturnType<typeof createWalletClient>,
  account: ReturnType<typeof getAccount>,
  scheduleId: bigint
): Promise<{ success: boolean; hash?: string; reason?: string }> {
  // Simulate first — avoids wasting gas on guaranteed reverts
  try {
    await publicClient.simulateContract({
      address: DIASPORA_FLOW_ADDRESS,
      abi: DIASPORA_FLOW_ABI,
      functionName: "executeRecurring",
      args: [scheduleId],
      account: account.address,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const short = msg.includes("reason:")
      ? msg.split("reason:")[1].trim()
      : msg.slice(0, 120);
    return { success: false, reason: `sim: ${short}` };
  }

  // Submit the real transaction
  const hash = await walletClient.writeContract({
    address: DIASPORA_FLOW_ADDRESS,
    abi: DIASPORA_FLOW_ABI,
    functionName: "executeRecurring",
    args: [scheduleId],
  });

  await publicClient.waitForTransactionReceipt({ hash });
  return { success: true, hash };
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("═".repeat(52));
  console.log("  DiasporaFlow Recurring Executor  |  Celo Mainnet");
  console.log("═".repeat(52));

  const account = getAccount();
  const walletClient = createWalletClient({
    account,
    chain: celo,
    transport: http(CELO_RPC),
  });

  console.log(`\nAgent wallet : ${account.address}`);

  // Print registration status
  const [has8004, hasSelf] = await Promise.all([
    check8004Registration(account.address),
    checkSelfRegistration(account.address),
  ]);
  console.log(`ERC-8004     : ${has8004 ? "✓ registered" : "✗ not registered — run: npm run register:8004"}`);
  console.log(`Self Agent ID: ${hasSelf ? "✓ verified" : "✗ not registered — visit: https://app.ai.self.xyz"}`);

  // Fetch agent CELO balance
  const celoBalance = await publicClient.getBalance({ address: account.address });
  console.log(`CELO balance : ${formatUnits(celoBalance, 18)} CELO`);

  if (celoBalance < 10000000000000000n) {
    console.log("⚠  Low CELO balance — fund the agent wallet with ≥0.01 CELO for gas.");
  }

  // Discover schedules
  console.log("\nScanning DiasporaFlow schedules...");
  const activeIds = await getActiveScheduleIds();
  console.log(`Active schedules found : ${activeIds.size}`);

  const dueIds = await getDueSchedules(activeIds);
  console.log(`Due for execution now  : ${dueIds.length}`);

  if (dueIds.length === 0) {
    console.log("\nNothing to execute. Exiting cleanly.");
    return;
  }

  // Execute
  console.log("\nExecuting due schedules:");
  let passed = 0;
  let skipped = 0;

  for (const id of dueIds) {
    const result = await executeSchedule(walletClient, account, id);
    if (result.success) {
      console.log(`  ✓  Schedule #${id}  →  ${celoscanTx(result.hash!)}`);
      passed++;
    } else {
      console.log(`  ✗  Schedule #${id}  —  ${result.reason}`);
      skipped++;
    }
  }

  console.log(`\nDone.  Executed: ${passed}  |  Skipped: ${skipped}`);
  console.log(`View agent on 8004scan: https://8004scan.io/agents/celo`);
}

main().catch((err) => {
  console.error("Fatal:", err.message ?? err);
  process.exit(1);
});
