import React, { useEffect } from 'react'

export interface ToastMessage {
  id: string
  title: string
  message: string
  type?: 'success' | 'info' | 'warning'
}

interface ToastProps {
  toast: ToastMessage | null
  onClose: () => void
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => {
      onClose()
    }, 4500)
    return () => clearTimeout(timer)
  }, [toast, onClose])

  if (!toast) return null

  const colorStyles = {
    success: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200',
    info: 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200',
    warning: 'bg-amber-950/90 border-amber-500/40 text-amber-200',
  }[toast.type ?? 'success']

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-sm">
      <div className={`p-4 rounded-2xl border shadow-2xl backdrop-blur-md flex items-start gap-3 ${colorStyles}`}>
        <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="flex-1">
          <h5 className="text-xs font-bold text-white">{toast.title}</h5>
          <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 text-xs font-bold"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
