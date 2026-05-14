# DiasporaFlow

Cross-border remittance MiniPay mini app. Send cUSD to family at **0.3% fee** vs 8–9% traditional.

## Features
- Send cUSD to any wallet with transparent fee breakdown
- Family profiles for quick repeat transfers
- Recurring/scheduled transfers (weekly, bi-weekly, monthly)
- Full transaction history with sent/received view

## Stack
- **Frontend:** Next.js 14 + TypeScript + TailwindCSS
- **Web3:** Wagmi v2 + viem (Celo chain)
- **Contract:** Solidity 0.8.20 + Hardhat + OpenZeppelin

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
# paste deployed address into frontend/lib/contracts.ts
npm run dev
```

## Contract
`DiasporaFlow.sol` handles transfers, recurring schedules, and family member registry.

| Network | cUSD address |
|---------|-------------|
| Celo mainnet | `0x765DE816845861e75A25fCA122bb6898B8B1282a` |
| Alfajores | `0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1` |

## License
MIT
