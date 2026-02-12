import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/useAuth'
import { useCreateTaskMutation } from '../features/tasks/hooks'

export default function SubmitTask() {
  const nav = useNavigate()
  const { session } = useAuth()
  const createTask = useCreateTaskMutation()

  const [nodeId, setNodeId] = useState('node-a')
  const [algorithm, setAlgorithm] = useState('yolo')
  const [mode, setMode] = useState('fast')
  const [threshold, setThreshold] = useState('0.5')

  const [file, setFile] = useState<File | null>(null)
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Submit Task</h1>
      <div style={{ opacity: 0.8, marginBottom: 16 }}>
        User: {session?.user.name} ({session?.user.role})
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        <label>
          Node
          <select value={nodeId} onChange={(e) => setNodeId(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="node-a">node-a</option>
            <option value="node-b">node-b</option>
            <option value="node-c">node-c</option>
          </select>
        </label>

        <label>
          Algorithm
          <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="yolo">yolo</option>
            <option value="sam">sam</option>
            <option value="ocr">ocr</option>
          </select>
        </label>

        <label>
          Mode
          <select value={mode} onChange={(e) => setMode(e.target.value)} style={{ display: 'block', width: '100%', padding: 8 }}>
            <option value="fast">fast</option>
            <option value="accurate">accurate</option>
          </select>
        </label>

        <label>
          Threshold
          <input
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="0.0 ~ 1.0"
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </label>

        <label>
          Input image
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            style={{ display: 'block', width: '100%', padding: 8 }}
          />
        </label>

        {previewUrl && (
          <div style={{ border: '1px solid #333', borderRadius: 12, padding: 12 }}>
            <div style={{ marginBottom: 8, opacity: 0.8 }}>Preview</div>
            <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', borderRadius: 8 }} />
          </div>
        )}

        <button
          disabled={createTask.isPending}
          onClick={async () => {
            const res = await createTask.mutateAsync({
              nodeId, algorithm, mode,
              params: { threshold: Number(threshold) },
              fileName: file?.name ?? null,
              file,
            })
            nav(`/tasks/${res.taskId}`)
          }}
          style={{ padding: '10px 14px', borderRadius: 10 }}
        >
          {createTask.isPending ? 'Submitting...' : 'Submit'}
        </button>

        {createTask.isError && (
          <div style={{ color: 'crimson' }}>
            Error: {(createTask.error as Error).message}
          </div>
        )}
      </div>
    </div>
  )
}
