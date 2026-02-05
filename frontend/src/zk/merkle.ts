import { IMT } from "@zk-kit/imt";
import { poseidon1, poseidon2 } from "poseidon-lite"

/**
 * depth: number of nodes from the leaf to the tree's root node.
 * zeroValue: default zero, can vary based on the specific use-case.
 * arity: number of children per node (2 = Binary IMT, 5 = Quinary IMT).
 */

const depth = 2
const zeroValue = 0
const arity = 2

// Build Merkle Tree
export function buildMerkleTree(leaves: bigint[]) {
  const tree = new IMT(poseidon2, depth, zeroValue, arity)
  leaves.forEach(l => tree.insert(l));
  return tree;
}

// Poseidon hash function
export function hashPoseidon(input: any[]) {
  return poseidon1(input)
}

/**
 * Generate a hash cryptographic of 10 digits using SHA-256.
 * @param {string|number} input - Input value.
 * @returns {Promise<string>} - A string of 10 digits.
 */
export async function generateCryptoHash10(input: any) {
  const msgUint8 = new TextEncoder().encode(String(input));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8); // Hash SHA-256

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  const bigIntHash = BigInt("0x" + hexHash.substring(0, 15));

  // Mod to obtain exactly 10 digits
  // Range: 1,000,000,000 - 9,999,999,999
  const min = 1000000000n;
  const max = 9999999999n;
  const result = (bigIntHash % (max - min + 1n)) + min;

  return result.toString();
}