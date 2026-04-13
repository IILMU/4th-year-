// test/VoteChain.test.js
// VoteChain Pro v2 — Full Test Suite
// Compatible with: ethers v6, Hardhat ^2.22.0

const { expect }         = require("chai");
const { ethers }         = require("hardhat");
const { time }           = require("@nomicfoundation/hardhat-network-helpers");

describe("VoteChain", function () {
  let voteChain;
  let owner;
  let voter1;
  let voter2;
  let voter3;

  // Helper — returns timestamps relative to current block time
  async function futureTimestamps(startOffsetSecs = 60, durationSecs = 3600) {
    const current = await time.latest();
    return {
      startTime: BigInt(current + startOffsetSecs),
      endTime:   BigInt(current + startOffsetSecs + durationSecs),
    };
  }

  beforeEach(async () => {
    [owner, voter1, voter2, voter3] = await ethers.getSigners();
    const VoteChain = await ethers.getContractFactory("VoteChain");
    voteChain = await VoteChain.deploy();
    await voteChain.waitForDeployment();
  });

  // ─── Deployment ─────────────────────────────────────────────────────────────
  describe("Deployment", () => {
    it("sets the deployer as owner", async () => {
      expect(await voteChain.owner()).to.equal(owner.address);
    });

    it("initializes electionCount to 0", async () => {
      expect(await voteChain.electionCount()).to.equal(0n);
    });
  });

  // ─── Election Creation ───────────────────────────────────────────────────────
  describe("createElection", () => {
    it("allows owner to create an election", async () => {
      const { startTime, endTime } = await futureTimestamps();
      await expect(
        voteChain.createElection(
          "Test Election",
          "A test election description",
          ["Alice", "Bob", "Carol"],
          startTime,
          endTime
        )
      )
        .to.emit(voteChain, "ElectionCreated")
        .withArgs(1n, owner.address, "Test Election", startTime, endTime);

      expect(await voteChain.electionCount()).to.equal(1n);
    });

    it("reverts when a non-owner tries to create an election", async () => {
      const { startTime, endTime } = await futureTimestamps();
      await expect(
        voteChain
          .connect(voter1)
          .createElection("Hack", "desc", ["A", "B"], startTime, endTime)
      ).to.be.revertedWithCustomError(voteChain, "OwnableUnauthorizedAccount");
    });

    it("reverts with fewer than 2 candidates", async () => {
      const { startTime, endTime } = await futureTimestamps();
      await expect(
        voteChain.createElection("X", "y", ["OnlyOne"], startTime, endTime)
      ).to.be.revertedWithCustomError(voteChain, "TooFewCandidates");
    });

    it("reverts when startTime >= endTime", async () => {
      const { startTime } = await futureTimestamps();
      await expect(
        voteChain.createElection("X", "y", ["A", "B"], startTime, startTime)
      ).to.be.revertedWithCustomError(voteChain, "InvalidTimeRange");
    });

    it("reverts when endTime is in the past", async () => {
      const past = BigInt(await time.latest()) - 100n;
      await expect(
        voteChain.createElection("X", "y", ["A", "B"], past - 200n, past)
      ).to.be.revertedWithCustomError(voteChain, "EndTimeInPast");
    });

    it("stores election metadata correctly", async () => {
      const { startTime, endTime } = await futureTimestamps();
      await voteChain.createElection(
        "Meta Test",
        "Description here",
        ["Alpha", "Beta"],
        startTime,
        endTime
      );

      const info = await voteChain.getElectionInfo(1n);
      expect(info.id).to.equal(1n);
      expect(info.title).to.equal("Meta Test");
      expect(info.description).to.equal("Description here");
      expect(info.startTime).to.equal(startTime);
      expect(info.endTime).to.equal(endTime);
      expect(info.active).to.equal(true);
      expect(info.candidateCount).to.equal(2n);
    });
  });

  // ─── Voting ──────────────────────────────────────────────────────────────────
  describe("vote", () => {
    beforeEach(async () => {
      const { startTime, endTime } = await futureTimestamps(0, 3600);
      // Start time = now so voting is immediately open
      const now = BigInt(await time.latest());
      await voteChain.createElection(
        "Live Election",
        "desc",
        ["Alice", "Bob"],
        now,
        now + 3600n
      );
    });

    it("allows a voter to cast a valid vote", async () => {
      await expect(voteChain.connect(voter1).vote(1n, 1n))
        .to.emit(voteChain, "VoteCast")
        .withArgs(1n, voter1.address, 1n);
    });

    it("increments the candidate vote count", async () => {
      await voteChain.connect(voter1).vote(1n, 1n);
      const candidate = await voteChain.getCandidate(1n, 1n);
      expect(candidate.voteCount).to.equal(1n);
    });

    it("prevents double voting", async () => {
      await voteChain.connect(voter1).vote(1n, 1n);
      await expect(
        voteChain.connect(voter1).vote(1n, 1n)
      ).to.be.revertedWithCustomError(voteChain, "AlreadyVoted");
    });

    it("allows multiple different voters", async () => {
      await voteChain.connect(voter1).vote(1n, 1n);
      await voteChain.connect(voter2).vote(1n, 2n);
      await voteChain.connect(voter3).vote(1n, 1n);

      const c1 = await voteChain.getCandidate(1n, 1n);
      const c2 = await voteChain.getCandidate(1n, 2n);
      expect(c1.voteCount).to.equal(2n);
      expect(c2.voteCount).to.equal(1n);
    });

    it("reverts for invalid candidate id 0", async () => {
      await expect(
        voteChain.connect(voter1).vote(1n, 0n)
      ).to.be.revertedWithCustomError(voteChain, "InvalidCandidate");
    });

    it("reverts for out-of-range candidate id", async () => {
      await expect(
        voteChain.connect(voter1).vote(1n, 99n)
      ).to.be.revertedWithCustomError(voteChain, "InvalidCandidate");
    });

    it("reverts after election has ended", async () => {
      const now = BigInt(await time.latest());
      await voteChain.createElection("Ended", "desc", ["A", "B"], now, now + 10n);
      await time.increase(20);
      await expect(
        voteChain.connect(voter1).vote(2n, 1n)
      ).to.be.revertedWithCustomError(voteChain, "ElectionEnded");
    });

    it("reverts when election is inactive", async () => {
      await voteChain.toggleElection(1n);
      await expect(
        voteChain.connect(voter1).vote(1n, 1n)
      ).to.be.revertedWithCustomError(voteChain, "ElectionNotActive");
    });
  });

  // ─── Toggle Election ─────────────────────────────────────────────────────────
  describe("toggleElection", () => {
    beforeEach(async () => {
      const now = BigInt(await time.latest());
      await voteChain.createElection("Toggle Test", "desc", ["A", "B"], now, now + 3600n);
    });

    it("toggles active to false", async () => {
      await expect(voteChain.toggleElection(1n))
        .to.emit(voteChain, "ElectionToggled")
        .withArgs(1n, false);
      const info = await voteChain.getElectionInfo(1n);
      expect(info.active).to.equal(false);
    });

    it("toggles back to true", async () => {
      await voteChain.toggleElection(1n);
      await voteChain.toggleElection(1n);
      const info = await voteChain.getElectionInfo(1n);
      expect(info.active).to.equal(true);
    });

    it("reverts for non-existent election", async () => {
      await expect(
        voteChain.toggleElection(999n)
      ).to.be.revertedWithCustomError(voteChain, "ElectionDoesNotExist");
    });

    it("reverts when called by non-owner", async () => {
      await expect(
        voteChain.connect(voter1).toggleElection(1n)
      ).to.be.revertedWithCustomError(voteChain, "OwnableUnauthorizedAccount");
    });
  });

  // ─── View Functions ──────────────────────────────────────────────────────────
  describe("View functions", () => {
    beforeEach(async () => {
      const now = BigInt(await time.latest());
      await voteChain.createElection(
        "View Test",
        "For testing views",
        ["X", "Y", "Z"],
        now,
        now + 3600n
      );
    });

    it("getElectionInfo reverts for non-existent election", async () => {
      await expect(
        voteChain.getElectionInfo(42n)
      ).to.be.revertedWithCustomError(voteChain, "ElectionDoesNotExist");
    });

    it("getCandidate returns correct data", async () => {
      const c = await voteChain.getCandidate(1n, 2n);
      expect(c.id).to.equal(2n);
      expect(c.name).to.equal("Y");
      expect(c.voteCount).to.equal(0n);
    });

    it("getAllCandidates returns all candidates", async () => {
      const [ids, names, voteCounts] = await voteChain.getAllCandidates(1n);
      expect(ids.length).to.equal(3);
      expect(names[0]).to.equal("X");
      expect(names[1]).to.equal("Y");
      expect(names[2]).to.equal("Z");
      expect(voteCounts[0]).to.equal(0n);
    });

    it("hasVotedInElection returns false before vote", async () => {
      expect(await voteChain.hasVotedInElection(1n, voter1.address)).to.equal(false);
    });

    it("hasVotedInElection returns true after vote", async () => {
      await voteChain.connect(voter1).vote(1n, 1n);
      expect(await voteChain.hasVotedInElection(1n, voter1.address)).to.equal(true);
    });
  });
});
