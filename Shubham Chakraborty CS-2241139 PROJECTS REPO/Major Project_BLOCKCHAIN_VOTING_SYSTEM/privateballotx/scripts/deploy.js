// scripts/deploy.js
// VoteChain Pro v2 — Deploy Script
// Compatible with: ethers v6, Hardhat ^2.22.0, Solidity ^0.8.20
//
// Usage:
//   npx hardhat run scripts/deploy.js --network localhost
//   npx hardhat run scripts/deploy.js --network sepolia

const { ethers, network, run } = require("hardhat");

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║       VoteChain Pro v2 — Deployment          ║");
  console.log("╚══════════════════════════════════════════════╝\n");

  // ── Resolve deployer ───────────────────────────────────────────────────────
  const [deployer] = await ethers.getSigners();

  // ethers v6: formatEther is on ethers object, getBalance returns bigint
  const balanceBigInt = await ethers.provider.getBalance(deployer.address);
  const balanceEth    = ethers.formatEther(balanceBigInt);

  console.log(`Network:         ${network.name}`);
  console.log(`Deployer:        ${deployer.address}`);
  console.log(`Balance:         ${balanceEth} ETH\n`);

  if (balanceBigInt === 0n) {
    throw new Error("Deployer has 0 balance. Fund your wallet before deploying.");
  }

  // ── Deploy VoteChain ───────────────────────────────────────────────────────
  console.log("Deploying VoteChain...");

  // ethers v6: getContractFactory returns a ContractFactory
  const VoteChain = await ethers.getContractFactory("VoteChain");

  // Constructor: constructor() Ownable(msg.sender) — no arguments needed
  const voteChain = await VoteChain.deploy();

  // ethers v6: waitForDeployment() replaces deployed()
  await voteChain.waitForDeployment();

  // ethers v6: target replaces address
  const contractAddress = await voteChain.getAddress();

  console.log(`\n✅ VoteChain deployed successfully!`);
  console.log(`   Contract address: ${contractAddress}`);
  console.log(`   Transaction hash: ${voteChain.deploymentTransaction().hash}\n`);

  // ── Seed a demo election (localhost only) ──────────────────────────────────
  if (network.name === "localhost") {
    console.log("Seeding demo election on localhost...");

    const now       = BigInt(Math.floor(Date.now() / 1000));
    const startTime = now + 60n;        // starts in 1 minute
    const endTime   = now + 86400n;     // ends in 24 hours

    const tx = await voteChain.createElection(
      "Demo Election 2025",
      "A sample election seeded during local deployment for development purposes.",
      ["Alice Johnson", "Bob Martinez", "Carol White"],
      startTime,
      endTime
    );
    await tx.wait();
    console.log("✅ Demo election created (ID: 1)\n");
  }

  // ── Print frontend env hint ────────────────────────────────────────────────
  console.log("─────────────────────────────────────────────────");
  console.log("Add to frontend/.env:");
  console.log(`  VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  VITE_NETWORK_CHAIN_ID=${network.config.chainId}`);
  console.log("─────────────────────────────────────────────────\n");

  // ── Etherscan verification (Sepolia only) ──────────────────────────────────
  if (network.name === "sepolia") {
    console.log("Waiting 6 block confirmations before verifying on Etherscan...");

    await voteChain
      .deploymentTransaction()
      .wait(6);

    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!\n");
    } catch (err) {
      if (err.message.toLowerCase().includes("already verified")) {
        console.log("ℹ️  Contract already verified on Etherscan.\n");
      } else {
        console.warn("⚠️  Verification failed:", err.message);
        console.warn("   You can verify manually with:");
        console.warn(`   npx hardhat verify --network sepolia ${contractAddress}\n`);
      }
    }
  }

  console.log("🎉 Deployment complete.\n");
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
