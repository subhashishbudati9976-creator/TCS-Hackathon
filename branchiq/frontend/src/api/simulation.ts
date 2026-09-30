import apiClient from './client'
import type { SimulationPayload, SimulationResult } from '../types'

export async function runSimulation(payload: SimulationPayload): Promise<SimulationResult> {
  const { data } = await apiClient.post<SimulationResult>('/simulate', payload)
  return data
}
