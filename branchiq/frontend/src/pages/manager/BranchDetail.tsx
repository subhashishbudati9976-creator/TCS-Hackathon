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
  ChevronRight,
  Activity,
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
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-9 h-9 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400 font-mono">Loading branch intelligence...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#090d16] p-8 text-slate-200">
        <button
          onClick={() => navigate('/manager/branches')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Branch Comparison</span>
        </button>
        <div className="p-5 bg-rose-500/10 border border-rose-500/25 rounded-xl text-rose-300 text-sm">
          {error ?? 'Branch intelligence bundle not found'}
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
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/manager/branches')}
            className="flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Regional Comparison</span>
          </button>

          <button
            onClick={() => navigate('/manager/simulation', { state: { branchId } })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs sm:text-sm font-semibold text-white shadow-sm cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Interventions</span>
          </button>
        </div>

        {/* Branch Overview Header Banner */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                {summary.branch.branch_code ?? branchId}
              </span>
              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{summary.branch.branch_type}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1.5">
              {summary.branch.branch_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>{summary.branch.city} &bull; {summary.branch.area ?? 'Central'}</span>
              <span>&bull;</span>
              <span>Counters: {summary.branch.number_of_counters}</span>
              <span>&bull;</span>
              <span>Total Staff: {summary.metrics.total_staff}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded-lg text-center min-w-[110px]">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Load Score</span>
              <span className="text-2xl font-bold font-mono text-white mt-0.5 block">
                {loadScore.overall_load_score.toFixed(0)}/100
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">{loadScore.risk_level}</span>
            </div>

            <div className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded-lg text-center min-w-[110px]">
              <span className="text-[11px] text-slate-400 uppercase font-semibold block">Avg Wait</span>
              <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {summary.metrics.avg_waiting_time_minutes.toFixed(1)}m
              </span>
              <span className="text-[10px] text-slate-500 font-mono">P90: {summary.metrics.p90_waiting_time_minutes.toFixed(1)}m</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#1e293b] gap-6 text-xs sm:text-sm font-medium">
          {[
            { id: 'overview', label: 'Capacity & Workload' },
            { id: 'forecast', label: 'Demand Forecast' },
            { id: 'bottlenecks', label: `Bottlenecks (${bottlenecks.length})` },
            { id: 'feedback', label: 'Customer Sentiment & NLP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3.5 transition-colors cursor-pointer border-b-2 font-medium ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 font-semibold'
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
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Service Capacity &amp; Skill Breakdown</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-[#1e293b] text-slate-400 font-medium bg-[#0b101b] uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Skill Group</th>
                      <th className="py-3 px-4 text-right">Staff Assigned</th>
                      <th className="py-3 px-4 text-right">Workload (min)</th>
                      <th className="py-3 px-4 text-right">Capacity (min)</th>
                      <th className="py-3 px-4 text-right">Utilization</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1e293b] text-slate-300">
                    {capacity.service_capacity_breakdown.map((s) => (
                      <tr key={s.service_type} className="hover:bg-[#131d2e] h-[52px]">
                        <td className="py-3 px-4 font-semibold text-white">{s.service_type}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{s.required_skill}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-200">{s.assigned_staff_count.toFixed(1)}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-200">{Math.round(s.workload_minutes)}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-200">{Math.round(s.capacity_minutes)}</td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                          {(s.utilization_rate * 100).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                              s.bottleneck_severity === 'Critical'
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : s.bottleneck_severity === 'High'
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
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
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>XGBoost Hourly Demand Forecast</span>
            </h2>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast} margin={{ top: 12, right: 16, left: -16, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px', color: '#f8fafc' }}
                    labelFormatter={(h) => `Operating Hour: ${h}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.25}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 3: Bottlenecks & Recommendations */}
        {activeTab === 'bottlenecks' && (
          <div className="space-y-6">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Detected Service Bottlenecks &amp; Root Causes</span>
              </h2>

              <div className="space-y-3">
                {bottlenecks.map((b) => (
                  <div key={b.service} className="p-4 rounded-lg bg-[#090d16] border border-[#1e293b]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">{b.service}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                              b.severity === 'CRITICAL' ? 'bg-rose-500/15 text-rose-400 border-rose-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            }`}
                          >
                            {b.severity}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 mt-1 block">
                          Peak Time: {b.time} &bull; Utilization: {(b.utilization * 100).toFixed(0)}% &bull; Est Wait: {b.estimated_wait_minutes.toFixed(1)}m
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400">Demand / Capacity:</span>
                        <span className="font-mono text-xs font-bold text-white ml-1.5">{b.predicted_demand} / {b.capacity}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-[#1e293b]">
                      <span className="text-xs font-semibold text-slate-400 block mb-1">Root Cause Attribution:</span>
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
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Intervention Recommendations</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg bg-[#090d16] border border-[#1e293b] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{rec.type}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-white">{rec.action}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.reason}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
                      <span className="text-xs text-emerald-400">{rec.expected_operational_effect}</span>
                      {rec.simulatable && (
                        <button
                          onClick={() => handleSimulate(rec)}
                          className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
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
              <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Total Verified Reviews</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{feedback.total_feedback}</span>
              </div>
              <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Satisfaction Rate</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  {feedback.sentiment_percentages.Positive}%
                </span>
              </div>
              <div className="p-4 bg-[#0f172a] border border-[#1e293b] rounded-xl text-center">
                <span className="text-xs text-slate-400 uppercase font-semibold">Average Rating</span>
                <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">
                  {feedback.average_rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            {/* Recent Feedback Feed */}
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-base sm:text-lg font-bold text-white mb-4">Recent Customer Comments</h2>
              <div className="space-y-3">
                {feedback.recent_feedback.slice(0, 8).map((f) => (
                  <div key={f.feedback_id} className="p-3.5 bg-[#090d16] border border-[#1e293b] rounded-lg text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                      <span>{f.service_type} &bull; Rating: {'★'.repeat(f.rating)}</span>
                      <span className={f.sentiment === 'Positive' ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
                        {f.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-200 italic">&ldquo;{f.feedback_text}&rdquo;</p>
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

export default BranchDetail
