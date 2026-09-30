import { useEffect, useState } from 'react'
import apiClient from './api/client'
import type { HealthResponse } from './types'

type ConnectionStatus = 'checking' | 'connected' | 'error'

function App() {
  const [status, setStatus] = useState<ConnectionStatus>('checking')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState<string>('')

  useEffect(() => {
    apiClient
      .get<HealthResponse>('/health')
      .then((res) => {
        setHealth(res.data)
        setStatus('connected')
      })
      .catch((err) => {
        setStatus('error')
        setErrorMsg(err.message ?? 'Unknown error')
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      {/* Logo / Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-blue-400">
          Branch<span className="text-white">IQ</span>
        </h1>
        <p className="mt-2 text-gray-400 text-sm">
          Intelligent Branch Service Load &amp; Customer Experience Optimizer
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-200">System Status</h2>

        {/* Frontend */}
        <StatusRow label="Frontend" status="connected" detail="React + Vite running" />

        {/* Backend */}
        <StatusRow
          label="Backend API"
          status={status}
          detail={
            status === 'connected'
              ? `${health?.service} v${health?.version} — ${health?.status}`
              : status === 'checking'
              ? 'Connecting to http://localhost:8000…'
              : errorMsg
          }
        />
      </div>

      <p className="text-xs text-gray-600">
        TCS Hackathon — BranchIQ Foundation Build
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusRow helper component
// ─────────────────────────────────────────────────────────────────────────────

interface StatusRowProps {
  label: string
  status: ConnectionStatus | 'connected'
  detail: string
}

function StatusRow({ label, status, detail }: StatusRowProps) {
  const dot =
    status === 'connected'
      ? 'bg-green-500'
      : status === 'checking'
      ? 'bg-yellow-400 animate-pulse'
      : 'bg-red-500'

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-800 last:border-0">
      <span className={`mt-1.5 h-2.5 w-2.5 rounded-full flex-shrink-0 ${dot}`} />
      <div>
        <p className="font-medium text-gray-100">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{detail}</p>
      </div>
    </div>
  )
}

export default App
