import React from 'react'
import type { NavView } from './Sidebar'
import type { Branch } from '../types'

interface HeaderProps {
  currentView: NavView
  currentBranch: Branch
  onToggleCustomerMode: () => void
  onRefreshData: () => void
  isRefreshing: boolean
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  currentBranch,
  onToggleCustomerMode,
  onRefreshData,
  isRefreshing,
}) => {
  const titles: Record<NavView, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Branch Operations Center',
      subtitle: `${currentBranch.name} • Real-time Service Load & Traffic Monitoring`,
    },
    bottlenecks: {
      title: 'Service Bottlenecks & Queue Matrix',
      subtitle: 'Counter saturation index and service-level capacity constraints',
    },
    recommendations: {
      title: 'Explainable AI Decision Intelligence',
      subtitle: 'Prescriptive operational actions with quantified impact projections',
    },
    simulator: {
      title: 'What-If Operational Simulator',
      subtitle: 'M/M/c Queuing model for staffing, demand surges, and counter allocation',
    },
    customer: {
      title: 'Customer Experience Portal',
      subtitle: 'Live wait times, fast-track appointment pass & alternative branch routing',
    },
    feedback: {
      title: 'Customer Sentiment Intelligence',
      subtitle: 'Natural language feedback analytics and scheduled appointment manifest',
    },
  }

  const { title, subtitle } = titles[currentView] || titles.dashboard

  return (
    <header className="h-20 border-b border-slate-800/80 px-8 flex items-center justify-between bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-30">
      <div>
        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
          <span>AVENUE Core</span>
          <span>/</span>
          <span className="text-indigo-400 font-mono uppercase">{currentBranch.branch_code}</span>
          <span>/</span>
          <span className="text-slate-200 capitalize">{currentView}</span>
        </div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        <p className="text-xs text-slate-400 hidden sm:block">{subtitle}</p>
      </div>

      <div className="flex items-center gap-3">
        {/* Simulated Time Tag */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-slate-300 font-medium">13:30 PM • Rush Hours</span>
        </div>

        {/* Refresh button */}
        <button
          onClick={onRefreshData}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all active:scale-95"
          title="Refresh real-time telemetry"
        >
          <svg
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        {/* Customer Portal Quick Mode Toggle */}
        <button
          onClick={onToggleCustomerMode}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            currentView === 'customer'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20'
          }`}
        >
          {currentView === 'customer' ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Manager Console</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Switch to Customer View</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
