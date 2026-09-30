import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, AlertCircle, Building2 } from 'lucide-react'

export const Login: React.FC = () => {
  const { login, signup, demoLogin, isLoading } = useAuth()
  const navigate = useNavigate()

  const [isSignup, setIsSignup] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [role, setRole] = useState<'MANAGER' | 'CUSTOMER'>('MANAGER')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      if (isSignup) {
        await signup({ email, password, name, role })
      } else {
        await login({ email, password })
      }
      navigate(role === 'MANAGER' ? '/manager/dashboard' : '/customer/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Authentication failed. Please verify credentials.')
    }
  }

  const handleQuickDemo = async (targetRole: 'MANAGER' | 'CUSTOMER') => {
    setError(null)
    try {
      await demoLogin(targetRole)
      navigate(targetRole === 'MANAGER' ? '/manager/dashboard' : '/customer/dashboard')
    } catch (err: any) {
      setError('Could not sign into demo account. Please ensure the backend is running.')
    }
  }

  return (
    <div className="min-h-screen bg-[#0e1117] text-slate-200 flex flex-col justify-center items-center px-4 py-12">
      {/* Platform Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 mb-4 shadow-lg shadow-emerald-500/5">
          <Building2 className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span>AVENUE</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            ENTERPRISE
          </span>
        </h1>
        <p className="text-sm text-slate-400 mt-2">
          Intelligent Branch Operations & Customer Experience Optimization Platform
        </p>
      </div>

      <div className="w-full max-w-md bg-[#161a22] border border-[#2d3748] rounded-xl p-6 sm:p-8 shadow-xl">
        {/* Hackathon Evaluator Quick Access Cards */}
        <div className="mb-6 p-4 rounded-lg bg-slate-800/60 border border-slate-700/80">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2.5">
            ⚡ Hackathon Instant Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('MANAGER')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-2.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Branch Manager</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-2.5 rounded-md bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-blue-400" />
              <span>Customer Portal</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            Click either button to immediately evaluate full live operational features.
          </p>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-700 w-full" />
          <span className="bg-[#161a22] px-3 text-[11px] uppercase tracking-wider text-slate-500 absolute font-mono">
            Or Sign In With Credentials
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3 py-2 rounded-md bg-[#0e1117] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@avenue.demo"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0e1117] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-md bg-[#0e1117] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-md bg-[#0e1117] border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="MANAGER">Branch Operations Manager</option>
                <option value="CUSTOMER">Retail Banking Customer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{isSignup ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError(null)
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500">
        AVENUE — TCS Hackathon Submission 2026 • Powered by XGBoost, FastAPI & React
      </footer>
    </div>
  )
}
