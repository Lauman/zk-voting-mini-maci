import { create } from '@storacha/client'

export async function getIPFSClient() {
  const client = await create()
  await client.login(import.meta.env.VITE_STORACHA_API_EMAIL)
  await client.setCurrentSpace(import.meta.env.VITE_STORACHA_SPACE_ID)
  return client
}
