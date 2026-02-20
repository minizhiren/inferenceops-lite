const KEY = 'inferenceops.pins'

export function loadPins(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function savePins(ids: string[]) {
  localStorage.setItem(KEY, JSON.stringify(ids))
}