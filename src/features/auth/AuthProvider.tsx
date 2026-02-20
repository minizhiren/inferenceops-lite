import React, { createContext, useMemo, useState } from 'react'
import type { AuthSession, Role } from './auth.types'
import { clearSession, loadSession, saveSession } from './auth.storage'

type AuthContextValue = {
  session: AuthSession | null
  isAuthed: boolean
  role: Role | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

function fakeLogin(username: string, password: string): Promise<AuthSession> {
  // 最小可用：用假账号模拟后端登录
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!password) return reject(new Error('Password required'))

      if (username === 'admin') {
        resolve({
          token: 'fake-admin-token',
          user: { id: 'u_admin', name: 'Admin', role: 'admin' },
        })
        return
      }
      if (username === 'user') {
        resolve({
          token: 'fake-user-token',
          user: { id: 'u_user', name: 'User', role: 'user' },
        })
        return
      }
      reject(new Error('Use username: admin or user'))
    }, 500)
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => loadSession())

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      isAuthed: !!session?.token,
      role: session?.user.role ?? null,
      login: async (username, password) => {
        const s = await fakeLogin(username, password)
        saveSession(s)
        setSession(s)
      },
      logout: () => {
        clearSession()
        setSession(null)
      },
    }
  }, [session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
