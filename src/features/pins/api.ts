export async function fetchPins(signal?: AbortSignal): Promise<{ ids: string[] }> {
  const res = await fetch('/api/me/pins', { signal })
  if (!res.ok) throw new Error(`Fetch pins failed: ${res.status}`)
  return res.json()
}

export async function updatePins(ids: string[]): Promise<{ ok: true }> {
  const res = await fetch('/api/me/pins', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!res.ok) throw new Error(`Update pins failed: ${res.status}`)
  return res.json()
}