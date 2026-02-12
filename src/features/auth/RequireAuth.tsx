import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './useAuth'
import type { Role } from './auth.types'

export default function RequireAuth({
  children,
  role,
}: {
  children: React.ReactNode
  role?: Role
}) {
  const { isAuthed, role: myRole } = useAuth()
  const location = useLocation()

  if (!isAuthed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (role && myRole !== role) {
    return <Navigate to="/tasks" replace />
  }

  return <>{children}</>
}
