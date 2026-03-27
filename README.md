# ProofPay

A decentralized escrow platform for freelancers and clients built on **Flow EVM Testnet**. Clients lock funds on-chain at job creation; freelancers submit cryptographically verifiable proof of work; payment releases automatically or on client approval — all enforced by smart contracts with no trusted intermediary.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Smart Contracts](#smart-contracts)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [1. Smart Contracts](#1-smart-contracts)
  - [2. Frontend](#2-frontend)
  - [3. Event Listener](#3-event-listener)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contract Reference](#contract-reference)
- [User Guide](#user-guide)
- [Project Structure](#project-structure)

---

## How It Works

```
Client                        Smart Contract               Freelancer
  │                                  │                          │
  ├── createJob(freelancer, title) ──►│ Lock FLOW in escrow      │
  │   + send FLOW                     │                          │
  │                                  │◄── acceptJob(jobId) ─────┤
  │                                  │                          │
  │                                  │◄── submitProof(jobId, cid)┤
  │   (review proof)                  │    (encrypted file on    │
  │                                  │     Storacha)            │
  ├── releasePayment(jobId, amount) ──►│ Transfer FLOW ──────────►│
  │                                  │                          │
  │   OR after 48h of inactivity:    │◄─ claimPaymentIfClient   │
  │                                  │    Inactive(jobId) ──────┤
  │                                  │ Auto-release remaining    │
  │                                  │ escrow to freelancer      │
```

1. **Client** creates a job and sends FLOW — funds are locked in the escrow contract immediately.
2. **Freelancer** sees the job (with a "Funds Locked in Escrow" badge) and accepts it.
3. **Freelancer** completes the work, encrypts the deliverable with Lit Protocol (so only the client can decrypt), uploads it to Storacha, and submits the CID on-chain.
4. **Client** reviews the proof and releases full or partial payment.
5. If the client is inactive for **48 hours** after proof submission, the freelancer can claim all remaining escrow automatically.
6. On completion, both parties' on-chain **trust scores** are updated.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                          │
│  Next.js 16 + React 19 + Wagmi + Viem + TailwindCSS 4  │
│                                                          │
│  ┌─────────────────┐    ┌──────────────────────────┐   │
│  │  useJobs.ts      │    │  useProofPayEscrow.ts    │   │
│  │  (reads + events)│    │  (writes)                │   │
│  └────────┬─────────┘    └────────────┬─────────────┘   │
└───────────┼──────────────────────────┼─────────────────┘
            │ RPC reads                │ Transactions
            ▼                          ▼
┌────────────────────────────────────────────────────────┐
│               Flow EVM Testnet (Chain 545)              │
│                                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ProofPayEscrow.sol                              │   │
│  │  0x7D674fDE6F3c7ba7583abeCAa5Ce43F15F618B8f    │   │
│  │  ─ escrow, payment release, trust scores        │   │
│  └─────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  ProofPayRegistry.sol                            │   │
│  │  0x8E447A61AA900A586124B823248a8C705b252F3a    │   │
│  │  ─ ratings, reputation                          │   │
│  └─────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────┘
            ▲
            │ Events (ProofSubmitted, PaymentReleased …)
┌───────────┴──────────────┐
│  listener/index.js        │
│  Node.js + ethers.js      │
│  OpenAI GPT-4 verification│
└──────────────────────────┘

Proof storage:  Freelancer file ──► Lit Protocol encryption
                                    ──► Storacha (IPFS/W3S)
                                    ──► CID stored on-chain
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart contracts | Solidity 0.8.20, Foundry, OpenZeppelin |
| Network | Flow EVM Testnet (Chain ID 545) |
| Frontend framework | Next.js 16, React 19, TypeScript |
| Web3 (reads/writes) | Wagmi 3, Viem 2, ethers.js 6 |
| Styling | TailwindCSS 4, Lucide React |
| State / data | TanStack Query v5 |
| File encryption | Lit Protocol (habanero testnet) |
| Decentralised storage | Storacha / Web3.Storage |
| Event listener | Node.js, ethers.js, OpenAI API |

---

## Smart Contracts

### ProofPayEscrow — `src/ProofPayEscrow.sol`

Core escrow logic. All payment lifecycle is enforced here.

**Job Status Flow**

```
OPEN (0) ──► ACCEPTED (1) ──► PROOF_SUBMITTED (2) ──► COMPLETED (3)
```

**Key Functions**

| Function | Caller | Description |
|----------|--------|-------------|
| `createJob(freelancer, jobTitle)` | Client | Creates job, locks `msg.value` FLOW in escrow |
| `acceptJob(jobId)` | Freelancer | Accepts the job; status → ACCEPTED |
| `submitProof(jobId, ipfsHash)` | Freelancer | Submits work CID; status → PROOF_SUBMITTED |
| `releasePayment(jobId, amount)` | Client | Releases partial or full payment to freelancer |
| `claimPaymentIfClientInactive(jobId)` | Freelancer | Claims remaining escrow if 48h have passed since proof submission |
| `depositEscrowPayment(jobId)` | Client | Top up escrow for an active job |
| `getTrustScore(user)` | Anyone | Returns `(completedJobs × 2) + successfulPayments` |

**Events**

```solidity
event JobCreated(uint256 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
event JobAccepted(uint256 indexed jobId);
event ProofSubmitted(uint256 indexed jobId);
event PaymentReleased(uint256 indexed jobId, uint256 amount);
event JobCompleted(uint256 indexed jobId);
```

**Deployed address (Flow EVM Testnet)**
```
0x7D674fDE6F3c7ba7583abeCAa5Ce43F15F618B8f
```

---

### ProofPayRegistry — `src/ProofPayRegistry.sol`

On-chain freelancer reputation. Separate from the escrow contract so ratings can be submitted by any party.

**Key Functions**

| Function | Caller | Description |
|----------|--------|-------------|
| `recordCompletion(freelancer)` | Anyone | Increments completed job counter |
| `rateFreelancer(freelancer, rating)` | Anyone | Submits a 1–5 star rating (once per address per freelancer) |
| `getReputation(freelancer)` | Anyone | Returns average rating × 100 (e.g. 450 = 4.5 stars) |
| `getFreelancerStats(freelancer)` | Anyone | Returns `(completedJobs, avgRatingScaled)` |

**Deployed address (Flow EVM Testnet)**
```
0x8E447A61AA900A586124B823248a8C705b252F3a
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Foundry | latest | `curl -L https://foundry.paradigm.xyz \| bash` |
| Node.js | ≥ 18 | [nodejs.org](https://nodejs.org) |
| Git | any | system package manager |
| A Web3 wallet | any | MetaMask, Rabby, etc. |
| FLOW testnet tokens | — | [Flow faucet](https://testnet-faucet.onflow.org) |

---

## Setup

### 1. Smart Contracts

```bash
# Clone the repo
git clone https://github.com/RuthChisom/proofpay.git
cd proofpay

# Install Foundry dependencies
forge install

# Build
forge build

# Run tests
forge test -v
```

#### Local development

```bash
# Start a local node
anvil

# Deploy to local anvil (uses default test key)
forge script script/DeployProofPay.s.sol --rpc-url http://localhost:8545 --broadcast
```

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Connect a wallet configured for **Flow EVM Testnet**:

| Setting | Value |
|---------|-------|
| Network name | Flow EVM Testnet |
| RPC URL | `https://testnet.evm.nodes.onflow.org` |
| Chain ID | `545` |
| Currency symbol | `FLOW` |
| Block explorer | `https://evm-testnet.flowscan.io` |

Get testnet FLOW from the [Flow faucet](https://testnet-faucet.onflow.org).

#### Production build

```bash
npm run build
npm start
```

---

### 3. Event Listener

The listener watches the contract for `ProofSubmitted` events and optionally verifies work with GPT-4.

```bash
cd listener

# Install dependencies
npm install

# Copy and fill in the env file (see Environment Variables below)
cp .env.example .env

# Start listener
node index.js
```

The listener will log received proofs and AI verdicts to stdout. It is optional — the frontend and contracts function without it.

---

## Environment Variables

### Listener (`listener/.env`)

```env
# Address of the deployed ProofPayEscrow contract
ESCROW_ADDRESS=0x7D674fDE6F3c7ba7583abeCAa5Ce43F15F618B8f

# Flow EVM Testnet RPC endpoint
RPC_URL=https://testnet.evm.nodes.onflow.org

# OpenAI API key for AI-powered proof verification
OPENAI_API_KEY=sk-...
```

### Deployment (`shell environment`)

```env
# Private key of the deployer wallet (omit to use Foundry default)
PRIVATE_KEY=0x...
```

### Frontend

Contract addresses are hardcoded in `frontend/src/lib/contracts.ts`. Update `ESCROW_ADDRESS` and `REGISTRY_ADDRESS` there after any redeployment.

---

## Deployment

### Deploy to Flow EVM Testnet

```bash
export PRIVATE_KEY=<your-private-key>

forge script script/DeployProofPay.s.sol \
  --rpc-url https://testnet.evm.nodes.onflow.org \
  --broadcast \
  --verify

# The script logs both addresses on completion:
# ProofPayRegistry deployed at: 0x...
# ProofPayEscrow deployed at:   0x...
```

### Update the frontend after redeployment

Edit `frontend/src/lib/contracts.ts`:

```ts
export const CONFIG = {
  ESCROW_ADDRESS: "0x<new-escrow-address>" as `0x${string}`,
  REGISTRY_ADDRESS: "0x<new-registry-address>" as `0x${string}`,
  // ...
};
```

Also update `frontend/src/app/config.ts` and `frontend/src/lib/escrow.ts` to match.

---

## Contract Reference

### Job struct

```solidity
struct Job {
    address client;
    address freelancer;
    uint256 totalAmount;       // total FLOW locked in escrow
    uint256 releasedAmount;    // FLOW already paid out
    uint256 createdAt;         // block.timestamp at creation
    uint256 acceptedAt;        // block.timestamp when accepted
    uint256 proofSubmittedAt;  // block.timestamp when proof was submitted
    Status  status;            // OPEN | ACCEPTED | PROOF_SUBMITTED | COMPLETED
    string  proofHash;         // IPFS CID or JSON containing CID + metadata
    string  jobTitle;          // human-readable title stored on-chain
}
```

### Trust score formula

```
getTrustScore(user) = (completedJobs[user] × 2) + successfulPayments[user]
```

A freelancer who has completed 5 jobs and a client who has released 3 payments each accumulate score independently.

### Custom errors

| Error | Condition |
|-------|-----------|
| `NotClient` | Caller is not the job's client |
| `NotFreelancer` | Caller is not the job's freelancer |
| `JobDoesNotExist` | `jobId >= jobCount` |
| `JobNotOpen` | `acceptJob` called when status ≠ OPEN |
| `JobNotAccepted` | `submitProof` called when status = OPEN |
| `ProofAlreadySubmitted` | `submitProof` called when status = PROOF_SUBMITTED |
| `ProofNotSubmitted` | `releasePayment` or `claimPaymentIfClientInactive` before proof |
| `JobAlreadyCompleted` | Action on a completed job |
| `AmountExceedsEscrow` | Release amount > remaining balance |
| `TooEarlyForClaim` | < 48h since `proofSubmittedAt` |
| `NoPaymentProvided` | `msg.value == 0` on payable call |
| `InvalidFreelancer` | Freelancer address is zero |
| `EmptyProofHash` | Empty IPFS hash string |
| `EmptyJobTitle` | Empty job title string |

---

## User Guide

### Client

1. Open the app and connect your wallet (MetaMask or any injected provider).
2. Switch to **Client Mode** in the dashboard.
3. Fill in the **Create New Job** form:
   - **Title** — stored on-chain as `jobTitle`
   - **Description** — stored in localStorage for display
   - **Freelancer Address** — the wallet that can accept and work on the job
   - **Amount (USD)** — converted to FLOW at the demo rate (1 FLOW = $5)
   - **Deadline** — stored in localStorage for display
4. Click **Create & Deposit** — confirm the wallet transaction. FLOW is locked immediately.
5. Once the freelancer submits proof, the card shows the proof and a **Release Payment** panel.
6. Enter the FLOW amount to release and click **Release**. Repeat for partial payments. The progress bar updates after each release.
7. When `releasedAmount == totalAmount`, the job completes automatically.

> **Cancel:** A job can only be cancelled while it is still OPEN (before the freelancer accepts).

---

### Freelancer

1. Open the app and connect your wallet.
2. Switch to **Freelancer Mode** in the dashboard.
3. Jobs assigned to your address appear with a **Funds Locked in Escrow** badge — the client's payment is already secured.
4. Click **Accept Job** to begin work; status changes to *Ongoing*.
5. When finished, click **Submit Proof**:
   - Enter a description of the completed work.
   - Paste the deliverable link or IPFS CID.
   - Confirm the wallet transaction.
6. Status changes to *In Review*. The client can now release payment.
7. If the client takes no action for **48 hours**, the **Claim Payment (Auto-Release)** button appears. Click it to receive all remaining escrow without client approval.

---

### Trust Scores

Every address has a live trust score displayed on job cards:

```
⭐ Trust 12 · 5 jobs
```

The score is computed on-chain:

| Event | Effect |
|-------|--------|
| Job fully paid out | `completedJobs[freelancer]++` → +2 to trust score |
| Job fully paid out | `successfulPayments[client]++` → +1 to trust score |

---

## Project Structure

```
proofpay/
├── src/
│   ├── ProofPayEscrow.sol        # Main escrow contract
│   └── ProofPayRegistry.sol      # Freelancer reputation contract
├── test/
│   ├── ProofPayEscrow.t.sol      # Escrow contract tests
│   └── ProofPayRegistry.t.sol    # Registry contract tests
├── script/
│   └── DeployProofPay.s.sol      # Foundry deployment script
├── lib/
│   ├── forge-std/                # Foundry standard library (submodule)
│   └── openzeppelin-contracts/   # OpenZeppelin contracts (submodule)
├── frontend/
│   └── src/
│       ├── app/
│       │   ├── page.tsx                   # Landing page + wallet connect
│       │   ├── layout.tsx                 # Root layout (Web3Provider wrapper)
│       │   ├── config.ts                  # Chain + contract config
│       │   └── components/
│       │       ├── Dashboard.tsx          # Main UI (job cards, forms, modals)
│       │       ├── Web3Provider.tsx       # Wagmi + Query provider
│       │       └── Login.tsx              # Flow FCL auth (experimental)
│       ├── hooks/
│       │   ├── useJobs.ts                 # Contract reads + event watchers
│       │   └── useProofPayEscrow.ts       # Contract write functions
│       └── lib/
│           ├── contracts.ts               # Addresses + ABI exports
│           ├── ProofPayEscrow.json        # Escrow ABI
│           ├── ProofPayRegistry.json      # Registry ABI
│           ├── escrow.ts                  # Encrypted upload + submitProof pipeline
│           └── lit.ts                     # Lit Protocol encrypt/decrypt helpers
├── listener/
│   ├── index.js                  # Event listener + AI verification service
│   └── package.json
├── foundry.toml                  # Foundry config (solc 0.8.20)
└── remappings.txt                # Solidity import remappings
```

---

## Network

All contracts are deployed on **Flow EVM Testnet**.

| Parameter | Value |
|-----------|-------|
| Chain ID | `545` |
| RPC URL | `https://testnet.evm.nodes.onflow.org` |
| Block Explorer | `https://evm-testnet.flowscan.io` |
| Faucet | `https://testnet-faucet.onflow.org` |
| ProofPayEscrow | `0x7D674fDE6F3c7ba7583abeCAa5Ce43F15F618B8f` |
| ProofPayRegistry | `0x8E447A61AA900A586124B823248a8C705b252F3a` |
