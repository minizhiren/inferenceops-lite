import { useEffect, useState } from 'react'
import { loadPins, savePins } from './storage'

export function usePins() {
  const [ids, setIds] = useState<string[]>(() => loadPins())

  useEffect(() => savePins(ids), [ids])

  function pin(id: string) {
    setIds((prev) => (prev.includes(id) ? prev : [id, ...prev]))
  }
  function unpin(id: string) {
    setIds((prev) => prev.filter((x) => x !== id))
  }
  function isPinned(id: string) {
    return ids.includes(id)
  }

  return { ids, setIds, pin, unpin, isPinned }
}