// ─────────────────────────────────────────────────────────────────────────────
// AVENUE / BranchIQ — Shared TypeScript Interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  service: string
  version: string
}

// ── Auth ─────────────────────────────────────────────────────────────────────
export type UserRole = 'MANAGER' | 'CUSTOMER'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  branch_id?: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupPayload {
  email: string
  password: string
  name: string
  role?: UserRole
  branch_id?: string | null
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: UserProfile
}

// ── Branch List & Overview ───────────────────────────────────────────────────
export interface BranchListItem {
  branch_id: string
  branch_code?: string
  branch_name: string
  city: string
  area?: string
  region?: string
  branch_type: string
  number_of_counters: number
  total_staff: number
  total_visits?: number
  avg_wait_minutes?: number
  p90_wait_minutes?: number
  abandonment_rate?: number
}

export interface NetworkBranchItem {
  branch_id: string
  branch_code: string
  branch_name: string
  city: string
  area: string
  total_visits: number
  avg_wait_minutes: number
  p90_wait_minutes: number
  abandonment_rate: number
  counters: number
  load_score: number
  risk_level: 'Low' | 'Moderate' | 'Elevated' | 'Severe'
  utilization_pct: number
  bottleneck_count: number
  forecast_peak_demand: number
  customer_satisfaction_pct: number
}

// ── Branch Summary ────────────────────────────────────────────────────────────
export interface BranchMetrics {
  total_visits: number
  total_appointments: number
  total_staff: number
  active_staff: number
  avg_waiting_time_minutes: number
  p90_waiting_time_minutes: number
  max_waiting_time_minutes: number
  abandoned_visits: number
  abandonment_rate_pct: number
  total_workload_hours: number
  customer_satisfaction_rating: number
  negative_feedback_count: number
}

export interface LoadAssessment {
  branch_id: string
  overall_load_score: number
  utilization_score: number
  wait_time_score: number
  queue_pressure_score: number
  complexity_score: number
  appointment_score: number
  total_workload_minutes: number
  total_capacity_minutes: number
  net_capacity_gap_minutes: number
  overall_utilization: number
  avg_waiting_time: number
  total_visits: number
  active_counters: number
  risk_level: 'Low' | 'Moderate' | 'Elevated' | 'Severe'
}

export interface BranchSummary {
  branch: BranchListItem
  metrics: BranchMetrics
  load_assessment: LoadAssessment
}

// ── Capacity ──────────────────────────────────────────────────────────────────
export interface ServiceCapacity {
  service_type: string
  required_skill: string
  request_count: number
  avg_duration_minutes: number
  workload_minutes: number
  assigned_staff_count: number
  capacity_minutes: number
  utilization_rate: number
  capacity_gap_minutes: number
  bottleneck_severity: 'Normal' | 'Moderate' | 'High' | 'Critical'
  digital_reduction_potential_minutes: number
}

export interface BranchCapacity {
  branch_id: string
  branch_name: string
  counters: number
  staff_headcount: number
  service_capacity_breakdown: ServiceCapacity[]
  branch_load_score: LoadAssessment
}

// ── Workload ──────────────────────────────────────────────────────────────────
export interface ServiceWorkload {
  service_type: string
  total_duration_minutes: number
  avg_duration: number
  workload_share: number
  total_requests: number
  avg_waiting_time: number
  p90_waiting_time: number
}

export interface HourlyProfile {
  arrival_hour: number
  arrival_count: number
  workload_minutes: number
  avg_waiting_time: number
  max_waiting_time: number
  abandoned_count: number
}

export interface DigitalOpportunity {
  total_visits: number
  total_workload_minutes: number
  digital_eligible_visits: number
  digital_eligible_workload_minutes: number
  target_adoption_rate: number
  potential_diverted_visits: number
  potential_workload_minutes_saved: number
  potential_staff_hours_saved: number
  pct_visits_reducible: number
  pct_workload_reducible: number
}

export interface BranchWorkload {
  branch_id: string
  service_workload: ServiceWorkload[]
  hourly_profile: HourlyProfile[]
  digital_diversion_opportunity: DigitalOpportunity
}

// ── Forecast ─────────────────────────────────────────────────────────────────
export interface ForecastPointItem {
  timestamp: string
  hour: number
  predicted_demand: number
  predicted_demand_precise?: number
  is_peak: boolean
  service_breakdown: Record<string, number>
}

export interface ForecastMetrics {
  MAE: number
  RMSE: number
  R2: number
  MAPE_pct?: number
}

export interface DemandForecastResponse {
  branch_id: string
  forecast_horizon_hours: number
  forecast: ForecastPointItem[]
  model: string
  metrics: ForecastMetrics
  peak_demand: number
  total_predicted_demand: number
}

// ── Bottlenecks ──────────────────────────────────────────────────────────────
export interface ServiceBottleneck {
  branch_id: string
  service: string
  time: string
  predicted_demand: number
  capacity: number
  utilization: number
  capacity_gap: number
  capacity_gap_minutes: number
  workload_minutes: number
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  queue_pressure: number
  estimated_wait_minutes: number
  required_skill: string
  assigned_staff: number
  root_causes: string[]
}

// ── Recommendations ──────────────────────────────────────────────────────────
export interface OperationalRecommendation {
  id: string
  branch_id: string
  type: 'STAFF_REASSIGNMENT' | 'DIGITAL_DIVERSION' | 'CUSTOMER_REDIRECTION' | 'APPOINTMENT_PREPARATION'
  action_type: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  action: string
  reason: string
  affected_service: string
  donor_service?: string
  staff_count?: number
  target_branch?: string
  expected_operational_effect: string
  simulatable: boolean
  simulation_params?: Record<string, any>
}

