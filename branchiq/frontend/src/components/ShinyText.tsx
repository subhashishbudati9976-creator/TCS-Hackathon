/**
 * ShinyText — AVENUE
 * Subtle left-to-right shine sweep on text.
 * Use for supporting headings, important labels, descriptive content.
 */
import React from 'react'

interface ShinyTextProps {
  children: React.ReactNode
  className?: string
  speed?: number // animation duration in seconds, default 3.5
  color?: string // base text color hex, default slate-300
}

export const ShinyText: React.FC<ShinyTextProps> = ({
  children,
  className = '',
  speed = 3.5,
  color = '#cbd5e1',
}) => {
  const id = React.useId().replace(/:/g, '')

  return (
    <>
      <style>{`
        @keyframes shiny-sweep-${id} {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shiny-text-${id} {
          background: linear-gradient(
            90deg,
            ${color} 0%,
            ${color} 35%,
            #ffffff 48%,
            #e2e8f0 52%,
            ${color} 65%,
            ${color} 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shiny-sweep-${id} ${speed}s linear infinite;
        }
      `}</style>
      <span className={`shiny-text-${id} ${className}`}>
        {children}
      </span>
    </>
  )
}

export default ShinyText
