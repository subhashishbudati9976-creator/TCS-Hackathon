import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Users,
  Clock,
  AlertTriangle,
  Activity,
  ThumbsUp,
  TrendingUp,
  Sliders,
  CheckCircle2,
  ChevronRight,
  Info,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts'
import * as api from '../../api'
import type {
  BranchListItem,
  BranchSummary,
  BranchCapacity,
  DemandForecastResponse,
  ServiceBottleneck,
  OperationalRecommendation,
  FeedbackNLPResult,
} from '../../types'

export const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate()

  // State
  const [branches, setBranches] = useState<BranchListItem[]>([])
  const [selectedBranchId, setSelectedBranchId] = useState<string>('BR001')
  const [horizonHours, setHorizonHours] = useState<number>(8)

  // Operational Data
  const [summary, setSummary] = useState<BranchSummary | null>(null)
  const [capacity, setCapacity] = useState<BranchCapacity | null>(null)
  const [forecast, setForecast] = useState<DemandForecastResponse | null>(null)
  const [bottlenecks, setBottlenecks] = useState<ServiceBottleneck[]>([])
  const [recommendations, setRecommendations] = useState<OperationalRecommendation[]>([])
  const [feedback, setFeedback] = useState<FeedbackNLPResult | null>(null)

  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 1. Initial branches load
  useEffect(() => {
    async function loadBranches() {
      try {
        const list = await api.getBranches()
        setBranches(list)
        if (list.length > 0 && !selectedBranchId) {
          setSelectedBranchId(list[0].branch_id)
        }
      } catch (err: any) {
        setError('Failed to connect to backend branch service.')
      }
    }
    loadBranches()
  }, [])

  // 2. Load branch operational intelligence
  useEffect(() => {
    if (!selectedBranchId) return

    async function loadBranchData() {
      setIsLoading(true)
      setError(null)
      try {
        const [sumRes, capRes, fcRes, bnRes, recRes, fbRes] = await Promise.all([
          api.getBranchSummary(selectedBranchId),
          api.getBranchCapacity(selectedBranchId),
          api.getBranchForecast(selectedBranchId, horizonHours),
          api.getBranchBottlenecks(selectedBranchId),
          api.getBranchRecommendations(selectedBranchId),
          api.getFeedbackNLP(selectedBranchId),
        ])
        setSummary(sumRes)
        setCapacity(capRes)
        setForecast(fcRes)
        setBottlenecks(bnRes)
        setRecommendations(recRes)
        setFeedback(fbRes)
      } catch (err: any) {
        setError(err?.message || 'Error fetching branch operational data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadBranchData()
  }, [selectedBranchId, horizonHours])

  const selectedBranch = branches.find((b) => b.branch_id === selectedBranchId)
  const loadScore = capacity?.branch_load_score?.overall_load_score ?? 45.0
  const riskLevel = capacity?.branch_load_score?.risk_level ?? 'Moderate'
  const peakDemand = forecast?.peak_demand ?? 38
  const avgWait = summary?.metrics?.avg_waiting_time_minutes ?? 14.2
  const activeStaff = summary?.metrics?.active_staff ?? 8
  const totalStaff = summary?.metrics?.total_staff ?? 10
  const satisfactionRate = feedback?.sentiment_percentages?.Positive ?? 92.5

  const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'CRITICAL' || b.severity === 'HIGH')

  // Top services by workload minutes
  const serviceChartData = (capacity?.service_capacity_breakdown ?? [])
    .slice(0, 6)
    .map((s) => ({
      name: s.service_type.length > 15 ? s.service_type.substring(0, 15) + '...' : s.service_type,
      workload: Math.round(s.workload_minutes),
      utilization: Math.round(s.utilization_rate * 100),
    }))

  const handleSimulateClick = (rec: OperationalRecommendation) => {
    navigate('/manager/simulation', {
      state: {
        branchId: selectedBranchId,
        actionType: rec.action_type,
        params: rec.simulation_params || {},
      },
    })
  }

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Top Control Bar: Branch Selector & Live Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 avenue-glass rounded-2xl p-5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono">
              <span className="relative flex h-2 w-2">
                <span className="status-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
              </span>
              <span>AVENUE • Problem Statement 5 Command Cockpit</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              {selectedBranch?.branch_name ?? 'Branch Operations Dashboard'}
            </h1>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2 font-mono">
              <span>{selectedBranch?.city} • {selectedBranch?.area ?? 'Regional Branch'}</span>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-400 font-semibold">ID: {selectedBranchId}</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400">Queue AI Live</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3 py-2 shadow-inner">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id} className="bg-slate-900 text-slate-200">
                    {b.branch_code ?? b.branch_id} — {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Horizon Selector */}
            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHorizonHours(4)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  horizonHours === 4 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Hours
              </button>
              <button
                type="button"
                onClick={() => setHorizonHours(8)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  horizonHours === 8 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/20' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8 Hours
              </button>
            </div>

            <button
              onClick={() => navigate(`/manager/branches/${selectedBranchId}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
            >
              <span>Full Intelligence</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline font-semibold ml-4">Retry</button>
          </div>
        )}

        {/* Operational KPI Grid (Elevated Executive Styling) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Branch Load Score */}
          <div className="kpi-card blue">
            <div className="kpi-label">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Branch Load</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{loadScore.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-mono">/100</span>
            </div>
            <div className="mt-2">
              <span
                className={`badge ${
                  riskLevel === 'Severe'
                    ? 'badge-severe'
                    : riskLevel === 'Elevated'
                    ? 'badge-elevated'
                    : 'badge-normal'
                }`}
              >
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Card 2: Peak Demand Forecast */}
          <div className="kpi-card amber">
            <div className="kpi-label">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Peak Demand</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{peakDemand}</span>
              <span className="text-xs text-slate-400 font-mono">cust/h</span>
            </div>
            <p className="text-[11px] text-amber-400/90 mt-2 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>ML Predictive</span>
            </p>
          </div>

          {/* Card 3: Estimated Wait Time */}
          <div className="kpi-card cyan">
            <div className="kpi-label">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Avg Wait Time</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{avgWait.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">min</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              P90: <span className="font-mono text-cyan-300 font-semibold">{summary?.metrics?.p90_waiting_time_minutes?.toFixed(1) ?? '22.0'}m</span>
            </p>
          </div>

          {/* Card 4: Active Bottlenecks */}
          <div className="kpi-card rose">
            <div className="kpi-label">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Bottlenecks</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{criticalBottlenecks.length}</span>
              <span className="text-xs text-slate-400 font-mono">critical</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              {bottlenecks.length} services tracked
            </p>
          </div>

          {/* Card 5: Staff Utilization */}
          <div className="kpi-card purple">
            <div className="kpi-label">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              <span>Staff on Shift</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{activeStaff}</span>
              <span className="text-xs text-slate-400 font-mono">/{totalStaff}</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Counters: <span className="font-mono text-purple-300 font-semibold">{summary?.load_assessment?.active_counters ?? 5} active</span>
            </p>
          </div>

          {/* Card 6: Customer Satisfaction */}
          <div className="kpi-card emerald">
            <div className="kpi-label">
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Satisfaction</span>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="kpi-value">{satisfactionRate.toFixed(1)}%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2">
              Rating: <span className="font-mono text-emerald-300 font-semibold">{feedback?.average_rating?.toFixed(1) ?? '4.5'}/5.0</span>
            </p>
          </div>
        </div>

        {/* Section: Forecast & Service Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Demand Forecast Chart (2 Columns) */}
          <div className="lg:col-span-2 avenue-glass rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                  <span>AI Predictive Demand Forecast ({horizonHours}h Horizon)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Machine learning model projecting footfall arrival velocity by operating hour
                </p>
              </div>

              {forecast?.metrics && (
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300 font-mono bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-700/80">
                  <span>R²: <strong className="text-cyan-400">{forecast.metrics.R2.toFixed(3)}</strong></span>
                  <span className="text-slate-600">|</span>
                  <span>MAE: <strong className="text-slate-200">{forecast.metrics.MAE.toFixed(2)}</strong></span>
                </div>
              )}
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={forecast?.forecast ?? []}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="forecastAvenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ 
                      backgroundColor: 'rgba(11, 18, 33, 0.95)', 
                      borderColor: 'rgba(6, 182, 212, 0.4)', 
                      borderRadius: '12px', 
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.8)'
                    }}
                    labelFormatter={(h) => `Operating Hour: ${h}:00 - ${Number(h) + 1}:00`}
                    formatter={(val: any) => [`${val} arrivals`, 'Projected Volume']}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#forecastAvenueGrad)"
                    dot={{ fill: '#06b6d4', r: 3 }}
                    activeDot={{ r: 6, fill: '#38bdf8', stroke: '#fff', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
              <span className="flex items-center gap-1.5 font-mono text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Feature Pipeline: Temporal Lag + Day-of-Week + Transaction Volatility</span>
              </span>
              <span>Projected Period Arrivals: <strong className="text-white font-mono">{forecast?.total_predicted_demand ?? 0} customers</strong></span>
            </div>
          </div>

          {/* Service Workload Breakdown (1 Column) */}
          <div className="avenue-glass rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Service Duration & Workload</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Total staff operational minutes required</p>

              <div className="h-60 mt-3 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(51, 65, 85, 0.4)" horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#cbd5e1" fontSize={10} width={90} tickLine={false} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: 'rgba(11, 18, 33, 0.95)', 
                        borderColor: 'rgba(99, 102, 241, 0.4)', 
                        borderRadius: '10px', 
                        fontSize: '11px' 
                      }}
                      formatter={(val: any) => [`${val} min`, 'Total Workload']}
                    />
                    <Bar dataKey="workload" radius={[0, 6, 6, 0]}>
                      {serviceChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.utilization > 80 ? '#f59e0b' : '#3b82f6'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-300">Peak Load Services</span>
              <span className="text-amber-400 font-mono font-semibold">Account & Loan Verification</span>
            </div>
          </div>
        </div>

        {/* Section: Live Operational Bottlenecks Panel */}
        <div className="avenue-glass rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Live Operational Bottleneck Detection</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Service-level capacity pressure identifying staff skill bottlenecks and surge timings
              </p>
            </div>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-full">
              {bottlenecks.length} Categories Monitored
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Service Category</th>
                  <th>Time Window</th>
                  <th>Severity</th>
                  <th className="text-right">Demand</th>
                  <th className="text-right">Capacity</th>
                  <th className="text-right">Utilization</th>
                  <th className="text-right">Est. Wait</th>
                  <th>Primary Root Cause</th>
                </tr>
              </thead>
              <tbody>
                {bottlenecks.slice(0, 6).map((b) => (
                  <tr key={b.service} className="hover:bg-slate-800/50 transition-colors">
                    <td>
                      <span className="font-bold text-white">{b.service}</span>
                      <span className="block text-[10px] text-slate-400 font-normal">
                        Skill: {b.required_skill} ({b.assigned_staff} assigned)
                      </span>
                    </td>
                    <td className="font-mono text-[11px] text-slate-300">{b.time}</td>
                    <td>
                      <span
                        className={`badge ${
                          b.severity === 'CRITICAL'
                            ? 'badge-critical'
                            : b.severity === 'HIGH'
                            ? 'badge-high'
                            : b.severity === 'MODERATE'
                            ? 'badge-moderate'
                            : 'badge-normal'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="text-right font-mono font-semibold">{b.predicted_demand}</td>
                    <td className="text-right font-mono">{b.capacity}</td>
                    <td className="text-right font-mono font-bold text-white">
                      {(b.utilization * 100).toFixed(0)}%
                    </td>
                    <td className="text-right font-mono text-cyan-300 font-bold">
                      {b.estimated_wait_minutes.toFixed(1)}m
                    </td>
                    <td className="text-xs text-slate-300">
                      {b.root_causes[0] ?? 'Demand within regular thresholds'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Operational Recommendations with Live Simulate Button */}
        <div className="avenue-glass rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>AI Operational Recommendations & Prescription Engine</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Prescriptive interventions: Cross-skilling staff, digital kiosk diversion, and network rebalancing
              </p>
            </div>
            <button
              onClick={() => navigate('/manager/simulation', { state: { branchId: selectedBranchId } })}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Launch What-If Sandbox</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`badge ${
                        rec.priority === 'HIGH'
                          ? 'badge-critical'
                          : rec.priority === 'MEDIUM'
                          ? 'badge-moderate'
                          : 'badge-normal'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{rec.type.replace('_', ' ')}</span>
                  </div>

                  <h3 className="text-xs font-extrabold text-white">{rec.action}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rec.reason}</p>

                  <div className="mt-3 p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-slate-300">
                    <strong className="text-cyan-400">Expected Outcome:</strong> {rec.expected_operational_effect}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: <strong className="text-slate-200">{rec.affected_service}</strong>
                  </span>

                  {rec.simulatable ? (
                    <button
                      type="button"
                      onClick={() => handleSimulateClick(rec)}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20 cursor-pointer"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Simulate Impact</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-500 italic">Automated Action</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
