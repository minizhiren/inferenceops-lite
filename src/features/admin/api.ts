import type { NodesResponse } from './types'

export async function fetchNodes(signal?: AbortSignal): Promise<NodesResponse> {
  const res = await fetch('/api/admin/nodes', { signal })
  if (!res.ok) throw new Error(`Fetch nodes failed: ${res.status}`)
  return res.json()
}

export async function restartNode(id: string): Promise<{ ok: true }> {
  const res = await fetch(`/api/admin/nodes/${id}/restart`, { method: 'POST' })
  if (!res.ok) throw new Error(`Restart failed: ${res.status}`)
  return res.json()
}