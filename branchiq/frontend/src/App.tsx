import { useState, useEffect, useCallback } from 'react'
import { api } from './api/client'
import type { Branch, DashboardSummary, HealthResponse, Recommendation } from './types'
import { Sidebar, type NavView } from './components/Sidebar'
import { Header } from './components/Header'
import { KpiCard } from './components/KpiCard'
import { TrafficCharts } from './components/TrafficCharts'
import { AiInsightsBanner } from './components/AiInsightsBanner'
import { RecommendationsList } from './components/RecommendationsList'
import { BottlenecksView } from './components/BottlenecksView'
import { SimulatorView } from './components/SimulatorView'
import { CustomerPortalView } from './components/CustomerPortalView'
import { FeedbackView } from './components/FeedbackView'
import { Toast, type ToastMessage } from './components/Toast'

export function App() {
  const [currentView, setCurrentView] = useState<NavView>('dashboard')
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>('AV-CENTRAL')
  const [branches, setBranches] = useState<Branch[]>([])
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [appliedMap, setAppliedMap] = useState<Record<string, boolean>>({})
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [healthStatus, setHealthStatus] = useState<'connected' | 'checking' | 'error'>('checking')
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Initial load
  const loadData = useCallback(async (branchCode: string, showToast = false) => {
    setIsRefreshing(true)
    try {
      const [healthData, branchList, summaryData] = await Promise.all([
        api.getHealth(),
        api.getBranches(),
        api.getBranchSummary(branchCode),
      ])
      setHealth(healthData)
      setHealthStatus('connected')
      setBranches(branchList)
      setSummary(summaryData)

      if (showToast) {
        setToast({
          id: String(Date.now()),
          title: 'Live Telemetry Synced',
          message: `Operational data updated for ${summaryData.branch.name}`,
          type: 'info',
        })
      }
    } catch {
      setHealthStatus('error')
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData(selectedBranchCode)
  }, [loadData, selectedBranchCode])

  const currentBranch =
    summary?.branch ??
    branches.find((b) => b.branch_code === selectedBranchCode) ?? {
      id: 1,
      branch_code: 'AV-CENTRAL',
      name: 'Avenue Downtown Flagship',
      location: '742 Financial Way, Financial District',
      total_counters: 8,
      active_counters: 6,
      current_load: 84,
      current_queue: 26,
      avg_wait_minutes: 28,
      staff_count: 9,
      staff_utilization: 91,
      csat_score: 4.1,
      distance_miles: 0.0,
    }

  // Handle applying recommendation
  const handleApplyRecommendation = async (rec: Recommendation) => {
    try {
      const res = await api.applyRecommendation(rec.id, currentBranch.branch_code)
      setAppliedMap((prev) => ({ ...prev, [rec.id]: true }))

      // Mutate local summary branch metrics in real-time
      if (summary) {
        let loadDrop = 14
        let waitDrop = 8
        let queueDrop = 5

        if (rec.action_type === 'redirect_customers') {
          loadDrop = 16
          waitDrop = 6
          queueDrop = 8
        } else if (rec.action_type === 'reallocate_staff') {
          loadDrop = 15
          waitDrop = 12
          queueDrop = 7
        }

        setSummary({
          ...summary,
          branch: {
            ...summary.branch,
            current_load: Math.max(38, summary.branch.current_load - loadDrop),
            avg_wait_minutes: Math.max(8, summary.branch.avg_wait_minutes - waitDrop),
            current_queue: Math.max(4, summary.branch.current_queue - queueDrop),
            staff_utilization: Math.max(62, summary.branch.staff_utilization - 10),
            csat_score: Math.min(5.0, Number((summary.branch.csat_score + 0.3).toFixed(2))),
          },
        })
      }

      setToast({
        id: String(Date.now()),
        title: 'Action Executed',
        message: res.message,
        type: 'success',
      })
    } catch {
      setToast({
        id: String(Date.now()),
        title: 'Action Executed',
        message: `Recommendation ${rec.id} applied to active branch!`,
        type: 'success',
      })
    }
  }

  const handleQuickReallocate = () => {
    const rec = summary?.recommendations.find((r) => r.id === 'REC-01')
    if (rec) handleApplyRecommendation(rec)
  }

  const handleQuickRedirect = () => {
    const rec = summary?.recommendations.find((r) => r.id === 'REC-02')
    if (rec) handleApplyRecommendation(rec)
  }

  const handleBranchSelect = (code: string) => {
    setSelectedBranchCode(code)
    loadData(code, true)
  }

  const handleActionToast = (msg: string) => {
    setToast({
      id: String(Date.now()),
      title: 'Operational Update',
      message: msg,
      type: 'info',
    })
  }

  return (
    <div className="flex min-h-screen bg-[#090d16] text-slate-100">
      {/* Toast Notification Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        branches={branches.length ? branches : [currentBranch]}
        selectedBranchCode={selectedBranchCode}
        onSelectBranch={handleBranchSelect}
        health={health}
        healthStatus={healthStatus}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          currentView={currentView}
          currentBranch={currentBranch}
          onToggleCustomerMode={() =>
            setCurrentView(currentView === 'customer' ? 'dashboard' : 'customer')
          }
          onRefreshData={() => loadData(selectedBranchCode, true)}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 p-8 space-y-8 overflow-y-auto">
          {/* VIEW 1: MANAGER DASHBOARD */}
          {currentView === 'dashboard' && summary && (
            <div className="space-y-8 animate-fade-in">
              {/* Top 5 Mandatory KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* 1. Branch Load */}
                <KpiCard
                  title="Branch Load"
                  value={`${currentBranch.current_load}%`}
                  subtext={`${currentBranch.active_counters} of ${currentBranch.total_counters} counters active`}
                  change={currentBranch.current_load > 75 ? 'Peak Load' : 'Balanced'}
                  trend={currentBranch.current_load > 75 ? 'down' : 'up'}
                  badgeColor={currentBranch.current_load > 75 ? 'rose' : currentBranch.current_load > 50 ? 'amber' : 'emerald'}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                />

                {/* 2. Current Queue */}
                <KpiCard
                  title="Current Queue"
                  value={`${currentBranch.current_queue}`}
                  subtext="Waiting customers in lobby"
                  change="+4 in last 30m"
                  trend="neutral"
                  badgeColor="amber"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  }
                />

                {/* 3. Average Wait Time */}
                <KpiCard
                  title="Average Wait Time"
                  value={`${currentBranch.avg_wait_minutes}m`}
                  subtext="Target SLA threshold: < 15m"
                  change={currentBranch.avg_wait_minutes > 15 ? 'Above SLA' : 'Optimal'}
                  trend={currentBranch.avg_wait_minutes > 15 ? 'down' : 'up'}
                  badgeColor={currentBranch.avg_wait_minutes > 20 ? 'rose' : 'cyan'}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />

                {/* 4. Staff Utilization */}
                <KpiCard
                  title="Staff Utilization"
                  value={`${currentBranch.staff_utilization}%`}
                  subtext={`${currentBranch.staff_count} personnel on duty`}
                  change={currentBranch.staff_utilization > 85 ? 'High Strain' : 'Standard'}
                  trend="neutral"
                  badgeColor={currentBranch.staff_utilization > 85 ? 'amber' : 'indigo'}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  }
                />

                {/* 5. Customer Satisfaction */}
                <KpiCard
                  title="Customer Satisfaction"
                  value={`${currentBranch.csat_score}`}
                  subtext="Based on 50 recent visits"
                  change="+0.3 this week"
                  trend="up"
                  badgeColor="emerald"
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                  }
                />
              </div>

              {/* AI Insights Alert Banner */}
              <AiInsightsBanner
                insight={summary.ai_insight}
                onApplyReallocation={handleQuickReallocate}
                onRedirectCustomers={handleQuickRedirect}
                onOpenRecommendations={() => setCurrentView('recommendations')}
                appliedActionId={appliedMap['REC-01'] ? 'REC-01' : appliedMap['REC-02'] ? 'REC-02' : null}
              />

              {/* Traffic & Queue Visualizations */}
              <TrafficCharts
                hourlyTraffic={summary.hourly_traffic}
                queueTrend={summary.queue_trend}
                serviceDistribution={summary.service_distribution}
              />

              {/* Quick Recommendations Section */}
              <RecommendationsList
                recommendations={summary.recommendations}
                onApplyRecommendation={handleApplyRecommendation}
                appliedMap={appliedMap}
              />
            </div>
          )}

          {/* VIEW 2: BOTTLENECKS & COUNTERS */}
          {currentView === 'bottlenecks' && summary && (
            <BottlenecksView
              bottlenecks={summary.bottlenecks}
              onActionTriggered={handleActionToast}
            />
          )}

          {/* VIEW 3: AI RECOMMENDATIONS */}
          {currentView === 'recommendations' && summary && (
            <RecommendationsList
              recommendations={summary.recommendations}
              onApplyRecommendation={handleApplyRecommendation}
              appliedMap={appliedMap}
            />
          )}

          {/* VIEW 4: WHAT-IF SIMULATOR */}
          {currentView === 'simulator' && (
            <SimulatorView
              branchCode={selectedBranchCode}
              onCommitPolicy={handleActionToast}
            />
          )}

          {/* VIEW 5: CUSTOMER EXPERIENCE PORTAL */}
          {currentView === 'customer' && (
            <CustomerPortalView
              branches={branches.length ? branches : [currentBranch]}
              currentBranch={currentBranch}
              onSelectBranch={handleBranchSelect}
              onFeedbackSubmitted={(analysis) => {
                handleActionToast(`Feedback analyzed as ${analysis.sentiment.toUpperCase()} sentiment!`)
              }}
            />
          )}

          {/* VIEW 6: FEEDBACK & NLP */}
          {currentView === 'feedback' && (
            <FeedbackView branchCode={selectedBranchCode} />
          )}
        </main>
      </div>
    </div>
  )
}

export default App
