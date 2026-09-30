import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Building2,
} from 'lucide-react'

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
    <div className="min-h-screen bg-[#090d16] text-slate-200 flex flex-col justify-center items-center px-4 py-12">
      {/* Platform Branding Header */}
      <div className="text-center mb-8 max-w-md">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold text-lg mb-3 tracking-wider">
          AV
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
          <span>AVENUE</span>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            ENTERPRISE
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
          Intelligent Branch Operations &amp; Customer Experience Platform
        </p>
      </div>

      <div className="w-full max-w-md bg-[#0f172a] border border-[#1e293b] rounded-xl p-6 sm:p-8 shadow-sm">
        {/* Instant Demo Access for Evaluators */}
        <div className="mb-6 p-4 rounded-lg bg-[#090d16] border border-[#1e293b]">
          <span className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase block mb-2.5">
            ⚡ Quick Demo Access
          </span>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('MANAGER')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-2.5 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Branch Manager</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 p-2.5 rounded-md bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/25 text-sky-300 text-xs font-semibold transition-all cursor-pointer"
            >
              <UserCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Customer Portal</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-2.5">
            Click either button to evaluate live operations immediately.
          </p>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-[#1e293b] w-full" />
          <span className="bg-[#0f172a] px-3 text-[11px] uppercase tracking-wider text-slate-500 absolute font-mono">
            Or Sign In With Email
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
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
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@avenue.demo"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#090d16] border border-[#1e293b] text-xs sm:text-sm text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="MANAGER">Branch Operations Manager</option>
                <option value="CUSTOMER">Retail Banking Customer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm mt-2"
          >
            <span>{isSignup ? 'Create Account' : 'Sign In to Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors"
          >
            {isSignup ? 'Already have an account? Sign In' : 'Need a new account? Register here'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
