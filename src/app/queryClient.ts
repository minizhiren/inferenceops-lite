import { QueryClient, QueryCache } from '@tanstack/react-query'
import { pushToast } from '../shared/toastStore'

function toMessage(err: unknown) {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  return 'Unknown error'
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      // 可选：避免把 aborted 当成错误弹出来
      const msg = toMessage(error)
      if (msg.toLowerCase().includes('aborted')) return

      // 可选：只对某些 query 弹 toast
      // if ((query.queryKey?.[0] ?? '') !== 'tasks') return

      pushToast(`Request failed: ${msg}`)
    },
  }),
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})