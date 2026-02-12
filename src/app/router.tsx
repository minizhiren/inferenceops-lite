import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from '../features/auth/LoginPage'
import RequireAuth from '../features/auth/RequireAuth'
import Tasks from '../pages/Tasks'
import SubmitTask from '../pages/SubmitTask'
import TaskDetail from '../pages/TaskDetail'
import AppLayout from './AppLayout'

function AdminNodes() {
  return <h1>Admin / Nodes</h1>
}

export default function Router() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth><AppLayout /></RequireAuth>}>

        <Route
          path="/tasks"
          element={
            <RequireAuth>
              <Tasks />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/nodes"
          element={
            <RequireAuth role="admin">
              <AdminNodes />
            </RequireAuth>
          }
        />

        <Route
          path="/submit"
          element={
            <RequireAuth>
              <SubmitTask />
            </RequireAuth>
          }
        />

        <Route
          path="/tasks/:id"
          element={
            <RequireAuth>
              <TaskDetail />
            </RequireAuth>
          }
        />

      </Route>
      <Route path="*" element={<Navigate to="/tasks" />} />
    </Routes>
  )
}
