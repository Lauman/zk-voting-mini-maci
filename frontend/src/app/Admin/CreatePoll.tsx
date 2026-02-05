import { useEffect, useState } from "react"
import { buildMerkleTree } from "../../zk/merkle"
import { useMerkle } from "../Stores/merkleStore"
import { abi } from "../../contracts/abi"
import { BaseError, useWaitForTransactionReceipt, useWriteContract } from "wagmi"
import { usePolls } from "../Stores/pollsStore"
import { ethers } from "ethers"
import { getPolls } from "../../services/subgraph"
import PollDetail from "../Polls/PollDetail"
import VoteForm from "../Vote/VoteForm"
import { uploadMerkleProof } from "../../ipfs/uploadProof"



export default function CreatePoll() {
  const members = useMerkle((state) => state.members)
  const setMembers = useMerkle((state) => state.updateMembers)
  const polls: bigint[] = usePolls((state) => state.polls)
  const updatePolls = usePolls((state) => state.updatePolls)
  const [root, setRoot] = useState<string | null>(null)
  const [lastTree, setLastTree] = useState<any>(null)
  const [pollSelected, setPollSelected] = useState<bigint | null>(null)
  const {
    data: hash,
    error,
    isPending,
    mutate: writeContractMutate,
    reset: resetWriteContract 
  } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    })

  useEffect(() => {
    const id = setInterval(() => {
      getPolls().then(fetchedPolls => {
        const newPolls = fetchedPolls.map((poll: { pollId: string; merkleRoot: string }) => BigInt(poll.pollId)).sort((a: bigint, b: bigint) => (a > b ? 1 : -1))
        updatePolls(newPolls)
      })
    }, 5000);

    return () => clearInterval(id);
  }, []);


  useEffect(() => {
    if (!isConfirmed) return
    const lastPollId = polls[polls.length - 1].toString()
    uploadToIPFS(BigInt(lastPollId));
    resetWriteContract()
  }, [isConfirmed])


  const uploadToIPFS = async (pollId: bigint) => {
    console.log("🚀 ~ uploadToIPFS ~ pollId:", pollId)
    if (!lastTree) return

    for (let i = 0; i < members.length; i++) {
      const proof = lastTree.createProof(i)

      const cid = await uploadMerkleProof({
        pollId: pollId.toString(),
        root: lastTree.root.toString(),
        leaf: members[i].toString(),
        pathElements: proof.siblings.map((x: { toString: () => any }) => x.toString()),
        pathIndices: proof.pathIndices,
      })

      console.log("CID for voter:", cid)
    }
  }

  async function createTree() {
    const treeSize = 4
    const leaves = Array.from(Array(treeSize).keys()).map(BigInt)
    setMembers(leaves)
    const tree = buildMerkleTree(leaves)
    setLastTree(tree)
    setRoot(tree.root.toString())

    await createPoll()
  }

  async function createPoll() {
    // Implementation for creating a poll on-chain can be added here
    if (!root) return
    const rootInBytes = ethers.zeroPadValue(
      ethers.toBeHex(root),
      32
    )
    const lastPollId = polls[polls.length - 1].toString()
    writeContractMutate({
      abi,
      address: import.meta.env.VITE_ZKMULTIPOLLVOTING_ADDRESS,
      functionName: 'createPoll',
      args: [
        BigInt(lastPollId) + 1n,
        rootInBytes
      ],
    })
  }

  return (
    <>
      <div className="p-6 bg-zinc-900 rounded-xl space-y-4">
        <h2 className="text-xl font-bold">Create Poll</h2>

        <button
          onClick={createTree}
          className="px-4 py-2 bg-indigo-600 rounded"
        >
          Build Merkle Tree
        </button>

        {root && (
          <div className="break-all text-sm">
            <b>Merkle Root:</b> {root}
          </div>
        )}


        {members.length > 0 && (
          <div className="break-all text-sm">
            <b>Members:</b> {members.map(m => m.toString()).join(", ")}
          </div>
        )}

        <div className="text-sm text-zinc-400">{status}</div>

        {hash && <div>Transaction Hash: {hash}</div>}
        {isConfirming && <div>Waiting for confirmation...</div>}
        {isConfirmed && <div>Transaction confirmed.</div>}
        {error && (
          <div>Error: {(error as BaseError).shortMessage || error.message}</div>
        )}
      </div>
      <h2 className="text-xl font-bold">Existing Polls</h2>

      <div className="grid grid-cols-3 gap-4">

        {polls.length > 0 && polls.map(pollId => <div key={pollId.toString()}><PollDetail idPoll={pollId} setSelectedPoll={setPollSelected} /></div>)}
      </div>

      <div className="pt-6"><VoteForm idPoll={pollSelected || undefined} /></div>
    </>

  )
}

