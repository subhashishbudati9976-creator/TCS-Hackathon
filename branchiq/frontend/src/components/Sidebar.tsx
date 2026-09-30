import React from 'react'
import type { Branch, HealthResponse } from '../types'

export type NavView = 'dashboard' | 'bottlenecks' | 'recommendations' | 'simulator' | 'customer' | 'feedback'

interface SidebarProps {
  currentView: NavView
  onSelectView: (view: NavView) => void
  branches: Branch[]
  selectedBranchCode: string
  onSelectBranch: (code: string) => void
  health: HealthResponse | null
  healthStatus: 'connected' | 'checking' | 'error'
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  branches,
  selectedBranchCode,
  onSelectBranch,
  health,
  healthStatus,
}) => {
  const currentBranch = branches.find((b) => b.branch_code === selectedBranchCode) ?? branches[0]

  const navItems = [
    {
      id: 'dashboard' as NavView,
      label: 'Manager Dashboard',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      badge: 'Live',
    },
    {
      id: 'bottlenecks' as NavView,
      label: 'Bottlenecks & Queues',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      badge: currentBranch?.current_load > 75 ? 'Alert' : undefined,
    },
    {
      id: 'recommendations' as NavView,
      label: 'AI Recommendations',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      badge: '4 Actions',
    },
    {
      id: 'simulator' as NavView,
      label: 'What-If Simulator',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      id: 'customer' as NavView,
      label: 'Customer Experience',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      badge: 'Portal',
    },
    {
      id: 'feedback' as NavView,
      label: 'Feedback & NLP',
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-64 bg-[#0c1222] border-r border-slate-800/80 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        {/* Logo / Branding */}
        <div className="p-6 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-extrabold text-white text-base tracking-tighter">AV</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1 font-mono">
                AVENUE
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">
                Branch Intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Active Branch Switcher */}
        <div className="p-4 border-b border-slate-800/80">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
            Active Operating Branch
          </label>
          <div className="relative">
            <select
              value={selectedBranchCode}
              onChange={(e) => onSelectBranch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white appearance-none focus:outline-none focus:border-indigo-500 font-medium cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.branch_code} value={b.branch_code}>
                  {b.name} ({b.current_load}% Load)
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-slate-400">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {currentBranch && (
            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    currentBranch.current_load > 75
                      ? 'bg-rose-500'
                      : currentBranch.current_load > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                />
                {currentBranch.current_load}% Load
              </span>
              <span className="font-mono text-slate-300 font-medium">{currentBranch.current_queue} in queue</span>
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSelectView(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badge === 'Alert'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              healthStatus === 'connected'
                ? 'bg-emerald-500'
                : healthStatus === 'checking'
                ? 'bg-amber-400 animate-ping'
                : 'bg-rose-500'
            }`}
          />
          <div className="truncate">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {health?.service || 'AVENUE Backend'}
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              FastAPI v{health?.version || '0.1.0'} • Online
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
