import apiClient from './client'
import type {
  BranchListItem,
  BranchSummary,
  BranchCapacity,
  BranchWorkload,
  BranchWaitingTimes,
  BranchIntelligenceBundle,
  NetworkBranchItem,
} from '../types'

export async function getBranches(): Promise<BranchListItem[]> {
  const { data } = await apiClient.get<BranchListItem[]>('/branches')
  return data
}

export async function getBranchSummary(branchId: string): Promise<BranchSummary> {
  const { data } = await apiClient.get<BranchSummary>(`/branches/${branchId}/summary`)
  return data
}

export async function getBranchCapacity(branchId: string): Promise<BranchCapacity> {
  const { data } = await apiClient.get<BranchCapacity>(`/branches/${branchId}/capacity`)
  return data
}

export async function getBranchWorkload(branchId: string): Promise<BranchWorkload> {
  const { data } = await apiClient.get<BranchWorkload>(`/branches/${branchId}/workload`)
  return data
}

export async function getBranchWaitingTimes(branchId: string): Promise<BranchWaitingTimes> {
  const { data } = await apiClient.get<BranchWaitingTimes>(`/branches/${branchId}/waiting-times`)
  return data
}

export async function getBranchIntelligence(branchId: string): Promise<BranchIntelligenceBundle> {
  const { data } = await apiClient.get<BranchIntelligenceBundle>(`/branches/${branchId}/intelligence`)
  return data
}

export async function getNetworkBranchIntelligence(): Promise<NetworkBranchItem[]> {
  const { data } = await apiClient.get<NetworkBranchItem[]>('/intelligence/branches')
  return data
}
