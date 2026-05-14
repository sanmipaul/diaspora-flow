import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
