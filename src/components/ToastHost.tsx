import { useEffect, useState } from 'react'
import { setToastListener } from '../shared/toastStore'

export default function ToastHost() {
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    setToastListener((m) => {
      setMsg(m)
      window.clearTimeout((ToastHost as any)._t)
      ;(ToastHost as any)._t = window.setTimeout(() => setMsg(null), 3000)
    })
  }, [])

  if (!msg) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        background: '#b91c1c',
        color: 'white',
        padding: '12px 16px',
        borderRadius: 10,
        boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
        maxWidth: 360,
        zIndex: 9999,
      }}
    >
      {msg}
    </div>
  )
}