// ── Simulation ───────────────────────────────────────────────────────────────
export interface SimulationPayload {
  branch_id: string
  action_type: string
  parameters: Record<string, any>
}

export interface SimulationStateMetrics {
  total_visits: number
  workload_minutes: number
  capacity_minutes: number
  utilization: number
  utilization_pct: number
  capacity_gap_minutes: number
  avg_wait_minutes: number
  branch_load_score: number
  queue_pressure: number
}

export interface SimulationImpact {
  workload_saved_minutes: number
  utilization_change_pct: number
  wait_time_reduction_minutes: number
  capacity_gap_reduced_minutes: number
  estimated_operational_improvement: string
}

export interface SimulationResult {
  scenario_id: string
  branch_id: string
  action_type: string
  action_description: string
  parameters: Record<string, any>
  before: SimulationStateMetrics
  after: SimulationStateMetrics
  impact: SimulationImpact
}

// ── Feedback & NLP ───────────────────────────────────────────────────────────
export interface ComplaintItem {
  topic: string
  count: number
  percentage: number
}

export interface ServiceSentimentItem {
  service_type: string
  positive: number
  neutral: number
  negative: number
  total: number
  satisfaction_rate: number
}

export interface RecentFeedbackItem {
  feedback_id: string
  customer_id: string
  branch_id: string
  timestamp: string
  service_type: string
  rating: number
  sentiment: string
  issue_category: string
  waiting_time_experienced: number
  feedback_text: string
}

export interface FeedbackNLPResult {
  total_feedback: number
  sentiment_distribution: { Positive: number; Neutral: number; Negative: number }
  sentiment_percentages: { Positive: number; Neutral: number; Negative: number }
  top_complaints: ComplaintItem[]
  service_sentiment: ServiceSentimentItem[]
  recent_feedback: RecentFeedbackItem[]
  negative_keywords: string[]
  average_rating: number
}

// ── Customer Experience ──────────────────────────────────────────────────────
export interface CustomerServiceOption {
  service_id: string
  service_type: string
  category_group: string
  average_service_time_min: number
  complexity_level: string
  digital_available: boolean
  branch_required: boolean
  digital_alternative: string
  documents_required: string[]
  appointment_recommended: boolean
  best_time_to_visit: string
}

export interface CustomerBranchView {
  branch_id: string
  branch_code: string
  branch_name: string
  city: string
  area: string
  latitude?: number
  longitude?: number
  counters: number
  operating_hours: string
  avg_wait_minutes: number
  current_load_score: number
  risk_level: string
  congestion_status: string
}

export interface RecommendedBranchCard {
  rank: number
  branch_id: string
  branch_name: string
  area: string
  city: string
  estimated_wait_minutes: number
  load_status: string
  load_score: number
  service_available: boolean
  recommendation_reason: string
}

export interface CustomerRecommendationResult {
  service_type: string
  digital_available: boolean
  digital_alternative: string
  documents_required: string[]
  appointment_recommended: boolean
  recommended_branches: RecommendedBranchCard[]
}

export interface ChatResponse {
  reply: string
  detected_service: string | null
  detected_branch: string | null
  is_grounded: boolean
}

// ── Bundled Intelligence ─────────────────────────────────────────────────────
export interface BranchIntelligenceBundle {
  branch_id: string
  summary: BranchSummary
  capacity: BranchCapacity
  workload: BranchWorkload
  forecast: DemandForecastResponse
  bottlenecks: ServiceBottleneck[]
  recommendations: OperationalRecommendation[]
  feedback: FeedbackNLPResult
}

// ── Waiting Times ────────────────────────────────────────────────────────────
export interface WaitStats {
  mean: number
  median: number
  p75: number
  p90: number
  p95: number
  max: number
  min: number
}

export interface BranchWaitingTimes {
  branch_id: string
  overall: WaitStats
  by_service: Array<{ service_type: string; mean: number; median: number; p90: number; max: number; count: number }>
  by_hour: Array<{ arrival_hour: number; mean: number; median: number; p90: number; max: number; count: number }>
  channel_comparison: Array<{ channel: string; mean: number; median: number; p90: number; count: number }>
}

// ── Analysis ─────────────────────────────────────────────────────────────────
export interface AnalysisSummary {
  total_branches: number
  total_staff: number
  total_visits: number
  avg_wait_minutes: number
  p90_wait_minutes: number
  overall_abandonment_rate: number
  avg_satisfaction_rating: number
}

export interface HourlyDemand {
  arrival_hour: number
  arrivals: number
  total_workload_minutes: number
  avg_waiting_time: number
  abandonment_count: number
}

export interface FeedbackSummary {
  issue_category: string
  count: number
  avg_rating: number
  avg_wait_minutes: number
  positive_count: number
  neutral_count: number
  negative_count: number
}

export interface ServiceSummary {
  service_type: string
  total_requests: number
  avg_duration: number
  workload_share_pct: number
  avg_waiting_time: number
  complexity_level: string
}

export interface BottleneckFeature {
  branch_id: string
  branch_name: string
  hour: number
  arrivals: number
  workload_minutes: number
  avg_waiting_time: number
  severity_indicator: 'Normal' | 'Moderate' | 'High' | 'Critical'
}

export interface BranchSummaryRow {
  branch_id: string
  branch_name: string
  city: string
  total_visits: number
  avg_wait_minutes: number
  p90_wait_minutes: number
  abandonment_rate: number
  total_workload_hours: number
  avg_satisfaction: number
}

export interface WaitingTimeSummary {
  dimension: string
  category: string
  count: number
  mean_wait_time: number
  median_wait_time: number
  p75_wait_time: number
  p90_wait_time: number
  p95_wait_time: number
  max_wait_time: number
}
