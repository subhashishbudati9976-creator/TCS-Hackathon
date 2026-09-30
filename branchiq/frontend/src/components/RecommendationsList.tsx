import React from 'react'
import type { Recommendation } from '../types'

interface RecommendationsListProps {
  recommendations: Recommendation[]
  onApplyRecommendation: (rec: Recommendation) => void
  appliedMap: Record<string, boolean>
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onApplyRecommendation,
  appliedMap,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">
            AI Operational Recommendations
          </h3>
          <p className="text-xs text-slate-400">
            Explainable AI decision intelligence with quantified impact estimations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
            {recommendations.length} Active Proposals
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec) => {
          const isApplied = appliedMap[rec.id] || rec.applied

          const priorityBadge =
            rec.priority === 'high'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : rec.priority === 'medium'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-slate-700/50 text-slate-300 border-slate-600'

          const typeIcon = {
            reallocate_staff: '👥',
            redirect_customers: '↗️',
            open_counter: '🪑',
            promote_appointments: '📅',
          }[rec.action_type] || '⚡'

          return (
            <div
              key={rec.id}
              className={`glass-panel rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                isApplied
                  ? 'border-emerald-500/30 bg-emerald-950/10 shadow-lg shadow-emerald-950/20'
                  : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{typeIcon}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">{rec.id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  {isApplied && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Applied
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">
                  {rec.title}
                </h4>

                <p className="text-xs text-slate-300 mb-3">
                  {rec.description}
                </p>

                {/* AI Explanation Box */}
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 mb-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Why AVENUE recommends this:
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {rec.explanation}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium mb-4">
                  <span className="text-emerald-500 font-bold">Estimated Impact:</span>
                  <span className="font-mono">{rec.estimated_impact}</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onApplyRecommendation(rec)}
                disabled={isApplied}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isApplied
                    ? 'bg-slate-800/80 text-slate-400 cursor-not-allowed border border-slate-700/50'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/20 active:scale-[0.98]'
                }`}
              >
                {isApplied ? (
                  <>
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    Recommendation Executed
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Apply Operational Action
                  </>
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
