import * as snarkjs from "snarkjs"

export async function generateProof(input: any) {
  const inputData = {
    secret: input.secret,
    leaf: input.leaf,
    root: input.root,
    pathElements: input.pathElements,
    pathIndices: input.pathIndices,
    vote: input.vote,
    electionId: input.electionId
  }
  const proof = await snarkjs.groth16.fullProve(
    inputData,
    "/zk/vote_circuit.wasm",
    "/zk/vote_circuit_final.zkey"
  )
  const vkey = await fetch("/zk/verification_key.json").then(function (res) {
    return res.json();
  });
  const solidityCallData = await snarkjs.groth16.exportSolidityCallData(proof.proof, proof.publicSignals);
  const verified = await snarkjs.groth16.verify(vkey, proof.publicSignals, proof.proof);
  // console.log("Verification result:", verified);
  // console.log("Solidity call data:", solidityCallData);
  return proof
}

