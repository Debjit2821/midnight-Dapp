# ShadowVote — Midnight Private Voting Vault

[![ShadowVote CI/CD](https://github.com/Debjit2821/midnight-Dapp/actions/workflows/ci.yml/badge.svg)](https://github.com/Debjit2821/midnight-Dapp/actions/workflows/ci.yml)
[![Midnight Network](https://img.shields.io/badge/Midnight-Preprod-6366f1.svg)](https://docs.midnight.network)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

A privacy-first decentralized voting and ballot verification platform built on the **Midnight Network** utilizing **Compact Smart Contracts**, **Zero-Knowledge Proofs (ZKPs)**, **Midnight.js SDK**, and **Lace Wallet**.

> **"Vote privately. Verify publicly."**

---

## 🔗 Project Links

*   **GitHub Repository**: [https://github.com/Debjit2821/midnight-Dapp](https://github.com/Debjit2821/midnight-Dapp)
*   **LIVE Demo**: [https://midnight-dapp-frontend.vercel.app/](https://midnight-dapp-frontend.vercel.app/)
*   **Demo Video**: [https://youtu.be/nui19DTB0zk](https://youtu.be/nui19DTB0zk)

---

## 💡 Initial Product Idea & Scoped Proposal

The **ShadowVote** platform is a decentralized, privacy-preserving voting platform designed for situations where participants need to prove that their vote is legitimate without revealing their individual choice. Midnight's zero-knowledge architecture allows the application to verify eligibility and process votes while keeping individual selections private. 

Election organizers (e.g., student unions, DAOs, corporate governance boards) register an election on the public ledger. Eligible voters connect their **Lace Wallet**, load their local *Private Witness* (containing their secret eligibility key and private candidate choice), and execute Zero-Knowledge Proofs (ZKPs) off-chain. The proof is verified by the **Compact Smart Contract** on the Midnight Preprod ledger, updating the public aggregate tally and registering a single-use nullifier to prevent double voting. The system exposes only aggregate election results and the information necessary to verify that valid votes were counted, providing a practical demonstration of selective disclosure for decentralized voting.

---

## 📸 Screenshots & Proof of Architecture

### 1. Landing Portal & Interactive Playground
*The landing interface displaying active election ballots, candidate selection cards, Lace wallet connection state, and live privacy indicators.*
!Landing Portal

### 2. Successful Compact Contract Compilation
*Output of the Compact compiler generating circuits, proving keys, and TypeScript runtime bindings.*
!Successful Compilation

### 3. Passing Automated Contract & Privacy Tests
*Vitest executing 6 comprehensive tests validating circuit logic, ZK proof checks, nullifier uniqueness, and zero-knowledge privacy bounds.*
!Passing Tests

### 4. Lace Wallet Connect Flow
*Lace wallet popup interface showing authorization, account sync, and Midnight Preprod network connection confirmation.*
!Wallet Connected

### 5. Private Credential & Ballot Preparation
*Client-side witness provider evaluating voter secret keys and candidate selection strictly off-chain in browser memory.*
!Credential Issued

### 6. Zero-Knowledge Proof & Verification
*Step-by-step transaction modal generating ZK proofs, requesting Lace signature, and broadcasting to the Midnight Preprod ledger.*
!Credential Verified

### 7. Observable Privacy Audit & Public Results
*Visual results dashboard displaying public candidate tallies, verifiable percentages, and distinction between public aggregate state and hidden private voter state.*
!Privacy Demonstration

### 8. GitHub Actions CI/CD Pipeline
*Successful build pipeline validating linter, Vitest test suites, TypeScript compilation, and production Vite bundle.*
!CI/CD Success

### 9. Contract Deployment Trace
*Transaction receipt and CLI logs showing the ShadowVote Compact contract deploying successfully on the Midnight Preprod network.*
!Contract Deployment

### 10. CI/CD Verification and Vitest Report in Git
*Verified automated test report running in CI/CD pipeline passing all contract logic and privacy invariant tests.*
!ci/cd and test

---

## ⛓ Deployed Addresses (Midnight Preprod Testnet)

The frontend environment and deployment documentation use the following Midnight Preprod identifiers.

> The Subscan links below are direct lookups. The official explorer can be used from its search page.

*   **ShadowVote Smart Contract (configured contract)**:
    *   **Explorer**: [https://preprod.midnight.subscan.io/account/0200bc5a5e7e812f5206c5ed89ff6dbb718596ee678ed4a5909dad5322645ddb](https://preprod.midnight.subscan.io)
    *   **Alternative Explorer**: [https://explorer.preprod.midnight.network](https://explorer.preprod.midnight.network)
    *   **Raw Hex Format**: `bc5a5e7e812f5206c5ed89ff6dbb718596ee678ed4a5909dad5322645ddb`
    *   **02-Prefixed Contract Hex Format**: `0200bc5a5e7e812f5206c5ed89ff6dbb718596ee678ed4a5909dad5322645ddb`

*   **Election Authority / Organizer (signing wallet)**:
    *   **Explorer**: [https://preprod.midnight.subscan.io/account/02008ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40](https://preprod.midnight.subscan.io)
    *   **Alternative Explorer**: [https://explorer.preprod.midnight.network](https://explorer.preprod.midnight.network)
    *   **Raw Hex Format**: `8ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40`
    *   **02-Prefixed Authority Hex Format**: `02008ccdc19c4a26f42fed3fc6f14f48ef5eea63dc2de9213cf60d50448783ba7f40`

There is intentionally no public voter address recorded alongside a ballot: the Compact contract persists the aggregate tallies and cryptographic nullifiers, not individual voter choices. Publishing a voter address linked to a ballot would violate the core privacy guarantee of the Midnight Network.

---

## 🛡 Privacy Model

The ShadowVote platform ensures **rational privacy** by dividing information into public ledger state, private witness, and zero-knowledge circuit proofs:

```text
                  ┌──────────────────────────────┐
                  │        Private Witness       │
                  │  (Voter Secret, Choice Num)  │
                  └──────────────┬───────────────┘
                                 │
                                 ▼  (Off-chain hash & ZK Proof)
  ┌──────────────────────────────┼──────────────────────────────┐
  │     Public Ledger State      │     Selective Disclosure     │
  │  (Tallies, Total, Status)    │   (Proof of Valid Ballot)    │
  └──────────────────────────────┴──────────────────────────────┘
```

1.  **Public State**: Variables recorded on the public blockchain ledger that are visible to all nodes:
    *   `electionId` (32-byte identifier hash of the active election).
    *   `admin` (Public key of the election organizer authority).
    *   `isActive` (Boolean flag indicating whether voting is currently open or closed).
    *   `candidateCount` (Total number of registered candidates).
    *   `candidateVotes` (Map of aggregate vote counts per candidate index).
    *   `totalVotes` (Integer counting total valid ballots cast).
    *   `nullifiers` (Map of spent cryptographic nullifiers preventing double voting).
2.  **Private Witness**: Sensitive voter fields processed strictly off-chain and never revealed on the ledger:
    *   `voterSecret` (256-bit private cryptographic credential key).
    *   `candidateChoice` (Voter's private candidate selection index: 0, 1, 2...).
3.  **Selective Disclosure & ZK Proving**: Voters run the Compact proving circuit locally. The ZK circuit verifies that:
    *   The voter possesses a valid secret key.
    *   The selected candidate index is within the valid range (`choice < candidateCount`).
    *   The nullifier $\text{hash}(\text{voterSecret}, \text{electionId})$ has not been recorded previously.
    *   The proof updates the candidate tally without ever disclosing *which* candidate was selected.

### 🔍 What an Observer Can and Cannot Learn

#### 👁 What an Observer Can Learn (Publicly Observable)
*   **Election Status**: Whether an election is active or closed.
*   **Candidate List & Metadata**: Names and descriptions of available candidates.
*   **Aggregate Vote Counts**: The total number of votes each candidate has received.
*   **Total Ballots**: The total number of valid votes cast across the election.
*   **Proof Validity**: Mathematical certainty that each counted ballot satisfied all circuit constraints.
*   **Nullifier Registry**: Anonymized 32-byte hashes proving no credential was double-spent.

#### 🔒 What an Observer Cannot Learn (Shielded & Confidential)
*   **Voter Selection**: Which candidate an individual voter selected.
*   **Voter Identity**: The Lace wallet address or identity linked to a specific vote.
*   **Private Witness**: Secret keys, credentials, or local execution traces.
*   **Cross-Election Tracking**: Because nullifiers include the `electionId`, a voter's nullifier in Election A cannot be linked to their nullifier in Election B.

---

## ⚙ Technology Stack & Project Structure

- **Contract Language**: Compact (Minokawa)
- **Frontend Framework**: React 18 (Vite, TypeScript, Custom Midnight Moon CSS Design System)
- **SDK**: Midnight.js SDK (`@midnight-ntwrk/midnight-js-contracts`, `@midnight-ntwrk/compact-runtime`)
- **Wallet Connection**: Lace Wallet DApp Connector API (`@midnight-ntwrk/dapp-connector-api`)
- **Test Runner**: Vitest (6 passing contract and privacy tests)

```text
shadowvote/
├── contract/
│   ├── src/
│   │   ├── shadowvote.compact       # Compact smart contract with ZK circuits
│   │   ├── index.ts                 # TypeScript contract library exports
│   │   └── utils.ts                 # Cryptographic nullifier and byte utilities
│   ├── managed/
│   │   └── shadowvote/              # Compiled contract runtime & ZKIR descriptors
│   │       ├── contract/
│   │       │   ├── index.d.ts       # Generated TypeScript definitions
│   │       │   └── index.cjs        # Contract runtime execution engine
│   │       └── zkir/
│   │           └── castVote.json    # Intermediate circuit representation
│   ├── package.json                 # Contract workspace dependencies
│   └── tsconfig.json                # Contract TypeScript configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx           # Brand header, navigation, and Lace connect button
│   │   │   ├── ElectionCard.tsx     # Active ballot with candidate selection
│   │   │   ├── ResultsDashboard.tsx # Public aggregate results & verifiability chart
│   │   │   ├── PrivacyExplainer.tsx # Interactive ZK pipeline diagram & disclosures
│   │   │   ├── TransactionModal.tsx # Multi-step ZK proof generation modal
│   │   │   └── NotificationBanner.tsx # Error and alert banner
│   │   ├── hooks/
│   │   │   ├── useLaceWallet.ts     # Lace wallet connection lifecycle hook
│   │   │   └── useMidnightContract.ts # Midnight contract queries and voting orchestration
│   │   ├── lib/
│   │   │   ├── midnightConfig.ts    # Preprod network parameters & endpoints
│   │   │   └── witnesses.ts         # Client-side private witness provider
│   │   ├── types/
│   │   │   └── index.ts             # DApp data types and transaction states
│   │   ├── styles/
│   │   │   └── index.css            # Midnight Moon dark theme & animations
│   │   ├── App.tsx                  # Root application view
│   │   └── main.tsx                 # React entry mount
│   ├── public/                      # Static assets & favicon
│   ├── index.html                   # HTML5 entry with meta SEO tags
│   ├── vite.config.ts               # Vite configuration
│   └── package.json                 # Frontend workspace dependencies
│
├── tests/
│   ├── shadowvote.contract.test.ts  # Contract logic unit tests (4 passing tests)
│   └── privacy.test.ts              # Zero-knowledge privacy invariant tests (2 passing tests)
│
├── scripts/
│   └── deploy.ts                    # Midnight Preprod automated deployment script
│
├── .github/
│   └── workflows/
│       └── ci.yml                   # GitHub Actions CI/CD workflow configuration
│
├── .env.example                     # Environment variable template
├── package.json                     # Monorepo workspace configuration
├── tsconfig.json                    # Root TypeScript configuration
├── vitest.config.ts                 # Vitest test configuration
└── README.md                        # Documentation & setup guide
```

---

## 🛠 Setup & Running Instructions

### Prerequisites
*   Node.js (v20.x or v22+)
*   npm (v10+)
*   Lace Wallet browser extension (configured for Midnight Preprod)

### 1. Install Dependencies
```bash
git clone https://github.com/Debjit2821/midnight-Dapp.git
cd midnight-Dapp
npm install
```

### 2. Run Automated Tests
To run the automated tests validating Compact contract circuits and ZK privacy invariants:
```bash
npm test
```

### 3. Run Locally (Dev Server)
Start the Vite development server locally:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🚀 Deployment Guide (Preprod Testnet)

Follow these steps to build and deploy the Compact contract to Midnight Preprod:

### 1. Prerequisites
Ensure you have the following installed and configured on your machine:
*   **Node.js 20+** and **npm** installed.
*   **Lace Wallet Browser Extension** installed and funded with `tNIGHT` tokens from the Midnight Preprod Faucet.
*   Optional: Docker Desktop running for local proof server daemon.

### 2. Compile the Compact Contract
Compile the Compact smart contract to generate type-safe bindings, WebAssembly targets, and ZK circuits:
```bash
npm run build:contract
```
This verifies and builds the compiled contract schemas and ZK circuits in the `contract/managed/` folder.

### 3. Start the Local Proof Server Daemon
When running off-chain zero-knowledge proving circuits locally, start the proof server:
```bash
docker run -d -p 6300:6300 midnightntwrk/proof-server:latest
```
Ensure the proof server is reachable on `http://localhost:6300`.

### 4. Configure Environment Variables
Copy the environment template:
```bash
cp .env.example .env
```
Ensure `MIDNIGHT_PROOF_SERVER_URI` is set to `http://localhost:6300` and `MIDNIGHT_INDEXER_URI` points to the official Preprod GraphQL endpoint.

### 5. Execute Smart Contract Deployment
Run the automated deployment script:
```bash
npm run deploy:preprod
```
The script will:
1. Initialize Midnight provider endpoints for Preprod.
2. Formulate election constructor parameters (`electionId`, `candidateCount`, `adminPk`).
3. Deploy the contract and register ZK verifiers on the Midnight Preprod network.
4. Output the newly generated contract address and transaction hash.

### 6. Verify Deployment on Block Explorers
Inspect the deployed contract on the Midnight Preprod explorer:
- **Contract Address**: `0200bc5a5e7e812f5206c5ed89ff6dbb718596ee678ed4a5909dad5322645ddb`
- **Explorer URL**: `https://preprod.midnight.subscan.io`

### 7. Run Frontend in Live Mode
Start the frontend with the deployed contract configured:
```bash
npm run dev
```
Connect your Lace wallet on Midnight Preprod, select your candidate, and cast your private zero-knowledge ballot!