import CreatePoll from "./app/Admin/CreatePoll"
import VoteForm from "./app/Vote/VoteForm"
import { Connection } from "./wagmi/connection"
import { useConnection } from 'wagmi'
import { WalletOptions } from "./wagmi/wallet-options"

export default function App() {
  const { isConnected } = useConnection()
  function ConnectWallet() {
    if (isConnected) return <Connection />
    return <WalletOptions />
  }
  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        ZK Multi-Poll Voting
      </h1>

      { !isConnected ? <ConnectWallet /> : <div className="text-center"> <CreatePoll /> </div> }
    </div>
  )
}
