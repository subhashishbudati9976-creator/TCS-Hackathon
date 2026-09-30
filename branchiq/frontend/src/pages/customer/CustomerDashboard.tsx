import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Compass,
  Sparkles,
  MapPin,
  Bot,
  Clock,
  CheckCircle2,
  ChevronRight,
  Smartphone,
  Building,
  Search,
} from 'lucide-react'
import * as api from '../../api'
import type { CustomerServiceOption, CustomerBranchView } from '../../types'

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [services, setServices] = useState<CustomerServiceOption[]>([])
  const [branches, setBranches] = useState<CustomerBranchView[]>([])
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
    <div className="min-h-screen bg-[#0e1117] text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-[#161a22] to-slate-900 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Branch & Digital Concierge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome to AVENUE Banking
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Check live branch wait times before you leave home, find instant digital alternatives, and know exactly what paperwork to bring.
            </p>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => navigate('/customer/branches')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Shortest Wait Branch</span>
              </button>
              <button
                onClick={() => navigate('/customer/services')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Browse Services & Docs</span>
              </button>
              <button
                onClick={() => navigate('/customer/assistant')}
                className="px-4 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
              >
                <Bot className="w-4 h-4 text-cyan-400" />
                <span>Ask AVENUE AI Assistant</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: Live Network Branch Wait Times */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>Live Branch Wait Times</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current estimated queue waiting times across our regional branches
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/branches')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>View All Branches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {sortedBranches.slice(0, 4).map((b, i) => (
              <div
                key={b.branch_id}
                onClick={() => navigate('/customer/branches', { state: { selectedBranchId: b.branch_id } })}
                className="p-4 rounded-xl bg-[#0e1117] border border-slate-700/80 hover:border-emerald-500/50 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono text-emerald-400 font-semibold">{b.branch_code}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      b.congestion_status === 'Low Crowding'
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    }`}
                  >
                    {b.congestion_status}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {b.branch_name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.city} • {b.area}</p>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Est. Wait:</span>
                  <span className="text-sm font-bold font-mono text-emerald-400">
                    {b.avg_wait_minutes.toFixed(1)} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Save Time with Digital Banking */}
        <div className="bg-[#161a22] border border-[#2d3748] rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Skip the Queue: Digital Banking Alternatives</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                These routine services can be completed 100% online from your mobile phone or web browser
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/services')}
              className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
            >
              <span>Explore All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {digitalServices.slice(0, 3).map((s) => (
              <div key={s.service_id} className="p-4 rounded-xl bg-[#0e1117] border border-slate-700/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{s.service_type}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Available Online
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{s.digital_alternative}</p>
                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
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
