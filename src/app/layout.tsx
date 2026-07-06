import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { AuthSessionProvider } from '@/components/providers/SessionProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
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
    <html lang="en" className={`${outfit.variable} h-full`}>
      <head>
        <meta name="color-scheme" content="light" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthSessionProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  )
}
