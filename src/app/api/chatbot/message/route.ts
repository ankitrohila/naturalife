import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface NavIntent { keywords: string[]; path: string; label: string }

// Simple rule-based navigation intents — no external NLU/LLM required.
const NAV_INTENTS: NavIntent[] = [
  { keywords: ['cart', 'my cart', 'checkout'], path: '/cart', label: 'your cart' },
  { keywords: ['my orders', 'order status', 'track order', 'track my order'], path: '/account/orders', label: 'your orders' },
  { keywords: ['wishlist'], path: '/account/wishlist', label: 'your wishlist' },
  { keywords: ['doormat', 'doormats'], path: '/shop?category=doormats', label: 'doormats' },
  { keywords: ['rug', 'rugs'], path: '/shop?category=rugs', label: 'rugs' },
  { keywords: ['carpet', 'carpets'], path: '/shop?category=carpets', label: 'carpets' },
  { keywords: ['cushion', 'cushion cover'], path: '/shop?category=cushion-covers', label: 'cushion covers' },
  { keywords: ['custom design', 'custom order', 'design request'], path: '/custom-design', label: 'the custom design request page' },
  { keywords: ['contact', 'support', 'help desk', 'raise a ticket', 'ticket'], path: '/account/tickets', label: 'the support ticket page' },
  { keywords: ['shop', 'all products', 'browse products'], path: '/shop', label: 'the shop page' },
]

const GREETING_WORDS = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening']
const THANKS_WORDS = ['thank', 'thanks', 'thank you', 'thanx', 'ty']
const BYE_WORDS = ['bye', 'goodbye', 'see you', 'that\'s all', 'thats all', 'nothing else']

const GREETING_REPLIES = [
  "Hey there! I'm the Naturalife Assistant 🌿 What are you shopping for today — doormats, rugs, cushion covers, or something else?",
  "Hi! Welcome to Naturalife. Looking for something specific, or would you like a few recommendations to start?",
  "Hello! I can help you find a product, check an order, or connect you with our team. What's on your mind?",
]
const THANKS_REPLIES = [
  "You're welcome! Anything else I can help with?",
  "Happy to help! Let me know if you need anything else.",
  "Anytime! Feel free to ask if something else comes up.",
]
const BYE_REPLIES = [
  "Take care! Come back anytime you need help. 🌿",
  "Sounds good — happy shopping!",
  "Bye for now! We're here 24/7 if you need us again.",
]
const NAV_CONFIRM_PHRASES = [
  (label: string) => `Sure — taking you to ${label} now.`,
  (label: string) => `On it! Opening ${label} for you.`,
  (label: string) => `Got it, heading to ${label}.`,
]
const NO_MATCH_REPLIES = [
  "I couldn't find an exact match for that, but here's what I found in our catalog that might be close:",
  "Hmm, not an exact hit — but these products might be what you're after:",
  "I found a few things that might match what you're looking for:",
]
const TICKET_SUGGEST_REPLIES = [
  "I don't have a ready answer for that one. Want me to open a support ticket so our team can help directly?",
  "That's a bit outside what I can answer myself — should I raise a support ticket for you?",
  "I'm not confident I've got this right. I can open a ticket with our support team if you'd like — just say \"raise a ticket\".",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function normalize(text: string) {
  return text.toLowerCase().trim()
}

function scoreMatch(input: string, question: string): number {
  const inputWords = new Set(normalize(input).split(/\s+/))
  const questionWords = normalize(question).split(/\s+/)
  let matches = 0
  for (const w of questionWords) if (inputWords.has(w)) matches++
  return matches / questionWords.length
}

const STOPWORDS = new Set(['a', 'an', 'the', 'is', 'are', 'do', 'you', 'have', 'has', 'i', 'want', 'need', 'looking', 'for', 'to', 'in', 'of', 'me', 'show', 'give', 'get', 'any', 'some', 'please', 'can'])

export async function POST(req: Request) {
  const { message, sessionId } = await req.json()
  if (!message?.trim()) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const normalized = normalize(message)
  const words = normalized.split(/\s+/).filter(Boolean)

  const log = async (botResponse: string, matchedFaqId?: string | null) =>
    prisma.chatLog.create({ data: { sessionId: sessionId || 'anonymous', userMessage: message, botResponse, matchedFaqId: matchedFaqId ?? null } }).catch(() => {})

  // 1. Greetings / pleasantries — short-circuit before intent matching
  if (words.length <= 4) {
    if (GREETING_WORDS.some((g) => normalized.includes(g))) {
      const reply = pick(GREETING_REPLIES)
      await log(reply)
      return NextResponse.json({ reply })
    }
    if (THANKS_WORDS.some((g) => normalized.includes(g))) {
      const reply = pick(THANKS_REPLIES)
      await log(reply)
      return NextResponse.json({ reply })
    }
    if (BYE_WORDS.some((g) => normalized.includes(g))) {
      const reply = pick(BYE_REPLIES)
      await log(reply)
      return NextResponse.json({ reply })
    }
  }

  // 2. Navigation intents
  for (const intent of NAV_INTENTS) {
    if (intent.keywords.some((k) => normalized.includes(k))) {
      const reply = pick(NAV_CONFIRM_PHRASES)(intent.label)
      await log(reply)
      return NextResponse.json({ reply, action: { type: 'navigate', path: intent.path } })
    }
  }

  // 3. Match against FAQ knowledge base
  const faqs = await prisma.chatbotFAQ.findMany({ where: { isActive: true } })
  let best: { faq: (typeof faqs)[number]; score: number } | null = null
  for (const faq of faqs) {
    const score = scoreMatch(normalized, faq.question)
    if (score > 0.4 && (!best || score > best.score)) best = { faq, score }
  }

  if (best) {
    await log(best.faq.answer, best.faq.id)
    return NextResponse.json({ reply: best.faq.answer })
  }

  // 4. No FAQ match — try a live product search so the bot can answer with real results
  const searchTerms = words.filter((w) => !STOPWORDS.has(w) && w.length > 2)
  if (searchTerms.length > 0) {
    const products = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        OR: searchTerms.flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' as const } },
          { shortDesc: { contains: term, mode: 'insensitive' as const } },
          { category: { name: { contains: term, mode: 'insensitive' as const } } },
        ]),
      },
      include: { images: { where: { isPrimary: true }, take: 1 }, variants: { orderBy: { price: 'asc' }, take: 1 } },
      take: 3,
    }).catch(() => [])

    if (products.length > 0) {
      const reply = pick(NO_MATCH_REPLIES)
      const productResults = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image: p.images[0]?.url ?? null,
        price: p.variants[0] ? Number(p.variants[0].price) : null,
      }))
      await log(`${reply} [${productResults.map((p) => p.name).join(', ')}]`)
      return NextResponse.json({ reply, products: productResults })
    }
  }

  // 5. Nothing matched at all — offer to raise a ticket, with varied phrasing
  const reply = pick(TICKET_SUGGEST_REPLIES)
  await log(reply)
  return NextResponse.json({ reply, action: { type: 'suggest_ticket' } })
}
