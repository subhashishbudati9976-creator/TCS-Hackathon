import React from 'react'

interface KpiCardProps {
  title: string
  value: string | number
  subtext: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan'
  icon: React.ReactNode
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtext,
  change,
  trend = 'neutral',
  badgeColor = 'indigo',
  icon,
}) => {
  const colorMap = {
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  }

  return (
    <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
          {title}
        </span>
        <div className={`p-2 rounded-xl border ${colorMap[badgeColor]} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              trend === 'down'
                ? 'bg-rose-500/15 text-rose-400'
                : trend === 'up'
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-slate-700 text-slate-300'
            }`}
          >
            {change}
          </span>
        )}
      </div>

      <p className="mt-1.5 text-xs text-slate-400 line-clamp-1">{subtext}</p>
    </div>
  )
}
