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
          <div className="mx-auto mb-5 w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--green-light)' }}>
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
            Order Placed!
          </h1>
          <p className="text-gray-600 mb-2">Thank you for shopping with Naturalife.</p>
          <p className="text-sm text-gray-500 mb-8">
            You&apos;ll receive a confirmation email and WhatsApp message shortly.
            {id && <><br />Order ID: <span className="font-mono font-medium">{id}</span></>}
          </p>
          <div className="flex flex-col gap-3">
            {id && (
              <a href={`/api/invoices/${id}?print=1`} target="_blank" rel="noopener noreferrer" className="py-3 text-white rounded-xl font-semibold" style={{ backgroundColor: 'var(--green)' }}>
                Download Invoice
              </a>
            )}
            <Link href="/account" className="py-3 rounded-xl font-semibold border border-[var(--green)]" style={{ color: 'var(--green)' }}>
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
