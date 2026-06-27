import Link from 'next/link'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams

  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center py-20 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
            Order Placed!
          </h1>
          <p className="text-gray-600 mb-2">Thank you for shopping with Naturalife.</p>
          <p className="text-sm text-gray-500 mb-8">
            You&apos;ll receive a confirmation email and WhatsApp message shortly.
            {id && <><br />Order ID: <span className="font-mono font-medium">{id}</span></>}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/account" className="py-3 text-white rounded-xl font-semibold" style={{ backgroundColor: 'var(--saffron)' }}>
              View My Orders
            </Link>
            <Link href="/shop" className="py-3 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50">
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
