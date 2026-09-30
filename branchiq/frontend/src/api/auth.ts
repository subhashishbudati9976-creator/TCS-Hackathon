import apiClient from './client'
import type { LoginCredentials, SignupPayload, AuthResponse, UserProfile } from '../types'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', credentials)
  if (data.access_token) {
    localStorage.setItem('avenue_token', data.access_token)
    localStorage.setItem('avenue_user', JSON.stringify(data.user))
  }
  return data
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/signup', payload)
  if (data.access_token) {
    localStorage.setItem('avenue_token', data.access_token)
    localStorage.setItem('avenue_user', JSON.stringify(data.user))
  }
  return data
}

export async function getMe(): Promise<UserProfile> {
  const { data } = await apiClient.get<{ user: UserProfile }>('/auth/me')
  return data.user
}

export function logout(): void {
  localStorage.removeItem('avenue_token')
  localStorage.removeItem('avenue_user')
}
