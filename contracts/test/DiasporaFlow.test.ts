import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import type { DiasporaFlow } from "../typechain-types";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("DiasporaFlow", function () {
  let contract: DiasporaFlow;
  let cUSD: Awaited<ReturnType<typeof ethers.deployContract>>;
  let owner: HardhatEthersSigner;
  let alice: HardhatEthersSigner;
  let bob: HardhatEthersSigner;
  let agent: HardhatEthersSigner;

  const ONE = ethers.parseUnits("1", 18);
  const HUNDRED = ethers.parseUnits("100", 18);
  const FEE_BPS = 30n;
  const BPS_DENOM = 10000n;

  function calcFee(amount: bigint) {
    return (amount * FEE_BPS) / BPS_DENOM;
  }

  beforeEach(async () => {
    [owner, alice, bob, agent] = await ethers.getSigners();
    const MockCUSD = await ethers.getContractFactory("MockCUSD");
    cUSD = await MockCUSD.deploy();
    const Factory = await ethers.getContractFactory("DiasporaFlow");
    contract = (await Factory.deploy(await cUSD.getAddress())) as DiasporaFlow;
    await cUSD.mint(alice.address, HUNDRED);
  });
});
