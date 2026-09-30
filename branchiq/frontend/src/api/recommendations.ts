import apiClient from './client'
import type { OperationalRecommendation } from '../types'

export async function getBranchRecommendations(branchId: string): Promise<OperationalRecommendation[]> {
  const { data } = await apiClient.get<OperationalRecommendation[]>(`/branches/${branchId}/recommendations`)
  return data
}
