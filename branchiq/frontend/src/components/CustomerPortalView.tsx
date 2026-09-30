import React, { useState } from 'react'
import { api } from '../api/client'
import type { Branch, Appointment, FeedbackAnalysis } from '../types'

interface CustomerPortalViewProps {
  branches: Branch[]
  currentBranch: Branch
  onSelectBranch: (branchCode: string) => void
  onFeedbackSubmitted?: (analysis: FeedbackAnalysis) => void
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  branches,
  currentBranch,
  onSelectBranch,
  onFeedbackSubmitted,
}) => {
  // Appointment form state
  const [customerName, setCustomerName] = useState<string>('')
  const [serviceType, setServiceType] = useState<string>('Account Opening & KYC')
  const [slotTime, setSlotTime] = useState<string>('14:30 Today')
  const [bookingLoading, setBookingLoading] = useState<boolean>(false)
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null)

  // Feedback form state
  const [feedbackRating, setFeedbackRating] = useState<number>(5)
  const [feedbackService, setFeedbackService] = useState<string>('General Banking')
  const [feedbackText, setFeedbackText] = useState<string>('')
  const [feedbackLoading, setFeedbackLoading] = useState<boolean>(false)
  const [lastAnalysis, setLastAnalysis] = useState<FeedbackAnalysis | null>(null)

  // Find lowest load branch for redirection recommendation
  const recommendedBranch =
    branches
      .filter((b) => b.branch_code !== currentBranch.branch_code)
      .sort((a, b) => a.current_load - b.current_load)[0] ?? null

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerName.trim()) return

    setBookingLoading(true)
    try {
      const appt = await api.bookAppointment({
        branch_code: currentBranch.branch_code,
        customer_name: customerName,
        service_type: serviceType,
        slot_time: slotTime,
      })
      setConfirmedAppt(appt)
    } finally {
      setBookingLoading(false)
    }
  }

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackText.trim()) return

    setFeedbackLoading(true)
    try {
      const analysis = await api.submitFeedback({
        branch_code: currentBranch.branch_code,
        customer_name: customerName || 'Verified Customer',
        service_type: feedbackService,
        rating: feedbackRating,
        comment: feedbackText,
      })
      setLastAnalysis(analysis)
      onFeedbackSubmitted?.(analysis)
      setFeedbackText('')
    } finally {
      setFeedbackLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Customer Mode Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400 flex items-center gap-1.5 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Customer Self-Service Hub
          </span>
          <h2 className="text-2xl font-bold text-white">Live Branch Experience &amp; Fast-Track Pass</h2>
        </div>

        {/* Branch Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Viewing:</span>
          <select
            value={currentBranch.branch_code}
            onChange={(e) => onSelectBranch(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
          >
            {branches.map((b) => (
              <option key={b.branch_code} value={b.branch_code}>
                {b.name} ({b.current_load}% Load)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommended Alternative Branch Banner (Redirection Feature) */}
      {recommendedBranch && recommendedBranch.current_load < currentBranch.current_load && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Recommended Nearby Branch: Save ~{Math.max(10, currentBranch.avg_wait_minutes - recommendedBranch.avg_wait_minutes)} Minutes!
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  {recommendedBranch.distance_miles} miles away
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                <strong>{recommendedBranch.name}</strong> currently operates at just {recommendedBranch.current_load}% load with an estimated wait time of only {recommendedBranch.avg_wait_minutes} mins.
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectBranch(recommendedBranch.branch_code)}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-md transition-all active:scale-95"
          >
            Switch to {recommendedBranch.name.split(' ')[1]} Hub &rarr;
          </button>
        </div>
      )}

      {/* Main Status & Wait-Times Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Live Branch Status */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase">Live Branch Load</span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                currentBranch.current_load > 75
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : currentBranch.current_load > 50
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {currentBranch.current_load > 75 ? 'Busy / Rush' : currentBranch.current_load > 50 ? 'Moderate' : 'Optimal'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold font-mono text-white">
              {currentBranch.current_load}%
            </span>
            <span className="text-xs text-slate-400">capacity occupied</span>
          </div>

          <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                currentBranch.current_load > 75
                  ? 'bg-rose-500'
                  : currentBranch.current_load > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${currentBranch.current_load}%` }}
            />
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Average Wait Time:</span>
              <span className="font-bold text-white font-mono">{currentBranch.avg_wait_minutes} mins</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customers in Queue:</span>
              <span className="font-bold text-white font-mono">{currentBranch.current_queue} persons</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Counters Operating:</span>
              <span className="font-bold text-white font-mono">{currentBranch.active_counters} / {currentBranch.total_counters}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Estimated Wait Time by Service */}
        <div className="md:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Current Wait Times by Service
              </h3>
              <p className="text-xs text-slate-400">Real-time counter estimates</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              Live Sensor
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                service: 'Cash & Deposits',
                wait: currentBranch.branch_code === 'AV-CENTRAL' ? 6 : 4,
                status: 'Fast Flow (< 8m)',
                color: 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
              },
              {
                service: 'Account Opening & KYC',
                wait: currentBranch.branch_code === 'AV-CENTRAL' ? 24 : 8,
                status: currentBranch.branch_code === 'AV-CENTRAL' ? 'Moderate (~24m)' : 'Fast Flow',
                color: currentBranch.branch_code === 'AV-CENTRAL' ? 'text-amber-400 border-amber-500/20 bg-amber-950/20' : 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
              },
              {
                service: 'Loan & Mortgages',
                wait: currentBranch.branch_code === 'AV-CENTRAL' ? 42 : 12,
                status: currentBranch.branch_code === 'AV-CENTRAL' ? 'High Demand (~42m)' : 'Available',
                color: currentBranch.branch_code === 'AV-CENTRAL' ? 'text-rose-400 border-rose-500/20 bg-rose-950/20' : 'text-emerald-400 border-emerald-500/20 bg-emerald-950/20',
              },
              {
                service: 'Wealth & Foreign Exchange',
                wait: currentBranch.branch_code === 'AV-CENTRAL' ? 19 : 6,
                status: 'Advisory Active',
                color: 'text-indigo-400 border-indigo-500/20 bg-indigo-950/20',
              },
            ].map((s) => (
              <div key={s.service} className={`p-3 rounded-xl border ${s.color}`}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-200">{s.service}</span>
                  <span className="font-mono font-bold text-lg">{s.wait}m</span>
                </div>
                <p className="text-[11px] opacity-80">{s.status}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Booking & Customer Feedback Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Appointment / Fast-Track Pass */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Book Fast-Track Appointment
              </h3>
              <p className="text-xs text-slate-400">Skip the counter waiting line with guaranteed token</p>
            </div>
          </div>

          {confirmedAppt ? (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/60 to-slate-900 border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-bold text-emerald-400 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Appointment Confirmed
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  {confirmedAppt.id}
                </span>
              </div>

              <div className="text-center py-2 border-y border-indigo-500/20">
                <span className="text-xs text-slate-400 uppercase tracking-widest">Digital Queue Token</span>
                <p className="text-3xl font-extrabold text-white font-mono tracking-wider text-indigo-300">
                  {confirmedAppt.token_number}
                </p>
                <p className="text-xs text-emerald-400 mt-1">Priority Fast-Lane Access</p>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p><strong>Customer:</strong> {confirmedAppt.customer_name}</p>
                <p><strong>Service:</strong> {confirmedAppt.service_type}</p>
                <p><strong>Time Window:</strong> {confirmedAppt.slot_time}</p>
                <p><strong>Branch:</strong> {currentBranch.name}</p>
              </div>

              <button
                onClick={() => setConfirmedAppt(null)}
                className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
              >
                Book Another Appointment
              </button>
            </div>
          ) : (
            <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jessica Alba"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service Required</label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Loan & Mortgage">Loan &amp; Mortgage Consultation</option>
                  <option value="Account Opening & KYC">Account Opening &amp; KYC</option>
                  <option value="Wealth & Foreign Exchange">Wealth &amp; Foreign Exchange</option>
                  <option value="Cash & Deposits">Commercial Cash &amp; Deposits</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Time Window</label>
                <select
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="14:00 Today">14:00 Today (Recommended - Low Traffic)</option>
                  <option value="14:30 Today">14:30 Today</option>
                  <option value="15:00 Today">15:00 Today</option>
                  <option value="15:30 Today">15:30 Today (Optimal Slot)</option>
                  <option value="10:00 Tomorrow">10:00 Tomorrow Morning</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-2.5 rounded-xl font-bold uppercase tracking-wider bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                {bookingLoading ? 'Reserving...' : 'Generate Digital Token'}
              </button>
            </form>
          )}
        </div>

        {/* Submit Customer Feedback (with Instant NLP Sentiment Analysis) */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/20 text-pink-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Submit Customer Feedback
              </h3>
              <p className="text-xs text-slate-400">Instant AI sentiment processing &amp; satisfaction feedback</p>
            </div>
          </div>

          <form onSubmit={handleSendFeedback} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Satisfaction Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFeedbackRating(star)}
                    className={`p-2 rounded-xl text-sm transition-all ${
                      star <= feedbackRating
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    ★ {star}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Service Experienced</label>
              <select
                value={feedbackService}
                onChange={(e) => setFeedbackService(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Loan & Mortgage">Loan &amp; Mortgage</option>
                <option value="Cash & Deposits">Cash &amp; Deposits</option>
                <option value="Account Opening & KYC">Account Opening &amp; KYC</option>
                <option value="General Banking">General Banking Experience</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Honest Review</label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience (e.g. 'Wait time was short and teller was very polite!')"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={feedbackLoading}
              className="w-full py-2.5 rounded-xl font-bold uppercase tracking-wider bg-pink-600 hover:bg-pink-500 text-white shadow-md shadow-pink-600/30 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {feedbackLoading ? 'Analyzing NLP Sentiment...' : 'Submit & Analyze Sentiment'}
            </button>
          </form>

          {/* Instant NLP Sentiment Result */}
          {lastAnalysis && (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400">AI NLP Analysis Result:</span>
                <span
                  className={`px-2 py-0.5 rounded-full uppercase text-[10px] font-bold ${
                    lastAnalysis.sentiment === 'positive'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : lastAnalysis.sentiment === 'neutral'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {lastAnalysis.sentiment} ({lastAnalysis.score > 0 ? `+${lastAnalysis.score}` : lastAnalysis.score})
                </span>
              </div>
              <p className="text-xs text-slate-200">{lastAnalysis.ai_summary}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {lastAnalysis.key_themes.map((theme) => (
                  <span key={theme} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    🏷️ {theme}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
