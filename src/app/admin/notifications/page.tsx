import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function AdminNotificationsPage() {
  const [templates, logs] = await Promise.all([
    prisma.notificationTemplate.findMany({ orderBy: { event: 'asc' } }).catch(() => []),
    prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take: 30 }).catch(() => []),
  ])

  const eventLabels: Record<string, string> = {
    ORDER_PLACED: '🛒 Order Placed',
    ORDER_CONFIRMED: '✅ Order Confirmed',
    ORDER_DISPATCHED: '📦 Order Dispatched',
    ORDER_DELIVERED: '🎉 Order Delivered',
    RETURN_INITIATED: '↩️ Return Initiated',
    REFUND_PROCESSED: '💰 Refund Processed',
    WELCOME: '👋 Welcome',
    OTP: '🔢 OTP',
  }

  const channelColors: Record<string, string> = { EMAIL: '#2D3A8C', WHATSAPP: '#25D366', SMS: '#E8832A' }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#F6F6F6' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Notification Templates</h1>
            <p className="text-sm text-gray-500 mt-1">Manage email, WhatsApp & SMS templates for all order events</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">Templates ({templates.length})</h2>
              <span className="text-xs text-gray-400">Run db:seed to create all default templates</span>
            </div>
            {templates.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                No templates. Run <code className="bg-gray-100 px-1 rounded">npm run db:seed</code> to create defaults.
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {templates.map((t) => (
                  <div key={t.id} className="px-5 py-4 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{eventLabels[t.event] ?? t.event}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                          style={{ backgroundColor: channelColors[t.channel] ?? 'gray' }}>
                          {t.channel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {t.isActive ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <button className="text-xs px-2 py-1 border border-gray-300 rounded text-gray-500 hover:bg-gray-100">Edit</button>
                    </div>
                    <p className="text-xs text-gray-500 font-mono truncate">{t.subject ?? t.bodyTemplate.slice(0, 80)}...</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notification Logs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Recent Notifications ({logs.length})</h2>
            </div>
            {logs.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No notification history yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead style={{ backgroundColor: '#F6F6F6' }}>
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Event</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Channel</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Recipient</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{eventLabels[log.event] ?? log.event}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded text-white" style={{ backgroundColor: channelColors[log.channel] ?? 'gray' }}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-mono">{log.recipient}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${log.status === 'SENT' ? 'bg-green-100 text-green-700' : log.status === 'FAILED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
