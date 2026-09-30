import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  MapPin,
  Bot,
  Clock,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  Building,
  Search,
  Layers,
  ArrowRight,
} from 'lucide-react'
import * as api from '../../api'
import type { CustomerServiceOption, CustomerBranchView } from '../../types'

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<CustomerServiceOption[]>([])
  const [branches, setBranches] = useState<CustomerBranchView[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    async function loadData() {
      try {
        const [svcList, brList] = await Promise.all([
          api.getCustomerServiceOptions(),
          api.getCustomerBranches(),
        ])
        setServices(svcList)
        setBranches(brList)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const digitalServices = services.filter((s) => s.digital_available)
  const sortedBranches = [...branches].sort((a, b) => a.avg_wait_minutes - b.avg_wait_minutes)

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Welcome Banner */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold mb-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Branch Concierge &amp; Digital Guidance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to AVENUE Banking
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Check live branch waiting times, discover fast digital self-service alternatives, and verify exact documentation required before your visit.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={() => navigate('/customer/branches')}
                className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Shortest Wait Branch</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/services')}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Browse Service Directory</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/customer/assistant')}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs sm:text-sm font-medium flex items-center gap-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-sky-400" />
                <span>Ask AVENUE Assistant</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: Live Network Branch Wait Times */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Live Branch Wait Times</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current estimated queue waiting times across our regional branch network
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/branches')}
              className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View All Branches</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedBranches.slice(0, 4).map((b) => (
              <div
                key={b.branch_id}
                onClick={() => navigate('/customer/branches', { state: { selectedBranchId: b.branch_id } })}
                className="p-5 rounded-lg bg-[#090d16] border border-[#1e293b] hover:border-emerald-500/40 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono text-emerald-400 font-semibold">{b.branch_code}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase tracking-wider ${
                        b.congestion_status === 'Low Crowding'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/25'
                      }`}
                    >
                      {b.congestion_status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                    {b.branch_name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{b.city} &bull; {b.area}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1e293b] flex items-center justify-between">
                  <span className="text-xs text-slate-400">Est. Wait:</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {b.avg_wait_minutes.toFixed(1)} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Save Time with Digital Banking */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Skip the Queue: Digital Banking Alternatives</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These routine services can be completed 100% online from your mobile app or web portal
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/customer/services')}
              className="text-xs sm:text-sm text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>Explore All Services</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {digitalServices.slice(0, 3).map((s) => (
              <div key={s.service_id} className="p-5 rounded-lg bg-[#090d16] border border-[#1e293b] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-white">{s.service_type}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                      Online Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.digital_alternative}</p>
                </div>
                <div className="pt-3 border-t border-[#1e293b] text-xs text-slate-400 flex items-center justify-between">
                  <span>Branch duration saved:</span>
                  <span className="font-mono text-emerald-400 font-semibold">{s.average_service_time_min} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerDashboard
