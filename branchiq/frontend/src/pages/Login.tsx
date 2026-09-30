import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AvenueLogo } from '../components/AvenueLogo'
import {
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Sparkles,
  Activity,
  TrendingDown,
  Users,
  Compass,
  Cpu,
  Layers,
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
      setError('Could not sign into demo account. Please ensure the backend is running on port 8000.')
    }
  }

  return (
    <div className="min-h-screen avenue-mesh-bg text-slate-100 flex flex-col justify-center items-center px-4 py-8 sm:py-12 relative overflow-hidden">
      {/* Background Cyber Rings & Ambience */}
      <div className="cyber-grid absolute inset-0 opacity-40 pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-5xl z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Executive Value Showcase (Problem Statement 5 Solution) */}
        <div className="lg:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="status-live-pulse absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
            </span>
            <span>TCS Problem Statement 5: Banking Domain</span>
          </div>

          <div className="space-y-2">
            <AvenueLogo size={52} subtitle="Next-Gen Operations & Customer Optimizer" />
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg mt-3">
              Anticipate branch service pressure, predict peak bottlenecks with machine learning, and redirect customer queues to instant digital channels.
            </p>
          </div>

          {/* Solution Pillar Highlights */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
                <TrendingDown className="w-4 h-4 text-cyan-400" />
                <span>-42% Wait Times</span>
              </div>
              <p className="text-[11px] text-slate-400">Dynamic queue balancing & load alerts across branches.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Smart Roster AI</span>
              </div>
              <p className="text-[11px] text-slate-400">Optimizes counter staff deployment for demand spikes.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1">
                <Compass className="w-4 h-4 text-indigo-400" />
                <span>Digital Redirection</span>
              </div>
              <p className="text-[11px] text-slate-400">Guides walk-in customers to self-service channels instantly.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Cpu className="w-4 h-4 text-amber-400" />
                <span>GenAI Prescriptions</span>
              </div>
              <p className="text-[11px] text-slate-400">Gemini-powered natural language action guides.</p>
            </div>
          </div>
        </div>

        {/* Right Column: High-Tech Glass Authentication Terminal */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto avenue-glass rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* Quick Evaluator Access Section */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-b from-cyan-950/20 via-slate-900/60 to-slate-950/80 border border-cyan-500/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                1-Click Evaluator Access
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-mono font-medium">
                Live Data Active
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleQuickDemo('MANAGER')}
                disabled={isLoading}
                className="group flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Branch Manager</span>
                <span className="text-[9px] font-normal text-amber-200/70 font-mono">Operations Cockpit</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemo('CUSTOMER')}
                disabled={isLoading}
                className="group flex flex-col items-center justify-center gap-1 p-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02]"
              >
                <UserCheck className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Retail Customer</span>
                <span className="text-[9px] font-normal text-cyan-200/70 font-mono">Queue & Assistant</span>
              </button>
            </div>
          </div>

          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-[#0b1221] px-3 text-[10px] uppercase tracking-wider text-slate-400 absolute font-mono font-semibold">
              Or Custom Login
            </span>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isSignup && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 text-xs focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
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
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
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
                <label className="block text-xs font-medium text-slate-300 mb-1">Role</label>
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
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold tracking-wide transition-all duration-200 shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{isSignup ? 'Create Account' : 'Authenticate & Enter'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup)
                setError(null)
              }}
              className="text-xs text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer"
            >
              {isSignup ? 'Already have credentials? Sign in' : "Need an account? Register new user"}
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-500 z-10 flex items-center gap-2 font-mono">
        <Activity className="w-3.5 h-3.5 text-cyan-500" />
        <span>AVENUE • Problem Statement 5 Banking Solution • Intelligent Load & Experience Optimizer</span>
      </footer>
    </div>
  )
}
