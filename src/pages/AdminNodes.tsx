import { useRestartNodeMutation, useNodesQuery } from '../features/admin/hooks'

function badge(status: string) {
  if (status === 'Online') return { bg: '#052e16', bd: '#14532d', fg: '#86efac', text: 'Online' }
  if (status === 'Degraded') return { bg: '#2a1600', bd: '#92400e', fg: '#fdba74', text: 'Degraded' }
  return { bg: '#2b0b0b', bd: '#7f1d1d', fg: '#fca5a5', text: 'Offline' }
}

export default function AdminNodes() {
  const q = useNodesQuery()
  const restart = useRestartNodeMutation()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0 }}>Admin / Nodes</h1>
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            Health checks refresh every 5s {q.isFetching ? '· updating…' : ''}
          </div>
        </div>
        <button onClick={() => q.refetch()} disabled={q.isFetching}>
          {q.isFetching ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {q.isLoading && <div style={{ marginTop: 16 }}>Loading nodes…</div>}
      {q.isError && <div style={{ marginTop: 16, color: 'tomato' }}>{(q.error as Error).message}</div>}

      {q.data && (
        <table style={{ width: '100%', marginTop: 16, borderCollapse: 'collapse', tableLayout: 'fixed' }} cellPadding={10}>
          <thead>
            <tr>
              <th align="left" style={{ borderBottom: '1px solid #222' }}>ID</th>
              <th align="left" style={{ borderBottom: '1px solid #222' }}>Name</th>
              <th align="left" style={{ borderBottom: '1px solid #222' }}>Status</th>
              <th align="left" style={{ borderBottom: '1px solid #222' }}>Load</th>
              <th align="left" style={{ borderBottom: '1px solid #222' }}>Last heartbeat</th>
              <th align="right" style={{ borderBottom: '1px solid #222' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {q.data.items.map((n) => {
              const b = badge(n.status)
              return (
                <tr key={n.id} style={{ borderBottom: '1px solid #141414' }}>
                  <td>{n.id}</td>
                  <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: 999,
                        border: `1px solid ${b.bd}`,
                        background: b.bg,
                        color: b.fg,
                        fontSize: 12,
                      }}
                    >
                      {b.text}
                    </span>
                  </td>
                  <td>{Math.round(n.load * 100)}%</td>
                  <td>{new Date(n.lastHeartbeatAt).toLocaleTimeString()}</td>
                  <td align="right">
                    <button
                      onClick={() => restart.mutate(n.id)}
                      disabled={restart.isPending}
                      style={{ padding: '6px 10px', borderRadius: 10 }}
                    >
                      {restart.isPending ? 'Restarting…' : 'Restart'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}