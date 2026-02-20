import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import Tasks from '../pages/Tasks'
import SubmitTask from '../pages/SubmitTask'
import TaskDetail from '../pages/TaskDetail'
import AppLayout from './AppLayout'
import AdminNodes from '../pages/AdminNodes'

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* 一次性保护 AppLayout + 所有子路由 */}
      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/submit" element={<SubmitTask />} />
        <Route path="/tasks/:id" element={<TaskDetail />} />

        {/* 仅 admin 需要额外 role 守卫 */}
        <Route
          path="/admin/nodes"
          element={
            <RequireAuth role="admin">
              <AdminNodes />
            </RequireAuth>
          }
        />
      </Route>

      {/* 默认入口建议直达 /tasks（受保护，会被守卫处理） */}
      <Route path="*" element={<Navigate to="/tasks" replace />} />
    </Routes>
  )
}