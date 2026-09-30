import apiClient from './client'
import type { CustomerServiceOption, CustomerBranchView, CustomerRecommendationResult, ChatResponse } from '../types'

export async function getCustomerServiceOptions(): Promise<CustomerServiceOption[]> {
  const { data } = await apiClient.get<CustomerServiceOption[]>('/customer/service-options')
  return data
}

export async function getCustomerBranches(): Promise<CustomerBranchView[]> {
  const { data } = await apiClient.get<CustomerBranchView[]>('/customer/branches')
  return data
}

export async function getCustomerBranchRecommendation(serviceType: string, preferredArea?: string): Promise<CustomerRecommendationResult> {
  const { data } = await apiClient.post<CustomerRecommendationResult>('/customer/recommendation', {
    service_type: serviceType,
    preferred_area: preferredArea,
  })
  return data
}

export async function sendCustomerChatMessage(message: string): Promise<ChatResponse> {
  const { data } = await apiClient.post<ChatResponse>('/customer/chat', { message })
  return data
}
