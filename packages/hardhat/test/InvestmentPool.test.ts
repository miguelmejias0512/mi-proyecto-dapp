import { expect } from "chai";
import { ethers } from "hardhat";
import { InvestmentPool } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("InvestmentPool", function () {
  let investmentPool: InvestmentPool;
  let owner: HardhatEthersSigner;
  let member1: HardhatEthersSigner;
  let member2: HardhatEthersSigner;
  let recipient: HardhatEthersSigner;

  const ADMIN_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"));

  beforeEach(async function () {
    // Get signers
    [owner, member1, member2, recipient] = await ethers.getSigners();

    // Deploy contract
    const InvestmentPoolFactory = await ethers.getContractFactory("InvestmentPool");
    investmentPool = await InvestmentPoolFactory.deploy();
    await investmentPool.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await investmentPool.hasRole(await investmentPool.DEFAULT_ADMIN_ROLE(), owner.address)).to.be.true;
    });

    it("Should grant ADMIN_ROLE to owner", async function () {
      expect(await investmentPool.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
    });

    it("Should set correct minimum deposit", async function () {
      const minimumDeposit = await investmentPool.minimumDeposit();
      expect(minimumDeposit).to.equal(ethers.parseEther("0.01"));
    });

    it("Should have zero initial pool balance", async function () {
      const poolBalance = await investmentPool.getPoolBalance();
      expect(poolBalance).to.equal(0);
    });

    it("Should have the right initial greeting message", async function () {
      expect(await investmentPool.greeting()).to.equal("Building Unstoppable Investment Pools!!!");
    });

    it("Should have zero initial deposit counter", async function () {
      const counter = await investmentPool.totalDepositCounter();
      expect(counter).to.equal(0);
    });
  });

  describe("Deposits", function () {
    it("Should allow deposits above minimum", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await expect(investmentPool.connect(member1).deposit({ value: depositAmount }))
        .to.emit(investmentPool, "Deposited")
        .withArgs(
          member1.address,
          depositAmount,
          depositAmount,
          await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1),
        );

      const balance = await investmentPool.getMemberBalance(member1.address);
      expect(balance).to.equal(depositAmount);
    });

    it("Should reject deposits below minimum", async function () {
      const depositAmount = ethers.parseEther("0.005"); // Below 0.01 ETH minimum

      await expect(investmentPool.connect(member1).deposit({ value: depositAmount })).to.be.revertedWithCustomError(
        investmentPool,
        "InsufficientDeposit",
      );
    });

    it("Should make depositor an active member", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await investmentPool.connect(member1).deposit({ value: depositAmount });

      expect(await investmentPool.isMember(member1.address)).to.be.true;
    });

    it("Should update pool balance correctly", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("2.0");

      await investmentPool.connect(member1).deposit({ value: deposit1 });
      await investmentPool.connect(member2).deposit({ value: deposit2 });

      const poolBalance = await investmentPool.getPoolBalance();
      expect(poolBalance).to.equal(deposit1 + deposit2);
    });

    it("Should allow multiple deposits from same member", async function () {
      const deposit1 = ethers.parseEther("1.0");
      const deposit2 = ethers.parseEther("0.5");

      await investmentPool.connect(member1).deposit({ value: deposit1 });
      await investmentPool.connect(member1).deposit({ value: deposit2 });

      const balance = await investmentPool.getMemberBalance(member1.address);
      expect(balance).to.equal(deposit1 + deposit2);
    });

    it("Should increment deposit counters", async function () {
      const depositAmount = ethers.parseEther("1.0");

      await investmentPool.connect(member1).deposit({ value: depositAmount });
      await investmentPool.connect(member1).deposit({ value: depositAmount });

      const totalCounter = await investmentPool.totalDepositCounter();
      const userCounter = await investmentPool.userDepositCounter(member1.address);

      expect(totalCounter).to.equal(2);
      expect(userCounter).to.equal(2);
    });

    it("Should update member deposit counter in member info", async function () {
      const depositAmount = ethers.parseEther("1.0");
      await investmentPool.connect(member1).deposit({ value: depositAmount });

      const [balance, depositedAt, isActive, depositCounter] = await investmentPool.getMemberInfo(member1.address);
      expect(depositCounter).to.equal(1);
    });
  });

  describe("Withdrawals", function () {
    beforeEach(async function () {
      // Member1 deposits 2 ETH
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("2.0") });
    });

    it("Should allow members to withdraw their balance", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const initialBalance = await ethers.provider.getBalance(member1.address);

      const tx = await investmentPool.connect(member1).withdraw(withdrawAmount);
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const finalBalance = await ethers.provider.getBalance(member1.address);
      const memberPoolBalance = await investmentPool.getMemberBalance(member1.address);

      expect(memberPoolBalance).to.equal(ethers.parseEther("1.0"));
      expect(finalBalance).to.equal(initialBalance + withdrawAmount - gasUsed);
    });

    it("Should revert if withdrawal exceeds balance", async function () {
      const withdrawAmount = ethers.parseEther("3.0"); // More than deposited

      await expect(investmentPool.connect(member1).withdraw(withdrawAmount)).to.be.revertedWithCustomError(
        investmentPool,
        "InsufficientBalance",
      );
    });

    it("Should revert if non-member tries to withdraw", async function () {
      await expect(investmentPool.connect(member2).withdraw(ethers.parseEther("1.0"))).to.be.revertedWithCustomError(
        investmentPool,
        "NotMember",
      );
    });

    it("Should deactivate member if balance reaches zero", async function () {
      await investmentPool.connect(member1).withdraw(ethers.parseEther("2.0"));
      expect(await investmentPool.isMember(member1.address)).to.be.false;
    });

    it("Should emit Withdrawn event", async function () {
      const withdrawAmount = ethers.parseEther("1.0");

      await expect(investmentPool.connect(member1).withdraw(withdrawAmount)).to.emit(investmentPool, "Withdrawn");
    });

    it("Should update pool balance correctly", async function () {
      const withdrawAmount = ethers.parseEther("1.0");
      const initialPoolBalance = await investmentPool.getPoolBalance();

      await investmentPool.connect(member1).withdraw(withdrawAmount);

      const finalPoolBalance = await investmentPool.getPoolBalance();
      expect(finalPoolBalance).to.equal(initialPoolBalance - withdrawAmount);
    });
  });

  describe("Proposals", function () {
    beforeEach(async function () {
      // Member1 deposits to become active member
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("5.0") });
    });

    it("Should allow members to create proposals", async function () {
      const description = "Invest in DeFi Protocol XYZ";
      const amount = ethers.parseEther("2.0");

      await expect(investmentPool.connect(member1).createProposal(description, recipient.address, amount)).to.emit(
        investmentPool,
        "ProposalCreated",
      );
    });

    it("Should not allow non-members to create proposals", async function () {
      const description = "Test Proposal";
      const amount = ethers.parseEther("1.0");

      await expect(
        investmentPool.connect(member2).createProposal(description, recipient.address, amount),
      ).to.be.revertedWithCustomError(investmentPool, "NotMember");
    });

    it("Should reject proposals with zero address", async function () {
      const description = "Test Proposal";
      const amount = ethers.parseEther("1.0");

      await expect(
        investmentPool.connect(member1).createProposal(description, ethers.ZeroAddress, amount),
      ).to.be.revertedWithCustomError(investmentPool, "InvalidAddress");
    });

    it("Should reject proposals exceeding pool balance", async function () {
      const description = "Test Proposal";
      const amount = ethers.parseEther("10.0"); // More than pool balance

      await expect(
        investmentPool.connect(member1).createProposal(description, recipient.address, amount),
      ).to.be.revertedWithCustomError(investmentPool, "InsufficientPoolFunds");
    });

    it("Should store proposal correctly", async function () {
      const description = "Invest in DeFi Protocol XYZ";
      const amount = ethers.parseEther("2.0");

      await investmentPool.connect(member1).createProposal(description, recipient.address, amount);

      const proposal = await investmentPool.getProposal(0);
      expect(proposal.description).to.equal(description);
      expect(proposal.target).to.equal(recipient.address);
      expect(proposal.amount).to.equal(amount);
      expect(proposal.proposer).to.equal(member1.address);
      expect(proposal.status).to.equal(0); // Pending
      expect(proposal.executed).to.be.false;
    });

    it("Should increment proposal count", async function () {
      const description = "Test Proposal";
      const amount = ethers.parseEther("1.0");

      await investmentPool.connect(member1).createProposal(description, recipient.address, amount);
      await investmentPool.connect(member1).createProposal(description, recipient.address, amount);

      const count = await investmentPool.proposalCount();
      expect(count).to.equal(2);
    });
  });

  describe("Proposal Management (Admin)", function () {
    let proposalId: number;

    beforeEach(async function () {
      // Member1 deposits and creates a proposal
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("5.0") });
      const tx = await investmentPool
        .connect(member1)
        .createProposal("Test Investment", recipient.address, ethers.parseEther("2.0"));
      await tx.wait();
      proposalId = 0;
    });

    it("Should allow admin to approve proposals", async function () {
      await expect(investmentPool.connect(owner).approveProposal(proposalId)).to.emit(
        investmentPool,
        "ProposalStatusChanged",
      );

      const proposal = await investmentPool.getProposal(proposalId);
      expect(proposal.status).to.equal(1); // Approved
    });

    it("Should allow admin to reject proposals", async function () {
      await expect(investmentPool.connect(owner).rejectProposal(proposalId)).to.emit(
        investmentPool,
        "ProposalStatusChanged",
      );

      const proposal = await investmentPool.getProposal(proposalId);
      expect(proposal.status).to.equal(2); // Rejected
    });

    it("Should not allow non-admin to approve proposals", async function () {
      await expect(investmentPool.connect(member1).approveProposal(proposalId)).to.be.reverted;
    });

    it("Should execute approved proposals", async function () {
      await investmentPool.connect(owner).approveProposal(proposalId);

      const initialRecipientBalance = await ethers.provider.getBalance(recipient.address);

      await expect(investmentPool.connect(owner).executeProposal(proposalId)).to.emit(
        investmentPool,
        "ProposalExecuted",
      );

      const finalRecipientBalance = await ethers.provider.getBalance(recipient.address);
      expect(finalRecipientBalance).to.equal(initialRecipientBalance + ethers.parseEther("2.0"));

      const proposal = await investmentPool.getProposal(proposalId);
      expect(proposal.executed).to.be.true;
      expect(proposal.status).to.equal(3); // Executed
    });

    it("Should not execute pending proposals", async function () {
      await expect(investmentPool.connect(owner).executeProposal(proposalId)).to.be.revertedWithCustomError(
        investmentPool,
        "ProposalNotApproved",
      );
    });

    it("Should not execute already executed proposals", async function () {
      await investmentPool.connect(owner).approveProposal(proposalId);
      await investmentPool.connect(owner).executeProposal(proposalId);

      await expect(investmentPool.connect(owner).executeProposal(proposalId)).to.be.revertedWithCustomError(
        investmentPool,
        "ProposalAlreadyExecuted",
      );
    });

    it("Should update pool balance after execution", async function () {
      const initialPoolBalance = await investmentPool.getPoolBalance();

      await investmentPool.connect(owner).approveProposal(proposalId);
      await investmentPool.connect(owner).executeProposal(proposalId);

      const finalPoolBalance = await investmentPool.getPoolBalance();
      expect(finalPoolBalance).to.equal(initialPoolBalance - ethers.parseEther("2.0"));
    });
  });

  describe("View Functions", function () {
    beforeEach(async function () {
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("1.0") });
      await investmentPool.connect(member2).deposit({ value: ethers.parseEther("2.0") });
    });

    it("Should return correct pool balance", async function () {
      const balance = await investmentPool.getPoolBalance();
      expect(balance).to.equal(ethers.parseEther("3.0"));
    });

    it("Should return correct member balance", async function () {
      const balance = await investmentPool.getMemberBalance(member1.address);
      expect(balance).to.equal(ethers.parseEther("1.0"));
    });

    it("Should return member info with deposit counter", async function () {
      const [balance, depositedAt, isActive, depositCounter] = await investmentPool.getMemberInfo(member1.address);
      expect(balance).to.equal(ethers.parseEther("1.0"));
      expect(isActive).to.be.true;
      expect(depositedAt).to.be.gt(0);
      expect(depositCounter).to.equal(1);
    });

    it("Should return total members count", async function () {
      const total = await investmentPool.getTotalMembers();
      expect(total).to.equal(2);
    });

    it("Should return active members list", async function () {
      const members = await investmentPool.getActiveMembers();
      expect(members.length).to.equal(2);
      expect(members).to.include(member1.address);
      expect(members).to.include(member2.address);
    });
  });

  describe("Admin Functions", function () {
    it("Should allow admin to change minimum deposit", async function () {
      const newMinimum = ethers.parseEther("0.05");

      await expect(investmentPool.connect(owner).setMinimumDeposit(newMinimum)).to.emit(
        investmentPool,
        "MinimumDepositChanged",
      );

      const minimumDeposit = await investmentPool.minimumDeposit();
      expect(minimumDeposit).to.equal(newMinimum);
    });

    it("Should not allow non-admin to change minimum deposit", async function () {
      const newMinimum = ethers.parseEther("0.05");

      await expect(investmentPool.connect(member1).setMinimumDeposit(newMinimum)).to.be.reverted;
    });

    it("Should allow admin to set new greeting", async function () {
      const newGreeting = "New Investment Strategy 2025!";

      await expect(investmentPool.connect(owner).setGreeting(newGreeting))
        .to.emit(investmentPool, "GreetingChange")
        .withArgs(owner.address, newGreeting, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await investmentPool.greeting()).to.equal(newGreeting);
    });

    it("Should not allow non-admin to change greeting", async function () {
      const newGreeting = "Unauthorized Change";

      await expect(investmentPool.connect(member1).setGreeting(newGreeting)).to.be.reverted;
    });

    it("Should allow DEFAULT_ADMIN to add new admin", async function () {
      await expect(investmentPool.connect(owner).addAdmin(member1.address))
        .to.emit(investmentPool, "AdminAdded")
        .withArgs(member1.address, owner.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await investmentPool.isAdmin(member1.address)).to.be.true;
    });

    it("Should allow DEFAULT_ADMIN to remove admin", async function () {
      await investmentPool.connect(owner).addAdmin(member1.address);

      await expect(investmentPool.connect(owner).removeAdmin(member1.address))
        .to.emit(investmentPool, "AdminRemoved")
        .withArgs(member1.address, owner.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await investmentPool.isAdmin(member1.address)).to.be.false;
    });

    it("Should not allow admin to remove themselves", async function () {
      await expect(investmentPool.connect(owner).removeAdmin(owner.address)).to.be.revertedWith(
        "Cannot remove yourself",
      );
    });
  });

  describe("Edge Cases", function () {
    it("Should handle zero balance withdrawals correctly", async function () {
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("1.0") });

      await expect(investmentPool.connect(member1).withdraw(0)).to.be.revertedWithCustomError(
        investmentPool,
        "InvalidAmount",
      );
    });

    it("Should handle receive function", async function () {
      const sendAmount = ethers.parseEther("1.0");

      await owner.sendTransaction({
        to: await investmentPool.getAddress(),
        value: sendAmount,
      });

      const poolBalance = await investmentPool.getPoolBalance();
      expect(poolBalance).to.equal(sendAmount);
    });

    it("Should reject fallback calls", async function () {
      await expect(
        owner.sendTransaction({
          to: await investmentPool.getAddress(),
          value: ethers.parseEther("1.0"),
          data: "0x12345678",
        }),
      ).to.be.revertedWith("Use deposit() function");
    });

    it("Should return correct contract balance", async function () {
      const depositAmount = ethers.parseEther("5.0");
      await investmentPool.connect(member1).deposit({ value: depositAmount });

      const contractBalance = await investmentPool.getContractBalance();
      expect(contractBalance).to.equal(depositAmount);
    });
  });

  describe("Active Proposals View", function () {
    beforeEach(async function () {
      await investmentPool.connect(member1).deposit({ value: ethers.parseEther("10.0") });
    });

    it("Should return only active proposals", async function () {
      // Create 3 proposals
      await investmentPool.connect(member1).createProposal("Proposal 1", recipient.address, ethers.parseEther("1.0"));
      await investmentPool.connect(member1).createProposal("Proposal 2", recipient.address, ethers.parseEther("1.0"));
      await investmentPool.connect(member1).createProposal("Proposal 3", recipient.address, ethers.parseEther("1.0"));

      // Reject one
      await investmentPool.connect(owner).rejectProposal(1);

      const activeProposals = await investmentPool.getActiveProposals();
      expect(activeProposals.length).to.equal(2);
      expect(activeProposals[0].id).to.equal(0);
      expect(activeProposals[1].id).to.equal(2);
    });
  });
});
