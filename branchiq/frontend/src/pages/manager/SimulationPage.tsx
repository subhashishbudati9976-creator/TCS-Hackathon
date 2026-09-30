import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import {
  SlidersHorizontal,
  Play,
  RotateCcw,
  TrendingDown,
  ArrowRight,
  ShieldAlert,
  Building2,
  Clock,
  Layers,
  Sparkles,
  CheckCircle2,
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
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Operational Decision-Support System</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
                What-If Scenario Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Model staff reassignments, digital diversion, and queue redirection without mutating live branch rosters
              </p>
            </div>

            <div className="flex items-center gap-2.5 bg-[#090d16] border border-[#1e293b] rounded-lg px-3.5 py-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id} className="bg-[#0f172a] text-slate-200">
                    {b.branch_name} ({b.branch_id})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* 12-Column Layout: 4-col Scenario Config + 8-col Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-7">
          {/* Left Column: Scenario Controls (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Configure Intervention</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Select strategy and tune parameters</p>
            </div>

            {/* Scenario Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                Intervention Strategy
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    id: 'STAFF_REASSIGNMENT',
                    label: 'Cross-Skilled Staff Reassignment',
                    desc: 'Reallocate idle counters to peak bottleneck services',
                  },
                  {
                    id: 'DIGITAL_DIVERSION',
                    label: 'Digital Diversion & Kiosk Routing',
                    desc: 'Divert eligible transactions to self-service app or ATM',
                  },
                  {
                    id: 'CUSTOMER_REDIRECTION',
                    label: 'Network Customer Redirection',
                    desc: 'Route walk-in arrivals to nearby low-wait branches',
                  },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`block p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                      actionType === s.id
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-[#090d16] border-[#1e293b] text-slate-400 hover:border-slate-700'
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
                    <div className="font-semibold text-white text-xs sm:text-sm">{s.label}</div>
                    <div className="text-[11px] text-slate-400 mt-1">{s.desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Dynamic Controls based on selected Scenario */}
            {actionType === 'STAFF_REASSIGNMENT' && (
              <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Donor Service (From)</label>
                  <select
                    value={fromService}
                    onChange={(e) => setFromService(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Cash Withdrawal">Cash Withdrawal (Low Util)</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Cheque Services">Cheque Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Service (To)</label>
                  <select
                    value={toService}
                    onChange={(e) => setToService(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="Loan Application">Loan Application (High Workload)</option>
                    <option value="Account Opening">Account Opening</option>
                    <option value="KYC Update">KYC Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>1 Member</span>
                    <span>2 Members</span>
                    <span>3 Members</span>
                  </div>
                </div>
              </div>
            )}

            {actionType === 'DIGITAL_DIVERSION' && (
              <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Digital Adoption Target: <strong className="text-white font-mono">{Math.round(adoptionRate * 100)}%</strong>
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
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>10%</span>
                    <span>35%</span>
                    <span>60%</span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2 block">
                    Directs Statement Requests &amp; KYC routine updates to mobile app
                  </span>
                </div>
              </div>
            )}

            {actionType === 'CUSTOMER_REDIRECTION' && (
              <div className="space-y-4 pt-4 border-t border-[#1e293b]">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Alternative Branch</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 focus:outline-none"
                  >
                    {branches
                      .filter((b) => b.branch_id !== branchId)
                      .map((b) => (
                        <option key={b.branch_id} value={b.branch_id} className="bg-[#0f172a]">
                          {b.branch_name} ({b.city})
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Walk-ins to Divert: <strong className="text-white font-mono">{Math.round(pctRedirected * 100)}%</strong>
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
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                    <span>5%</span>
                    <span>15%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#1e293b]">
              <button
                type="button"
                onClick={handleRunSimulation}
                disabled={isSimulating}
                className="flex-1 py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Simulating...' : 'Run What-If Simulation'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Right Column: BEFORE vs AFTER Results (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {simulationResult ? (
              <>
                {/* Impact Highlight Banner */}
                <div className="bg-[#0f172a] border border-emerald-500/25 rounded-xl p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Projected Operational Impact</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mt-1.5">
                    {simulationResult.action_description}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {simulationResult.impact.estimated_operational_improvement}
                  </p>
                </div>

                {/* BEFORE vs AFTER Metrics Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* BEFORE Card */}
                  <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-[#1e293b] pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Baseline</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">BEFORE</span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Avg Customer Wait:</span>
                        <span className="font-mono font-semibold text-white">
                          {simulationResult.before.avg_wait_minutes.toFixed(1)} min
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-semibold text-amber-400">
                          {simulationResult.before.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-semibold text-white">
                          {simulationResult.before.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-semibold text-rose-400">
                          {simulationResult.before.capacity_gap_minutes > 0 ? `+${simulationResult.before.capacity_gap_minutes}m` : `${simulationResult.before.capacity_gap_minutes}m`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Total Workload:</span>
                        <span className="font-mono text-slate-300">
                          {simulationResult.before.workload_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AFTER Card */}
                  <div className="bg-[#0f172a] border border-emerald-500/30 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-500/25 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Simulated Outcome</span>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 font-semibold">
                        AFTER
                      </span>
                    </div>

                    <div className="space-y-3 text-xs sm:text-sm">
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Avg Customer Wait:</span>
                        <div className="flex items-center gap-2 font-mono font-bold text-emerald-400">
                          <span>{simulationResult.after.avg_wait_minutes.toFixed(1)} min</span>
                          {simulationResult.impact.wait_time_reduction_minutes > 0 && (
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded font-mono">
                              -{simulationResult.impact.wait_time_reduction_minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {simulationResult.after.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          {simulationResult.after.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#1e293b]">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-semibold text-emerald-300">
                          {simulationResult.after.capacity_gap_minutes > 0 ? `+${simulationResult.after.capacity_gap_minutes}m` : `${simulationResult.after.capacity_gap_minutes}m`}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5">
                        <span className="text-slate-400">Total Workload:</span>
                        <span className="font-mono text-slate-300">
                          {simulationResult.after.workload_minutes} min
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mathematical Integrity Badge */}
                <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-lg text-xs text-slate-400 flex items-center justify-between">
                  <span>Scenario ID: <strong className="font-mono text-slate-300">{simulationResult.scenario_id}</strong></span>
                  <span className="text-slate-500">Grounded queue calculation &bull; Zero historical mutation</span>
                </div>
              </>
            ) : (
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-12 text-center text-slate-400 text-xs">
                Select scenario parameters on the left and click "Run What-If Simulation".
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SimulationPage
