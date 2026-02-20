import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTasksQuery } from '../features/tasks/hooks'
import { useAuth } from '../features/auth/useAuth'
import { useMemo } from 'react'
import { usePins } from '../features/pins/hooks'

const STATUSES = ['All', 'Queued', 'Running', 'Succeeded', 'Failed', 'Canceled'] as const
type StatusFilter = typeof STATUSES[number] // 'All' | TaskStatus

function isStatusFilter(v: string): v is StatusFilter {
  return (STATUSES as readonly string[]).includes(v)
}

export default function Tasks() {
  const { session } = useAuth()

  const [searchParams, setSearchParams] = useSearchParams()

  const rawStatus = searchParams.get('status')
  const status: StatusFilter = rawStatus && isStatusFilter(rawStatus) ? rawStatus : 'All'

  const page = Number(searchParams.get('page') ?? '1')
  const pageSize = Number(searchParams.get('pageSize') ?? '10')
  const sort = searchParams.get('sort') ?? 'createdAt_desc'

  const { data, isLoading, isError, error, isFetching, refetch } = useTasksQuery({
    status,
    page,
    pageSize,
    sort,
  })

  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  function setPage(nextPage: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (nextPage <= 1) next.delete('page')
      else next.set('page', String(nextPage))
      return next
    })
  }

  const nav = useNavigate()

  const { ids: pinnedIds, pin, unpin, isPinned } = usePins()

  const pinnedTasks = useMemo(() => {
    const items = data?.items ?? []
    const map = new Map(items.map((t) => [t.id, t]))
    return pinnedIds.map((id) => map.get(id)).filter(Boolean)
  }, [data?.items, pinnedIds])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '6fr 4fr',
        gap: 16,
        alignItems: 'start',
      }}
    >
      {/* LEFT: Tasks */}
      <div style={{ ...cardStyle, marginLeft: 10 }}>
        <div style={{ marginLeft: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, marginLeft: 10, flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setSearchParams((prev) => {
                    const next = new URLSearchParams(prev)

                    // 切换筛选时重置分页到第 1 页
                    next.delete('page')

                    if (s === 'All') next.delete('status')
                    else next.set('status', s)

                    return next
                  })
                }}
                style={{
                  padding: '6px',
                  borderRadius: 8,
                  border: s === status ? '1px solid #3b82f6' : '1px solid #333',
                  background: s === status ? '#1e40af' : '#111',
                  color: '#fff',
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* header */}<select
            value={String(pageSize)}
            onChange={(e) => {
              const nextSize = Number(e.target.value)
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set('pageSize', String(nextSize))
                next.delete('page')
                return next
              })
            }}
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>{n} / page</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              const nextSort = e.target.value
              setSearchParams((prev) => {
                const next = new URLSearchParams(prev)
                next.set('sort', nextSort)
                next.delete('page')
                return next
              })
            }}
          >
            <option value="createdAt_desc">Created ↓</option>
            <option value="createdAt_asc">Created ↑</option>
          </select>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0 }}>Tasks</h1>
              <div style={{ opacity: 0.8 }}>
                User: {session?.user.name} ({session?.user.role})
              </div>
            </div>
          </div>

          {/* content */}
          <div style={{ marginTop: 16 }}>
            {isLoading && (
              <div style={{ display: 'grid', gap: 8 }}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 40,
                      background: '#222',
                      borderRadius: 8,
                      animation: 'pulse 1.5s infinite',
                    }}
                  />
                ))}
              </div>
            )}

            {isError && (
              <div>
                <div style={{ color: 'crimson' }}>Error: {(error as Error).message}</div>
                <button onClick={() => refetch()} style={{ marginTop: 8 }}>
                  Retry
                </button>
              </div>
            )}

            {!isLoading && !isError && data && data.items.length === 0 && <div>Empty</div>}

            {!isLoading && !isError && data && data.items.length > 0 && (
              <>
                <table cellPadding={8} style={{ marginTop: 12, borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th align="left">ID</th>
                      <th align="left">Status</th>
                      <th align="left">Algorithm</th>
                      <th align="left">Node</th>
                      <th align="left">Created</th>
                      <th align="right">Pin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items.map((t) => (
                      <tr
                        key={t.id}
                        onClick={() => nav(`/tasks/${t.id}`)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{t.id}</td>
                        <td>{t.status}</td>
                        <td>{t.algorithm}</td>
                        <td>{t.nodeId}</td>
                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                        <td align="right">
                          {isPinned(t.id) ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                unpin(t.id)
                              }}
                              style={{ padding: '6px 10px', borderRadius: 10 }}
                            >
                              Unpin
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                pin(t.id)
                              }}
                              style={{ padding: '6px 10px', borderRadius: 10 }}
                            >
                              Pin
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* pagination */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 12,
                  }}
                >
                  <div style={{ opacity: 0.8 }}>
                    {isFetching && !isLoading ? 'Updating…' : `Total: ${total}`}
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '0px 10px' }}>
                    <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
                      Prev
                    </button>
                    <span>
                      {page} / {totalPages}
                    </span>
                    <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Pinned */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Pinned</h2>
          <div style={{ opacity: 0.7, fontSize: 12 }}>{pinnedIds.length}</div>
        </div>

        <div style={{ marginTop: 12 }}>
          {pinnedTasks.length === 0 ? (
            <div style={{ opacity: 0.75 }}>Pin tasks from the left list.</div>
          ) : (
            <div style={{ display: 'grid', gap: 10 }}>
              {pinnedTasks.map((t) => (
                <div
                  key={t!.id}
                  style={{
                    border: '1px solid #222',
                    borderRadius: 12,
                    padding: 12,
                    background: '#0f0f0f',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{t!.id}</div>
                      <div style={{ opacity: 0.8, fontSize: 12 }}>
                        {t!.status} · {t!.algorithm} · {t!.nodeId}
                      </div>
                    </div>

                    <button onClick={() => unpin(t!.id)} style={{ padding: '6px 10px', borderRadius: 10 }}>
                      Unpin
                    </button>
                  </div>

                  <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => nav(`/tasks/${t!.id}`)}
                      style={{ padding: '6px 10px', borderRadius: 10 }}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import type { CSSProperties } from 'react'

const cardStyle: CSSProperties = {
  background: '#0b0b0b',
  border: '1px solid #222',
  borderRadius: 16,
  padding: 16,
}