'use client'

export function WovenBorderDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full h-px ${className}`} aria-hidden
      style={{ background: 'linear-gradient(90deg, transparent, var(--line), var(--green-light), var(--line), transparent)' }} />
  )
}
