import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Test Environment — Admin' }

export default async function TestEnvPage() {
  const notifMode = await prisma.siteSettings.findUnique({ where: { key: 'notification_mode' } }).catch(() => null)
  const mode = (notifMode?.value as any)?.mode ?? 'TEST'
  const isLive = mode === 'LIVE'

  const notifLogs = await prisma.notificationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  }).catch(() => [])

  const testEmail = process.env.NOTIFICATION_TEST_EMAIL ?? 'not configured'
  const testWA = process.env.NOTIFICATION_TEST_WHATSAPP ?? 'not configured'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Test Environment</h1>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${isLive ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-orange-500'}`} />
          {isLive ? 'LIVE MODE' : 'TEST MODE'}
        </div>
      </div>

      {!isLive && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-sm text-orange-800">
          <strong>TEST MODE ACTIVE:</strong> All notifications go to test contacts — Email: {testEmail} | WhatsApp: {testWA}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Cycle Simulator */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">🛒 Order Cycle Simulator</h2>
            <p className="text-xs text-gray-500 mt-1">Create test orders and step through all statuses</p>
          </div>
          <div className="px-5 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <a href="/api/test/create-retail-order" className="flex items-center justify-center gap-2 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                🛍️ Create Retail Order
              </a>
              <a href="/api/test/create-wholesale-order" className="flex items-center justify-center gap-2 py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                📦 Create Wholesale Order
              </a>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Status Progression</label>
              <div className="flex flex-wrap gap-2">
                {['PLACED', 'CONFIRMED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'].map((s) => (
                  <span key={s} className="text-xs px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-gray-600">{s}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Notification Test */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">📧 Test Notifications</h2>
            <p className="text-xs text-gray-500 mt-1">Send test notifications to configured test contacts</p>
          </div>
          <div className="px-5 py-5 space-y-3">
            {['ORDER_PLACED', 'ORDER_DISPATCHED', 'ORDER_DELIVERED', 'RETURN_REQUESTED', 'REFUND_DONE'].map((event) => (
              <div key={event} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{event.replace(/_/g, ' ')}</span>
                <div className="flex gap-2">
                  <button className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">📧 Email</button>
                  <button className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">💬 WA</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Test */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">💳 Payment Test</h2>
          </div>
          <div className="px-5 py-5 space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-800">
              Razorpay test mode uses test keys from .env.local. Use test card: 4111 1111 1111 1111
            </div>
            <div className="grid grid-cols-3 gap-3">
              {['UPI/GPay', 'Card', 'COD'].map((m) => (
                <button key={m} className="py-3 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50">Test {m}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">⚙️ Mode Control</h2>
          </div>
          <div className="px-5 py-5">
            <p className="text-sm text-gray-600 mb-4">
              Current: <strong>{mode}</strong><br />
              Test email: <code className="text-xs">{testEmail}</code><br />
              Test WhatsApp: <code className="text-xs">{testWA}</code>
            </p>
            <div className="flex gap-3">
              <form action="/api/admin/notification-mode" method="post">
                <input type="hidden" name="mode" value="TEST" />
                <button type="submit" className={`px-4 py-2 text-sm rounded-lg font-medium ${!isLive ? 'text-white' : 'border border-gray-300 text-gray-600'}`} style={!isLive ? { backgroundColor: '#f97316' } : {}}>
                  🧪 Set TEST Mode
                </button>
              </form>
              <form action="/api/admin/notification-mode" method="post">
                <input type="hidden" name="mode" value="LIVE" />
                <button type="submit" className={`px-4 py-2 text-sm rounded-lg font-medium ${isLive ? 'text-white' : 'border border-gray-300 text-gray-600'}`} style={isLive ? { backgroundColor: '#16a34a' } : {}}>
                  🟢 Set LIVE Mode
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Log */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">📋 Notification Log</h2>
        </div>
        {notifLogs.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-gray-400">No notifications sent yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Event', 'Recipient', 'Channel', 'Status', 'Time'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {notifLogs.map((log) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs font-medium text-gray-700">{log.event}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{log.recipient}</td>
                  <td className="px-4 py-3 text-xs">{log.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${log.status === 'sent' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
