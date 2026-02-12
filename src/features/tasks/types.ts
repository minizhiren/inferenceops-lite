export type TaskStatus = 'Queued' | 'Running' | 'Succeeded' | 'Failed' | 'Canceled'

export type Task = {
  id: string
  status: TaskStatus
  createdAt: string
  nodeId: string
  algorithm: string
  owner: { id: string; name: string }
}

export type TasksQuery = {
  status: TaskStatus | 'All'
  page: number
  pageSize: number
  sort: string
}

export type CreateTaskInput = {
  nodeId: string
  algorithm: string
  mode: string
  params: Record<string, unknown>
  fileName: string | null
  file?: File | null
}

export type Log = {
  ts: string
  level: 'INFO' | 'ERROR'
  msg: string
}

export type TaskLogsResponse = {
  items: Log[]
  nextCursor: number | null
}
