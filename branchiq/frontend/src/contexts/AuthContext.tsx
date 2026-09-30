import React, { createContext, useContext, useState, useEffect } from 'react'
import type { UserProfile, UserRole, LoginCredentials, SignupPayload } from '../types'
import * as authApi from '../api/auth'

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  role: UserRole | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
  demoLogin: (role: UserRole) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  useEffect(() => {
    const savedToken = localStorage.getItem('avenue_token')
    const savedUser = localStorage.getItem('avenue_user')
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('avenue_token')
        localStorage.removeItem('avenue_user')
      }
    } else {
      // Default to manager demo on first launch for judges convenience
      demoLogin('MANAGER').catch(() => {})
    }
    setIsLoading(false)
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      const res = await authApi.login(credentials)
      setToken(res.access_token)
      setUser(res.user)
    } finally {
      setIsLoading(false)
    }
  }

  const signup = async (payload: SignupPayload) => {
    setIsLoading(true)
    try {
      const res = await authApi.signup(payload)
      setToken(res.access_token)
      setUser(res.user)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authApi.logout()
    setToken(null)
    setUser(null)
  }

  const demoLogin = async (targetRole: UserRole) => {
    const credentials = targetRole === 'MANAGER'
      ? { email: 'manager@avenue.demo', password: 'manager123' }
      : { email: 'customer@avenue.demo', password: 'customer123' }
    
    await login(credentials)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role: user?.role ?? null,
        isLoading,
        login,
        signup,
        logout,
        demoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
