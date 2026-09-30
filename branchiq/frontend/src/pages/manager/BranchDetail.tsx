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
      <div className="min-h-screen bg-[#0e1117] flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-400">Loading comprehensive branch intelligence...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#0e1117] p-8 text-slate-200">
        <button
          onClick={() => navigate('/manager/branches')}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Branches</span>
        </button>
        <div className="p-6 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-sm">
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
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Back */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/manager/branches')}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Branch Comparison</span>
          </button>

          <button
            onClick={() => navigate('/manager/simulation', { state: { branchId } })}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold text-white shadow-sm cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Simulate Scenarios</span>
          </button>
        </div>

        {/* Branch Header */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {summary.branch.branch_code ?? branchId}
              </span>
              <span className="text-xs text-slate-400 font-medium">{summary.branch.branch_type}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              {summary.branch.branch_name}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {summary.branch.city} • Counters: {summary.branch.number_of_counters} • Total Staff: {summary.metrics.total_staff}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#0e1117] border border-slate-700 rounded-lg text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Load Score</span>
              <span className="text-xl font-bold font-mono text-white mt-0.5 block">
                {loadScore.overall_load_score.toFixed(0)}/100
              </span>
              <span className="text-[10px] text-amber-400 font-semibold">{loadScore.risk_level}</span>
            </div>

            <div className="p-3 bg-[#0e1117] border border-slate-700 rounded-lg text-center min-w-[100px]">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Avg Wait</span>
              <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                {summary.metrics.avg_waiting_time_minutes.toFixed(1)}m
              </span>
              <span className="text-[10px] text-slate-500">P90: {summary.metrics.p90_waiting_time_minutes.toFixed(1)}m</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-700 gap-6 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Capacity & Workload' },
            { id: 'forecast', label: 'Demand Forecast' },
            { id: 'bottlenecks', label: `Bottlenecks (${bottlenecks.length})` },
            { id: 'feedback', label: 'Customer Sentiment & NLP' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 transition-colors cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400 font-bold'
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
            <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Service Capacity & Skill Breakdown</span>
              </h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-slate-400 font-medium bg-[#11151c]">
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Skill Group</th>
                      <th className="py-2.5 px-3 text-right">Staff Assigned</th>
                      <th className="py-2.5 px-3 text-right">Workload (min)</th>
                      <th className="py-2.5 px-3 text-right">Capacity (min)</th>
                      <th className="py-2.5 px-3 text-right">Utilization</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {capacity.service_capacity_breakdown.map((s) => (
                      <tr key={s.service_type} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-semibold text-white">{s.service_type}</td>
                        <td className="py-2.5 px-3 text-slate-400">{s.required_skill}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{s.assigned_staff_count.toFixed(1)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Math.round(s.workload_minutes)}</td>
                        <td className="py-2.5 px-3 text-right font-mono">{Math.round(s.capacity_minutes)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-semibold text-white">
                          {(s.utilization_rate * 100).toFixed(0)}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              s.bottleneck_severity === 'Critical'
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : s.bottleneck_severity === 'High'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
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
          <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>XGBoost Hourly Demand Forecast</span>
            </h2>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                  <XAxis dataKey="hour" stroke="#718096" fontSize={11} tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#718096" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a202c', borderColor: '#4a5568', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(h) => `Operating Hour: ${h}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted_demand"
                    stroke="#10b981"
                    strokeWidth={2.5}
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
            <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Detected Service Bottlenecks & Root Causes</span>
              </h2>

              <div className="space-y-3">
                {bottlenecks.map((b) => (
                  <div key={b.service} className="p-4 rounded-lg bg-[#0e1117] border border-slate-700/80">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{b.service}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                              b.severity === 'CRITICAL' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            }`}
                          >
                            {b.severity}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Peak Time: {b.time} • Utilization: {(b.utilization * 100).toFixed(0)}% • Est Wait: {b.estimated_wait_minutes.toFixed(1)}m
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[11px] text-slate-400">Demand / Capacity:</span>
                        <span className="font-mono text-xs font-bold text-white ml-1.5">{b.predicted_demand} / {b.capacity}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800">
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
            <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Intervention Recommendations</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec) => (
                  <div key={rec.id} className="p-4 rounded-lg bg-[#0e1117] border border-slate-700/80 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {rec.priority} PRIORITY
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">{rec.type}</span>
                      </div>
                      <h3 className="text-xs font-bold text-white">{rec.action}</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.reason}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400">{rec.expected_operational_effect}</span>
                      {rec.simulatable && (
                        <button
                          onClick={() => handleSimulate(rec)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold cursor-pointer"
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
              <div className="p-4 bg-[#161a22] border border-[#2d3748] rounded-xl text-center">
                <span className="text-xs text-slate-400">Total Customer Reviews</span>
                <span className="text-2xl font-bold font-mono text-white block mt-1">{feedback.total_feedback}</span>
              </div>
              <div className="p-4 bg-[#161a22] border border-[#2d3748] rounded-xl text-center">
                <span className="text-xs text-slate-400">Satisfaction Rate</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 block mt-1">
                  {feedback.sentiment_percentages.Positive}%
                </span>
              </div>
              <div className="p-4 bg-[#161a22] border border-[#2d3748] rounded-xl text-center">
                <span className="text-xs text-slate-400">Average Rating</span>
                <span className="text-2xl font-bold font-mono text-amber-400 block mt-1">
                  {feedback.average_rating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>

            {/* Recent Feedback Feed */}
            <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
              <h2 className="text-sm font-bold text-white mb-3">Recent Customer Comments</h2>
              <div className="space-y-3">
                {feedback.recent_feedback.slice(0, 8).map((f) => (
                  <div key={f.feedback_id} className="p-3 bg-[#0e1117] border border-slate-800 rounded-lg text-xs">
                    <div className="flex items-center justify-between text-slate-400 mb-1 text-[11px]">
                      <span>{f.service_type} • Rating: {'★'.repeat(f.rating)}</span>
                      <span className={f.sentiment === 'Positive' ? 'text-emerald-400' : 'text-rose-400 font-semibold'}>
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
