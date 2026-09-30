import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Navbar } from './components/Navbar'
import { Login } from './pages/Login'
import { ManagerDashboard } from './pages/manager/ManagerDashboard'
import { BranchComparison } from './pages/manager/BranchComparison'
import { BranchDetail } from './pages/manager/BranchDetail'
import { SimulationPage } from './pages/manager/SimulationPage'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { ServiceDiscovery } from './pages/customer/ServiceDiscovery'
import { BranchFinder } from './pages/customer/BranchFinder'
import { CustomerAssistant } from './pages/customer/CustomerAssistant'

// Protected Route wrapper with role check
const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'MANAGER' | 'CUSTOMER' }> = ({
  children,
  requiredRole,
}) => {
  const { user, token, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'MANAGER' ? '/manager/dashboard' : '/customer/dashboard'} replace />
  }

  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  )
}

// Root redirect based on active user state
const HomeRedirect: React.FC = () => {
  const { role, token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e1117] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return <Navigate to={role === 'MANAGER' ? '/manager/dashboard' : '/customer/dashboard'} replace />
}

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login />} />

          {/* Root Redirect */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Manager Protected Routes */}
          <Route
            path="/manager/dashboard"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/branches"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <BranchComparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/branches/:branchId"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <BranchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/simulation"
            element={
              <ProtectedRoute requiredRole="MANAGER">
                <SimulationPage />
              </ProtectedRoute>
            }
          />

          {/* Customer Protected Routes */}
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/services"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <ServiceDiscovery />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/branches"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <BranchFinder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/assistant"
            element={
              <ProtectedRoute requiredRole="CUSTOMER">
                <CustomerAssistant />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
