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
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161a22] border border-[#2d3748] rounded-xl p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Service Directory & Preparation Guide</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              Banking Services & Requirements
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify digital channel eligibility, required documents, and average consultation times
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search services (e.g. Loan, KYC)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0e1117] border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 shadow-inner"
              />
            </div>

            <div className="flex items-center bg-[#0e1117] border border-slate-700 rounded-lg p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'ALL' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilterType('DIGITAL')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'DIGITAL' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Online Available
              </button>
              <button
                type="button"
                onClick={() => setFilterType('BRANCH')}
                className={`px-3 py-1 rounded transition-colors cursor-pointer ${
                  filterType === 'BRANCH' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400'
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
              className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 flex flex-col justify-between hover:border-slate-600 transition-all shadow-sm space-y-4"
            >
              <div>
                {/* Badges */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {s.category_group}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {s.digital_available ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Online</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>In-Branch</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white">{s.service_type}</h3>

                <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>~{s.average_service_time_min.toFixed(0)} mins</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                    <span>Complexity: {s.complexity_level}</span>
                  </span>
                </div>

                {/* Digital Alternative Box if available */}
                {s.digital_available && (
                  <div className="mt-3 p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/25 text-xs text-emerald-300">
                    <strong className="block text-[11px] text-emerald-400 font-semibold mb-0.5">
                      💡 Self-Service Option:
                    </strong>
                    {s.digital_alternative}
                  </div>
                )}

                {/* Preparation / Documents Checklist */}
                <div className="mt-3 text-xs">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Required Paperwork / Preparation:</span>
                  </span>
                  <ul className="space-y-1 text-slate-300 text-[11px]">
                    {s.documents_required.map((doc, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  {s.appointment_recommended ? '📅 Appointment Recommended' : '⚡ Walk-ins Welcome'}
                </span>

                <button
                  type="button"
                  onClick={() => navigate('/customer/branches', { state: { selectedService: s.service_type } })}
                  className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Find Branch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
