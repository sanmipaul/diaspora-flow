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

  describe("send()", () => {
    it("transfers net amount to recipient and collects fee", async () => {
      const fee = calcFee(ONE);
      const net = ONE - fee;
      await cUSD.connect(alice).approve(await contract.getAddress(), ONE);
      await contract.connect(alice).send(bob.address, ONE, "School fees");
      expect(await cUSD.balanceOf(bob.address)).to.equal(net);
      expect(await contract.collectedFees()).to.equal(fee);
    });

    it("emits TransferSent with correct arguments", async () => {
      const fee = calcFee(ONE);
      const net = ONE - fee;
      await cUSD.connect(alice).approve(await contract.getAddress(), ONE);
      await expect(contract.connect(alice).send(bob.address, ONE, "Rent"))
        .to.emit(contract, "TransferSent")
        .withArgs(0n, alice.address, bob.address, net, fee, "Rent");
    });

    it("records transferId in sent and received mappings", async () => {
      await cUSD.connect(alice).approve(await contract.getAddress(), ONE);
      await contract.connect(alice).send(bob.address, ONE, "");
      const sentIds = await contract.getSentTransfers(alice.address);
      const receivedIds = await contract.getReceivedTransfers(bob.address);
      expect(sentIds.length).to.equal(1);
      expect(receivedIds.length).to.equal(1);
      expect(sentIds[0]).to.equal(0n);
    });

    it("reverts on zero amount", async () => {
      await expect(contract.connect(alice).send(bob.address, 0n, "")).to.be.revertedWith("Amount must be > 0");
    });

    it("reverts on zero address recipient", async () => {
      await expect(contract.connect(alice).send(ethers.ZeroAddress, ONE, "")).to.be.revertedWith("Invalid recipient");
    });

    it("reverts without ERC20 approval", async () => {
      await expect(contract.connect(alice).send(bob.address, ONE, "")).to.be.reverted;
    });
  });

  describe("scheduleRecurring()", () => {
    const WEEKLY = BigInt(7 * 24 * 3600);

    it("stores schedule and emits RecurringScheduled", async () => {
      await expect(contract.connect(alice).scheduleRecurring(bob.address, ONE, WEEKLY, "Mum"))
        .to.emit(contract, "RecurringScheduled")
        .withArgs(0n, alice.address, bob.address, ONE, WEEKLY);
      const ids = await contract.getUserSchedules(alice.address);
      expect(ids.length).to.equal(1);
      const s = await contract.schedules(0n);
      expect(s.active).to.be.true;
      expect(s.label).to.equal("Mum");
    });

    it("reverts when interval is below 1 day", async () => {
      await expect(
        contract.connect(alice).scheduleRecurring(bob.address, ONE, BigInt(3600), "")
      ).to.be.revertedWith("Interval too short");
    });
  });

  describe("executeRecurring()", () => {
    const WEEKLY = BigInt(7 * 24 * 3600);

    beforeEach(async () => {
      await contract.connect(alice).scheduleRecurring(bob.address, ONE, WEEKLY, "weekly");
      await cUSD.connect(alice).approve(await contract.getAddress(), ethers.MaxUint256);
    });

    it("executes transfer to recipient when due", async () => {
      await time.increase(Number(WEEKLY) + 60);
      const bobBefore = await cUSD.balanceOf(bob.address);
      await contract.connect(agent).executeRecurring(0n);
      const net = ONE - calcFee(ONE);
      expect(await cUSD.balanceOf(bob.address) - bobBefore).to.equal(net);
    });

    it("advances nextExecution by one interval after run", async () => {
      await time.increase(Number(WEEKLY) + 60);
      await contract.connect(agent).executeRecurring(0n);
      const s = await contract.schedules(0n);
      const latest = await time.latest();
      expect(s.nextExecution).to.be.approximately(BigInt(latest) + WEEKLY, 5n);
    });

    it("reverts when called before due time", async () => {
      await expect(contract.connect(agent).executeRecurring(0n)).to.be.revertedWith("Too early");
    });

    it("reverts on cancelled schedule", async () => {
      await contract.connect(alice).cancelRecurring(0n);
      await time.increase(Number(WEEKLY) + 60);
      await expect(contract.connect(agent).executeRecurring(0n)).to.be.revertedWith("Schedule inactive");
    });
  });

  describe("cancelRecurring()", () => {
    it("marks schedule inactive and emits RecurringCancelled", async () => {
      await contract.connect(alice).scheduleRecurring(bob.address, ONE, BigInt(86400), "daily");
      await expect(contract.connect(alice).cancelRecurring(0n))
        .to.emit(contract, "RecurringCancelled")
        .withArgs(0n);
      expect((await contract.schedules(0n)).active).to.be.false;
    });
  });
});
