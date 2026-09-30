import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Building2,
  Clock,
  Layers,
} from 'lucide-react'
import * as api from '../../api'
import type { BranchListItem, SimulationResult, SimulationPayload } from '../../types'

export const SimulationPage: React.FC = () => {
  const location = useLocation()
  const navState = (location.state as any) || {}

  const [branches, setBranches] = useState<BranchListItem[]>([])
  const [branchId, setBranchId] = useState<string>(navState.branchId || 'BR001')
  const [actionType, setActionType] = useState<string>(navState.actionType || 'STAFF_REASSIGNMENT')

  // Scenario parameters
  const [fromService, setFromService] = useState<string>(navState.params?.from_service || 'Cash Withdrawal')
  const [toService, setToService] = useState<string>(navState.params?.to_service || 'Loan Application')
  const [staffCount, setStaffCount] = useState<number>(navState.params?.staff_count || 1)
  const [adoptionRate, setAdoptionRate] = useState<number>(navState.params?.adoption_rate || 0.25)
  const [targetBranch, setTargetBranch] = useState<string>(navState.params?.target_branch || 'BR002')
  const [pctRedirected, setPctRedirected] = useState<number>(navState.params?.pct_redirected || 0.15)

  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadBranches() {
      try {
        const list = await api.getBranches()
        setBranches(list)
      } catch {}
    }
    loadBranches()
  }, [])

  // Execute initial simulation on load
  useEffect(() => {
    handleRunSimulation()
  }, [branchId])

  const handleRunSimulation = async () => {
    setIsSimulating(true)
    setError(null)
    try {
      let params: Record<string, any> = {}
      if (actionType === 'STAFF_REASSIGNMENT') {
        params = { from_service: fromService, to_service: toService, staff_count: staffCount }
      } else if (actionType === 'DIGITAL_DIVERSION') {
        params = { target_service: 'Statement Request', adoption_rate: adoptionRate }
      } else if (actionType === 'CUSTOMER_REDIRECTION') {
        params = { target_branch: targetBranch, pct_redirected: pctRedirected }
      }

      const payload: SimulationPayload = {
        branch_id: branchId,
        action_type: actionType,
        parameters: params,
      }
      const res = await api.runSimulation(payload)
      setSimulationResult(res)
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Simulation execution failed.')
    } finally {
      setIsSimulating(false)
    }
  }

  const handleReset = () => {
    setActionType('STAFF_REASSIGNMENT')
    setFromService('Cash Withdrawal')
    setToService('Loan Application')
    setStaffCount(1)
    setAdoptionRate(0.25)
    setPctRedirected(0.15)
    handleRunSimulation()
  }

  return (
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>What-If Scenario Sandbox</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                Operational Intervention Simulator
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Model staff reassignments, digital diversion, and queue redirection without mutating live branch rosters
              </p>
            </div>

            <div className="flex items-center gap-2 bg-[#0e1117] border border-slate-700 rounded-lg px-3 py-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id} className="bg-[#161a22]">
                    {b.branch_name} ({b.branch_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Controls and Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scenario Controls */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Configure Scenario</span>
            </h2>

            {/* Scenario Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Intervention Type</label>
              <div className="space-y-2">
                {[
                  { id: 'STAFF_REASSIGNMENT', label: 'Cross-Skilled Staff Reassignment', desc: 'Move idle or low-utilization staff to peak bottleneck' },
                  { id: 'DIGITAL_DIVERSION', label: 'Digital Diversion & Kiosk Routing', desc: 'Divert eligible transactions to self-service app/kiosk' },
                  { id: 'CUSTOMER_REDIRECTION', label: 'Network Customer Redirection', desc: 'Direct walk-in arrivals to nearby low-wait branches' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`block p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                      actionType === s.id
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-[#0e1117] border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="scenario"
                      value={s.id}
                      checked={actionType === s.id}
                      onChange={(e) => setActionType(e.target.value)}
                      className="sr-only"
                    />
                    <div className="font-bold text-slate-200">{s.label}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{s.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Controls based on selected Scenario */}
            {actionType === 'STAFF_REASSIGNMENT' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Donor Service (From)</label>
                  <select
                    value={fromService}
                    onChange={(e) => setFromService(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1117] border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Cash Withdrawal">Cash Withdrawal (Low Util)</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Cheque Services">Cheque Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Service (To)</label>
                  <select
                    value={toService}
                    onChange={(e) => setToService(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1117] border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Loan Application">Loan Application (High Workload)</option>
                    <option value="Account Opening">Account Opening</option>
                    <option value="KYC Update">KYC Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Staff Members to Reassign: <strong className="text-white font-mono">{staffCount}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {actionType === 'DIGITAL_DIVERSION' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Digital Adoption Rate: <strong className="text-white font-mono">{Math.round(adoptionRate * 100)}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.05"
                    value={adoptionRate}
                    onChange={(e) => setAdoptionRate(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500">Targeting Statement Requests & KYC updates</span>
                </div>
              </div>
            )}

            {actionType === 'CUSTOMER_REDIRECTION' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Branch</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0e1117] border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    {branches
                      .filter((b) => b.branch_id !== branchId)
                      .map((b) => (
                        <option key={b.branch_id} value={b.branch_id}>
                          {b.branch_name} ({b.city})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Walk-ins to Redirect: <strong className="text-white font-mono">{Math.round(pctRedirected * 100)}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.05"
                    value={pctRedirected}
                    onChange={(e) => setPctRedirected(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right Column: BEFORE vs AFTER Results (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            {simulationResult ? (
              <>
                {/* Impact Highlight Banner */}
                <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <span>Projected Operational Impact</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {simulationResult.action_description}
                  </h3>
                  <p className="text-xs text-emerald-300 mt-1">
                    {simulationResult.impact.estimated_operational_improvement}
                  </p>
                </div>

                {/* BEFORE vs AFTER Metrics Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* BEFORE Card */}
                  <div className="bg-[#161a22] border border-slate-700 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Baseline</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">BEFORE</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Avg Waiting Time:</span>
                        <span className="font-mono font-semibold text-white">
                          {simulationResult.before.avg_wait_minutes.toFixed(1)} min
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-semibold text-amber-400">
                          {simulationResult.before.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-semibold text-white">
                          {simulationResult.before.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-semibold text-rose-400">
                          {simulationResult.before.capacity_gap_minutes > 0 ? `+${simulationResult.before.capacity_gap_minutes}m` : `${simulationResult.before.capacity_gap_minutes}m`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Total Workload:</span>
                        <span className="font-mono text-slate-300">
                          {simulationResult.before.workload_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AFTER Card */}
                  <div className="bg-[#161a22] border border-emerald-500/40 rounded-xl p-5 space-y-3 shadow-lg shadow-emerald-950/20">
                    <div className="flex items-center justify-between border-b border-emerald-500/30 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulated Outcome</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        AFTER
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Avg Waiting Time:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-400">
                          <span>{simulationResult.after.avg_wait_minutes.toFixed(1)} min</span>
                          {simulationResult.impact.wait_time_reduction_minutes > 0 && (
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-1 rounded">
                              -{simulationResult.impact.wait_time_reduction_minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {simulationResult.after.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          {simulationResult.after.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-semibold text-emerald-300">
                          {simulationResult.after.capacity_gap_minutes > 0 ? `+${simulationResult.after.capacity_gap_minutes}m` : `${simulationResult.after.capacity_gap_minutes}m`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Total Workload:</span>
                        <span className="font-mono text-slate-300">
                          {simulationResult.after.workload_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Integrity Badge */}
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                  <span>Scenario ID: <strong className="font-mono text-slate-400">{simulationResult.scenario_id}</strong></span>
                  <span className="italic">Grounded queue calculation • Zero historical mutation</span>
                </div>
              </>
            ) : (
              <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-12 text-center text-slate-400 text-xs">
                Select scenario parameters on the left and click "Run Simulation".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
