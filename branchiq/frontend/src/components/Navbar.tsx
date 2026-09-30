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
    { to: '/customer/services', label: 'Service Catalog', icon: Layers },
    { to: '/customer/branches', label: 'Branch Finder', icon: MapPin },
    { to: '/customer/assistant', label: 'AVENUE Assistant', icon: Bot },
  ]

  const links = isManager ? managerLinks : customerLinks

  return (
    <header className="sticky top-0 z-50 bg-[#0b101b] border-b border-[#1c2738] shadow-sm">
      <div className="w-full max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 sm:h-[68px] flex items-center justify-between">
        {/* Left: Product Brand */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link
            to={isManager ? '/manager/dashboard' : '/customer/dashboard'}
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 font-bold text-sm tracking-wider group-hover:border-emerald-500/40 transition-colors">
              AV
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-wider text-slate-100">AVENUE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium tracking-tight bg-slate-800/80 text-emerald-400 border border-emerald-500/20">
                  ENTERPRISE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal tracking-wide">
                Branch Intelligence Platform
              </p>
            </div>
          </Link>

          {/* Center Navigation Links for Desktop */}
          <nav className="hidden md:flex items-center gap-1.5 lg:ml-4">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Right: Role, Profile & Sign Out */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Demo Role Switcher */}
          <button
            onClick={handleRoleSwitch}
            type="button"
            title="Switch demo persona for testing"
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-slate-700/80 bg-slate-800/60 text-slate-300 hover:bg-slate-700/60 hover:text-white transition-all cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline text-slate-400">Role:</span>
            <span className={`font-semibold ${isManager ? 'text-amber-400' : 'text-sky-400'}`}>
              {role}
            </span>
            <span className="text-[10px] text-slate-400 underline ml-0.5">Switch</span>
          </button>

          {/* User Profile Info */}
          <div className="hidden lg:flex flex-col text-right border-l border-slate-800 pl-3">
            <span className="text-xs font-semibold text-slate-200">{user?.name}</span>
            <span className="text-[11px] text-slate-400 font-mono">{user?.email}</span>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            type="button"
            title="Sign out of AVENUE"
            className="p-2 rounded-md text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors cursor-pointer border border-transparent hover:border-slate-700/50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Navbar
