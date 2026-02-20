import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { CreateTaskInput, TasksQuery } from './types'
import { fetchTasks, createTask, cancelTask, fetchTask, fetchTaskLogs } from './api'

export function useTasksQuery(q: TasksQuery) {
  return useQuery({
    queryKey: ['tasks', q],
    queryFn: ({ signal }) => fetchTasks(q, signal),
    placeholderData: (prev) => prev,
    staleTime: 10_000,
  })
}

export function useCreateTaskMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export function useCancelTaskMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const ac = new AbortController()
      // 或把 ac 存 ref，用于组件卸载时 abort
      return cancelTask(id, ac.signal)
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
      qc.invalidateQueries({ queryKey: ['task', id] })
    },
  })
}

export function useTaskQuery(id: string) {
  return useQuery({
    enabled: Boolean(id),
    queryKey: ['task', id],
    queryFn: ({ signal }) => fetchTask(id, signal),

    // ✅ 首次没数据也轮询，拿到状态后再按状态决定是否继续
    refetchInterval: (q) => {
      if (q.state.status === 'error') return false

      const status = q.state.data?.task.status
      if (!status) return 2000

      return status === 'Running' || status === 'Queued' ? 2000 : false
    },
    staleTime: 0,
  })
}

export function useTaskLogs(id?: string, isActive?: boolean) {
  return useQuery({
    enabled: !!id,
    queryKey: ['taskLogs', id],
    queryFn: ({ signal }) => fetchTaskLogs(id!, signal),
    refetchInterval: isActive ? 2000 : false,
  })
}
