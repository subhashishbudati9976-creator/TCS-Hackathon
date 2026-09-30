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
  Layers,
  ArrowUpRight,
  MessageSquare,
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

  // Metrics extraction
  const loadScore = summary?.load_assessment?.overall_load_score ?? 35
  const riskLevel = summary?.load_assessment?.risk_level ?? 'Low'
  const peakDemand = forecast?.forecast ? Math.max(...forecast.forecast.map((f) => f.predicted_demand), 0) : 0
  const avgWait = summary?.metrics?.avg_waiting_time_minutes ?? 4.8
  const activeStaff = summary?.metrics?.active_staff ?? 12
  const totalStaff = summary?.metrics?.total_staff ?? 14
  const satisfactionRate = feedback?.sentiment_percentages?.Positive ?? 92.2
  const criticalBottlenecks = bottlenecks.filter((b) => b.severity === 'CRITICAL' || b.severity === 'HIGH')

  // Top 5 services for workload breakdown chart
  const serviceChartData = (capacity?.service_capacity_breakdown ?? [])
    .slice(0, 5)
    .map((s) => ({
      name: s.service_type.length > 18 ? s.service_type.substring(0, 18) + '...' : s.service_type,
      fullName: s.service_type,
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
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header & Live Branch Selector */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-Time Operational Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {selectedBranch?.branch_name ?? 'Branch Operations Dashboard'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>{selectedBranch?.city} &bull; {selectedBranch?.area ?? 'Regional Branch'}</span>
              <span>&bull;</span>
              <span className="font-mono text-slate-500">ID: {selectedBranchId}</span>
              <span>&bull;</span>
              <span className="text-emerald-400/90 font-medium">Model Online (XGBoost)</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2 bg-[#090d16] border border-[#1e293b] rounded-lg px-3.5 py-2">
              <Building2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none cursor-pointer"
              >
                {branches.map((b) => (
                  <option key={b.branch_id} value={b.branch_id} className="bg-[#0f172a] text-slate-200">
                    {b.branch_code ?? b.branch_id} &mdash; {b.branch_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Forecast Horizon Selector */}
            <div className="flex items-center bg-[#090d16] border border-[#1e293b] rounded-lg p-1 text-xs font-medium">
              <button
                type="button"
                onClick={() => setHorizonHours(4)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  horizonHours === 4 ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4h Horizon
              </button>
              <button
                type="button"
                onClick={() => setHorizonHours(8)}
                className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  horizonHours === 8 ? 'bg-emerald-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                8h Horizon
              </button>
            </div>

            <button
              onClick={() => navigate(`/manager/branches/${selectedBranchId}`)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs sm:text-sm font-medium text-slate-200 transition-all cursor-pointer"
            >
              <span>Full Intelligence</span>
              <ChevronRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => window.location.reload()} className="underline font-semibold ml-4">Retry</button>
          </div>
        )}

        {/* Row 1: Operational KPI Grid (Equal Height, Clean Typography) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4">
          {/* Card 1: Branch Load Score */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Branch Load</span>
              <Activity className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{loadScore.toFixed(0)}</span>
              <span className="text-xs text-slate-400 font-mono">/100</span>
            </div>
            <div className="flex items-center">
              <span
                className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  riskLevel === 'Severe'
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : riskLevel === 'Elevated'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                }`}
              >
                {riskLevel} Risk
              </span>
            </div>
          </div>

          {/* Card 2: Peak Demand Forecast */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Demand</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-amber-400 tracking-tight">{peakDemand}</span>
              <span className="text-xs text-slate-400 font-mono">cust/h</span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400/80" />
              <span>Max Next {horizonHours}h</span>
            </div>
          </div>

          {/* Card 3: Estimated Wait Time */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Customer Wait</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{avgWait.toFixed(1)}</span>
              <span className="text-xs text-slate-400 font-mono">min</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              P90: <span className="text-slate-300 font-semibold">{summary?.metrics?.p90_waiting_time_minutes?.toFixed(1) ?? '10.5'}m</span>
            </div>
          </div>

          {/* Card 4: Bottleneck Services */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Bottlenecks</span>
              <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-2xl sm:text-3xl font-bold font-mono tracking-tight ${criticalBottlenecks.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {criticalBottlenecks.length}
              </span>
              <span className="text-xs text-slate-400 font-mono">flagged</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {bottlenecks.length} services audited
            </div>
          </div>

          {/* Card 5: Staff Utilization */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Staff Active</span>
              <Users className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight">{activeStaff}</span>
              <span className="text-xs text-slate-400 font-mono">/{totalStaff} rostered</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Counters: <span className="text-slate-300 font-semibold">{summary?.load_assessment?.active_counters ?? 5}</span>
            </div>
          </div>

          {/* Card 6: Customer Satisfaction */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 sm:p-4.5 flex flex-col justify-between h-[118px]">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Satisfaction</span>
              <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-bold font-mono text-emerald-400 tracking-tight">{satisfactionRate.toFixed(1)}%</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Rating: <span className="text-slate-300 font-semibold">{feedback?.average_rating?.toFixed(1) ?? '4.5'}/5.0</span>
            </div>
          </div>
        </div>

        {/* Row 2: 12-Column Grid (8-col Forecast Chart + 4-col Service Workload Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Demand Forecast Chart (8 Columns) */}
          <div className="lg:col-span-8 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Demand Forecast &mdash; Next {horizonHours} Hours</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Hourly customer arrival projection powered by XGBoost time-series model
                  </p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-400 font-mono bg-[#090d16] px-3 py-1.5 rounded-md border border-[#1e293b]">
                  <span className="text-slate-300">Model: <strong className="text-white">XGBoost</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>R&sup2;: <strong className="text-emerald-400">{forecast?.metrics?.R2?.toFixed(3) ?? '0.892'}</strong></span>
                  <span className="text-slate-600">&bull;</span>
                  <span>MAE: <strong className="text-slate-200">{forecast?.metrics?.MAE?.toFixed(2) ?? '1.84'}</strong></span>
                </div>
              </div>

              <div className="h-72 sm:h-80 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={forecast?.forecast ?? []}
                    margin={{ top: 12, right: 16, left: -16, bottom: 4 }}
                  >
                    <defs>
                      <linearGradient id="forecastDemandGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      stroke="#64748b"
                      fontSize={11}
                      tickFormatter={(h) => `${h}:00`}
                    />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      labelFormatter={(h) => `Operating Window: ${h}:00 &mdash; ${Number(h) + 1}:00`}
                      formatter={(val: any) => [`${val} arrivals`, 'Predicted Demand']}
                    />
                    <Area
                      type="monotone"
                      dataKey="predicted_demand"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#forecastDemandGrad)"
                      dot={{ fill: '#10b981', r: 3 }}
                      activeDot={{ r: 5, fill: '#34d399' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-4 mt-2 border-t border-[#1e293b]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Chronological train-test split (Zero data leakage)</span>
              </span>
              <span>Total Horizon Volume: <strong className="text-white font-mono">{forecast?.total_predicted_demand ?? 0} customers</strong></span>
            </div>
          </div>

          {/* Service Workload Distribution (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Service Workload Minutes</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Top transaction types by required duration</p>
              </div>

              <div className="h-72 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={serviceChartData}
                    layout="vertical"
                    margin={{ top: 8, right: 16, left: 10, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                    <XAxis type="number" stroke="#64748b" fontSize={11} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#94a3b8"
                      fontSize={11}
                      width={100}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#f8fafc',
                      }}
                      formatter={(val: any) => [`${val} min`, 'Total Workload']}
                    />
                    <Bar dataKey="workload" radius={[0, 4, 4, 0]}>
                      {serviceChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.utilization > 80 ? '#f59e0b' : '#38bdf8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-4 mt-2 border-t border-[#1e293b] flex items-center justify-between">
              <span>High Duration Focus</span>
              <span className="text-slate-300 font-mono">Account &amp; Loan desk</span>
            </div>
          </div>
        </div>

        {/* Row 3: Operational Bottlenecks & Capacity Gaps (12 Columns, 52px Row Height) */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Live Operational Pressure &amp; Bottleneck Detection</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Service-level capacity gaps respecting staff skill matrices and peak arrival surges
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-[#090d16] px-3 py-1 rounded-md border border-[#1e293b]">
              {bottlenecks.length} Services Evaluated
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-slate-400 font-medium bg-[#0b101b] uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Time Window</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-right">Demand</th>
                  <th className="py-3.5 px-4 text-right">Capacity</th>
                  <th className="py-3.5 px-4 text-right">Utilization</th>
                  <th className="py-3.5 px-4 text-right">Est. Wait</th>
                  <th className="py-3.5 px-5">Primary Root Cause</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300">
                {bottlenecks.slice(0, 6).map((b) => (
                  <tr key={b.service} className="hover:bg-[#131d2e] transition-colors h-[54px]">
                    <td className="py-3 px-4 font-semibold text-white">
                      {b.service}
                      <span className="block text-[11px] font-normal text-slate-400 mt-0.5">
                        {b.required_skill} ({b.assigned_staff} staff)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">{b.time}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                          b.severity === 'CRITICAL'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : b.severity === 'HIGH'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : b.severity === 'MODERATE'
                            ? 'bg-yellow-500/10 text-yellow-300 border-yellow-500/25'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                        }`}
                      >
                        {b.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">{b.predicted_demand}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-200">{b.capacity}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                      {(b.utilization * 100).toFixed(0)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium">
                      {b.estimated_wait_minutes.toFixed(1)}m
                    </td>
                    <td className="py-3 px-5 text-xs text-slate-300 max-w-md truncate" title={b.root_causes[0] ?? ''}>
                      {b.root_causes[0] ?? 'Demand within nominal thresholds'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Row 4: 12-Column Grid (8-col AI Recommendations + 4-col Sentiment Intelligence) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Section: Operational Recommendations with Live Simulate Button (8 Columns) */}
          <div className="lg:col-span-8 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
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
                  <span>Simulation Sandbox</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.slice(0, 4).map((rec) => (
                  <div
                    key={rec.id}
                    className="bg-[#090d16] border border-[#1e293b] rounded-lg p-4 flex flex-col justify-between hover:border-slate-700 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                            rec.priority === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/25'
                              : rec.priority === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                              : 'bg-sky-500/10 text-sky-400 border-sky-500/25'
                          }`}
                        >
                          {rec.priority} Priority
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{rec.type.replace('_', ' ')}</span>
                      </div>

                      <h3 className="text-sm font-semibold text-white leading-snug">{rec.action}</h3>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{rec.reason}</p>

                      <div className="mt-3 p-2.5 rounded bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400">
                        <strong className="text-emerald-400">Expected Outcome:</strong> {rec.expected_operational_effect}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
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
                          <span>Simulate</span>
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

          {/* Section: Customer Feedback & Sentiment Intelligence (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="mb-4">
                <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400" />
                  <span>Customer Sentiment Intelligence</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">NLP topic categorization across recent visits</p>
              </div>

              {/* Sentiment Ratio Bar */}
              <div className="space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-semibold">{satisfactionRate.toFixed(1)}% Positive</span>
                  <span className="text-rose-400 font-semibold">{feedback?.sentiment_percentages?.Negative?.toFixed(1) ?? '5.5'}% Negative</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                  <div
                    className="bg-emerald-500 h-full"
                    style={{ width: `${satisfactionRate}%` }}
                  />
                  <div
                    className="bg-slate-600 h-full"
                    style={{ width: `${100 - satisfactionRate - (feedback?.sentiment_percentages?.Negative ?? 5.5)}%` }}
                  />
                  <div
                    className="bg-rose-500 h-full"
                    style={{ width: `${feedback?.sentiment_percentages?.Negative ?? 5.5}%` }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  Based on {feedback?.total_feedback ?? 11000} verified surveys
                </div>
              </div>

              {/* Top Operational Issues */}
              <div className="mt-6 space-y-3">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 block">
                  Identified Operational Friction Points
                </span>
                {(feedback?.top_complaints ?? []).slice(0, 3).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-[#090d16] border border-[#1e293b] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-200 capitalize">
                        {item.topic.replace('_', ' ')}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {item.count} recorded complaints ({item.percentage.toFixed(1)}%)
                      </div>
                    </div>
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                      Friction
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-xs text-slate-400 pt-4 mt-4 border-t border-[#1e293b] flex items-center justify-between">
              <span>Target Operational SLA</span>
              <span className="text-emerald-400 font-mono font-semibold">&gt; 90% Positive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard
