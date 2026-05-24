# DiasporaFlow AI Agent

On-chain AI agent registered with **ERC-8004** and **Self Agent ID** that automatically executes scheduled cross-border remittances on Celo mainnet.

## What it does

Users can set up recurring cUSD transfers (weekly / bi-weekly / monthly) on the DiasporaFlow contract. Without the agent, these require manual execution. The agent watches the chain and fires `executeRecurring(scheduleId)` the moment a transfer becomes due — so families never miss a payment.

## Registered Agent

| Property | Value |
|----------|-------|
| Agent wallet | `0x96fbc86fCf4eAB5E94b7d74BE1f8D135E8b9BFC3` |
| ERC-8004 Agent ID | [#9145](https://8004scan.io/agents/celo/9145) |
| Self Agent ID | pending — visit [app.ai.self.xyz](https://app.ai.self.xyz) |
| Registration tx | [celoscan](https://celoscan.io/tx/0xba21e33f3bb6f37444b3ed7f086624f5f341af749491e2e9a99b95377665d714) |

## Registries

| Registry | Address |
|----------|---------|
| ERC-8004 Identity Registry | `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Self Agent Registry | `0xaC3DF9ABf80d0F5c020C06B04Cced27763355944` |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create your agent wallet
```bash
# Install Foundry if needed: curl -L https://foundry.paradigm.xyz | bash
cast wallet new
# Save the address and private key — this wallet IS the agent identity
```

### 3. Configure environment
```bash
cp .env.example .env
# Fill in AGENT_PRIVATE_KEY and PINATA_JWT
```

### 4. Edit registration.json
Replace `REPLACE_WITH_AGENT_WALLET_ADDRESS` with your agent wallet address.

### 5. Register with ERC-8004
Fund the agent wallet with ~0.01 CELO, then:
```bash
npm run register:8004
# Mints an ERC-721 NFT → you get an agent ID
# Note the ID and add AGENT_8004_ID to .env
```

### 6. Get Self Agent ID
1. Download the **Self app** on your phone
2. Go to [app.ai.self.xyz](https://app.ai.self.xyz)
3. Scan the QR code → scan your passport
4. Bind to your agent wallet address

### 7. Check registrations
```bash
npm run check
# Should print: ✓ All AI Track requirements met
```

### 8. Run the executor
```bash
npm run execute
```

## Running on a schedule

### GitHub Actions (recommended)
The included `.github/workflows/agent-executor.yml` runs the executor every hour automatically. Set these repository secrets:
- `AGENT_PRIVATE_KEY` — your agent wallet private key

### Cron (local)
```
0 * * * * cd /path/to/diaspora-flow/agent && npm run execute >> /tmp/agent.log 2>&1
```

### Railway / Render
Deploy as a cron job service pointing to `npm run execute`.

## Architecture

```
executor.ts
  ├── getLogs(RecurringScheduled)     scan all schedule IDs from contract events
  ├── getLogs(RecurringCancelled)     filter out cancelled ones
  ├── readContract(schedules[id])     check active + nextExecution <= now
  ├── simulateContract(executeRecurring)   dry-run to avoid wasted gas
  └── writeContract(executeRecurring)     fire the real tx
```

## Agent wallet requirements

- ~0.05 CELO for gas (each execution costs ~$0.001)
- No cUSD needed — the transfer funds come from the schedule's sender wallet
