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
  Zap,
  ArrowRight,
  TrendingDown,
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
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Welcome Banner: Smart Branch Concierge */}
        <div className="avenue-glass rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-cyan-500/25">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyan-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>AVENUE Smart Branch & Digital Concierge</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Intelligent Service & Queue Navigator
            </h1>
            <p className="text-sm text-slate-300 mt-2 leading-relaxed">
              Check live branch waiting times before you step out, find instant zero-wait digital banking alternatives, and get AI-assisted checklist guidance for required paperwork.
            </p>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={() => navigate('/customer/branches')}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/25 cursor-pointer"
              >
                <MapPin className="w-4 h-4" />
                <span>Find Shortest Wait Branch</span>
              </button>
              <button
                onClick={() => navigate('/customer/services')}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Browse Services & Docs</span>
              </button>
              <button
                onClick={() => navigate('/customer/assistant')}
                className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Bot className="w-4 h-4 text-indigo-400" />
                <span>Ask AVENUE AI Assistant</span>
              </button>
            </div>
          </div>
        </div>

        {/* Section: Live Network Branch Wait Times */}
        <div className="avenue-glass rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Live Branch Wait Times & Crowd Barometer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Current queue velocities and waiting times updated in real time across the branch network
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/branches')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>View All Branches</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sortedBranches.slice(0, 4).map((b) => (
              <div
                key={b.branch_id}
                onClick={() => navigate('/customer/branches', { state: { selectedBranchId: b.branch_id } })}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 transition-all duration-200 cursor-pointer group shadow-sm hover:shadow-cyan-500/10 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-mono text-cyan-400 font-bold">{b.branch_code}</span>
                  <span
                    className={`badge ${
                      b.congestion_status === 'Low Crowding'
                        ? 'badge-normal'
                        : b.congestion_status === 'Elevated'
                        ? 'badge-elevated'
                        : 'badge-moderate'
                    }`}
                  >
                    {b.congestion_status}
                  </span>
                </div>
                <h3 className="text-xs font-extrabold text-white group-hover:text-cyan-300 transition-colors">
                  {b.branch_name}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{b.city} • {b.area}</p>

                <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Current Wait:</span>
                  <span className="text-sm font-black font-mono text-cyan-300">
                    {b.avg_wait_minutes.toFixed(1)} min
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Save Time with Digital Banking (TCS PS-5 Redirection Requirement) */}
        <div className="avenue-glass rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                <span>Instant Digital Channels: Skip Branch Queue Entirely</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Save 30+ minutes — these routine requests can be resolved instantly via mobile app or web portal
              </p>
            </div>
            <button
              onClick={() => navigate('/customer/services')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer font-bold"
            >
              <span>Explore All Digital Services</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {digitalServices.slice(0, 3).map((s) => (
              <div key={s.service_id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{s.service_type}</span>
                  <span className="badge badge-normal">
                    Digital Instant
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">{s.digital_alternative}</p>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Time saved:</span>
                  </span>
                  <span className="font-mono text-emerald-300 font-bold">{s.average_service_time_min} mins</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
