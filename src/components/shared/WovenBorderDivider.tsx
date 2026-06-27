'use client'

export function WovenBorderDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 20" xmlns="http://www.w3.org/2000/svg" className="w-full h-5">
        <defs>
          <pattern id="woven" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="10" height="10" fill="#E8832A" />
            <rect x="10" y="0" width="10" height="10" fill="#C9A84C" />
            <rect x="20" y="0" width="10" height="10" fill="#8B5E3C" />
            <rect x="30" y="0" width="10" height="10" fill="#2D3A8C" />
            <rect x="0" y="10" width="10" height="10" fill="#2D3A8C" />
            <rect x="10" y="10" width="10" height="10" fill="#8B5E3C" />
            <rect x="20" y="10" width="10" height="10" fill="#C9A84C" />
            <rect x="30" y="10" width="10" height="10" fill="#E8832A" />
          </pattern>
        </defs>
        <rect width="1200" height="20" fill="url(#woven)" />
      </svg>
    </div>
  )
}
