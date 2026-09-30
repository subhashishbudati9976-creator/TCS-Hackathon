import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, Search, ArrowUpDown, ChevronRight, Activity, Users } from 'lucide-react'
import * as api from '../../api'
import type { NetworkBranchItem } from '../../types'

export const BranchComparison: React.FC = () => {
  const navigate = useNavigate()
  const [branches, setBranches] = useState<NetworkBranchItem[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [sortBy, setSortBy] = useState<keyof NetworkBranchItem>('load_score')
  const [sortAsc, setSortAsc] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadNetworkBranches() {
      setIsLoading(true)
      try {
        const data = await api.getNetworkBranchIntelligence()
        setBranches(data)
      } catch (err: any) {
        setError('Failed to load network branch comparison data.')
      } finally {
        setIsLoading(false)
      }
    }
    loadNetworkBranches()
  }, [])

  const handleSort = (field: keyof NetworkBranchItem) => {
    if (sortBy === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortBy(field)
      setSortAsc(false)
    }
  }

  const filtered = branches
    .filter((b) =>
      b.branch_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.branch_code.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const valA = a[sortBy] ?? 0
      const valB = b[sortBy] ?? 0
      if (valA < valB) return sortAsc ? -1 : 1
      if (valA > valB) return sortAsc ? 1 : -1
      return 0
    })

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 p-4 sm:p-6 lg:p-8 relative">
      <div className="cyber-grid absolute inset-0 opacity-25 pointer-events-none" />
      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 avenue-glass rounded-2xl p-5 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase font-mono">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Branch Operational Matrix • Avenue Intelligence</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white mt-1">
              Regional Branch Network Comparison
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live capacity utilization, peak load risk index, and customer satisfaction across all branches
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search branch or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Comparison Table */}
        <div className="avenue-glass rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 font-semibold bg-[#11151c]">
                  <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('branch_name')}>
                    <span className="flex items-center gap-1.5">
                      <span>Branch</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-3 cursor-pointer text-right" onClick={() => handleSort('load_score')}>
                    <span className="flex items-center justify-end gap-1.5">
                      <span>Load Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-3">Risk Level</th>
                  <th className="py-3 px-3 cursor-pointer text-right" onClick={() => handleSort('forecast_peak_demand')}>
                    <span className="flex items-center justify-end gap-1.5">
                      <span>Peak Demand</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-3 cursor-pointer text-right" onClick={() => handleSort('utilization_pct')}>
                    <span className="flex items-center justify-end gap-1.5">
                      <span>Utilization</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-3 cursor-pointer text-right" onClick={() => handleSort('avg_wait_minutes')}>
                    <span className="flex items-center justify-end gap-1.5">
                      <span>Avg Wait</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </span>
                  </th>
                  <th className="py-3 px-3 text-right">Bottlenecks</th>
                  <th className="py-3 px-3 text-right">Satisfaction</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filtered.map((b) => (
                  <tr key={b.branch_id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-emerald-400 text-[11px]">{b.branch_code}</span>
                        <span>{b.branch_name}</span>
                      </div>
                      <span className="block text-[11px] font-normal text-slate-400">
                        {b.city} • {b.area} ({b.counters} counters)
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-white">
                      {b.load_score.toFixed(0)}/100
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border ${
                          b.risk_level === 'Severe'
                            ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                            : b.risk_level === 'Elevated'
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {b.risk_level}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-amber-400 font-semibold">
                      {b.forecast_peak_demand}
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      {b.utilization_pct.toFixed(0)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-semibold">
                      {b.avg_wait_minutes.toFixed(1)}m
                    </td>

                    <td className="py-3 px-3 text-right">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded ${
                          b.bottleneck_count > 0 ? 'bg-rose-500/20 text-rose-300 font-bold' : 'text-slate-400'
                        }`}
                      >
                        {b.bottleneck_count}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-200">
                      {b.customer_satisfaction_pct.toFixed(1)}%
                    </td>

                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => navigate(`/manager/branches/${b.branch_id}`)}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white border border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 mx-auto transition-all cursor-pointer"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
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
