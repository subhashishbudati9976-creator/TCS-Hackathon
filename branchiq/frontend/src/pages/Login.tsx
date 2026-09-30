import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BranchIQLogo } from '../components/BranchIQLogo'
import { ShieldCheck, UserCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles, Activity } from 'lucide-react'

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
      setError('Could not sign into demo account. Please ensure the backend is running on port 8000.')
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Ambient Glow Orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Platform Header */}
      <div className="text-center mb-8 max-w-lg z-10">
        <div className="inline-flex items-center justify-center mb-4">
          <BranchIQLogo size={52} subtitle="Intelligent Branch Operations & Flow Optimization" />
        </div>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          AI-driven operations cockpit predicting bottlenecks, optimizing counter staffing, and guiding bank customers in real time.
        </p>
      </div>

      <div className="w-full max-w-md backdrop-blur-2xl bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/60 z-10">
        {/* Hackathon Evaluator Quick Access Cards */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-b from-slate-800/60 to-slate-950/60 border border-slate-700/80 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              1-Click Demo Evaluation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
              Live APIs
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleQuickDemo('MANAGER')}
              disabled={isLoading}
              className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-amber-500/15 via-amber-500/5 to-transparent hover:from-amber-500/25 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-amber-500/10 hover:scale-[1.02]"
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Branch Manager</span>
              <span className="text-[10px] font-normal text-amber-200/60">Operations Cockpit</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('CUSTOMER')}
              disabled={isLoading}
              className="group flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-gradient-to-br from-cyan-500/15 via-blue-500/5 to-transparent hover:from-cyan-500/25 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs font-semibold transition-all duration-200 cursor-pointer shadow-sm hover:shadow-cyan-500/10 hover:scale-[1.02]"
            >
              <UserCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold">Customer Portal</span>
              <span className="text-[10px] font-normal text-cyan-200/60">Queue & AI Assist</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-3 leading-normal">
            Click either persona to test live ML forecasts, scenario simulations, and customer queue intelligence.
          </p>
        </div>

        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] uppercase tracking-wider text-slate-500 absolute font-mono font-semibold">
            Or Sign In With Account
          </span>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@avenue.demo"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500 font-mono"
              />
            </div>
          </div>

          {isSignup && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              >
                <option value="MANAGER">Branch Operations Manager</option>
                <option value="CUSTOMER">Retail Banking Customer</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer mt-3"
          >
            <span>{isSignup ? 'Create Account' : 'Authenticate & Enter'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup)
              setError(null)
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
          >
            {isSignup ? 'Already have credentials? Sign in' : "New team evaluator? Switch to register"}
          </button>
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-slate-500 z-10 flex items-center gap-2 font-mono">
        <Activity className="w-3.5 h-3.5 text-cyan-500" />
        <span>BranchIQ • TCS Hackathon Submission 2026 • AI Engine & Operations Cockpit</span>
      </footer>
    </div>
  )
}
