/**
 * TechText — AVENUE
 * Major heading treatment with a refined technical identity:
 * monospaced-weight letterform + subtle gradient sweep.
 * Clean, readable, data-intelligence aesthetic.
 * No canvas. No gimmicks.
 */
import React from 'react'

interface TechTextProps {
  children: React.ReactNode
  /** Tailwind font-size class or inline fontSize */
  size?: string
  className?: string
  /** Tag to render as — defaults to span, set to 'h1'/'h2' etc. as needed */
  as?: keyof JSX.IntrinsicElements
  /** Accent color for the gradient highlight — defaults to emerald */
  accent?: string
}

export const TechText: React.FC<TechTextProps> = ({
  children,
  size,
  className = '',
  as: Tag = 'span',
  accent = '#10b981',
}) => {
  const id = React.useId().replace(/:/g, '')

  return (
    <>
      <style>{`
        @keyframes techtext-reveal-${id} {
          0%   { opacity: 0; letter-spacing: 0.25em; }
          100% { opacity: 1; letter-spacing: inherit; }
        }
        .tech-text-${id} {
          background: linear-gradient(
            135deg,
            #f1f5f9 0%,
            #e2e8f0 30%,
            ${accent} 50%,
            #e2e8f0 70%,
            #f1f5f9 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 700;
          letter-spacing: -0.01em;
          animation: techtext-reveal-${id} 0.6s ease-out both;
        }
      `}</style>
      {/* @ts-ignore dynamic tag */}
      <Tag
        className={`tech-text-${id} ${size ?? ''} ${className}`}
        style={{ lineHeight: 1.15 }}
      >
        {children}
      </Tag>
    </>
  )
}

export default TechText
