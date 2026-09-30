import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { BranchIQLogo } from './BranchIQLogo'
import {
  Building2,
  BarChart3,
  SlidersHorizontal,
  Bot,
  Compass,
  MapPin,
  LogOut,
  UserCheck,
  Sparkles,
  Shield,
  Layers,
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
    { to: '/manager/dashboard', label: 'Operations Dashboard', icon: BarChart3 },
    { to: '/manager/branches', label: 'Branch Network', icon: Building2 },
    { to: '/manager/simulation', label: 'What-If Simulation', icon: SlidersHorizontal },
  ]

  const customerLinks = [
    { to: '/customer/dashboard', label: 'Customer Portal', icon: Compass },
    { to: '/customer/services', label: 'Service Discovery', icon: Sparkles },
    { to: '/customer/branches', label: 'Branch Finder', icon: MapPin },
    { to: '/customer/assistant', label: 'AI Assistant', icon: Bot },
  ]

  const links = isManager ? managerLinks : customerLinks

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/85 border-b border-slate-800/90 px-4 sm:px-6 py-2.5 shadow-xl shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-6">
          <Link to={isManager ? '/manager/dashboard' : '/customer/dashboard'} className="group flex items-center gap-1">
            <BranchIQLogo size={36} subtitle="Branch Intelligence Engine" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-800/80">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-indigo-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
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
            title="Switch demo persona (Manager vs Customer)"
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800/90 text-slate-200 transition-all shadow-sm hover:border-slate-600 cursor-pointer group"
          >
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isManager ? 'bg-amber-400' : 'bg-cyan-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isManager ? 'bg-amber-500' : 'bg-cyan-500'}`} />
            </span>
            <span className="text-[11px] text-slate-400">Portal:</span>
            <span className={`font-bold tracking-wide text-xs ${isManager ? 'text-amber-400' : 'text-cyan-400'}`}>
              {role}
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:text-slate-200 group-hover:bg-slate-700 transition-colors ml-0.5">
              Switch
            </span>
          </button>

          {/* User Profile Info */}
          <div className="hidden lg:flex items-center gap-2.5 pl-2 border-l border-slate-800/80">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs border border-white/10">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-200 leading-tight">{user?.name || 'Authorized User'}</span>
              <span className="text-[10px] font-mono text-slate-400 leading-tight">{user?.email || 'user@branchiq.ai'}</span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out of BranchIQ"
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
