import React, { useState } from 'react'
import type { BottleneckAlert } from '../types'

interface BottlenecksViewProps {
  bottlenecks: BottleneckAlert[]
  onActionTriggered?: (actionMsg: string) => void
}

interface CounterStatus {
  id: number
  name: string
  service: string
  operator: string
  status: 'active' | 'idle' | 'standby'
  queue: number
}

const INITIAL_COUNTERS: CounterStatus[] = [
  { id: 1, name: 'Counter 1', service: 'Loan & Mortgage', operator: 'Sarah Jenkins', status: 'active', queue: 7 },
  { id: 2, name: 'Counter 2', service: 'Loan & Mortgage', operator: 'David Miller', status: 'active', queue: 7 },
  { id: 3, name: 'Counter 3', service: 'Cash & Deposits', operator: 'Emily Davis', status: 'active', queue: 2 },
  { id: 4, name: 'Counter 4', service: 'Cash & Deposits', operator: 'Alex Turner', status: 'active', queue: 1 },
  { id: 5, name: 'Counter 5', service: 'Account Opening & KYC', operator: 'Robert Lee', status: 'active', queue: 4 },
  { id: 6, name: 'Counter 6', service: 'Account Opening & KYC', operator: 'Rachel Green', status: 'active', queue: 4 },
  { id: 7, name: 'Counter 7', service: 'Fast-Track KYC', operator: 'Marcus Vance', status: 'standby', queue: 0 },
  { id: 8, name: 'Counter 8', service: 'Wealth Advisory', operator: 'Sophia Ramirez', status: 'active', queue: 5 },
]

export const BottlenecksView: React.FC<BottlenecksViewProps> = ({
  bottlenecks,
  onActionTriggered,
}) => {
  const [counters, setCounters] = useState<CounterStatus[]>(INITIAL_COUNTERS)
  const [activeTab, setActiveTab] = useState<'bottlenecks' | 'counters'>('bottlenecks')

  const toggleCounterStatus = (id: number) => {
    setCounters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus = c.status === 'active' ? 'standby' : 'active'
          onActionTriggered?.(`Counter ${c.id} status changed to ${nextStatus.toUpperCase()}`)
          return { ...c, status: nextStatus }
        }
        return c
      })
    )
  }

  const shiftToLoanService = (id: number) => {
    setCounters((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          onActionTriggered?.(`Counter ${c.id} (${c.operator}) reassigned to Loan & Mortgages!`)
          return { ...c, service: 'Loan & Mortgage', status: 'active', queue: 3 }
        }
        return c
      })
    )
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Service-Level Bottlenecks &amp; Physical Counter Matrix
          </h3>
          <p className="text-xs text-slate-400">
            Real-time queue saturation analysis and counter resource dispatch
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('bottlenecks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'bottlenecks'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Service Bottlenecks ({bottlenecks.length})
          </button>
          <button
            onClick={() => setActiveTab('counters')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'counters'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Counter Grid (8 Total)
          </button>
        </div>
      </div>

      {activeTab === 'bottlenecks' ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bottlenecks.map((item) => {
              const severityColor =
                item.severity === 'high'
                  ? 'border-rose-500/30 bg-rose-950/10'
                  : item.severity === 'medium'
                  ? 'border-amber-500/30 bg-amber-950/10'
                  : 'border-emerald-500/30 bg-emerald-950/10'

              const severityBadge =
                item.severity === 'high'
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                  : item.severity === 'medium'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'

              return (
                <div
                  key={item.id}
                  className={`glass-panel rounded-2xl p-5 border ${severityColor} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{item.service_name}</h4>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${severityBadge}`}>
                        {item.severity} Bottleneck
                      </span>
                    </div>

                    {/* Metric Strips */}
                    <div className="grid grid-cols-4 gap-2 mb-4 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Queue</p>
                        <p className="text-lg font-bold text-white font-mono">{item.queue_length}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Avg Wait</p>
                        <p className={`text-lg font-bold font-mono ${item.avg_wait_minutes > 20 ? 'text-rose-400' : 'text-slate-200'}`}>
                          {item.avg_wait_minutes}m
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Capacity</p>
                        <p className="text-lg font-bold text-slate-300 font-mono">{item.capacity_per_hour}/hr</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-semibold text-slate-400">Staff</p>
                        <p className="text-lg font-bold text-slate-300 font-mono">{item.staff_allocated}</p>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="mb-2">
                      <span className="text-[11px] font-semibold text-slate-400">Root Cause:</span>
                      <p className="text-xs text-slate-300 mt-0.5">{item.impact_reason}</p>
                    </div>

                    {/* Action */}
                    <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 mb-4">
                      <span className="text-[11px] font-semibold text-indigo-400">Recommended Mitigation:</span>
                      <p className="text-xs text-slate-200 mt-0.5">{item.recommended_action}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onActionTriggered?.(`Mitigation applied for ${item.service_name}`)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Execute Mitigation</span>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* Counter Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {counters.map((c) => {
            const isActive = c.status === 'active'

            return (
              <div
                key={c.id}
                className={`glass-panel rounded-2xl p-4 border transition-all ${
                  isActive ? 'border-slate-800' : 'border-dashed border-slate-700/60 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold font-mono text-white">{c.name}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <p className="text-xs font-semibold text-indigo-300 truncate">{c.service}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    {c.operator}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-300 pt-1 border-t border-slate-800/80">
                    <span>Queue Assigned:</span>
                    <span className="font-bold font-mono text-white">{c.queue} waiting</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => toggleCounterStatus(c.id)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {isActive ? 'Pause / Standby' : 'Open Counter'}
                  </button>

                  {c.service !== 'Loan & Mortgage' && (
                    <button
                      onClick={() => shiftToLoanService(c.id)}
                      className="py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 transition-all"
                      title="Reassign operator to Loans"
                    >
                      Shift to Loan
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
