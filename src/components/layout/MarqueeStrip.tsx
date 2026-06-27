'use client'

interface MarqueeOffer {
  id: string
  text: string
  linkUrl?: string | null
}

export function MarqueeStrip({ offers }: { offers: MarqueeOffer[] }) {
  if (!offers.length) return null
  // Duplicate for seamless loop
  const doubled = [...offers, ...offers]

  return (
    <div className="bg-indigo-brand text-white text-sm py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((offer, i) => (
          <span key={`${offer.id}-${i}`} className="mx-8 flex-shrink-0">
            {offer.linkUrl ? (
              <a href={offer.linkUrl} className="hover:underline">{offer.text}</a>
            ) : (
              <span>{offer.text}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
