import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchNodes, restartNode } from './api'

export function useNodesQuery() {
  return useQuery({
    queryKey: ['adminNodes'],
    queryFn: ({ signal }) => fetchNodes(signal),
    refetchInterval: 5000, // ✅ 健康状态轮询
    staleTime: 0,
  })
}

export function useRestartNodeMutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => restartNode(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminNodes'] })
    },
  })
}