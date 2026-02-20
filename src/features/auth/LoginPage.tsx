import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'

export default function LoginPage() {
  const { login } = useAuth()
  const nav = useNavigate()
  const location = useLocation() as any

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from ?? '/tasks'

  return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      background: '#0b0b0b',
    }}
  >
    <div
      style={{
        width: '100%',
        maxWidth: 420,
        background: '#0f0f0f',
        border: '1px solid #222',
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Login</h1>
        <p style={{ margin: '6px 0 0', opacity: 0.75, fontSize: 13 }}>
          Try username: <b>admin</b> / <b>user</b> (password: anything)
        </p>
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Username</span>
          <input
            placeholder="admin or user"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid #222',
              background: '#0b0b0b',
              color: '#fff',
              outline: 'none',
            }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span style={{ fontSize: 12, opacity: 0.8 }}>Password</span>
          <input
            placeholder="anything"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              height: 38,
              padding: '0 12px',
              borderRadius: 10,
              border: '1px solid #222',
              background: '#0b0b0b',
              color: '#fff',
              outline: 'none',
            }}
          />
        </label>

        <button
          onClick={async () => {
            setErr(null)
            setLoading(true)
            try {
              await login(username.trim(), password)
              nav(from, { replace: true })
            } catch (e: any) {
              setErr(e?.message ?? 'Login failed')
            } finally {
              setLoading(false)
            }
          }}
          disabled={loading}
          style={{
            height: 40,
            borderRadius: 10,
            border: '1px solid #1d4ed8',
            background: loading ? '#111827' : '#1e40af',
            color: '#fff',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {err && (
          <div
            style={{
              color: '#ff6b6b',
              fontSize: 13,
              background: 'rgba(220, 38, 38, 0.12)',
              border: '1px solid rgba(220, 38, 38, 0.35)',
              borderRadius: 10,
              padding: '8px 10px',
            }}
          >
            {err}
          </div>
        )}
      </div>
    </div>
  </div>
)
}
