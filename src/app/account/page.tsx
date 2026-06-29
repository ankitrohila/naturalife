import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { WovenBorderDivider } from '@/components/shared/WovenBorderDivider'
import Link from 'next/link'

export const metadata = { title: 'My Account' }

const statusColors: Record<string, string> = {
  PLACED: 'bg-yellow-50 text-yellow-700', CONFIRMED: 'bg-blue-50 text-blue-700',
  PACKED: 'bg-purple-50 text-purple-700', DISPATCHED: 'bg-cyan-50 text-cyan-700',
  DELIVERED: 'bg-green-50 text-green-700', CANCELLED: 'bg-red-50 text-red-600',
  RETURN_REQUESTED: 'bg-orange-50 text-orange-700',
}

export default async function AccountPage() {
  const session = await auth()
  if (!session?.user) redirect('/login?callbackUrl=/account')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id! },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { items: { take: 1, include: { variant: { include: { product: { select: { name: true } } } } } } },
      },
      addresses: true,
      coinLedger: { orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })

  if (!user) redirect('/login')

  const totalCoins = user.coinLedger.reduce((sum, l) => {
    return l.type === 'EARNED' ? sum + l.coins : l.type === 'REDEEMED' ? sum - l.coins : sum
  }, 0)

  return (
    <>
      <Header />
      <main className="min-h-screen py-10 px-4" style={{ backgroundColor: 'var(--ivory)' }}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-bold" style={{ backgroundColor: 'var(--saffron)' }}>
              {user.name[0]}
            </div>
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-display)', color: 'var(--indigo)' }}>
                Welcome, {user.name.split(' ')[0]}!
              </h1>
              <p className="text-sm text-gray-500">{user.primaryEmail} · Member since {new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="ml-auto text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--gold)', fontFamily: 'var(--font-display)' }}>{totalCoins}</div>
              <div className="text-xs text-gray-500">Naturalife Coins</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Orders */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">My Orders</h2>
                  <span className="text-xs text-gray-500">{user.orders.length} orders</span>
                </div>
                {user.orders.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm text-gray-500">No orders yet</p>
                    <Link href="/shop" className="mt-3 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--saffron)' }}>Start Shopping</Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {user.orders.map((o) => {
                      const firstItem = o.items[0]?.variant?.product?.name
                      return (
                        <div key={o.id} className="px-5 py-4 flex items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-800">{o.orderNumber}</p>
                            <p className="text-xs text-gray-500 truncate">{firstItem}{o.items.length > 1 ? ` +${o.items.length - 1} more` : ''}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{new Date(o.createdAt).toLocaleDateString('en-IN')}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">₹{Number(o.total).toLocaleString('en-IN')}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[o.status] ?? 'bg-gray-50 text-gray-600'}`}>
                              {o.status}
                            </span>
                            <a href={`/api/invoices/${o.id}?print=1`} target="_blank" rel="noopener noreferrer" className="block mt-1 text-xs font-medium hover:underline" style={{ color: 'var(--green)' }}>
                              Download Invoice
                            </a>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Coins ledger */}
              {user.coinLedger.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="font-semibold text-gray-800">Coin History</h2>
                    <span className="font-bold text-sm" style={{ color: 'var(--gold)' }}>{totalCoins} coins</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {user.coinLedger.map((l) => (
                      <div key={l.id} className="px-5 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-700">{l.description ?? l.type}</p>
                          <p className="text-xs text-gray-400">{new Date(l.createdAt).toLocaleDateString('en-IN')}</p>
                        </div>
                        <span className={`text-sm font-semibold ${l.type === 'EARNED' ? 'text-green-600' : 'text-red-500'}`}>
                          {l.type === 'EARNED' ? '+' : '-'}{l.coins}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* Profile */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Profile</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="font-medium text-gray-800">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Primary Email</p>
                    <p className="text-gray-800">{user.primaryEmail}</p>
                    <p className="text-xs text-gray-400">Cannot be changed</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Primary Phone</p>
                    <p className="text-gray-800">{user.primaryPhone}</p>
                    <p className="text-xs text-gray-400">Cannot be changed</p>
                  </div>
                  {user.whatsappNumber && (
                    <div>
                      <p className="text-xs text-gray-500">WhatsApp</p>
                      <p className="text-gray-800">{user.whatsappNumber}</p>
                    </div>
                  )}
                </div>
                <button className="mt-4 w-full py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">Edit Profile</button>
              </div>

              {/* Addresses */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Addresses</h3>
                {user.addresses.length === 0 ? (
                  <p className="text-sm text-gray-400 mb-3">No addresses saved</p>
                ) : (
                  <div className="space-y-3 mb-3">
                    {user.addresses.map((addr) => (
                      <div key={addr.id} className="text-sm p-3 border border-gray-100 rounded-lg">
                        <p className="font-medium">{addr.line1}</p>
                        {addr.line2 && <p className="text-gray-500">{addr.line2}</p>}
                        <p className="text-gray-500">{addr.city}, {addr.state} {addr.pincode}</p>
                        {addr.isDefault && <span className="text-xs text-green-600 font-medium">Default</span>}
                      </div>
                    ))}
                  </div>
                )}
                <button className="w-full py-2 text-sm border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">+ Add Address</button>
              </div>

              {/* Quick links */}
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
                <div className="space-y-2">
                  {[['Continue Shopping', '/shop'], ['Contact Support', '/contact'], ['Return Policy', '/pages/return-refund-policy']].map(([label, href]) => (
                    <Link key={href as string} href={href as string} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 py-1">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <WovenBorderDivider />
      <Footer />
    </>
  )
}
