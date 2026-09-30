import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Building2,
  Users,
  Clock,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Activity,
  Cpu,
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
import type { BranchIntelligenceBundle, OperationalRecommendation } from '../../types'

export const BranchDetail: React.FC = () => {
  const { branchId = 'BR001' } = useParams<{ branchId: string }>()
  const navigate = useNavigate()

  const [data, setData] = useState<BranchIntelligenceBundle | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'forecast' | 'bottlenecks' | 'feedback'>('overview')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadIntelligence() {
      setIsLoading(true)
      try {
        const bundle = await api.getBranchIntelligence(branchId)
        setData(bundle)
      } catch (err: any) {
        setError(err?.message || `Failed to load branch intelligence for ${branchId}`)
      } finally {
        setIsLoading(false)
      }
    }
    loadIntelligence()
  }, [branchId])

  if (isLoading) {
    return (
      <div className="min-h-screen avenue-mesh-bg flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-mono text-cyan-400">Loading comprehensive branch telemetry...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen avenue-mesh-bg p-8 text-slate-200">
        <button
          onClick={() => navigate('/manager/branches')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Branches</span>
        </button>
        <div className="p-6 bg-rose-500/15 border border-rose-500/30 rounded-2xl text-rose-300 text-sm">
          {error ?? 'Branch not found'}
        </div>
      </div>
    )
  }

  const { summary, capacity, forecast, bottlenecks, recommendations, feedback } = data
  const loadScore = capacity.branch_load_score

  const handleSimulate = (rec: OperationalRecommendation) => {
    navigate('/manager/simulation', {
      state: {
        branchId: branchId,
        actionType: rec.action_type,
        params: rec.simulation_params || {},
      },
    })
  }

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/manager/branches')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Branch Comparison</span>
          </button>

          <button
            onClick={() => navigate('/manager/simulation', { state: { branchId } })}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-xs font-bold text-white shadow-md shadow-cyan-600/20 cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Launch Digital Twin Sandbox</span>
          </button>
        </div>

        {/* Branch Header */}
        <div className="avenue-glass rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-cyan-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                {summary.branch.branch_code ?? branchId}
              </span>
              <span className="text-xs text-slate-400 font-medium font-mono">{summary.branch.branch_type}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              {summary.branch.branch_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {summary.branch.city} • Counters: <strong className="text-slate-200">{summary.branch.number_of_counters}</strong> • Total Staff: <strong className="text-slate-200">{summary.metrics.total_staff}</strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center min-w-[110px] shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Load Score</span>
              <span className="text-xl font-black font-mono text-cyan-300 mt-0.5 block">
                {loadScore.overall_load_score.toFixed(0)}/100
              </span>
              <span className="badge badge-moderate text-[9px] mt-1">{loadScore.risk_level}</span>
            </div>

            <div className="p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-center min-w-[110px] shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Avg Wait</span>
              <span className="text-xl font-black font-mono text-emerald-400 mt-0.5 block">
                {summary.metrics.avg_waiting_time_minutes.toFixed(1)}m
              </span>
              <span className="text-[10px] text-slate-400 font-mono">P90: {summary.metrics.p90_waiting_time_minutes.toFixed(1)}m</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 gap-6 text-xs font-bold">
          {[
            { id: 'overview', label: 'Capacity & Workload' },
            { id: 'forecast', label: 'Demand Forecast' },
            { id: 'bottlenecks', label: `Bottlenecks (${bottlenecks.length})` },
            { id: 'feedback', label: 'Customer Sentiment & NLP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 transition-all cursor-pointer border-b-2 font-mono ${
                activeTab === tab.id
                  ? 'border-cyan-400 text-cyan-300 font-extrabold'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Overview & Capacity Breakdown */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="avenue-glass rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Service Capacity & Skill Breakdown</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Service Category</th>
                      <th>Skill Group</th>
                      <th className="text-right">Staff Assigned</th>
                      <th className="text-right">Workload (min)</th>
                      <th className="text-right">Capacity (min)</th>
                      <th className="text-right">Utilization</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {capacity.service_capacity_breakdown.map((s) => (
                      <tr key={s.service_type} className="hover:bg-slate-800/40">
                        <td className="font-semibold text-white">{s.service_type}</td>
                        <td className="text-slate-400">{s.required_skill}</td>
                        <td className="text-right font-mono">{s.assigned_staff_count.toFixed(1)}</td>
                        <td className="text-right font-mono">{Math.round(s.workload_minutes)}</td>
                        <td className="text-right font-mono">{Math.round(s.capacity_minutes)}</td>
                        <td className="text-right font-mono font-bold text-white">
                          {(s.utilization_rate * 100).toFixed(0)}%
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              s.bottleneck_severity === 'Critical'
                                ? 'badge-critical'
                                : s.bottleneck_severity === 'High'
                                ? 'badge-high'
                                : 'badge-normal'
                            }`}
                          >
                            {s.bottleneck_severity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Forecast */}
        {activeTab === 'forecast' && (
          <div className="avenue-glass rounded-2xl p-5 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>XGBoost Hourly Demand Forecast</span>
            </h2>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="detailDemandGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.45} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(51,65,85,0.4)" vertical={false} />
                  <XAxis dataKey="hour" stroke="#94a3b8" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(11,18,33,0.95)', borderColor: 'rgba(6,182,212,0.4)', borderRadius: '10px', fontSize: '12px' }}
                    labelFormatter={(h) => `Operating Hour: ${h}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#detailDemandGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Bottlenecks & Recommendations */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-6">
            <div className="avenue-glass rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Detected Service Bottlenecks & Root Causes</span>
              </h2>

              <div className="space-y-3">
                {bottlenecks.map((b) => (
                  <div key={b.service} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{b.service}</span>
                          <span
                            className={`badge ${
                              b.severity === 'CRITICAL' ? 'badge-critical' : 'badge-normal'
                            }`}
                          >
                            {b.severity}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                          Peak Time: {b.time} • Utilization: {(b.utilization * 100).toFixed(0)}% • Est Wait: {b.estimated_wait_minutes.toFixed(1)}m
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 font-mono">Demand / Capacity:</span>
                        <span className="font-mono text-xs font-bold text-cyan-300 ml-1.5">{b.predicted_demand} / {b.capacity}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1">Root Cause Attribution:</span>
                      <ul className="list-disc list-inside text-xs text-slate-300 space-y-0.5">
                        {b.root_causes.map((rc, i) => (
                          <li key={i}>{rc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="avenue-glass rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Prescriptive Recommendations</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`badge ${rec.priority === 'HIGH' ? 'badge-critical' : 'badge-moderate'}`}>
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{rec.type}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white">{rec.action}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.reason}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-cyan-400 font-medium">{rec.expected_operational_effect}</span>
                      {rec.simulatable && (
                        <button
                          onClick={() => handleSimulate(rec)}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-sm cursor-pointer"
                        >
                          Simulate
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Customer Sentiment & Feedback NLP */}
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 avenue-glass rounded-xl text-center">
                <span className="text-xs text-slate-400">Total Customer Reviews</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{feedback.total_feedback}</span>
              </div>
              <div className="p-5 avenue-glass rounded-xl text-center">
                <span className="text-xs text-slate-400">Satisfaction Rate</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  {feedback.sentiment_percentages.Positive}%
                </span>
              </div>
              <div className="p-5 avenue-glass rounded-xl text-center">
                <span className="text-xs text-slate-400">Average Rating</span>
                <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">
                  {feedback.average_rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            {/* Recent Feedback Feed */}
            <div className="avenue-glass rounded-2xl p-5 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-3">Recent Customer Comments</h2>
              <div className="space-y-3">
                {feedback.recent_feedback.slice(0, 8).map((f) => (
                  <div key={f.feedback_id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px] font-mono">
                      <span>{f.service_type} • Rating: {'★'.repeat(f.rating)}</span>
                      <span className={f.sentiment === 'Positive' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                        {f.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-200 italic">"{f.feedback_text}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
