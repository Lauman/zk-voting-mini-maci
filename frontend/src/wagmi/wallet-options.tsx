import { useConnect } from 'wagmi'
import { injected } from 'wagmi/connectors'

export function WalletOptions() {
  const  connect  = useConnect()

  return (
    <button onClick={() => connect.mutate({ connector: injected() })}>
      Connect
    </button>
  )
}