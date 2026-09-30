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
  Cpu,
  GitBranch,
  Network,
  Flame,
  CheckCircle2,
  Smartphone,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Activity,
  Workflow,
  Zap,
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
  const [adoptionRate, setAdoptionRate] = useState<number>(navState.params?.adoption_rate || 0.40)
  const [targetBranch, setTargetBranch] = useState<string>(navState.params?.target_branch || 'BR002')
  const [pctRedirected, setPctRedirected] = useState<number>(navState.params?.pct_redirected || 0.20)

  // Active view tab for visualization
  const [activeVizTab, setActiveVizTab] = useState<'DAG' | 'HEATMAP' | 'SANKEY'>('DAG')

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

  // Quick Preset Scenarios requested for the Hackathon Digital Twin
  const handlePresetSelect = (preset: 'MEDICAL_LEAVE' | 'KIOSK_DEFLECT' | 'LUNCH_SURGE') => {
    if (preset === 'MEDICAL_LEAVE') {
      setActionType('STAFF_REASSIGNMENT')
      setFromService('Cash Withdrawal')
      setToService('Loan Application')
      setStaffCount(2)
    } else if (preset === 'KIOSK_DEFLECT') {
      setActionType('DIGITAL_DIVERSION')
      setAdoptionRate(0.40)
    } else if (preset === 'LUNCH_SURGE') {
      setActionType('CUSTOMER_REDIRECTION')
      setTargetBranch('BR002')
      setPctRedirected(0.25)
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
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Header: Branch Digital Twin & What-If Simulator */}
        <div className="avenue-glass rounded-2xl p-6 shadow-2xl border border-cyan-500/25">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase font-mono">
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Branch Digital Twin • Virtual Replica Engine</span>
                <span className="text-slate-600">|</span>
                <span className="text-indigo-400">TCS PS-5 What-If Simulator</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
                Branch Digital Twin & What-If Scenario Simulator
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
                A high-fidelity virtual replica of physical branch queue operations. Simulate staff sickness, surge footfalls, and digital kiosk deflections virtually before committing changes in the live branch.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-inner">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <select
                  value={branchId}
                  onChange={(e) => setBranchId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
                >
                  {branches.map((b) => (
                    <option key={b.branch_id} value={b.branch_id} className="bg-slate-900 text-slate-200">
                      {b.branch_name} ({b.branch_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Quick Preset Questions Bar (Direct Hackathon Evaluation Scenarios) */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <span className="text-xs font-bold text-cyan-400 uppercase font-mono flex items-center gap-1.5 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-Click "What-If" Scenarios:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 flex-1 md:ml-4">
              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('MEDICAL_LEAVE')
                  handleRunSimulation()
                }}
                className="p-2.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-purple-300 group-hover:text-purple-200 flex items-center justify-between">
                  <span>What if 2 tellers take medical leave?</span>
                  <ArrowUpRight className="w-3 h-3 text-purple-400" />
                </div>
                <div className="text-[10px] text-slate-400">Rebalance idle counter staff to loans</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('KIOSK_DEFLECT')
                  handleRunSimulation()
                }}
                className="p-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center justify-between">
                  <span>What if we deflect 40% to kiosks?</span>
                  <ArrowUpRight className="w-3 h-3 text-cyan-400" />
                </div>
                <div className="text-[10px] text-slate-400">Fast-track routine deposits & statements</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  handlePresetSelect('LUNCH_SURGE')
                  handleRunSimulation()
                }}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 text-left transition-all group cursor-pointer"
              >
                <div className="text-[11px] font-bold text-amber-300 group-hover:text-amber-200 flex items-center justify-between">
                  <span>What if footfall surges +50% at lunch?</span>
                  <ArrowUpRight className="w-3 h-3 text-amber-400" />
                </div>
                <div className="text-[10px] text-slate-400">Redirect overflow to North branch</div>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Section: Queue Flow Graph / Directed Acyclic Graph (DAG) & Hotspot Heatmap */}
        <div className="avenue-glass rounded-2xl p-5 shadow-2xl border border-slate-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-bold text-white tracking-wide">
                  Virtual Queue Topology: DAG & Congestion Hotspots
                </h2>
                <span className="badge badge-normal font-mono text-[9px]">Live Twin Map</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Visualizing physical customer journey transitions, digital deflection bypass, and active counter bottlenecks
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveVizTab('DAG')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  activeVizTab === 'DAG' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Queue Flow (DAG)
              </button>
              <button
                type="button"
                onClick={() => setActiveVizTab('HEATMAP')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  activeVizTab === 'HEATMAP' 
                    ? 'bg-gradient-to-r from-rose-600 to-amber-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Hotspot Heatmap
              </button>
              <button
                type="button"
                onClick={() => setActiveVizTab('SANKEY')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  activeVizTab === 'SANKEY' 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Journey Flow Ratio
              </button>
            </div>
          </div>

          {/* Interactive Flow Visualizer Canvas */}
          {activeVizTab === 'DAG' && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 relative overflow-hidden">
              <div className="cyber-grid absolute inset-0 opacity-20 pointer-events-none" />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                {/* Stage 1: Entrance */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/40 shadow-lg shadow-cyan-500/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-cyan-400 font-bold">NODE 01</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                        100% Influx
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-white">Branch Entrance & Token Kiosk</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Arrival timestamping & biometric queue token allocation.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex justify-between font-mono">
                    <span>Flow:</span>
                    <strong className="text-cyan-400">42 cust/hour</strong>
                  </div>
                </div>

                {/* Stage 2: Smart Triage & Digital Bypass */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-500/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-emerald-400 font-bold">NODE 02</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Digital Bypass
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-white">Self-Service & Mobile App</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Deflected 38% routine cash deposits & passbook updates.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex justify-between font-mono">
                    <span>Wait Reduction:</span>
                    <strong className="text-emerald-400">-100% Queue</strong>
                  </div>
                </div>

                {/* Stage 3: Physical Service Desks */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-amber-400 font-bold">NODE 03</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300">
                        Hotspot Active
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-white">Teller & Loan Counters</h3>
                    <p className="text-[11px] text-slate-400 mt-1">High-touch documentation, complex KYC, and commercial loans.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex justify-between font-mono">
                    <span>Peak Utilization:</span>
                    <strong className="text-rose-400">92% Capacity</strong>
                  </div>
                </div>

                {/* Stage 4: Exit & Feedback */}
                <div className="p-4 rounded-xl bg-slate-900/90 border border-indigo-500/40 shadow-lg shadow-indigo-500/5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-indigo-400 font-bold">NODE 04</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        Exit Gate
                      </span>
                    </div>
                    <h3 className="text-xs font-extrabold text-white">Resolution & Satisfaction</h3>
                    <p className="text-[11px] text-slate-400 mt-1">Digital receipt sent, CSAT recorded, and SLA marked complete.</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex justify-between font-mono">
                    <span>SLA Adherence:</span>
                    <strong className="text-indigo-400">98.4% Goal</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeVizTab === 'HEATMAP' && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/50 shadow-lg shadow-rose-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
                      CRITICAL HOTSPOT
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                      24.8m Wait
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Loan & Credit Verification Desk</h4>
                  <p className="text-xs text-slate-300 mt-1">Documentation processing queue exceeds safe SLA thresholds.</p>
                  <div className="mt-3 text-[11px] text-rose-300 font-mono">
                    ● Staff Deficiency: Needs +1 Counter
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/50 shadow-lg shadow-amber-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      ELEVATED LOAD
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      12.4m Wait
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Account Opening & KYC Tiers</h4>
                  <p className="text-xs text-slate-300 mt-1">High midday arrival volume from walk-in retail clients.</p>
                  <div className="mt-3 text-[11px] text-amber-300 font-mono">
                    ● Status: Within peak buffer range
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 shadow-lg shadow-emerald-950/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      NORMAL CLEARANCE
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      3.2m Wait
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white">Cash Withdrawal & Deposits</h4>
                  <p className="text-xs text-slate-300 mt-1">Swift turnarounds with surplus teller capacity available to donor.</p>
                  <div className="mt-3 text-[11px] text-emerald-300 font-mono">
                    ● Donor Candidate for cross-skill reassign
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeVizTab === 'SANKEY' && (
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Physical Branch Counter Queues (Traditional Walk-in)</span>
                    <span className="text-amber-400 font-mono">62% Total Traffic</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full" style={{ width: '62%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Self-Service Kiosk Deflection (Zero Wait Bypass)</span>
                    <span className="text-cyan-400 font-mono">24% Total Traffic</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-300">Cross-Branch Network Redirection (Nearby Low-Wait Branch)</span>
                    <span className="text-indigo-400 font-mono">14% Total Traffic</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" style={{ width: '14%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                <span>Total Net Deflection to Zero-Wait Channels:</span>
                <strong className="text-emerald-400 font-bold">38% Of Overall Branch Congestion Diverted</strong>
              </div>
            </div>
          )}
        </div>

        {/* Controls and Results Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Scenario Controls */}
          <div className="avenue-glass rounded-2xl p-5 shadow-xl space-y-5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Digital Twin Parameters</span>
            </h2>

            {/* Scenario Type Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Intervention Mechanism</label>
              <div className="space-y-2">
                {[
                  { id: 'STAFF_REASSIGNMENT', label: 'Cross-Skilled Staff Reassignment', desc: 'Move idle or low-utilization staff to peak bottleneck' },
                  { id: 'DIGITAL_DIVERSION', label: 'Digital Diversion & Kiosk Routing', desc: 'Divert eligible transactions to self-service app/kiosk' },
                  { id: 'CUSTOMER_REDIRECTION', label: 'Network Customer Redirection', desc: 'Direct walk-in arrivals to nearby low-wait branches' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`block p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      actionType === s.id
                        ? 'bg-gradient-to-r from-cyan-950/50 to-indigo-950/50 border-cyan-500/50 text-cyan-300 shadow-sm'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-700'
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
                    <div className="font-extrabold text-slate-200">{s.label}</div>
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
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Cash Withdrawal">Cash Withdrawal (Surplus Capacity)</option>
                    <option value="Cash Deposit">Cash Deposit</option>
                    <option value="Cheque Services">Cheque Services</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Service (To)</label>
                  <select
                    value={toService}
                    onChange={(e) => setToService(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="Loan Application">Loan Application (Peak Bottleneck)</option>
                    <option value="Account Opening">Account Opening</option>
                    <option value="KYC Update">KYC Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Staff Members to Reassign: <strong className="text-cyan-400 font-mono">{staffCount}</strong>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="1"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {actionType === 'DIGITAL_DIVERSION' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Digital Adoption Rate: <strong className="text-cyan-400 font-mono">{Math.round(adoptionRate * 100)}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="0.6"
                    step="0.05"
                    value={adoptionRate}
                    onChange={(e) => setAdoptionRate(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <span className="text-[11px] text-slate-500">Diverts Statement Requests & Routine KYC to mobile</span>
                </div>
              </div>
            )}

            {actionType === 'CUSTOMER_REDIRECTION' && (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Target Overflow Branch</label>
                  <select
                    value={targetBranch}
                    onChange={(e) => setTargetBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none"
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
                    Walk-ins to Redirect: <strong className="text-cyan-400 font-mono">{Math.round(pctRedirected * 100)}%</strong>
                  </label>
                  <input
                    type="range"
                    min="0.05"
                    max="0.30"
                    step="0.05"
                    value={pctRedirected}
                    onChange={(e) => setPctRedirected(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
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
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-cyan-600/25 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isSimulating ? 'Simulating...' : 'Run Simulation'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 cursor-pointer"
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
                <div className="bg-gradient-to-r from-cyan-950/60 via-slate-900 to-indigo-950/60 border border-cyan-500/40 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 font-mono">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Projected Digital Twin Impact</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white mt-1">
                    {simulationResult.action_description}
                  </h3>
                  <p className="text-xs text-cyan-200 mt-1 font-medium">
                    {simulationResult.impact.estimated_operational_improvement}
                  </p>
                </div>

                {/* BEFORE vs AFTER Metrics Comparison Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* BEFORE Card */}
                  <div className="avenue-glass rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Current Baseline</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold">BEFORE</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Avg Waiting Time:</span>
                        <span className="font-mono font-bold text-white">
                          {simulationResult.before.avg_wait_minutes.toFixed(1)} min
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-bold text-amber-400">
                          {simulationResult.before.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-bold text-white">
                          {simulationResult.before.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-bold text-rose-400">
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
                  <div className="avenue-glass border border-cyan-500/50 rounded-2xl p-5 space-y-3 shadow-xl shadow-cyan-950/30">
                    <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">Digital Twin Simulated</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                        AFTER
                      </span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Avg Waiting Time:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-cyan-300">
                          <span>{simulationResult.after.avg_wait_minutes.toFixed(1)} min</span>
                          {simulationResult.impact.wait_time_reduction_minutes > 0 && (
                            <span className="text-[10px] text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                              -{simulationResult.impact.wait_time_reduction_minutes}m
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Utilization Rate:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {simulationResult.after.utilization_pct.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Branch Load Score:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {simulationResult.after.branch_load_score.toFixed(0)}/100
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800">
                        <span className="text-slate-400">Capacity Gap:</span>
                        <span className="font-mono font-bold text-cyan-300">
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
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span>Scenario ID: <strong className="text-cyan-400">{simulationResult.scenario_id}</strong></span>
                  <span className="text-emerald-400 font-semibold">● Grounded Deterministic Simulation • Zero Production Risk</span>
                </div>
              </>
            ) : (
              <div className="avenue-glass rounded-2xl p-12 text-center text-slate-400 text-xs">
                Select scenario parameters or click a preset "What-If" question above to run simulation.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
