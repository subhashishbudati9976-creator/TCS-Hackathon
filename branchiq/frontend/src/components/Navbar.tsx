import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
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
    <header className="sticky top-0 z-50 bg-[#161a22] border-b border-[#2d3748] px-4 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to={isManager ? '/manager/dashboard' : '/customer/dashboard'} className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-sm">
              AV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-slate-100">AVENUE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-tight bg-slate-800 text-slate-400 border border-slate-700">
                  MVP 1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Branch Intelligence Platform</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right action area */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <button
            onClick={handleRoleSwitch}
            title="Switch demo persona for testing"
            className="flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Role:</span>
            <span className={`font-semibold ${isManager ? 'text-amber-400' : 'text-blue-400'}`}>
              {role}
            </span>
            <span className="text-[10px] text-slate-400 underline ml-1">Switch</span>
          </button>

          {/* User Profile Info */}
          <div className="hidden lg:flex flex-col text-right">
            <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
            <span className="text-[10px] text-slate-400">{user?.email}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
