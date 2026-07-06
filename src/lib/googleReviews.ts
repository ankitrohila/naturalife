import { prisma } from './prisma'

export interface GoogleReview {
  authorName: string
  authorPhoto: string | null
  rating: number
  text: string
  relativeTime: string
  time: number
}

const CACHE_KEY = 'google_reviews_cache'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24h — Google Places data doesn't need to be fetched more often than this

// Returns null when no API key/Place ID is configured yet, so callers can
// fall back to the Testimonial table or static copy without erroring.
export async function getGoogleReviews(): Promise<GoogleReview[] | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  const placeId = process.env.GOOGLE_PLACE_ID
  if (!apiKey || !placeId || apiKey === 'test') return null

  const cached = await prisma.siteSettings.findUnique({ where: { key: CACHE_KEY } }).catch(() => null)
  if (cached) {
    const { fetchedAt, reviews } = cached.value as unknown as { fetchedAt: number; reviews: GoogleReview[] }
    if (Date.now() - fetchedAt < CACHE_TTL_MS) return reviews
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews&reviews_sort=most_relevant&key=${apiKey}`
    const res = await fetch(url)
    const data = await res.json()
    if (data.status !== 'OK') throw new Error(data.error_message ?? data.status)

    const reviews: GoogleReview[] = (data.result?.reviews ?? [])
      .filter((r: any) => r.rating >= 4)
      .map((r: any) => ({
        authorName: r.author_name,
        authorPhoto: r.profile_photo_url ?? null,
        rating: r.rating,
        text: r.text,
        relativeTime: r.relative_time_description,
        time: r.time,
      }))

    const cacheValue = { fetchedAt: Date.now(), reviews } as unknown as object
    await prisma.siteSettings.upsert({
      where: { key: CACHE_KEY },
      create: { key: CACHE_KEY, value: cacheValue },
      update: { value: cacheValue },
    })

    return reviews
  } catch (err) {
    console.error('Google Reviews fetch failed:', err)
    return null
  }
}
