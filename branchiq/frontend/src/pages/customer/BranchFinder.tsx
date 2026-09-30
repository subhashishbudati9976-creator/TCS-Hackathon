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
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Service Selector */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Smart Branch Recommendation</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Find the Lowest-Wait Branch
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Select your required service to find branches with the shortest queues and active counters
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0e1117] border border-slate-700 rounded-lg px-3 py-2">
            <span className="text-xs text-slate-400">Service:</span>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              {services.map((s) => (
                <option key={s.service_id} value={s.service_type} className="bg-[#161a22]">
                  {s.service_type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Digital Availability Callout */}
        {recommendation?.digital_available && (
          <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  ⚡ Online Self-Service Alternative
                </span>
                <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
                  {recommendation.digital_alternative}
                </p>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  You can complete this service right now without visiting a branch.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/customer/assistant')}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold whitespace-nowrap cursor-pointer shadow-sm"
            >
              Ask Assistant
            </button>
          </div>
        )}

        {/* Top 3 Recommended Branches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Recommended Branches for {selectedService}</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">Ranked by lowest queue congestion</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendation?.recommended_branches.map((b) => (
              <div
                key={b.branch_id}
                className="bg-[#161a22] border border-emerald-500/30 rounded-xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-emerald-500/60 transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 bg-emerald-600/30 border-b border-l border-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-bl-md">
                  Rank #{b.rank}
                </div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-bold mb-1">
                    <span>{b.branch_id}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white">{b.branch_name}</h3>
                  <p className="text-xs text-slate-400">{b.city} • {b.area}</p>

                  <div className="mt-4 p-3 rounded-lg bg-[#0e1117] border border-slate-700/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Estimated Wait</span>
                      <span className="text-xl font-bold font-mono text-emerald-400 mt-0.5 block">
                        {b.estimated_wait_minutes.toFixed(1)} min
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        b.load_status === 'Low Crowding'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {b.load_status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-3 italic leading-relaxed">
                    "{b.recommendation_reason}"
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Counters Available</span>
                  </span>
                  <button
                    onClick={() => navigate('/customer/assistant')}
                    className="text-xs text-slate-300 hover:text-white underline cursor-pointer"
                  >
                    Get directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Network Branches Full Table */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
          <h2 className="text-sm font-bold text-white mb-3">All Regional Branch Wait Times</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-medium bg-[#11151c]">
                  <th className="py-2.5 px-3">Branch</th>
                  <th className="py-2.5 px-3">City / Area</th>
                  <th className="py-2.5 px-3">Operating Hours</th>
                  <th className="py-2.5 px-3 text-right">Counters</th>
                  <th className="py-2.5 px-3 text-right">Estimated Wait</th>
                  <th className="py-2.5 px-3 text-center">Crowding Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {allBranches.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-white">
                      {b.branch_name} <span className="font-mono text-slate-400 text-[11px]">({b.branch_id})</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{b.city} • {b.area}</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{b.operating_hours}</td>
                    <td className="py-2.5 px-3 text-right font-mono">{b.counters}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                      {b.avg_wait_minutes.toFixed(1)}m
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          b.congestion_status === 'Low Crowding'
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
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
