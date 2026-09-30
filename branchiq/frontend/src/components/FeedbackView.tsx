import React, { useState, useEffect } from 'react'
import { api } from '../api/client'
import type { FeedbackItem, Appointment } from '../types'

interface FeedbackViewProps {
  branchCode: string
}

export const FeedbackView: React.FC<FeedbackViewProps> = ({ branchCode }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filterSentiment, setFilterSentiment] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all')

  useEffect(() => {
    api.getFeedback(branchCode).then(setFeedbacks)
    api.getAppointments(branchCode).then(setAppointments)
  }, [branchCode])

  const filteredFeedbacks = feedbacks.filter((f) =>
    filterSentiment === 'all' ? true : f.sentiment === filterSentiment
  )

  const positiveCount = feedbacks.filter((f) => f.sentiment === 'positive').length
  const neutralCount = feedbacks.filter((f) => f.sentiment === 'neutral').length
  const negativeCount = feedbacks.filter((f) => f.sentiment === 'negative').length
  const totalCount = feedbacks.length || 1

  const positivePct = Math.round((positiveCount / totalCount) * 100)
  const neutralPct = Math.round((neutralCount / totalCount) * 100)
  const negativePct = Math.round((negativeCount / totalCount) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Customer Feedback Intelligence &amp; Appointment Schedule
        </h3>
        <p className="text-xs text-slate-400">
          NLP aspect-based sentiment categorization and scheduled customer flow
        </p>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-emerald-500/20 bg-emerald-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Positive Sentiment</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
              {positiveCount} reviews
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{positivePct}%</p>
          <p className="text-xs text-slate-400 mt-1">Praises for quick service &amp; helpful staff</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 bg-amber-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Neutral Observation</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono">
              {neutralCount} reviews
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{neutralPct}%</p>
          <p className="text-xs text-slate-400 mt-1">Standard routine transactions</p>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-rose-500/20 bg-rose-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Negative / Friction</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono">
              {negativeCount} reviews
            </span>
          </div>
          <p className="text-3xl font-extrabold text-white font-mono">{negativePct}%</p>
          <p className="text-xs text-slate-400 mt-1">Rooted in peak wait times &amp; loan delays</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Customer Reviews Feed */}
        <div className="lg:col-span-8 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Recent Customer Reviews ({filteredFeedbacks.length})
            </h4>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['all', 'positive', 'neutral', 'negative'] as const).map((sent) => (
                <button
                  key={sent}
                  onClick={() => setFilterSentiment(sent)}
                  className={`px-2.5 py-1 rounded-lg font-semibold uppercase text-[10px] transition-all ${
                    filterSentiment === sent
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {sent}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredFeedbacks.map((f) => {
              const badgeStyle =
                f.sentiment === 'positive'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : f.sentiment === 'neutral'
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/30'

              return (
                <div key={f.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{f.customer_name}</span>
                      <span className="text-[11px] text-slate-400">• {f.service_type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold">
                        {'★'.repeat(f.rating)}{'☆'.repeat(5 - f.rating)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${badgeStyle}`}>
                        {f.sentiment}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{f.comment}"
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-800/80">
                    <span>NLP Sentiment Score: <strong className="text-slate-300 font-mono">{f.sentiment_score > 0 ? `+${f.sentiment_score}` : f.sentiment_score}</strong></span>
                    <span>{new Date(f.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Upcoming Appointments Table */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              Upcoming Appointments
            </h4>
            <p className="text-xs text-slate-400">Guaranteed time slots with issued tokens</p>
          </div>

          <div className="space-y-3">
            {appointments.map((a) => (
              <div key={a.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 font-mono">{a.token_number}</span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {a.status}
                  </span>
                </div>
                <p className="text-xs font-semibold text-white">{a.customer_name}</p>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{a.service_type}</span>
                  <span className="font-mono text-slate-300">{a.slot_time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
