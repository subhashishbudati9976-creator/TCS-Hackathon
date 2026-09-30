import React, { useState } from 'react'
import { api } from '../api/client'
import type { SimulationResult } from '../types'

interface SimulatorViewProps {
  branchCode: string
  onCommitPolicy?: (msg: string) => void
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  branchCode,
  onCommitPolicy,
}) => {
  const [staffCount, setStaffCount] = useState<number>(9)
  const [demandMultiplier, setDemandMultiplier] = useState<number>(1.0)
  const [activeCounters, setActiveCounters] = useState<number>(6)
  const [crossTrained, setCrossTrained] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)

  const [result, setResult] = useState<SimulationResult>({
    scenario_id: 'SIM-BASE',
    branch_code: branchCode,
    before: {
      branch_load: 84,
      avg_wait_minutes: 28,
      queue_pressure: 26,
      staff_utilization: 91,
      predicted_csat: 4.1,
    },
    after: {
      branch_load: 64,
      avg_wait_minutes: 14,
      queue_pressure: 12,
      staff_utilization: 75,
      predicted_csat: 4.7,
    },
    delta: {
      branch_load: -20,
      avg_wait_minutes: -14,
      queue_pressure: -14,
      staff_utilization: -16,
      predicted_csat: 0.6,
    },
    ai_verdict:
      'Reallocating 1 cross-trained teller and holding 6 active counters drops peak wait times from 28 to 14 mins (-50%) and recovers CSAT to 4.7/5.0 with zero counter overrun.',
  })

  const handleSimulate = async () => {
    setLoading(true)
    try {
      const res = await api.runSimulation({
        branch_code: branchCode,
        staff_count: staffCount,
        demand_multiplier: demandMultiplier,
        active_counters: activeCounters,
        cross_trained_reallocated: crossTrained,
      })
      setResult(res)
    } finally {
      setLoading(false)
    }
  }

  const resetToDefaults = () => {
    setStaffCount(9)
    setDemandMultiplier(1.0)
    setActiveCounters(6)
    setCrossTrained(0)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          What-If Scenario Simulator
        </h3>
        <p className="text-xs text-slate-400">
          Simulate staffing variations, arrival demand surges, and counter capacity using queuing models
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-slate-800/80 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Simulation Inputs
            </h4>
            <button
              onClick={resetToDefaults}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Reset Defaults
            </button>
          </div>

          {/* Slider 1: Staff Count */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Available Staff On Duty</span>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {staffCount} Personnel
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={15}
              value={staffCount}
              onChange={(e) => setStaffCount(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>4 (Skeleton)</span>
              <span>9 (Baseline)</span>
              <span>15 (Max Overtime)</span>
            </div>
          </div>

          {/* Slider 2: Demand Multiplier */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Expected Customer Demand</span>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {Math.round(demandMultiplier * 100)}% ({demandMultiplier >= 1 ? `+${Math.round((demandMultiplier - 1) * 100)}% Surge` : `-${Math.round((1 - demandMultiplier) * 100)}% Low`})
              </span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2.0}
              step={0.1}
              value={demandMultiplier}
              onChange={(e) => setDemandMultiplier(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>50% (Rainy / Quiet)</span>
              <span>100% (Normal)</span>
              <span>200% (Extreme Peak)</span>
            </div>
          </div>

          {/* Slider 3: Active Counters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Active Service Counters</span>
              <span className="font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                {activeCounters} of 8 Counters
              </span>
            </div>
            <input
              type="range"
              min={3}
              max={8}
              value={activeCounters}
              onChange={(e) => setActiveCounters(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>3 Counters</span>
              <span>6 Counters</span>
              <span>8 (All Open)</span>
            </div>
          </div>

          {/* Slider 4: Cross-Trained Reallocation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Cross-Trained Staff to High-Wait Desks</span>
              <span className="font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                +{crossTrained} Reallocated
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={3}
              value={crossTrained}
              onChange={(e) => setCrossTrained(Number(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0 Staff</span>
              <span>1 Staff</span>
              <span>3 Staff</span>
            </div>
          </div>

          {/* Run Button */}
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            {loading ? (
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            )}
            <span>Calculate What-If Outcome</span>
          </button>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                  Simulation Outcome Comparison
                </h4>
                <p className="text-xs text-slate-400">Baseline Current State vs Simulated Scenario</p>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                {result.scenario_id}
              </span>
            </div>

            {/* 5 Side-by-side KPI Comparisons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {/* Metric 1: Branch Load */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Branch Load</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">{result.after.branch_load}%</span>
                  <span className="text-xs text-slate-500 line-through font-mono">{result.before.branch_load}%</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  <span className={result.delta.branch_load <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.delta.branch_load > 0 ? `+${result.delta.branch_load}%` : `${result.delta.branch_load}%`}
                  </span>
                </div>
              </div>

              {/* Metric 2: Avg Wait Time */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Avg Wait Time</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">{result.after.avg_wait_minutes}m</span>
                  <span className="text-xs text-slate-500 line-through font-mono">{result.before.avg_wait_minutes}m</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  <span className={result.delta.avg_wait_minutes <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.delta.avg_wait_minutes > 0 ? `+${result.delta.avg_wait_minutes}m` : `${result.delta.avg_wait_minutes}m`}
                  </span>
                </div>
              </div>

              {/* Metric 3: Queue Pressure */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Queue Backlog</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">{result.after.queue_pressure}</span>
                  <span className="text-xs text-slate-500 line-through font-mono">{result.before.queue_pressure}</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  <span className={result.delta.queue_pressure <= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.delta.queue_pressure > 0 ? `+${result.delta.queue_pressure}` : `${result.delta.queue_pressure}`}
                  </span>
                </div>
              </div>

              {/* Metric 4: Staff Utilization */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Staff Utilization</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">{result.after.staff_utilization}%</span>
                  <span className="text-xs text-slate-500 line-through font-mono">{result.before.staff_utilization}%</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  <span className="text-slate-400">
                    {result.delta.staff_utilization > 0 ? `+${result.delta.staff_utilization}%` : `${result.delta.staff_utilization}%`}
                  </span>
                </div>
              </div>

              {/* Metric 5: CSAT Score */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 uppercase">Predicted CSAT</span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-emerald-400">{result.after.predicted_csat}</span>
                  <span className="text-xs text-slate-500 line-through font-mono">{result.before.predicted_csat}</span>
                </div>
                <div className="mt-1 text-xs font-semibold">
                  <span className={result.delta.predicted_csat >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    {result.delta.predicted_csat > 0 ? `+${result.delta.predicted_csat}` : `${result.delta.predicted_csat}`}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Analytical Verdict */}
            <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/30">
              <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mathematical Simulation Verdict
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {result.ai_verdict}
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => onCommitPolicy?.(`Policy ${result.scenario_id} committed! Updated branch operating thresholds.`)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/25 transition-all flex items-center gap-2 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Apply Scenario to Real-Time Operations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
