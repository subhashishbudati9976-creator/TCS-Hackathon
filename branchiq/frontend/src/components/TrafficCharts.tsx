import React from 'react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { ForecastPoint, QueueTrendPoint, ServiceDemandPoint } from '../types'

interface TrafficChartsProps {
  hourlyTraffic: ForecastPoint[]
  queueTrend: QueueTrendPoint[]
  serviceDistribution: ServiceDemandPoint[]
}

export const TrafficCharts: React.FC<TrafficChartsProps> = ({
  hourlyTraffic,
  queueTrend,
  serviceDistribution,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Chart 1: Customer Traffic by Hour (Predicted vs Actual vs Capacity) */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Customer Traffic by Hour</h3>
            <p className="text-xs text-slate-400">Predicted footfall vs actual walk-ins &amp; capacity limit</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium">
            09:00 - 17:00 Today
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Area
                type="monotone"
                dataKey="predicted_customers"
                name="Predicted Traffic"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#predictedGrad)"
              />
              <Area
                type="monotone"
                dataKey="actual_customers"
                name="Actual Walk-ins"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#actualGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Queue Trend & Completed Services */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Queue Trend &amp; Processing Velocity</h3>
            <p className="text-xs text-slate-400">Active waiting backlog vs completed transactions</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
            Real-time Telemetry
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={queueTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="active_queue" name="Waiting in Queue" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed_services" name="Completed Services" fill="#06b6d4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Service Demand Distribution */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Service Demand Distribution</h3>
            <p className="text-xs text-slate-400">Share of total customer requests &amp; queue pressure</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-medium">
            4 Core Desks
          </span>
        </div>

        <div className="space-y-4">
          {serviceDistribution.map((item) => {
            const statusBadge =
              item.status === 'critical'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                : item.status === 'strained'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'

            return (
              <div key={item.service} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{item.service}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusBadge}`}>
                      {item.status}
                    </span>
                  </div>
                  <span className="font-mono text-slate-400">
                    {item.current_waiting} waiting • ~{item.avg_duration_mins}m per client
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        item.status === 'critical'
                          ? 'bg-rose-500'
                          : item.status === 'strained'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${item.demand_share}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-300 w-10 text-right font-mono">
                    {item.demand_share}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart 4: Hourly Wait-Time Progression Curve */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-white">Wait-Time Progression Curve</h3>
            <p className="text-xs text-slate-400">Predicted customer wait time (mins) across operating hours</p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
            SLA Threshold: 20 min
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="waitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="m" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="predicted_wait_minutes"
                name="Predicted Wait Time (min)"
                stroke="#ec4899"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#waitGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
