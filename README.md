# DiasporaFlow

Cross-border remittance MiniPay mini app.

Send cUSD to family at 0.3% fee vs 8–9% traditional.

## Features
- Send cUSD to any wallet with transparent fee breakdown
- Family profiles for quick repeat transfers
- Recurring/scheduled transfers (weekly, bi-weekly, monthly)
- Full transaction history

## Stack
- Next.js 14 + TypeScript + TailwindCSS
- Wagmi v2 + viem (Celo chain)
- Solidity (Hardhat) smart contract

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
npm run dev
```
