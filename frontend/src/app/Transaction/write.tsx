import { useWriteContractSync } from 'wagmi'
import { abi } from '../../contracts/abi'

export function WriteTransaction(pollId: number, voteOption: number, nullifier: string, proof: any, publicSignals: any) {
    const writeContractSync = useWriteContractSync()

    return (
        <button
            onClick={() =>
                writeContractSync.mutate({
                    abi,
                    address: import.meta.env.VITE_ZKMULTIPOLLVOTING_ADDRESS,
                    functionName: 'vote',
                    args: [
                        pollId,
                        voteOption,
                        nullifier,
                        proof,
                        publicSignals
                    ],
                })
            }
        >
            Vote
        </button>
    )
}