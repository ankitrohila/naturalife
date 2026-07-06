import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export const metadata = { title: 'Store Credits' }

const typeStyles: Record<string, string> = {
  EARNED: 'text-[var(--green)]',
  REDEEMED: 'text-red-500',
  EXPIRED: 'text-gray-400',
}

export default async function StoreCreditsPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account/store-credits')

  const ledger = await prisma.coinLedger.findMany({
    where: { userId: session.user.id! },
    orderBy: { createdAt: 'desc' },
    include: { order: { select: { orderNumber: true } } },
  })

  const balance = ledger.reduce((sum, l) => (l.type === 'EARNED' ? sum + l.coins : sum - l.coins), 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--ink)' }}>Store Credits</h1>
      </div>

      <div className="bg-white border border-[var(--line)] p-6 mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Your Naturalife Coins Balance</p>
          <p className="text-3xl font-bold" style={{ color: 'var(--green)' }}>{balance} coins</p>
          <p className="text-xs text-gray-400 mt-1">1 coin = ₹1 · redeemable at checkout</p>
        </div>
        <Link href="/shop" className="text-sm font-semibold hover:underline" style={{ color: 'var(--green)' }}>Shop Now →</Link>
      </div>

      <div className="bg-white border border-[var(--line)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--line)]">
          <h2 className="font-semibold text-gray-800">History</h2>
        </div>
        {ledger.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-gray-500">No store credit activity yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {ledger.map((l) => (
              <div key={l.id} className="px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{l.description ?? l.type}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {l.order && ` · Order ${l.order.orderNumber}`}
                  </p>
                </div>
                <p className={`text-sm font-semibold ${typeStyles[l.type] ?? ''}`}>
                  {l.type === 'EARNED' ? '+' : '−'}{l.coins} coins
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
