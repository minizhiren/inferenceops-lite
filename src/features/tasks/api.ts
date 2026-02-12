import type { TasksQuery, Task, CreateTaskInput } from './types'
import type { Log } from './types'

export async function fetchTasks(q: TasksQuery, signal?: AbortSignal): Promise<{ items: Task[]; total: number }> {
  const sp = new URLSearchParams()
  if (q.status !== 'All') sp.set('status', q.status)
  sp.set('page', String(q.page))
  sp.set('pageSize', String(q.pageSize))
  sp.set('sort', q.sort)

  const res = await fetch(`/api/tasks?${sp.toString()}`, { signal })
  if (!res.ok) throw new Error(`Request failed: ${res.status}`)
  return res.json()
}

export async function createTask(input: CreateTaskInput & { file?: File | null }) {
  const fd = new FormData()
  fd.set('nodeId', input.nodeId)
  fd.set('algorithm', input.algorithm)
  fd.set('mode', input.mode)
  fd.set('params', JSON.stringify(input.params))
  if (input.file) fd.set('file', input.file)

  const res = await fetch('/api/tasks', { method: 'POST', body: fd })
  if (!res.ok) throw new Error(`Create task failed: ${res.status}`)
  return res.json()
}

export async function cancelTask(id: string, signal?: AbortSignal): Promise<{ ok: true }> {
  const res = await fetch(`/api/tasks/${id}/cancel`, { method: 'POST', signal })
  if (!res.ok) throw new Error(`Cancel task failed: ${res.status}`)
  return res.json()
}

export async function fetchTask(id: string, signal?: AbortSignal): Promise<{ task: Task }> {
  const res = await fetch(`/api/tasks/${id}`, { signal })
  if (!res.ok) throw new Error(`Fetch task failed: ${res.status}`)
  return res.json()
}


export async function fetchTaskLogs(id: string, signal?: AbortSignal): Promise<{ items: Log[] }> {
  const res = await fetch(`/api/tasks/${id}/logs`, { signal })
  if (!res.ok) throw new Error(`Fetching task logs failed: ${res.status}`)
  return res.json()
}