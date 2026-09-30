import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  Building2,
  AlertCircle,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  Navigation,
} from 'lucide-react'
import * as api from '../../api'
import type { CustomerRecommendationResult, CustomerBranchView, CustomerServiceOption } from '../../types'

export const BranchFinder: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const navState = (location.state as any) || {}

  const [services, setServices] = useState<CustomerServiceOption[]>([])
  const [selectedService, setSelectedService] = useState<string>(navState.selectedService || 'Account Opening')
  const [recommendation, setRecommendation] = useState<CustomerRecommendationResult | null>(null)
  const [allBranches, setAllBranches] = useState<CustomerBranchView[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [svcList, brList] = await Promise.all([
          api.getCustomerServiceOptions(),
          api.getCustomerBranches(),
        ])
        setServices(svcList)
        setAllBranches(brList)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!selectedService) return

    async function fetchRecommendation() {
      setIsLoading(true)
      try {
        const rec = await api.getCustomerBranchRecommendation(selectedService)
        setRecommendation(rec)
      } catch (err) {
        console.error('Failed to get recommendation', err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecommendation()
  }, [selectedService])

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header with Service Selector */}
        <div className="avenue-glass rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-cyan-500/25">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase font-mono">
              <MapPin className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>Smart Branch Queue Radar • TCS PS-5</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              Find the Lowest-Wait Branch
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your required service to find branches with the shortest queues and dedicated counters
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl px-3.5 py-2 shadow-inner">
            <span className="text-xs font-bold text-slate-400 font-mono">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {services.map((s) => (
                <option key={s.service_id} value={s.service_type} className="bg-slate-900 text-slate-200">
                  {s.service_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Digital Availability Callout (TCS Problem Statement 5 Direct Redirection) */}
        {recommendation?.digital_available && (
          <div className="bg-gradient-to-r from-cyan-950/70 via-slate-900 to-indigo-950/70 border border-cyan-500/40 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 shrink-0 border border-cyan-500/40 shadow-md shadow-cyan-500/10">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 font-mono flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5" />
                  Instant Digital Self-Service Available
                </span>
                <p className="text-xs text-slate-200 mt-1 leading-relaxed max-w-2xl">
                  {recommendation.digital_alternative}
                </p>
                <span className="text-[11px] text-cyan-400/90 mt-1 block font-mono">
                  ● Save 30+ minutes — complete this request instantly without travelling to a branch.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/customer/assistant')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold whitespace-nowrap cursor-pointer shadow-md shadow-cyan-600/20"
            >
              Ask AI Concierge
            </button>
          </div>
        )}

        {/* Top 3 Recommended Branches */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Recommended Branches for <strong className="text-cyan-300">{selectedService}</strong></span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Ranked by minimum queue velocity</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendation?.recommended_branches.map((b) => (
              <div
                key={b.branch_id}
                className="avenue-glass border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-col justify-between space-y-4 hover:border-cyan-500/60 transition-all relative overflow-hidden group hover:-translate-y-1"
              >
                <div className="absolute top-0 right-0 bg-cyan-600/30 border-b border-l border-cyan-500/40 text-cyan-200 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-bl-xl">
                  Rank #{b.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold mb-1">
                    <span>{b.branch_id}</span>
                  </div>
                  <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                    {b.branch_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{b.city} • {b.area}</p>

                  <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-baseline justify-between shadow-inner">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-semibold text-slate-400 block">Est. Waiting Time</span>
                      <span className="text-2xl font-black font-mono text-cyan-300 mt-0.5 block">
                        {b.estimated_wait_minutes.toFixed(1)} min
                      </span>
                    </div>

                    <span
                      className={`badge ${
                        b.load_status === 'Low Crowding'
                          ? 'badge-normal'
                          : 'badge-moderate'
                      }`}
                    >
                      {b.load_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 italic leading-relaxed">
                    "{b.recommendation_reason}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Counters Active</span>
                  </span>
                  <button
                    onClick={() => navigate('/customer/assistant')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Check Docs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Network Branches Full Table */}
        <div className="avenue-glass rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>All Regional Branch Waiting Times</span>
            </h2>
            <span className="badge badge-normal font-mono text-[9px]">Live Data Sync</span>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>City / Area</th>
                  <th>Operating Hours</th>
                  <th className="text-right">Counters</th>
                  <th className="text-right">Estimated Wait</th>
                  <th className="text-center">Crowding Level</th>
                </tr>
              </thead>
              <tbody>
                {allBranches.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-800/40">
                    <td className="font-bold text-white">
                      {b.branch_name} <span className="font-mono text-cyan-400 text-[11px]">({b.branch_id})</span>
                    </td>
                    <td className="text-slate-400">{b.city} • {b.area}</td>
                    <td className="text-slate-400 font-mono text-[11px]">{b.operating_hours}</td>
                    <td className="text-right font-mono">{b.counters}</td>
                    <td className="text-right font-mono font-bold text-cyan-300">
                      {b.avg_wait_minutes.toFixed(1)}m
                    </td>
                    <td className="text-center">
                      <span
                        className={`badge ${
                          b.congestion_status === 'Low Crowding'
                            ? 'badge-normal'
                            : 'badge-moderate'
                        }`}
                      >
                        {b.congestion_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
