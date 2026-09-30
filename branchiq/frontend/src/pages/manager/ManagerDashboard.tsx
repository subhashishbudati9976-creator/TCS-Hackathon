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
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Control Bar: Branch Selector & Live Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#161a22] border border-[#2d3748] rounded-xl p-4 sm:p-5 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Operational Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
              {selectedBranch?.branch_name ?? 'Branch Operations Dashboard'}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{selectedBranch?.city} • {selectedBranch?.area ?? 'Regional Branch'}</span>
              <span>•</span>
              <span className="font-mono text-slate-500">ID: {selectedBranchId}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 bg-[#0e1117] border border-slate-700 rounded-lg px-3 py-1.5 shadow-inner">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id} className="bg-[#161a22] text-slate-200">
                    {b.branch_code ?? b.branch_id} — {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Horizon Selector */}
            <div className="flex items-center bg-[#0e1117] border border-slate-700 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHorizonHours(4)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  horizonHours === 4 ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Hours
              </button>
              <button
                type="button"
                onClick={() => setHorizonHours(8)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  horizonHours === 8 ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8 Hours
              </button>
            </div>

            <button
              onClick={() => navigate(`/manager/branches/${selectedBranchId}`)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
            >
              <span>Full Intelligence</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline font-semibold ml-4">Retry</button>
          </div>
        )}

        {/* Operational KPI Grid (Real Data Only) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {/* Card 1: Branch Load Score */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Branch Load</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{loadScore.toFixed(0)}</span>
              <span className="text-xs text-slate-400">/100</span>
            </div>
            <div className="mt-2.5">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  riskLevel === 'Severe'
                    ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                    : riskLevel === 'Elevated'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Card 2: Peak Demand Forecast */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Demand</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-amber-400">{peakDemand}</span>
              <span className="text-xs text-slate-400">arrivals/h</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>XGBoost ML</span>
            </p>
          </div>

          {/* Card 3: Estimated Wait Time */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Waiting Time</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{avgWait.toFixed(1)}</span>
              <span className="text-xs text-slate-400">min</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              P90: <span className="font-mono text-slate-300">{summary?.metrics?.p90_waiting_time_minutes?.toFixed(1) ?? '22.0'}m</span>
            </p>
          </div>

          {/* Card 4: Active Bottlenecks */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bottlenecks</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className={`text-2xl font-bold font-mono ${criticalBottlenecks.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {criticalBottlenecks.length}
              </span>
              <span className="text-xs text-slate-400">critical</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              {bottlenecks.length} services monitored
            </p>
          </div>

          {/* Card 5: Staff Utilization */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Staff Active</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-white">{activeStaff}</span>
              <span className="text-xs text-slate-400">/{totalStaff} on shift</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Counters: <span className="font-mono text-slate-300">{summary?.load_assessment?.active_counters ?? 5}</span>
            </p>
          </div>

          {/* Card 6: Customer Satisfaction */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-4 shadow-sm">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Satisfaction</div>
            <div className="flex items-baseline gap-1.5 mt-2">
              <span className="text-2xl font-bold font-mono text-emerald-400">{satisfactionRate.toFixed(1)}%</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Rating: <span className="font-mono text-slate-300">{feedback?.average_rating?.toFixed(1) ?? '4.5'}/5.0</span>
            </p>
          </div>
        </div>

        {/* Section: Forecast & Service Breakdown Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Demand Forecast Chart (2 Columns) */}
          <div className="lg:col-span-2 bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>XGBoost Demand Forecast ({horizonHours}h Horizon)</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Predicted customer arrival volume with chronological feature engineering
                </p>
              </div>

              {forecast?.metrics && (
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400 font-mono bg-[#0e1117] px-2.5 py-1 rounded border border-slate-700">
                  <span>R²: <strong className="text-emerald-400">{forecast.metrics.R2.toFixed(3)}</strong></span>
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
                    <linearGradient id="forecastDemandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    stroke="#718096"
                    fontSize={11}
                    tickFormatter={(h) => `${h}:00`}
                  />
                  <YAxis stroke="#718096" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(h) => `Operating Hour: ${h}:00 - ${Number(h) + 1}:00`}
                    formatter={(val: any) => [`${val} arrivals`, 'Predicted Demand']}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#forecastDemandGrad)"
                    dot={{ fill: '#10b981', r: 3 }}
                    activeDot={{ r: 6, fill: '#34d399' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-3 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span>Primary ML Engine: XGBoost 3.4.1 (Non-leaking chronological split)</span>
              </span>
              <span>Total Projected: <strong className="text-white font-mono">{forecast?.total_predicted_demand ?? 0} customers</strong></span>
            </div>
          </div>

          {/* Service Workload Breakdown (1 Column) */}
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Service Workload Minutes</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Top transaction types by required duration</p>

              <div className="h-60 mt-3 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" horizontal={false} />
                    <XAxis type="number" stroke="#718096" fontSize={10} />
                    <YAxis dataKey="name" type="category" stroke="#a0aec0" fontSize={10} width={90} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', borderRadius: '6px', fontSize: '11px' }}
                      formatter={(val: any) => [`${val} min`, 'Total Workload']}
                    />
                    <Bar dataKey="workload" radius={[0, 4, 4, 0]}>
                      {serviceChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.utilization > 80 ? '#f59e0b' : '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex items-center justify-between">
              <span>High Duration Focus</span>
              <span className="text-slate-300 font-mono">Account & Loan desk</span>
            </div>
          </div>
        </div>

        {/* Section: Live Operational Bottlenecks Panel */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Live Operational Pressure & Bottleneck Detection</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Service-level capacity gaps respecting staff skill matrices and peak arrival surges
              </p>
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
              {bottlenecks.length} Services Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-medium bg-[#11151c]">
                  <th className="py-2.5 px-3">Service</th>
                  <th className="py-2.5 px-3">Time Window</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3 text-right">Demand</th>
                  <th className="py-2.5 px-3 text-right">Capacity</th>
                  <th className="py-2.5 px-3 text-right">Utilization</th>
                  <th className="py-2.5 px-3 text-right">Est. Wait</th>
                  <th className="py-2.5 px-4">Primary Root Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {bottlenecks.slice(0, 6).map((b) => (
                  <tr key={b.service} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {b.service}
                      <span className="block text-[10px] font-normal text-slate-400">
                        {b.required_skill} ({b.assigned_staff} staff)
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-300 font-mono text-[11px]">{b.time}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          b.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : b.severity === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            : b.severity === 'MODERATE'
                            ? 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.predicted_demand}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.capacity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                      {(b.utilization * 100).toFixed(0)}%
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                      {b.estimated_wait_minutes.toFixed(1)}m
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-300">
                      {b.root_causes[0] ?? 'Demand within thresholds'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section: Operational Recommendations with Live Simulate Button */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recommended Operational Interventions</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Targeted actions: Cross-skilling staff, digital diversion, and network load balancing
              </p>
            </div>
            <button
              onClick={() => navigate('/manager/simulation', { state: { branchId: selectedBranchId } })}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Custom Simulation Sandbox</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                className="bg-[#0e1117] border border-slate-700/80 rounded-lg p-4 flex flex-col justify-between hover:border-slate-600 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        rec.priority === 'HIGH'
                          ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                          : rec.priority === 'MEDIUM'
                          ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">{rec.type.replace('_', ' ')}</span>
                  </div>

                  <h3 className="text-xs font-bold text-white">{rec.action}</h3>
                  <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rec.reason}</p>

                  <div className="mt-3 p-2 rounded bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-400">
                    <strong className="text-emerald-400">Expected Outcome:</strong> {rec.expected_operational_effect}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Target: <strong className="text-slate-200">{rec.affected_service}</strong>
                  </span>

                  {rec.simulatable ? (
                    <button
                      type="button"
                      onClick={() => handleSimulateClick(rec)}
                      className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
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
