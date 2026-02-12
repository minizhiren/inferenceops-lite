import { Link, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'
import { useCancelTaskMutation, useTaskQuery, useTaskLogs } from '../features/tasks/hooks'

export default function TaskDetail() {
  const { id: rawId } = useParams()
  const id = rawId ?? ''
  const taskQuery = useTaskQuery(id)
  const cancelMut = useCancelTaskMutation()

  const t = taskQuery.data?.task

  const isRunning =
    t?.status === 'Running' ||
    t?.status === 'Queued'
  const logsQuery = useTaskLogs(id, isRunning)

  const logsContainerRef = useRef<HTMLDivElement | null>(null)

  const qc = useQueryClient()

  useEffect(() => {
    if (!id) return
    // 切换任务时，取消旧 task/logs 请求
    qc.cancelQueries({ queryKey: ['task'] })
    qc.cancelQueries({ queryKey: ['taskLogs'] })
  }, [id, qc])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Task Detail</h1>
      <div style={{ opacity: 0.85 }}>Task ID: {id}</div>

      <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
        <button
          disabled={!id || cancelMut.isPending || t?.status === 'Canceled' || t?.status === 'Succeeded'}
          onClick={() => id && cancelMut.mutate(id)}
        >
          {cancelMut.isPending ? 'Canceling...' : 'Cancel Task'}
        </button>

        <button disabled={!id || taskQuery.isFetching} onClick={() => taskQuery.refetch()}>
          {taskQuery.isFetching ? 'Refreshing…' : 'Refresh'}
        </button>

        <Link to="/tasks">← Back to Tasks</Link>
      </div>

      {taskQuery.isLoading && <div style={{ marginTop: 16 }}>Loading detail…</div>}

      {taskQuery.isError && (
        <div style={{ marginTop: 16, color: 'tomato' }}>
          Error: {(taskQuery.error as Error).message}
        </div>
      )}

      {t && (
        <div style={{ marginTop: 16, border: '1px solid #333', borderRadius: 12, padding: 12 }}>
          <div><b>Status:</b> {t.status} {taskQuery.isFetching ? '(polling)' : ''}</div>
          <div><b>Algorithm:</b> {t.algorithm}</div>
          <div><b>Node:</b> {t.nodeId}</div>
          <div><b>Owner:</b> {t.owner.name}</div>
          <div><b>Created:</b> {new Date(t.createdAt).toLocaleString()}</div>
        </div>
      )}

      <div style={{ marginTop: 24 }}>
        <h2>Logs</h2>

        {logsQuery.isLoading && <div>Loading logs…</div>}

        {logsQuery.isError && (
          <div style={{ color: 'tomato' }}>
            {(logsQuery.error as Error).message}
          </div>
        )}

        {logsQuery.data && (
          <div
            ref={logsContainerRef}
            style={{
              background: '#111',
              padding: 12,
              borderRadius: 12,
              maxHeight: 300,
              overflowY: 'auto',
              fontFamily: 'monospace',
              fontSize: 13,
            }}
          >
            {logsQuery.data.items.map((log, i) => (
              <div
                key={i}
                style={{
                  color: log.level === 'ERROR' ? 'tomato' : '#ccc',
                }}
              >
                [{new Date(log.ts).toLocaleTimeString()}] {log.level} — {log.msg}
              </div>
            ))}
          </div>
        )}
      </div>

      {cancelMut.isError && (
        <div style={{ marginTop: 12, color: 'tomato' }}>
          {(cancelMut.error as Error).message}
        </div>
      )}
    </div>
  )
}
