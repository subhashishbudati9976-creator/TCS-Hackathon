import React from 'react'

interface BranchIQLogoProps {
  className?: string
  size?: number
  showText?: boolean
  subtitle?: string
}

export const BranchIQLogo: React.FC<BranchIQLogoProps> = ({
  className = '',
  size = 38,
  showText = true,
  subtitle = 'Branch Operations AI',
}) => {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Dynamic Glowing Hex Icon */}
      <div 
        style={{ width: size, height: size }}
        className="relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900/90 via-slate-950 to-blue-950/80 border border-slate-700/60 shadow-lg shadow-cyan-500/10 group transition-transform duration-300 hover:scale-105"
      >
        <div className="absolute inset-0 rounded-xl bg-cyan-500/10 blur-sm opacity-50 group-hover:opacity-100 transition-opacity" />
        <svg
          viewBox="0 0 40 40"
          className="w-4/5 h-4/5 relative z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="componentLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="50%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="componentAccentGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Outer Apex Hexagon */}
          <path
            d="M20 7L31 14V26L20 33L9 26V14L20 7Z"
            stroke="url(#componentLogoGrad)"
            strokeWidth="2.2"
            strokeLinejoin="round"
            className="opacity-90"
          />

          {/* Interconnected Network Links */}
          <line x1="20" y1="7" x2="20" y2="20" stroke="url(#componentAccentGrad)" strokeWidth="2" strokeLinecap="round" />
          <line x1="9" y1="26" x2="20" y2="20" stroke="url(#componentLogoGrad)" strokeWidth="2" strokeLinecap="round" />
          <line x1="31" y1="26" x2="20" y2="20" stroke="url(#componentLogoGrad)" strokeWidth="2" strokeLinecap="round" />

          {/* Central & Periphery Processing Nodes */}
          <circle cx="20" cy="20" r="3.2" fill="url(#componentLogoGrad)" />
          <circle cx="20" cy="7" r="2.2" fill="#06b6d4" />
          <circle cx="31" cy="14" r="1.8" fill="#3b82f6" />
          <circle cx="9" cy="14" r="1.8" fill="#3b82f6" />
          <circle cx="31" cy="26" r="2.2" fill="#8b5cf6" />
          <circle cx="9" cy="26" r="2.2" fill="#10b981" />
          <circle cx="20" cy="33" r="2" fill="#10b981" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-lg tracking-tight text-white font-sans">
              Branch<span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">IQ</span>
            </span>
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold uppercase tracking-wider bg-cyan-950/70 text-cyan-400 border border-cyan-800/60 shadow-xs">
              AI Ops
            </span>
          </div>
          {subtitle && (
            <span className="text-[10px] font-medium tracking-wide text-slate-400 uppercase">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
