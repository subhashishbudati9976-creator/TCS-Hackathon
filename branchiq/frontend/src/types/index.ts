// ─────────────────────────────────────────────────────────────────────────────
// AVENUE — shared TypeScript interfaces
// ─────────────────────────────────────────────────────────────────────────────

export interface HealthResponse {
  status: string
  service: string
  version: string
}

export interface Branch {
  id: number | string
  branch_code: string
  name: string
  location: string
  total_counters: number
  active_counters: number
  current_load: number          // 0–100 %
  current_queue: number
  avg_wait_minutes: number
  staff_count: number
  staff_utilization: number    // 0–100 %
  csat_score: number           // 1.0 - 5.0
  distance_miles: number
}

export interface ForecastPoint {
  hour: string
  predicted_customers: number
  actual_customers: number | null
  predicted_wait_minutes: number
  counter_capacity: number
}

export interface QueueTrendPoint {
  hour: string
  active_queue: number
  completed_services: number
  avg_service_time: number
}

export interface ServiceDemandPoint {
  service: string
  demand_share: number
  current_waiting: number
  avg_duration_mins: number
  status: 'optimal' | 'strained' | 'critical'
}

export interface BottleneckAlert {
  id: number | string
  branch_code: string
  service_name: string
  severity: 'low' | 'medium' | 'high'
  queue_length: number
  avg_wait_minutes: number
  capacity_per_hour: number
  staff_allocated: number
  impact_reason: string
  recommended_action: string
}

export interface Recommendation {
  id: string
  branch_code: string
  action_type: 'reallocate_staff' | 'redirect_customers' | 'promote_appointments' | 'open_counter' | string
  title: string
  description: string
  explanation: string
  priority: 'low' | 'medium' | 'high'
  estimated_impact: string
  applied: boolean
}

export interface SimulationRequest {
  branch_code: string
  staff_count: number
  demand_multiplier: number
  active_counters: number
  cross_trained_reallocated: number
}

export interface FeedbackRequest {
  branch_code: string
  customer_name: string
  service_type: string
  rating: number
  comment: string
}

export interface SimulationMetrics {
  branch_load: number
  avg_wait_minutes: number
  queue_pressure: number
  staff_utilization: number
  predicted_csat: number
}

export interface SimulationResult {
  scenario_id: string
  branch_code: string
  before: SimulationMetrics
  after: SimulationMetrics
  delta: {
    branch_load: number
    avg_wait_minutes: number
    queue_pressure: number
    staff_utilization: number
    predicted_csat: number
  }
  ai_verdict: string
}

export interface FeedbackItem {
  id: number | string
  branch_code: string
  customer_name: string
  service_type: string
  rating: number
  comment: string
  sentiment: 'positive' | 'neutral' | 'negative'
  sentiment_score: number
  created_at: string
}

export interface FeedbackAnalysis {
  feedback_id: string
  branch_code: string
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
  key_themes: string[]
  ai_summary: string
  id?: number | string
  rating?: number
  customer_name?: string
  service_type?: string
}

export interface Appointment {
  id: string
  branch_code: string
  customer_name: string
  service_type: string
  slot_time: string
  token_number: string
  status: string
}

export interface AIInsight {
  title: string
  summary: string
  confidence: number
  urgency: string
  timestamp: string
}

export interface DashboardSummary {
  branch: Branch
  all_branches: Branch[]
  ai_insight: AIInsight
  recommendations: Recommendation[]
  bottlenecks: BottleneckAlert[]
  hourly_traffic: ForecastPoint[]
  queue_trend: QueueTrendPoint[]
  service_distribution: ServiceDemandPoint[]
}
