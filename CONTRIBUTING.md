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

## AI Agent development

The `agent/` module is a standalone Node.js package. To work on it:

```bash
cd agent
npm install
cp .env.example .env    # add AGENT_PRIVATE_KEY
npm run check           # verify on-chain registrations
npm run execute         # run executor against Celo mainnet
```

To test against Alfajores, update `CELO_RPC` in `agent/src/contracts.ts` and use testnet contract addresses.

The GitHub Actions workflow (`.github/workflows/agent-executor.yml`) runs the executor every hour via cron. Add `AGENT_PRIVATE_KEY` as a repository secret to activate it.

## Commit convention
Follow [Conventional Commits](https://www.conventionalcommits.org/):
`feat:`, `fix:`, `chore:`, `docs:`, `ci:`, `refactor:`
