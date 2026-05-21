import { formatUnits, type Address } from "viem";

export function shortAddress(address: Address): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCUSD(wei: bigint, decimals = 2): string {
  return `${Number(formatUnits(wei, 18)).toFixed(decimals)} cUSD`;
}

export function formatDate(unixSeconds: bigint): string {
  return new Date(Number(unixSeconds) * 1000).toLocaleString();
}

export function secondsUntil(unixSeconds: bigint): string {
  const now = BigInt(Math.floor(Date.now() / 1000));
  if (unixSeconds <= now) return "overdue";
  const diff = Number(unixSeconds - now);
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function celoscanTx(hash: string): string {
  return `https://celoscan.io/tx/${hash}`;
}

export function celoscanAddress(address: Address): string {
  return `https://celoscan.io/address/${address}`;
}
