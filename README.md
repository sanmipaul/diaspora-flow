# DiasporaFlow

Cross-border remittance MiniPay mini app. Send cUSD to family at **0.3% fee** vs 8–9% traditional.

## Features

| Feature | Description |
|---------|-------------|
| Send cUSD | Transparent fee breakdown, approve-and-send in one flow |
| Family profiles | Save addresses for quick repeat transfers |
| Recurring transfers | Weekly / bi-weekly / monthly schedules on-chain |
| Transaction history | Full sent + received view |
| Protocol stats | Live onchain metrics — volume, transfers, fees, users |
| **AI Agent** | Auto-executes scheduled transfers · ERC-8004 + Self Agent ID |

## Stack

- **Frontend:** Next.js 14 + TypeScript + TailwindCSS
- **Web3:** Wagmi v2 + viem (Celo chain)
- **Contract:** Solidity 0.8.20 + Hardhat + OpenZeppelin
- **AI Agent:** ERC-8004 identity · Self Agent ID · Celo mainnet

## Deployed Contracts

| Network | DiasporaFlow | cUSD |
|---------|-------------|------|
| Celo mainnet | `0x735983527295A6E15e7a9593ba52f3EE9aE648e3` | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| Alfajores | — | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |

## Setup

### Contracts
```bash
cd contracts
npm install
cp .env.example .env   # add PRIVATE_KEY
npm run deploy:alfajores
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

### AI Agent
```bash
cd agent
npm install
cp .env.example .env        # add AGENT_PRIVATE_KEY + PINATA_JWT
npm run register:8004       # mint ERC-8004 identity NFT on Celo
# then visit app.ai.self.xyz to get Self Agent ID
npm run check               # verify both registrations
npm run execute             # run the recurring transfer executor
```

See [agent/README.md](agent/README.md) for the full guide.

## AI Agent — Celo Proof of Ship AI Track

DiasporaFlow includes a registered on-chain AI agent that qualifies for the [Celo Proof of Ship AI Track](https://www.celopg.eco/programs/proof-of-ship):

| Requirement | Implementation |
|------------|----------------|
| Registered with ERC-8004 | Identity Registry `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432` |
| Self Agent ID | Self Agent Registry `0xaC3DF9ABf80d0F5c020C06B04Cced27763355944` |
| Agent wallet onchain activity | Executes `executeRecurring()` on DiasporaFlow contract |

The agent runs on a GitHub Actions cron schedule (hourly) and can be verified at [8004scan.io](https://8004scan.io).

## License

MIT
