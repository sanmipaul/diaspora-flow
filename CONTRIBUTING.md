# Contributing to DiasporaFlow

## Prerequisites
- Node.js 18+
- A Celo wallet with testnet funds (get from [Alfajores faucet](https://faucet.celo.org))

## Development workflow
1. Fork and clone the repo
2. Set up contracts: `cd contracts && npm install && cp .env.example .env`
3. Deploy to Alfajores: `npm run deploy:alfajores`
4. Paste the deployed address into `frontend/lib/contracts.ts`
5. Start the frontend: `cd frontend && npm install && npm run dev`

## Commit convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`
