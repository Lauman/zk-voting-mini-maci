import { useEffect, useState } from "react"
import { abi } from "../../contracts/abi.js"
import { useBlockNumber, useReadContract } from 'wagmi'
import { Poll } from "./typesPolls.js"

export default function PollDetail({ idPoll, setSelectedPoll }: { idPoll?: bigint, setSelectedPoll?: (id: bigint) => void }) {
    const { data: blockNumber } = useBlockNumber({ watch: true })
    const { data: dataPollFetch, refetch } = useReadContract({
        address: import.meta.env.VITE_ZKMULTIPOLLVOTING_ADDRESS,
        abi,
        functionName: 'polls',
        args: [idPoll],
    })
    const [dataPoll, setdataPoll] = useState<Poll | null>(null)

    useEffect(() => {
        if (dataPollFetch) {
            const [merkleRoot, yesVotes, noVotes, isActive] = dataPollFetch as unknown as [string, bigint, bigint, boolean]
            setdataPoll({
                merkleRoot,
                yesVotes: Number(yesVotes),
                noVotes: Number(noVotes),
                isActive,
            })
        }
    }, [dataPollFetch])
    useEffect(() => {
        // want to refetch every `n` block instead? use the modulo operator!
        // if (blockNumber % 5 === 0) refetch() // refetch every 5 blocks
        refetch()
    }, [blockNumber])
    return (
        <div className="p-6 bg-zinc-900 rounded-xl space-y-4">
            <h2 className="text-xl font-bold">Poll {idPoll?.toString()}</h2>

            {dataPoll && dataPoll?.isActive === true ? (
                <div className="text-green-500 font-bold">Status: Active</div>
            ) : (
                <div className="text-red-500 font-bold">Status: Closed</div>
            )}

            {dataPoll && dataPoll?.isActive === true ? (

                <div>                
                    <button
                    onClick={() => setSelectedPoll && setSelectedPoll(idPoll!)}
                    className="px-4 py-2 bg-emerald-600 rounded"
                >
                    Select Poll to Vote
                </button></div>
            ) : (
                <div></div>
            )}

        </div>
    )
}

