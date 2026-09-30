import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  MapPin,
  Clock,
  CheckCircle2,
  Building2,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  Search,
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
  const [searchTerm, setSearchTerm] = useState<string>('')
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

  const filteredBranches = allBranches.filter((b) =>
    b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.area.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Smart Branch Locator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Find Optimal Branch by Service &amp; Wait Time
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Select your required service to find branches with the shortest estimated waiting times and available counters
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Service Selection Dropdown */}
            <div className="flex items-center gap-2 bg-[#090d16] border border-[#1e293b] rounded-lg px-3.5 py-2">
              <label htmlFor="service-select" className="text-xs text-slate-400 whitespace-nowrap">Service:</label>
              <select
                id="service-select"
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-transparent text-xs sm:text-sm font-semibold text-slate-200 focus:outline-none cursor-pointer"
              >
                {services.map((s) => (
                  <option key={s.service_id} value={s.service_type} className="bg-[#0f172a]">
                    {s.service_type}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Search Filter */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by city or branch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>
        </div>

        {/* AI Recommended Best Branch Card */}
        {recommendation && recommendation.recommended_branches?.length > 0 && (() => {
          const topBranch = recommendation.recommended_branches[0]
          return (
            <div className="bg-[#0f172a] border border-emerald-500/30 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Recommended Branch for {recommendation.service_type}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {topBranch.branch_name}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
                    {topBranch.recommendation_reason} &bull; {topBranch.area}, {topBranch.city}
                  </p>
                </div>

                <div className="flex items-center gap-4 bg-[#090d16] border border-[#1e293b] p-4 rounded-lg">
                  <div className="text-center px-3 border-r border-[#1e293b]">
                    <span className="text-[11px] text-slate-400 block uppercase font-medium">Est. Wait</span>
                    <span className="text-2xl font-bold font-mono text-emerald-400 mt-0.5 block">
                      {topBranch.estimated_wait_minutes.toFixed(0)}m
                    </span>
                  </div>
                  <div className="text-center px-3">
                    <span className="text-[11px] text-slate-400 block uppercase font-medium">Load Status</span>
                    <span className="text-sm font-semibold text-slate-200 mt-1 block">
                      {topBranch.load_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checklist of required documents */}
              {recommendation.documents_required?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-[#1e293b] flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium">Required Papers:</span>
                  {recommendation.documents_required.map((doc, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-md bg-[#090d16] border border-[#1e293b] text-slate-300"
                    >
                      &bull; {doc}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* All Branches Comparison Cards (4 Columns on Desktop) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>All Branch Locations &amp; Live Wait Status</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {filteredBranches.length} locations available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBranches.map((b) => {
              const topBranchId = recommendation?.recommended_branches?.[0]?.branch_id
              const isRecommended = topBranchId === b.branch_id
              const isLowCrowd = b.congestion_status === 'Low Crowding'

              return (
                <div
                  key={b.branch_id}
                  className={`bg-[#0f172a] border rounded-xl p-5 flex flex-col justify-between transition-all ${
                    isRecommended
                      ? 'border-emerald-500/50 shadow-sm'
                      : 'border-[#1e293b] hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-mono text-emerald-400 font-semibold">{b.branch_code}</span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          isLowCrowd
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                        }`}
                      >
                        {b.congestion_status}
                      </span>
                    </div>

                    <h3 className="text-base font-semibold text-white">{b.branch_name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{b.city} &bull; {b.area}</p>

                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-[#1e293b]">
                        <span className="text-slate-400">Current Wait Time:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {b.avg_wait_minutes.toFixed(1)} min
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-[#1e293b]">
                        <span className="text-slate-400">Service Counters:</span>
                        <span className="font-mono text-slate-200">
                          {b.counters} active
                        </span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-400">Hours:</span>
                        <span className="font-mono text-slate-300">
                          {b.operating_hours}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-[#1e293b] flex items-center justify-between">
                    <span className="text-xs text-slate-400">Load: {b.current_load_score.toFixed(0)}/100</span>
                    {isRecommended && (
                      <span className="text-[11px] font-semibold text-emerald-400">
                        Top Recommendation
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BranchFinder
