import { NextResponse } from "next/server";

// A2A-compatible agent card served at /api/agent-card
// Referenced in registration.json as the A2A endpoint for ERC-8004 discovery
export async function GET() {
  const card = {
    name: "DiasporaFlow Recurring Executor",
    description:
      "AI agent that automatically executes scheduled cross-border remittances on Celo. " +
      "Saves diaspora families 7–8% vs traditional services by triggering cUSD transfers when due.",
    url: "https://diaspora-flow.vercel.app/api/agent-card",
    version: "1.0.0",
    provider: {
      organization: "DiasporaFlow",
      url: "https://diaspora-flow.vercel.app",
    },
    capabilities: {
      streaming: false,
      pushNotifications: false,
      stateTransitionHistory: true,
    },
    skills: [
      {
        id: "execute-recurring-transfer",
        name: "Execute Recurring Transfer",
        description:
          "Checks DiasporaFlow contract for due recurring schedules and executes them on-chain via executeRecurring(scheduleId).",
        tags: ["remittance", "celo", "cUSD", "recurring", "defi"],
        inputSchema: {
          type: "object",
          properties: {
            scheduleId: {
              type: "number",
              description: "The recurring schedule ID to execute",
            },
          },
        },
      },
    ],
    authentication: {
      schemes: ["ERC-8004-signature"],
    },
    contract: {
      address: "0x735983527295A6E15e7a9593ba52f3EE9aE648e3",
      chain: "celo",
      chainId: 42220,
    },
  };

  return NextResponse.json(card, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
