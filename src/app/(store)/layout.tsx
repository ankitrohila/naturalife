import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { getNavigationCategories } from '@/app/actions/categories'
import { CartSyncProvider } from '@/components/providers/CartSyncProvider'
import { CompareTray } from '@/components/shop/CompareTray'
import { ChatWidget } from '@/components/chatbot/ChatWidget'

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
