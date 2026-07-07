import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNavigationCategories } from '@/app/actions/categories'
import { CartSyncProvider } from '@/components/providers/CartSyncProvider'
import { CompareTray } from '@/components/shop/CompareTray'
import { ChatWidget } from '@/components/chatbot/ChatWidget'

// Every storefront page reads live data from Postgres. Rendering at request
// time (instead of prerendering at build time) means `next build` never needs
// a reachable database — required for Vercel builds.
export const dynamic = 'force-dynamic'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getNavigationCategories()

  return (
    <CartSyncProvider>
      <Header categories={categories} />
      {children}
      <Footer />
      <CompareTray />
      <ChatWidget />
    </CartSyncProvider>
  )
}
