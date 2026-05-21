// Serves the A2A agent card at the standard well-known path:
// GET /.well-known/agent.json
// This is the canonical discovery URL referenced in the ERC-8004 registration.json
import { redirect } from "next/navigation";

export function GET() {
  redirect("/api/agent-card");
}
