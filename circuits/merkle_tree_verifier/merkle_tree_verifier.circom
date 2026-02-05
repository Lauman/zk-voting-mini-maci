pragma circom 2.2.3;

include "../circomlib/circuits/poseidon.circom";

template MerkleTreeVerifier(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels]; // 0 = left, 1 = right
    signal input root;

    signal cur[levels + 1];
    signal left[levels];
    signal right[levels];

    cur[0] <== leaf;

    component hashers[levels];
    
    for (var i = 0; i < levels; i++) {

        left[i]  <== cur[i] + pathIndices[i] * (pathElements[i] - cur[i]);
        right[i] <== pathElements[i] + pathIndices[i] * (cur[i] - pathElements[i]);

        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== left[i];
        hashers[i].inputs[1] <== right[i];

        cur[i + 1] <== hashers[i].out;
    }

    root === cur[levels];
}
