pragma circom 2.2.3;

include "../circomlib/circuits/poseidon.circom";

template Nullifier() {
    signal input secret;
    signal input electionId;
    signal output nullifier;

    component nPoseidon = Poseidon(2);
    nPoseidon.inputs[0] <== secret;
    nPoseidon.inputs[1] <== electionId;
    nullifier <== nPoseidon.out;
}
