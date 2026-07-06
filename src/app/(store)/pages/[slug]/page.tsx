import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'

// Sensible defaults so the standard policy pages render even before they're
// customised in the CMS. DB content (if present) always takes precedence.
const DEFAULTS: Record<string, { title: string; body: string[] }> = {
  'about': { title: 'About Us', body: [
    'Naturalife has been making homes a living one since 2012. We bring together a curated collection of premium handcrafted home textiles — doormats, rugs, dhurries and more — sourced from skilled artisans across India.',
    'Every product is selected with care, tested for quality, and offered at an honest price for both retail customers and wholesale partners.',
  ]},
  'privacy-policy': { title: 'Privacy Policy', body: [
    'We respect your privacy. This policy explains what information we collect, how we use it, and the choices you have.',
    'We collect the details you provide at checkout (name, contact, address) solely to process and deliver your orders and to send order updates. We never sell your personal data.',
    'For any privacy request, write to info@naturalife.co.in.',
  ]},
  'terms-and-conditions': { title: 'Terms & Conditions', body: [
    'By using this website and placing an order, you agree to these terms.',
    'Prices are listed in INR and are subject to change. Orders are confirmed once payment is received (or for COD, once verified). Product colours may vary slightly from images due to screen settings.',
  ]},
  'return-refund-policy': { title: 'Return & Refund Policy', body: [
    'We offer easy 7-day returns on most products. Items must be unused, in original condition and packaging.',
    'To start a return, contact us with your order number. Approved refunds are processed to the original payment method within 5–7 business days.',
  ]},
  'shipping-policy': { title: 'Shipping Policy', body: [
    'We ship pan-India. Orders are dispatched within 1–2 business days and typically delivered in 5–7 days.',
    'Free shipping on retail orders above ₹1,000; a flat fee applies below that. Wholesale shipping is arranged via assigned distributors.',
  ]},
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } }).catch(() => null)
  const title = page?.title ?? DEFAULTS[slug]?.title
  return title ? { title } : {}
}

export default async function CmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const page = await prisma.page.findUnique({ where: { slug } }).catch(() => null)
  const fallback = DEFAULTS[slug]

  if (!page && !fallback) notFound()

  const title = page?.title ?? fallback!.title
  const content = page?.content as any
  const html: string | null = content?.html ?? null
  const bodyParas: string[] = html ? [] : (content?.body ?? fallback?.body ?? [])

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl md:text-4xl font-semibold mb-8" style={{ color: 'var(--ink)' }}>{title}</h1>
        {html ? (
          <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <div className="space-y-4 text-gray-700 leading-relaxed">
            {bodyParas.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
      </div>
    </main>
  )
}
