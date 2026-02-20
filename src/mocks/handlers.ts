import { http, HttpResponse, delay } from 'msw'

type TaskStatus = 'Queued' | 'Running' | 'Succeeded' | 'Failed' | 'Canceled'

const logsDb: Record<string, { ts: string; level: string; msg: string }[]> = {}

type Task = {
  id: string
  status: TaskStatus
  createdAt: string
  nodeId: string
  algorithm: string
  owner: { id: string; name: string }
}

type NodeStatus = 'Online' | 'Offline' | 'Degraded'
type Node = {
  id: string
  name: string
  status: NodeStatus
  load: number
  lastHeartbeatAt: string
}

const nodesDb: Node[] = [
  { id: 'node-a', name: 'GPU Node A', status: 'Online', load: 0.32, lastHeartbeatAt: new Date().toISOString() },
  { id: 'node-b', name: 'GPU Node B', status: 'Degraded', load: 0.78, lastHeartbeatAt: new Date().toISOString() },
  { id: 'node-c', name: 'CPU Node C', status: 'Offline', load: 0.0, lastHeartbeatAt: new Date(Date.now() - 60_000).toISOString() },
]

function jitter() {
  return (Math.random() - 0.5) * 0.12
}


function makeFakeTasks(count = 20): Task[] {
  const statuses: TaskStatus[] = ['Queued', 'Running', 'Succeeded', 'Failed', 'Canceled']
  const algos = ['yolo', 'sam', 'ocr']
  const nodes = ['node-a', 'node-b', 'node-c']

  return Array.from({ length: count }).map((_, i) => {
    const status = statuses[i % statuses.length]
    return {
      id: `t_${String(i + 1).padStart(4, '0')}`,
      status,
      createdAt: new Date(Date.now() - i * 60_000).toISOString(),
      nodeId: nodes[i % nodes.length],
      algorithm: algos[i % algos.length],
      owner: { id: 'u_user', name: 'User' },
    }
  })
}

function ensureLogs(id: string) {
  if (!logsDb[id]) {
    logsDb[id] = Array.from({ length: 5 }).map((_, i) => ({
      ts: new Date(Date.now() - (5 - i) * 1000).toISOString(),
      level: 'INFO',
      msg: `Task ${id} boot log #${i + 1}`,
    }))
  }
  return logsDb[id]
}

const db = {
  tasks: makeFakeTasks(53),
}

export const handlers = [
  http.get('/api/tasks', async ({ request }) => {
    await delay(600)

    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    const page = Number(url.searchParams.get('page') ?? '1')
    const pageSize = Number(url.searchParams.get('pageSize') ?? '10')
    const sort = url.searchParams.get('sort') ?? 'createdAt_desc'

    let items = db.tasks.slice()
    if (status) items = items.filter((t) => t.status === status)

    // sort: createdAt_desc / createdAt_asc
    items.sort((a, b) => {
      const da = new Date(a.createdAt).getTime()
      const dbt = new Date(b.createdAt).getTime()
      return sort === 'createdAt_asc' ? da - dbt : dbt - da
    })

    const total = items.length
    const start = (page - 1) * pageSize
    const paged = items.slice(start, start + pageSize)

    return HttpResponse.json({ items: paged, total })
  }),

  http.post('/api/tasks', async ({ request }) => {
    await delay(500)
    const fd = await request.formData()

    const nodeId = String(fd.get('nodeId') ?? 'node-a')
    const algorithm = String(fd.get('algorithm') ?? 'yolo')

    const id = `t_${String(db.tasks.length + 1).padStart(4, '0')}`
    const now = new Date().toISOString()

    db.tasks.unshift({
      id,
      status: 'Queued',
      createdAt: now,
      nodeId,
      algorithm,
      owner: { id: 'u_user', name: 'User' },
    })

    return HttpResponse.json({ taskId: id }, { status: 201 })
  }),

  http.post('/api/tasks/:id/cancel', async ({ params }) => {
    await delay(300)
    const { id } = params as { id: string }

    const t = db.tasks.find((x) => x.id === id)
    if (!t) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

    t.status = 'Canceled'
    return HttpResponse.json({ ok: true })
  }),

  http.get('/api/tasks/:id', async ({ params }) => {
    await delay(300)
    const { id } = params as { id: string }

    const t = db.tasks.find((x) => x.id === id)
    if (!t) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

    return HttpResponse.json({ task: t })
  }),

  http.get('/api/tasks/:id/logs', async ({ request, params }) => {
    await delay(500)

    const { id } = params as { id: string }

    const t = db.tasks.find((x) => x.id === id)
    if (!t) {
      return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    }

    const logs = ensureLogs(id)

    // 如果任务在运行，每次请求新增一条日志
    if (t.status === 'Running') {
      logs.push({
        ts: new Date().toISOString(),
        level: Math.random() > 0.9 ? 'ERROR' : 'INFO',
        msg: `Task ${id} runtime log #${logs.length + 1}`,
      })
    }

    return HttpResponse.json({
      items: logs,
    })
  }),
  http.get('/api/admin/nodes', async () => {
    await delay(400)

    // 模拟心跳 & load 变化
    nodesDb.forEach((n) => {
      if (n.status !== 'Offline') {
        n.load = Math.max(0, Math.min(1, n.load + jitter()))
        n.lastHeartbeatAt = new Date().toISOString()
      }
      // 少量概率抖动状态
      const r = Math.random()
      if (r < 0.02) n.status = 'Offline'
      else if (r < 0.06) n.status = 'Degraded'
      else if (r < 0.18) n.status = 'Online'
    })

    return HttpResponse.json({ items: nodesDb })
  }),

  http.post('/api/admin/nodes/:id/restart', async ({ params }) => {
    await delay(600)
    const { id } = params as { id: string }
    const n = nodesDb.find((x) => x.id === id)
    if (!n) return HttpResponse.json({ message: 'Not found' }, { status: 404 })

    // 模拟重启：先 Degraded 再 Online
    n.status = 'Degraded'
    n.load = Math.max(0.15, n.load)

    return HttpResponse.json({ ok: true })
  }),
]



