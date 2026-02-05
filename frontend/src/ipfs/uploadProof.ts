import { getIPFSClient } from "./client"

export async function uploadMerkleProof(
  proofData: Record<string, any>
) {
  const client = await getIPFSClient()

  const blob = new Blob(
    [JSON.stringify(proofData)],
    { type: "application/json" }
  )

  const files = [
    new File([blob], `proof_${proofData.leaf}.json`)
  ]

  const directoryCid = await client.uploadDirectory(files)
  return directoryCid
}
