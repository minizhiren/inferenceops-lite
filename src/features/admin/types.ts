export type NodeStatus = 'Online' | 'Offline' | 'Degraded'

export type Node = {
  id: string
  name: string
  status: NodeStatus
  load: number // 0~1
  lastHeartbeatAt: string
}

export type NodesResponse = {
  items: Node[]
}