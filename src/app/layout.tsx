import type { Metadata } from 'next'
import { Playfair_Display, Hind } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/SessionProvider'
import './globals.css'

const playfair = Playfair_Display({
  variable: '--font-display',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
})

const hind = Hind({
  variable: '--font-body',
  subsets: ['latin', 'devanagari'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Naturalife – Handcrafted Indian Home Textiles',
    template: '%s | Naturalife',
  },
  description:
    'Premium handcrafted doormats, rugs, dhurries, carpets and home textiles. Authentic Indian craftsmanship. Free shipping above ₹999. Wholesale available.',
  keywords: ['doormats', 'rugs', 'dhurries', 'carpets', 'Indian textiles', 'handcrafted', 'home decor'],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Naturalife',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hi" className={`${playfair.variable} ${hind.variable} h-full`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthSessionProvider>
          {children}
        </AuthSessionProvider>
      </body>
    </html>
  )
}
