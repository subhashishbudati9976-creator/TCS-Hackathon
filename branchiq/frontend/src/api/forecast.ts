import apiClient from './client'
import type { DemandForecastResponse } from '../types'

export async function getBranchForecast(branchId: string, horizonHours: number = 8): Promise<DemandForecastResponse> {
  const { data } = await apiClient.get<DemandForecastResponse>(`/branches/${branchId}/forecast`, {
    params: { horizon_hours: horizonHours },
  })
  return data
}

export async function createForecast(branchId: string, horizonHours: number = 8): Promise<DemandForecastResponse> {
  const { data } = await apiClient.post<DemandForecastResponse>('/forecast', {
    branch_id: branchId,
    horizon_hours: horizonHours,
  })
  return data
}
