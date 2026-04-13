# ⛓️ VoteChain Pro v2

> A production-ready, decentralized on-chain voting system built on Ethereum.
> One wallet. One vote. Full transparency.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-blue?logo=solidity)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.22+-yellow)](https://hardhat.org/)
[![React](https://img.shields.io/badge/React-18-61dafb?logo=react)](https://react.dev/)
[![ethers](https://img.shields.io/badge/ethers-v6-purple)](https://docs.ethers.org/v6/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📋 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Smart Contract Design](#3-smart-contract-design)
4. [Security Design](#4-security-design)
5. [Gas Optimization](#5-gas-optimization)
6. [Tech Stack](#6-tech-stack)
7. [Prerequisites](#7-prerequisites)
8. [Installation](#8-installation)
9. [Environment Variables](#9-environment-variables)
10. [Compile the Contract](#10-compile-the-contract)
11. [Deploy to Sepolia](#11-deploy-to-sepolia)
12. [Verify on Etherscan](#12-verify-on-etherscan)
13. [Run the Frontend](#13-run-the-frontend)
14. [Deploy Frontend to Vercel](#14-deploy-frontend-to-vercel)
15. [Example User Flow](#15-example-user-flow)
16. [Troubleshooting](#16-troubleshooting)
17. [Future Improvements](#17-future-improvements)
18. [License](#18-license)

---

## 1. Project Overview

VoteChain Pro v2 is a full-stack decentralized application (dApp) that enables secure, transparent, on-chain elections. Every vote is recorded as a blockchain transaction — immutable, publicly auditable, and enforced at the smart contract level.

**Core capabilities:**

- Admins create elections with candidates, start/end times, and descriptions
- Any wallet holder can cast exactly one vote per election
- Results are tallied in real time, directly on-chain
- Admin can pause or resume elections
- Frontend validates wallet, network, and vote eligibility before any transaction

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               React 18 + Vite Frontend                   │  │
│  │                                                          │  │
│  │  WalletConnect ──► useContract Hook ──► Contract Utils   │  │
│  │       │                  │                    │           │  │
│  │  CreateElection    ElectionList         ethers v6         │  │
│  │       │                  │          BrowserProvider       │  │
│  │  VotePanel ◄─────────────┘               │               │  │
│  └────────────────────────────────┬──────────┘              │  │
│                                   │                          │  │
│                             MetaMask Wallet                  │  │
│                          (window.ethereum)                   │  │
└───────────────────────────────────┬─────────────────────────┘
                                    │
                        Signed Transactions / RPC
                                    │
            ┌───────────────────────▼──────────────────────────┐
            │              Ethereum Network                     │
            │                 (Sepolia)                         │
            │                                                   │
            │  ┌────────────────────────────────────────────┐  │
            │  │           VoteChain.sol                    │  │
            │  │                                            │  │
            │  │  Ownable ──► Owner-only functions          │  │
            │  │                                            │  │
            │  │  createElection()  ──► ElectionCreated     │  │
            │  │  vote()            ──► VoteCast            │  │
            │  │  toggleElection()  ──► ElectionToggled     │  │
            │  │                                            │  │
            │  │  Storage:                                  │  │
            │  │    elections mapping                       │  │
            │  │      └── candidates mapping                │  │
            │  │      └── hasVoted mapping (per address)    │  │
            │  └────────────────────────────────────────────┘  │
            │                                                   │
            │  Etherscan ◄── Source Verified                    │
            └───────────────────────────────────────────────────┘
```

---

## 3. Smart Contract Design

**File:** `contracts/VoteChain.sol`

The contract inherits from OpenZeppelin v5's `Ownable`, giving the deployer exclusive rights to create elections and modify their status.

### Storage Layout

```
VoteChain
│
├── electionCount : uint256               (slot 0)
│
└── elections     : mapping(uint256 → Election)
       │
       └── Election
             ├── id            : uint256
             ├── title         : string
             ├── description   : string
             ├── startTime     : uint64  ─┐ packed
             ├── endTime       : uint64  ─┘ into 1 slot
             ├── active        : bool    ─┐ packed
             ├── candidateCount: uint32  ─┘ into 1 slot
             ├── candidates    : mapping(uint256 → Candidate)
             │       └── Candidate
             │             ├── id        : uint128 ─┐ packed
             │             ├── voteCount : uint128 ─┘ into 1 slot
             │             └── name      : string
             └── hasVoted      : mapping(address → bool)
```

### Key Functions

| Function | Access | Description |
|---|---|---|
| `createElection(...)` | `onlyOwner` | Creates an election with candidates and time range |
| `vote(electionId, candidateId)` | Public | Cast one vote per wallet |
| `toggleElection(electionId)` | `onlyOwner` | Pause/resume an election |
| `getElectionInfo(id)` | View | Returns election metadata |
| `getAllCandidates(id)` | View | Returns all candidates in one call |
| `hasVotedInElection(id, addr)` | View | Check if address has voted |

### Custom Errors

The contract uses Solidity custom errors (not `require` with strings) for lower gas costs on revert:

```
AlreadyVoted, ElectionNotActive, ElectionNotStarted, ElectionEnded,
InvalidCandidate, ElectionDoesNotExist, TooFewCandidates,
InvalidTimeRange, EndTimeInPast
```

---

## 4. Security Design

### One-Wallet-One-Vote Enforcement

Each `Election` maintains a `mapping(address => bool) hasVoted`. Before a vote is recorded, the contract checks `hasVoted[msg.sender]` and reverts with `AlreadyVoted` if true. The flag is set **before** the vote count is incremented, following the checks-effects-interactions pattern.

### Ownable (Admin Roles)

Election creation and status toggling are gated by OpenZeppelin v5's `Ownable`, which reverts unauthorized calls with `OwnableUnauthorizedAccount`. Ownership can be transferred via `transferOwnership()` for key rotation.

### Event Logs

All state-changing actions emit indexed events:

- `ElectionCreated(indexed electionId, indexed creator, ...)`
- `VoteCast(indexed electionId, indexed voter, indexed candidateId)`
- `ElectionToggled(indexed electionId, active)`

This allows off-chain services (subgraphs, indexers) to efficiently reconstruct the full voting history without reading all storage.

### Time-Based Access Control

Voting is only permitted when:
1. `election.active == true`
2. `block.timestamp >= election.startTime`
3. `block.timestamp <= election.endTime`

All three conditions are checked in sequence via custom errors.

---

## 5. Gas Optimization

| Technique | Where Applied |
|---|---|
| Custom errors | Replaces all `require` strings (~20 gas per char saved on revert) |
| `uint64` timestamps | Instead of `uint256`, saves 2 storage slots per election |
| `uint128` vote counts | Packed with candidate ID into a single 32-byte slot |
| `uint32` candidateCount | Packed with `active` bool — both fit in 5 bytes |
| `unchecked { ++i }` | All `for` loops — prevents redundant overflow checks |
| `unchecked` voteCount | `uint128` can never overflow in realistic usage |
| `getAllCandidates()` | Batch view in one RPC call instead of N calls |
| Optimizer `runs: 200` | Hardhat configured for deployment-size/speed balance |
| `calldata` parameters | All string/array inputs use `calldata` not `memory` |

---

## 6. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Smart Contract Language | Solidity | `^0.8.20` |
| Development Framework | Hardhat | `^2.22.0` |
| Contract Library | OpenZeppelin | `^5.0.2` |
| Web3 Library | ethers.js | `^6.13.x` |
| Frontend Framework | React | `^18.3.x` |
| Frontend Bundler | Vite | `^5.4.x` |
| Testing Framework | Chai + Hardhat | Latest |
| Network | Ethereum Sepolia | Chain ID: 11155111 |
| Runtime | Node.js | `18.x` |

---

## 7. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18.x** — [nodejs.org/en/download](https://nodejs.org/en/download)
  - Check: `node --version` should show `v18.x.x`
- **MetaMask** browser extension — [metamask.io](https://metamask.io/download/)
- **Sepolia ETH** for gas — get free testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com)
- **Alchemy or Infura account** for a Sepolia RPC URL — [alchemy.com](https://alchemy.com) or [infura.io](https://infura.io)
- **Etherscan account** for contract verification — [etherscan.io/register](https://etherscan.io/register)

---

## 8. Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/yourusername/votechain-pro-v2.git
cd votechain-pro-v2
```

### Step 2 — Install backend dependencies

```bash
npm install
```

This installs: Hardhat, OpenZeppelin, ethers, and all testing tools.

### Step 3 — Install frontend dependencies

```bash
cd frontend
npm install
cd ..
```

This installs: React 18, Vite, ethers v6.

---

## 9. Environment Variables

### Backend (.env)

```bash
# In project root
cp .env.example .env
```

Open `.env` and fill in:

```env
# Your deployer wallet's private key (with 0x prefix)
# Use a dedicated wallet — not your main wallet
DEPLOYER_PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Sepolia RPC from Alchemy: https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# From etherscan.io/myapikey
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_KEY
```

### Frontend (.env)

```bash
# In frontend directory
cp frontend/.env.example frontend/.env
```

Open `frontend/.env` and fill in (you'll have the address after deploying):

```env
VITE_CONTRACT_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_NETWORK_CHAIN_ID=11155111
VITE_NETWORK_NAME=Sepolia
```

---

## 10. Compile the Contract

From the project root:

```bash
npx hardhat compile
```

On success, you'll see:
```
Compiled 1 Solidity file successfully (evm target: paris).
```

The compiled artifacts will be in `./artifacts/contracts/VoteChain.sol/`.

---

## 11. Deploy to Sepolia

Ensure your `.env` is configured with `DEPLOYER_PRIVATE_KEY` and `SEPOLIA_RPC_URL`, and your deployer wallet has Sepolia ETH.

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

The output will include:

```
╔══════════════════════════════════════════════╗
║       VoteChain Pro v2 — Deployment          ║
╚══════════════════════════════════════════════╝

Network:         sepolia
Deployer:        0xYourWalletAddress
Balance:         0.12 ETH

Deploying VoteChain...

✅ VoteChain deployed successfully!
   Contract address: 0xABCDEF...
   Transaction hash: 0x123456...

─────────────────────────────────────────────────
Add to frontend/.env:
  VITE_CONTRACT_ADDRESS=0xABCDEF...
  VITE_NETWORK_CHAIN_ID=11155111
─────────────────────────────────────────────────
```

Copy the contract address and add it to `frontend/.env`.

### Deploy to localhost (optional, for development)

```bash
# Terminal 1 — start local node
npx hardhat node

# Terminal 2 — deploy with demo election seeded
npx hardhat run scripts/deploy.js --network localhost
```

For localhost, update `frontend/.env`:
```env
VITE_CONTRACT_ADDRESS=0xYourLocalAddress
VITE_NETWORK_CHAIN_ID=31337
VITE_NETWORK_NAME=Localhost
```

---

## 12. Verify on Etherscan

Contract verification is **automatic** when deploying to Sepolia. The deploy script waits for 6 confirmations and then calls `hardhat verify`.

If you need to verify manually:

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

No constructor arguments are needed (the constructor takes none).

After verification, your contract source code will be publicly readable at:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS#code
```

---

## 13. Run the Frontend Locally

Ensure `frontend/.env` has your contract address, then:

```bash
cd frontend
npm run dev
```

Open your browser at: **http://localhost:5173**

You should see:
- The VoteChain Pro header
- A "Connect MetaMask" button
- On wallet connection, the elections list (or empty state)
- If you are the contract owner, the admin panel appears

---

## 14. Deploy Frontend to Vercel

### Option A — Vercel CLI

```bash
# Install Vercel CLI globally
npm i -g vercel

cd frontend

# Deploy (follow prompts)
vercel

# Set environment variables in Vercel dashboard, or:
vercel env add VITE_CONTRACT_ADDRESS
vercel env add VITE_NETWORK_CHAIN_ID
vercel env add VITE_NETWORK_NAME
```

### Option B — Vercel Dashboard (GUI)

1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repository
4. Set **Root Directory** to `frontend`
5. Set **Build Command** to `npm run build`
6. Set **Output Directory** to `dist`
7. Add Environment Variables:
   - `VITE_CONTRACT_ADDRESS` = your contract address
   - `VITE_NETWORK_CHAIN_ID` = `11155111`
   - `VITE_NETWORK_NAME` = `Sepolia`
8. Click **Deploy**

---

## 15. Example User Flow

### Admin Flow (Contract Owner)

```
1. Open the dApp in browser
2. Click "Connect MetaMask" → approve connection
3. MetaMask switches to Sepolia automatically (or click "Switch to Sepolia")
4. See the "🛡️ Admin — Create New Election" panel (only visible to owner)
5. Click to expand the panel
6. Fill in:
   - Title: "Q4 Board Vote 2025"
   - Description: "Vote for the new board chairperson"
   - Start time: (pick a date/time)
   - End time: (pick a later date/time)
   - Candidates: "Alice Chen", "Bob Nakamura", "Carol Rivera"
7. Click "🗳️ Create Election"
8. MetaMask opens — confirm the transaction
9. Wait for tx confirmation (~15 seconds)
10. Election appears in the list with "Upcoming" or "Live" status
11. To pause: click "⏸ Pause Election" on any election card
```

### Voter Flow

```
1. Open the dApp in browser
2. Click "Connect MetaMask" → approve connection
3. Ensure you're on Sepolia (switch if needed)
4. Browse the elections list
5. Find a "Live" election
6. Click on a candidate name to select it (it highlights)
7. Click "🗳️ Vote for Alice Chen"
8. MetaMask opens — confirm the transaction (no ETH cost beyond gas)
9. Wait for confirmation
10. "✅ You have voted in this election." badge appears
11. Click "📊 View Results" to see live vote counts and percentage bars
```

---

## 16. Troubleshooting

### "MetaMask not detected"
- Ensure the MetaMask browser extension is installed and enabled
- Try refreshing the page
- Check that MetaMask is not in a disabled state in your browser extensions

### "Wrong Network"
- Click "Switch to Sepolia" in the UI, or
- Open MetaMask → click the network dropdown → select "Sepolia Test Network"
- If Sepolia is not in the list, add it via [chainlist.org](https://chainlist.org)

### `npx hardhat compile` fails with "Source file not found"
- Ensure OpenZeppelin is installed: `npm install` from the project root
- Verify the import path in the contract matches OZ v5: `@openzeppelin/contracts/access/Ownable.sol`

### Deploy fails with "insufficient funds"
- Your deployer wallet needs Sepolia ETH for gas
- Get test ETH from [sepoliafaucet.com](https://sepoliafaucet.com) or [faucets.chain.link](https://faucets.chain.link)

### Deploy fails with "invalid RPC URL"
- Double-check `SEPOLIA_RPC_URL` in `.env`
- Alchemy format: `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
- Infura format: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`

### Etherscan verification fails
- Ensure `ETHERSCAN_API_KEY` is valid and active
- Wait a few minutes for the deployment to be indexed by Etherscan before verifying
- Retry manually: `npx hardhat verify --network sepolia DEPLOYED_ADDRESS`

### Frontend shows blank page
- Check browser console for errors
- Ensure `frontend/.env` has `VITE_CONTRACT_ADDRESS` set (not the placeholder)
- Ensure the ABI in `frontend/src/abi/VoteChain.json` matches the deployed contract

### "You have already voted" error
- Your wallet address has already cast a vote in this election
- Each wallet can vote only once per election by smart contract enforcement

### Transactions not confirming
- Sepolia can be slow during congestion
- Check tx status on [sepolia.etherscan.io](https://sepolia.etherscan.io)
- You may need to speed up the transaction in MetaMask

### `npm run dev` fails — "vite: command not found"
- Run `npm install` from inside the `frontend/` directory
- Ensure you are using Node 18: `node --version`

---

## 17. Future Improvements

- **Delegation** — Allow voters to delegate their vote to a trusted representative
- **ERC-20 Weighted Voting** — Weight votes by token holdings (e.g., governance tokens)
- **Encrypted Ballots** — Use commit-reveal or ZK proofs to hide votes until the election ends
- **Multi-sig Admin** — Replace single Ownable with a Gnosis Safe multisig for admin actions
- **IPFS Metadata** — Store election descriptions off-chain on IPFS, hash on-chain
- **The Graph Integration** — Index events for instant historical query support
- **Mobile Wallet Support** — WalletConnect v2 / RainbowKit for mobile wallets
- **Snapshot Integration** — Off-chain gasless voting with on-chain finalization
- **Email/Push Notifications** — Alert voters when elections go live
- **Election Templates** — Reusable templates for common election types

---

## 18. License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 VoteChain Pro

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
