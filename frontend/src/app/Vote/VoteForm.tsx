import { useState } from "react"
import { buildMerkleTree, generateCryptoHash10, hashPoseidon } from "../../zk/merkle"
import { generateProof } from "../../zk/proof"
import { ethers, id } from "ethers"
import { BaseError, useContractEvents, useWaitForTransactionReceipt, useWatchContractEvent, useWriteContract } from "wagmi"
import { abi } from "../../contracts/abi"
import { useMerkle } from "../Stores/merkleStore"


export default function VoteForm({ idPoll }: { idPoll?: bigint }) {
  const [secret, setSecret] = useState("")
  const [leafUser, setLeafUser] = useState("")
  const [vote, setVote] = useState("1")
  const [status, setStatus] = useState("")
  const members = useMerkle((state) => state.members)
  const {
    data: hash,
    error,
    isPending,
    mutate: writeContractMutate
  } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed, isError: isErrored, error: txError } =
    useWaitForTransactionReceipt({
      hash
    })

  async function voteZK() {
    setStatus("Generating proof...")
    // fetch some random data to simulate async operation
    // const resposeIPFS = await fetch('https://dogapi.dog/api/v1/facts?number=1')
    // console.log("🚀 ~ voteZK ~ algo:",  await resposeIPFS.json())
    // proof = await resposeIPFS.json()
    const secretHash = await generateCryptoHash10(secret)

    const proof = { pollId: "13", root: "3720616653028013822312861221679392249031832781774563366107458835261883914924", leaf: "1", pathElements: ["0", "17197790661637433027297685226742709599380837544520340689137581733613433332983"], pathIndices: [1, 0] }

    const { proof: zkProof, publicSignals } = await generateProof({
      secret: hashPoseidon([secretHash]).toString(),
      leaf: proof.leaf.toString(),
      root: proof.root.toString(),
      pathElements: proof.pathElements.map(x => x.toString()),
      pathIndices: proof.pathIndices.map(x => x.toString()),
      vote: vote,
      electionId: idPoll ? idPoll.toString() : "0",
    })

    const proofA = [zkProof.pi_a[0], zkProof.pi_a[1]];
    const proofB = [[zkProof.pi_b[0][1], zkProof.pi_b[0][0]], [zkProof.pi_b[1][1], zkProof.pi_b[1][0]]];
    const proofC = [zkProof.pi_c[0], zkProof.pi_c[1]];
    
    const rootInBytes = ethers.zeroPadValue(
      ethers.toBeHex(proof.root.toString()),
      32
    )
    console.log("🚀 ~ voteZK ~ rootInBytes:", rootInBytes)
    const nullifierInBytes = ethers.zeroPadValue(
      ethers.toBeHex(publicSignals[0].toString()),
      32
    )
    const proofFinal = { a: proofA, b: proofB, c: proofC }
    const data = [
      idPoll,
      parseInt(vote),
      nullifierInBytes,
      proofFinal,
      publicSignals
    ]
    console.log("🚀 ~ voteZK ~ data:", data)
    writeContractMutate({
      abi,
      address: import.meta.env.VITE_ZKMULTIPOLLVOTING_ADDRESS,
      functionName: 'vote',
      args: data,
    })
    setStatus("Proof generated ✔")
  }

  return (
    <div className="p-6 bg-zinc-900 rounded-xl space-y-4">
      <h2 className="text-xl font-bold">Vote for Poll {idPoll?.toString()}</h2>

      <input
        className="w-full p-2 bg-zinc-800 rounded"
        placeholder="Your secret (bigint)"
        value={secret}
        onChange={e => setSecret(e.target.value)}
      />

      <input
        className="w-full p-2 bg-zinc-800 rounded"
        placeholder="Your Leaf (bigint)"
        value={leafUser}
        onChange={e => setLeafUser(e.target.value)}
      />

      <button
        onClick={voteZK}
        className="px-4 py-2 bg-emerald-600 rounded"
      >
        Generate Proof
      </button>

      <div className="text-sm text-zinc-400">{status}</div>

      {hash && <div>Transaction Hash: {hash}</div>}
      {isConfirming && <div>Waiting for confirmation...</div>}
      {isConfirmed && <div>Transaction confirmed.</div>}
      {error && (
        <div>
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
          <div>Failure: { }</div>
        </div>
      )}
      {isErrored && (<div>Transaction failed: {txError?.message}</div>)}
    </div>
  )
}

