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
    <div style={{ padding: 24, maxWidth: 420 }}>
      <h1>Login</h1>
      <p>Try username: admin / user</p>

      <div style={{ display: 'grid', gap: 8 }}>
        <input
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          placeholder="password (anything)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
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
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {err && <div style={{ color: 'crimson' }}>{err}</div>}
      </div>
    </div>
  )
}
