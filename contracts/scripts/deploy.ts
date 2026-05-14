import { ethers, network } from "hardhat";

const CUSD_MAINNET = "0x765DE816845861e75A25fCA122bb6898B8B1282a";
const CUSD_ALFAJORES = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const cUSD = network.name === "celo" ? CUSD_MAINNET : CUSD_ALFAJORES;
  const DiasporaFlow = await ethers.getContractFactory("DiasporaFlow");
  const contract = await DiasporaFlow.deploy(cUSD);
  await contract.waitForDeployment();

  console.log("DiasporaFlow deployed to:", await contract.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
