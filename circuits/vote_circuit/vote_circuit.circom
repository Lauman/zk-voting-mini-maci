pragma circom 2.2.3;

include "../merkle_tree_verifier/merkle_tree_verifier.circom";
include "../nullifier/nullifier.circom";

template VoteCircuit(levels) {
    signal input secret;
    signal input vote; // 0 or 1

    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input root;

    signal input electionId;
    signal output nullifier;

    // Enforce binary vote
    vote * (vote - 1) === 0;

    // Merkle membership
    component mt = MerkleTreeVerifier(levels);
    mt.leaf <== leaf;
    mt.pathElements <== pathElements;
    mt.pathIndices <== pathIndices;
    mt.root <== root;

    // Nullifier
    component n = Nullifier();
    n.secret <== secret;
    n.electionId <== electionId;
    nullifier <== n.nullifier;
}

component main {public [root, electionId, vote]} = VoteCircuit(2);
