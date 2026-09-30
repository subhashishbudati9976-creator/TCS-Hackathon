import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Building2,
  Search,
  ArrowUpDown,
  ChevronRight,
  Activity,
  Users,
  Clock,
  AlertTriangle,
  ThumbsUp,
} from 'lucide-react'
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

  // Summary strip metrics
  const totalBranches = branches.length
  const avgUtilization =
    totalBranches > 0
      ? branches.reduce((acc, b) => acc + (b.utilization_pct ?? 65), 0) / totalBranches
      : 65
  const maxWait =
    totalBranches > 0
      ? Math.max(...branches.map((b) => b.avg_wait_minutes ?? 0))
      : 0
  const totalBottlenecks =
    branches.reduce((acc, b) => acc + (b.bottleneck_count ?? 0), 0)

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-6 sm:py-8 space-y-7">
        {/* Page Header with Live Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0f172a] border border-[#1e293b] rounded-xl p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-emerald-400 uppercase">
              <Building2 className="w-3.5 h-3.5" />
              <span>Multi-Branch Operational Matrix</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-1">
              Regional Branch Comparison
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Live capacity utilization, peak load risks, and customer satisfaction across all 10 branches
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search branch name, code, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#090d16] border border-[#1e293b] rounded-lg pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Summary Strip (4 KPI Metrics) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Branches</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{totalBranches}</div>
            </div>
            <Building2 className="w-6 h-6 text-slate-500" />
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Network Utilization</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{avgUtilization.toFixed(1)}%</div>
            </div>
            <Activity className="w-6 h-6 text-slate-500" />
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Peak Network Wait</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">{maxWait.toFixed(1)}m</div>
            </div>
            <Clock className="w-6 h-6 text-slate-500" />
          </div>

          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Active Bottlenecks</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-1">{totalBottlenecks}</div>
            </div>
            <AlertTriangle className="w-6 h-6 text-slate-500" />
          </div>
        </div>

        {/* Full-Width Branch Operational Matrix Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-[#1e293b] text-slate-400 font-medium bg-[#0b101b] uppercase tracking-wider text-[11px]">
                  <th
                    onClick={() => handleSort('branch_name')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Branch &amp; Code</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4">Location</th>
                  <th
                    onClick={() => handleSort('load_score')}
                    className="py-3.5 px-4 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Load Score</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Operational Risk</th>
                  <th
                    onClick={() => handleSort('forecast_peak_demand')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Peak Demand</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('utilization_pct')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Utilization</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort('avg_wait_minutes')}
                    className="py-3.5 px-4 text-right cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center justify-end gap-1.5">
                      <span>Avg Wait</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-center">Bottlenecks</th>
                  <th className="py-3.5 px-4 text-right">Satisfaction</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b] text-slate-300">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      Loading regional branch intelligence...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400">
                      No branches match your search query.
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const isSevere = b.risk_level === 'Severe' || (b.load_score ?? 0) > 75
                    const isElevated = b.risk_level === 'Elevated' || (b.load_score ?? 0) > 50

                    return (
                      <tr
                        key={b.branch_id}
                        className="hover:bg-[#131d2e] transition-colors h-[54px]"
                      >
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{b.branch_name}</div>
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            {b.branch_code ?? b.branch_id}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-300 text-xs">
                          <div>{b.city}</div>
                          <div className="text-[11px] text-slate-400">{b.area ?? 'Central'}</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                          {(b.load_score ?? 35).toFixed(0)}
                          <span className="text-[10px] text-slate-500 font-normal">/100</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                              isSevere
                                ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                                : isElevated
                                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            }`}
                          >
                            {b.risk_level ?? (isSevere ? 'Severe' : isElevated ? 'Elevated' : 'Low')}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-200">
                          {b.forecast_peak_demand ?? 28} <span className="text-[10px] text-slate-500">cust/h</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                          {(b.utilization_pct ?? 65).toFixed(0)}%
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium">
                          {(b.avg_wait_minutes ?? 4.8).toFixed(1)}m
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded ${
                              (b.bottleneck_count ?? 0) > 0
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                                : 'text-slate-400'
                            }`}
                          >
                            {b.bottleneck_count ?? 0}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-emerald-400 font-medium">
                          {(b.customer_satisfaction_pct ?? 92.5).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/manager/branches/${b.branch_id}`)}
                            className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer inline-flex items-center gap-1"
                          >
                            <span>Inspect</span>
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-400" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BranchComparison
