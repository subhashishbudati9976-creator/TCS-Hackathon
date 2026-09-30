import React from 'react'
import type { AIInsight } from '../types'

interface AiInsightsBannerProps {
  insight: AIInsight
  onApplyReallocation: () => void
  onRedirectCustomers: () => void
  onOpenRecommendations: () => void
  appliedActionId: string | null
}

export const AiInsightsBanner: React.FC<AiInsightsBannerProps> = ({
  insight,
  onApplyReallocation,
  onRedirectCustomers,
  onOpenRecommendations,
  appliedActionId,
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/60 border border-indigo-500/30 p-6 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-40 h-40 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-indigo-400">
              AI Operational Foresight
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {insight.confidence}% Confidence
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20">
              {insight.urgency} Urgency
            </span>
          </div>

          <h2 className="text-lg font-bold text-white tracking-tight">
            {insight.title}
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed">
            {insight.summary}
          </p>

          <p className="text-xs text-indigo-300/80 font-mono">
            {insight.timestamp}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap lg:flex-col sm:flex-row gap-2.5 w-full lg:w-auto shrink-0">
          <button
            onClick={onApplyReallocation}
            disabled={appliedActionId === 'REC-01'}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md ${
              appliedActionId === 'REC-01'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25 hover:shadow-indigo-600/40 active:scale-95'
            }`}
          >
            {appliedActionId === 'REC-01' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Staff Reallocated (Applied)
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Execute Reallocation
              </>
            )}
          </button>

          <button
            onClick={onRedirectCustomers}
            disabled={appliedActionId === 'REC-02'}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              appliedActionId === 'REC-02'
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 cursor-default'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 active:scale-95'
            }`}
          >
            {appliedActionId === 'REC-02' ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Redirection Broadcasted
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                Redirect to North Hub
              </>
            )}
          </button>

          <button
            onClick={onOpenRecommendations}
            className="px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors text-center"
          >
            Review All 4 Recommendations &rarr;
          </button>
        </div>
      </div>
    </div>
  )
}
