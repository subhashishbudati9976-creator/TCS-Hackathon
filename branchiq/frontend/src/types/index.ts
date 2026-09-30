// ─────────────────────────────────────────────────────────────────────────────
// BranchIQ — shared TypeScript interfaces
// ─────────────────────────────────────────────────────────────────────────────

/** Response from GET /api/health */
export interface HealthResponse {
  status: string
  service: string
  version: string
}

/** Branch summary record (placeholder — schema will expand in later steps) */
export interface Branch {
  id: string
  name: string
  location: string
  current_load: number          // 0–100 %
  wait_time_minutes: number
}

/** Forecast data point (placeholder) */
export interface ForecastPoint {
  timestamp: string
  predicted_customers: number
  branch_id: string
}

/** Bottleneck alert (placeholder) */
export interface BottleneckAlert {
  branch_id: string
  severity: 'low' | 'medium' | 'high'
  message: string
  detected_at: string
}

/** Recommendation item (placeholder) */
export interface Recommendation {
  id: string
  branch_id: string
  action_type: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

/** Simulation result (placeholder) */
export interface SimulationResult {
  scenario_id: string
  before: Record<string, number>
  after: Record<string, number>
}

/** Feedback sentiment result (placeholder) */
export interface FeedbackAnalysis {
  feedback_id: string
  text: string
  sentiment: 'positive' | 'neutral' | 'negative'
  score: number
}
