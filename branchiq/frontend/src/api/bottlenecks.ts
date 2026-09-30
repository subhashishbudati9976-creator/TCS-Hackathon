import apiClient from './client'
import type { ServiceBottleneck } from '../types'

export async function getBranchBottlenecks(branchId: string): Promise<ServiceBottleneck[]> {
  const { data } = await apiClient.get<ServiceBottleneck[]>(`/branches/${branchId}/bottlenecks`)
  return data
}

export async function getAllBottlenecks(severity?: string): Promise<ServiceBottleneck[]> {
  const { data } = await apiClient.get<ServiceBottleneck[]>('/bottlenecks', {
    params: severity ? { severity } : {},
  })
  return data
}
