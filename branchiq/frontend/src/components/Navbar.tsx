import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AvenueLogo } from './AvenueLogo'
import {
  Building2,
  BarChart3,
  SlidersHorizontal,
  Bot,
  Compass,
  MapPin,
  LogOut,
  Sparkles,
  Cpu,
  Activity,
  ArrowRightLeft,
} from 'lucide-react'

export const Navbar: React.FC = () => {
  const { user, role, logout, demoLogin } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const isManager = role === 'MANAGER'

  const handleRoleSwitch = async () => {
    if (isManager) {
      await demoLogin('CUSTOMER')
      navigate('/customer/dashboard')
    } else {
      await demoLogin('MANAGER')
      navigate('/manager/dashboard')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const managerLinks = [
    { to: '/manager/dashboard', label: 'Command Center', icon: BarChart3 },
    { to: '/manager/branches', label: 'Branch Network', icon: Building2 },
    { to: '/manager/simulation', label: 'What-If Simulation', icon: SlidersHorizontal },
  ]

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Customer Portal', icon: Compass },
    { to: '/customer/services', label: 'Services & KYC', icon: Sparkles },
    { to: '/customer/branches', label: 'Live Crowd Radar', icon: MapPin },
    { to: '/customer/assistant', label: 'Concierge AI', icon: Bot },
  ]

  const links = isManager ? managerLinks : customerLinks

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#050814]/90 border-b border-slate-800/80 px-4 sm:px-6 py-2.5 shadow-2xl shadow-black/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & PS-5 Indicator */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link to={isManager ? '/manager/dashboard' : '/customer/dashboard'} className="group flex items-center gap-1">
            <AvenueLogo size={36} subtitle="Branch Load Optimizer" />
          </Link>

          {/* Live AI Status Ticker */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800/80 text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="status-live-pulse absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-400 font-mono text-[10px]">AI ENGINE:</span>
            <span className="text-emerald-400 font-semibold tracking-wide">ONLINE</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400 text-[10px]">PS-5 PREDICTIVE RADAR</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 ml-2 pl-3 border-l border-slate-800/80">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-indigo-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Persona Switcher */}
          <button
            onClick={handleRoleSwitch}
            title="Switch demo persona (Operations Director vs Premier Customer)"
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 transition-all shadow-sm hover:border-cyan-500/50 cursor-pointer group"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-180 transition-transform duration-300" />
            <span className="text-[11px] text-slate-400">Mode:</span>
            <span className={`font-bold tracking-wide text-xs ${isManager ? 'text-amber-400' : 'text-cyan-400'}`}>
              {isManager ? 'Operations Manager' : 'Premier Customer'}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 group-hover:text-cyan-300 group-hover:bg-slate-700 transition-colors">
              Switch
            </span>
          </button>

          {/* User Profile Info */}
          <div className="hidden sm:flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10 ${
              isManager 
                ? 'bg-gradient-to-tr from-amber-600 to-rose-600' 
                : 'bg-gradient-to-tr from-cyan-600 to-indigo-600'
            }`}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Avenue User'}</span>
              <span className="text-[10px] font-mono text-slate-400 leading-tight">{user?.email || 'user@avenue.ai'}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out of AVENUE"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
