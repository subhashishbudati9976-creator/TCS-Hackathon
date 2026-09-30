import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Calendar,
  ChevronRight,
  Smartphone,
  Building,
  Filter,
  Zap,
} from 'lucide-react'
import * as api from '../../api'
import type { CustomerServiceOption } from '../../types'

export const ServiceDiscovery: React.FC = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<CustomerServiceOption[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [filterType, setFilterType] = useState<'ALL' | 'DIGITAL' | 'BRANCH'>('ALL')
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadServices() {
      try {
        const data = await api.getCustomerServiceOptions()
        setServices(data)
      } finally {
        setIsLoading(false)
      }
    }
    loadServices()
  }, [])

  const filtered = services.filter((s) => {
    const matchesSearch =
      s.service_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category_group.toLowerCase().includes(searchTerm.toLowerCase())
    if (filterType === 'DIGITAL') return matchesSearch && s.digital_available
    if (filterType === 'BRANCH') return matchesSearch && s.branch_required
    return matchesSearch
  })

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="avenue-glass rounded-2xl p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-cyan-500/25">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Service Directory & Preparation Guide • AVENUE</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              Banking Services & Requirements
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify digital channel eligibility, required documents, and average consultation times
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search services (e.g. Loan, KYC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner"
              />
            </div>

            <div className="flex items-center bg-slate-900/90 border border-slate-700/80 rounded-xl p-1 text-xs font-mono">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filterType === 'ALL' 
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('DIGITAL')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filterType === 'DIGITAL' 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Online Available
              </button>
              <button
                type="button"
                onClick={() => setFilterType('BRANCH')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                  filterType === 'BRANCH' 
                    ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                In-Branch Required
              </button>
            </div>
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => (
            <div
              key={s.service_id}
              className="avenue-glass rounded-2xl p-5 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-xl space-y-4 group hover:-translate-y-1"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    {s.category_group}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {s.digital_available ? (
                      <span className="badge badge-normal flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Online Fast-Track</span>
                      </span>
                    ) : (
                      <span className="badge badge-moderate flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>In-Branch Desk</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  {s.service_type}
                </h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2 font-mono">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>~{s.average_service_time_min.toFixed(0)} mins</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Tier: {s.complexity_level}</span>
                  </span>
                </div>

                {/* Digital Alternative Box if available */}
                {s.digital_available && (
                  <div className="mt-3 p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-xs text-cyan-200">
                    <strong className="block text-[11px] text-cyan-300 font-bold mb-0.5 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      Zero-Wait Self-Service:
                    </strong>
                    {s.digital_alternative}
                  </div>
                )}

                {/* Preparation / Documents Checklist */}
                <div className="mt-3.5 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mb-1.5 font-mono">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Required Paperwork / Verification:</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {s.documents_required.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {s.appointment_recommended ? '📅 Slot Booking Advised' : '⚡ Walk-in Token Ready'}
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/customer/branches', { state: { selectedService: s.service_type } })}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-cyan-600 border border-slate-700 hover:border-cyan-500 text-slate-200 hover:text-white text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-sm"
                >
                  <span>Find Branch</span>
                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
