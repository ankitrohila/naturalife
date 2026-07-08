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

  // Strip emoji characters from marquee text
  const stripEmoji = (text: string) =>
    text.replace(/[\u{1F300}-\u{1FFFF}\u{2600}-\u{27FF}\u{FE00}-\u{FE0F}]/gu, '').trim()

  return (
    <div className="bg-indigo-brand text-white text-sm py-2 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {doubled.map((offer, i) => (
          <span key={`${offer.id}-${i}`} className="mx-8 flex-shrink-0">
            {offer.linkUrl ? (
              <a href={offer.linkUrl} className="hover:underline">{stripEmoji(offer.text)}</a>
            ) : (
              <span>{stripEmoji(offer.text)}</span>
            )}
          </span>
        ))}
      </div>
    </div>
  )
}
