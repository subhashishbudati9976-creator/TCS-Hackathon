import apiClient from './client'
import type {
  AnalysisSummary,
  BottleneckFeature,
  DigitalOpportunity,
  FeedbackSummary,
  HourlyDemand,
  ServiceSummary,
  BranchSummaryRow,
  WaitingTimeSummary,
  FeedbackNLPResult,
} from '../types'

export async function getAnalysisSummary(): Promise<AnalysisSummary> {
  const { data } = await apiClient.get<AnalysisSummary>('/analysis/summary')
  return data
}

export async function getBottleneckFeatures(branchId?: string, severity?: string): Promise<BottleneckFeature[]> {
  const { data } = await apiClient.get<BottleneckFeature[]>('/analysis/bottleneck-features', {
    params: { branch_id: branchId, severity },
  })
  return data
}

export async function getDigitalOpportunities(): Promise<DigitalOpportunity[]> {
  const { data } = await apiClient.get<DigitalOpportunity[]>('/analysis/digital-opportunities')
  return data
}

export async function getFeedbackSummary(): Promise<FeedbackSummary[]> {
  const { data } = await apiClient.get<FeedbackSummary[]>('/analysis/feedback-summary')
  return data
}

export async function getFeedbackNLP(branchId?: string): Promise<FeedbackNLPResult> {
  const { data } = await apiClient.get<FeedbackNLPResult>('/analysis/feedback', {
    params: branchId ? { branch_id: branchId } : {},
  })
  return data
}

export async function getHourlyDemand(): Promise<HourlyDemand[]> {
  const { data } = await apiClient.get<HourlyDemand[]>('/analysis/hourly-demand')
  return data
}

export async function getServiceSummary(): Promise<ServiceSummary[]> {
  const { data } = await apiClient.get<ServiceSummary[]>('/analysis/service-summary')
  return data
}

export async function getBranchSummaryAll(): Promise<BranchSummaryRow[]> {
  const { data } = await apiClient.get<BranchSummaryRow[]>('/analysis/branch-summary')
  return data
}

export async function getWaitingTimeSummary(): Promise<WaitingTimeSummary[]> {
  const { data } = await apiClient.get<WaitingTimeSummary[]>('/analysis/waiting-times')
  return data
}
