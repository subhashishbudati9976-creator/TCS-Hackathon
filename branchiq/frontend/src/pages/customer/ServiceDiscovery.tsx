import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Smartphone,
  Building,
  Layers,
  ChevronRight,
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
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Layers className="w-3.5 h-3.5" />
              <span>Service Directory &amp; Requirements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Banking Services &amp; Documentation Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify digital channel eligibility, required documents, and average consultation times
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search service name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#090d16] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-[#090d16] border border-[#1e293b] rounded-lg p-1 text-xs font-medium">
              {(['ALL', 'DIGITAL', 'BRANCH'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                    filterType === t
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t === 'ALL' ? 'All' : t === 'DIGITAL' ? 'Digital' : 'In-Branch'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid (3 Columns on Desktop) */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading service directory...
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-12 text-center text-slate-400 text-xs">
            No banking services found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((s) => (
              <div
                key={s.service_id}
                className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {s.category_group}
                    </span>
                    {s.digital_available ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Online Available</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                        <Building className="w-3 h-3 text-slate-400" />
                        <span>Branch Only</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-semibold text-white">{s.service_type}</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Standard {s.complexity_level.toLowerCase()} complexity banking transaction under {s.category_group.toLowerCase()}.
                  </p>

                  {s.digital_available && (
                    <div className="mt-3.5 p-3 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs">
                      <span className="text-emerald-400 font-semibold block mb-0.5">Online Alternative:</span>
                      <span className="text-slate-300">{s.digital_alternative}</span>
                    </div>
                  )}

                  {/* Required Documents */}
                  <div className="mt-4 pt-3 border-t border-[#1e293b]">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                      Required Documents to Bring:
                    </span>
                    <ul className="space-y-1.5">
                      {s.documents_required.map((doc, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{doc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-[#1e293b] flex items-center justify-between text-xs">
                  <div className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Avg Duration: <strong className="text-white font-mono">{s.average_service_time_min} mins</strong></span>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate('/customer/branches', { state: { selectedService: s.service_type } })}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Find Branch</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ServiceDiscovery
