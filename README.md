# 🗳️ ZK Multi-Poll Voting System

A privacy-preserving voting system based on **Zero-Knowledge Proofs** that enables the creation of multiple on-chain polls and allows users to vote anonymously, while enforcing **one-person-one-vote per poll** through nullifiers and zk-SNARK verification.

The project follows an architecture inspired by **MACI** and **Semaphore**, with a clear separation between:
- identity
- membership
- voting
- on-chain verification

---

## 🧠 System Architecture

The system is composed of five main modules:

.
├── circuits
├── contracts
├── frontend
├── subgraph
└── test


Each module has a well-defined responsibility within the overall ZK workflow.

---

## 🔐 Circuits

📁 `circuits/`

Contains the Circom circuits that define the cryptographic logic of the system.

### Main Circuits

- **`merkle_tree_verifier.circom`**
  - Verifies that a `leaf` belongs to a Merkle Tree given a `root`
  - Uses Poseidon as the hashing function
  - Inputs:
    - `leaf`
    - `pathElements`
    - `pathIndices`
    - `root`

- **`nullifier.circom`**
  - Generates a deterministic nullifier from a `secret` and a `pollId`
  - Prevents double voting within the same poll
  - Allows voting across multiple polls without linking identities

- **`vote_circuit.circom`**
  - Main circuit of the system
  - Combines:
    - Merkle inclusion verification
    - nullifier generation
    - vote validation
  - Produces the `publicSignals` consumed by the smart contract

📌 These circuits are compiled into:
- `circuit.wasm`
- `circuit_final.zkey`

which are later consumed by the frontend.

---

## ⛓️ Smart Contracts

📁 `contracts/`

Contains the Solidity smart contracts responsible for proof verification and poll management.

### Contracts

- **`Groth16Verifier.sol`**
  - zk-SNARK verifier contract
  - Auto-generated from the Circom circuit
  - Verifies Groth16 proofs

- **`ZKMultiPollVoting.sol`**
  - Core contract of the system
  - Responsibilities:
    - create polls
    - store Merkle roots per poll
    - verify zk-proofs
    - record votes
    - prevent double voting via nullifiers
  - Supports **multiple polls** within a single contract

📌 The contract never handles identities or member lists, only:
- Merkle roots
- nullifiers
- valid zk-proofs

---

## 🖥️ Frontend

📁 `frontend/`

Frontend application built with:

- React 18
- Vite 7
- TypeScript
- TailwindCSS
- wagmi + viem
- snarkjs
- @zk-kit/imt
- storacha (IPFS)

### Frontend Responsibilities

#### Admin
- Build the Merkle Tree off-chain
- Generate inclusion proofs
- Upload proofs to IPFS
- Create polls on-chain

#### Voter
- Fetch Merkle proofs from IPFS
- Generate zk-proofs in the browser
- Submit vote transactions
- No need to reconstruct the Merkle Tree

📌 The frontend never uploads secrets to IPFS  
📌 zk-proofs are generated **on demand**

---

## 🌍 Subgraph

📁 `subgraph/`

GraphQL subgraph built using **The Graph** to index smart contract events.

### Indexed Data

- Poll creation events
- Merkle roots per poll
- Poll state
- Vote events (without revealing voter identity)

### Purpose

- Smart contracts are not query-friendly
- Enables:
  - poll listings
  - improved frontend UX
  - privacy-preserving data access

The frontend queries the subgraph using GraphQL.

---

## 🧪 Tests

📁 `test/`

Contains the smart contract test suite.

### Tested Scenarios

- Poll creation
- zk-proof verification
- Double-voting prevention
- Nullifier handling
- Invalid cases (wrong proof, invalid root, reused nullifier, etc.)

Tests ensure consistency between the circuit logic and on-chain verification.

---

## 🔁 System Flow

1. Admin defines the poll members
2. A Merkle Tree is built off-chain
3. Merkle roots and inclusion proofs are generated
4. The Merkle root is stored on-chain during poll creation
5. Each voter retrieves their inclusion proof from IPFS
6. The voter generates a zk-proof in the frontend
7. The contract verifies:
   - proof validity
   - nullifier uniqueness
   - correct Merkle root
8. The vote is recorded without revealing voter identity

---

## 🔒 Security Properties

- ✔ Voter anonymity
- ✔ One vote per poll
- ✔ No trusted backend
- ✔ On-chain verifiable proofs
- ✔ Sensitive data never published

---

## 📌 Inspiration

- MACI
- Semaphore
- Zupass
- Minimal Anti-Collusion Voting

---

## 🚀 Project Status

A functional, modular, and extensible ZK voting system, suitable both for **advanced ZK learning** and as a foundation for real-world anonymous voting applications.

