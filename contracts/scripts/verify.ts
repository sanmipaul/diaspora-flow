import { run } from "hardhat";

const DIASPORAFLOW = "0x735983527295A6E15e7a9593ba52f3EE9aE648e3";
const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";

async function main() {
  console.log("Verifying DiasporaFlow on Celoscan...");
  await run("verify:verify", {
    address: DIASPORAFLOW,
    constructorArguments: [CUSD_MAINNET],
    contract: "contracts/DiasporaFlow.sol:DiasporaFlow",
  });
  console.log("Verified: https://celoscan.io/address/" + DIASPORAFLOW + "#code");
}

main().catch((e) => { console.error(e); process.exit(1); });
