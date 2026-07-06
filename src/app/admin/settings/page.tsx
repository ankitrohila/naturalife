import { prisma } from '@/lib/prisma'

export const metadata = { title: 'Settings — Admin' }

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSettings.findMany().catch(() => [])
  const settingsMap = Object.fromEntries(settings.map((s) => [s.key, s.value]))

  const get = (key: string, field: string, fallback = '') =>
    (settingsMap[key] as any)?.[field] ?? fallback

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        {/* General */}
        <SettingsSection title="General">
          <form action="/api/admin/settings" method="post" className="grid grid-cols-2 gap-4">
            <input type="hidden" name="group" value="general" />
            {[
              { label: 'Company Name', name: 'company_name_text', value: get('company_name', 'text', 'Naturalife') },
              { label: 'GST Number', name: 'company_gst_text', value: get('company_gst', 'text') },
              { label: 'Phone', name: 'company_phone_text', value: get('company_phone', 'text') },
              { label: 'Email', name: 'company_email_text', value: get('company_email', 'text') },
              { label: 'WhatsApp', name: 'company_whatsapp_text', value: get('company_whatsapp', 'text') },
            ].map(({ label, name, value }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input name={name} defaultValue={value} className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
              <textarea name="company_address_text" defaultValue={get('company_address', 'text')} rows={2} className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <button type="submit" className="px-4 py-2 text-sm text-white rounded-none font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Save General</button>
            </div>
          </form>
        </SettingsSection>

        {/* Shipping */}
        <SettingsSection title="Shipping & Delivery">
          <form action="/api/admin/settings" method="post" className="grid grid-cols-3 gap-4">
            <input type="hidden" name="group" value="shipping" />
            {[
              { label: 'Free Shipping Threshold (₹)', name: 'free_threshold', value: get('free_shipping_threshold', 'amount', '1000') },
              { label: 'Domestic Shipping Fee (₹)', name: 'domestic_fee', value: get('domestic_shipping_fee', 'amount', '100') },
              { label: 'International Shipping ($)', name: 'intl_fee', value: get('international_shipping_fee_usd', 'amount', '200') },
            ].map(({ label, name, value }) => (
              <div key={name}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                <input type="number" name={name} defaultValue={value} className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="col-span-3 flex items-center gap-3">
              <input type="checkbox" id="cod" name="cod" defaultChecked={(settingsMap['cod_available'] as any)?.enabled !== false} className="w-4 h-4" />
              <label htmlFor="cod" className="text-sm text-gray-600">Cash on Delivery available</label>
            </div>
            <div className="col-span-3">
              <button type="submit" className="px-4 py-2 text-sm text-white rounded-none font-medium" style={{ backgroundColor: 'var(--saffron)' }}>Save Shipping</button>
            </div>
          </form>
        </SettingsSection>

        {/* Coins */}
        <SettingsSection title="Loyalty Coins">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Earn Rate (coins per ₹100 spent)</label>
              <input type="number" defaultValue={get('coin_earn_rate', 'coinsPerHundred', '10')} className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Redemption Rate (coins per ₹1 discount)</label>
              <input type="number" defaultValue={get('coin_redemption_rate', 'coinsPerRupee', '10')} className="w-full border border-gray-200 rounded-none px-3 py-2 text-sm" />
            </div>
          </div>
        </SettingsSection>

        {/* Notification mode */}
        <SettingsSection title="Notification Mode">
          <div className="flex items-center gap-4">
            <div className="flex rounded-none overflow-hidden border border-gray-300">
              {['TEST', 'LIVE'].map((mode) => {
                const current = get('notification_mode', 'mode', 'TEST')
                const isActive = current === mode
                return (
                  <button key={mode} className={`px-6 py-2 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-gray-600'}`}
                    style={isActive ? { backgroundColor: mode === 'TEST' ? '#f97316' : '#16a34a' } : { backgroundColor: '#f9fafb' }}>
                    {mode === 'TEST' ? 'TEST MODE' : 'LIVE MODE'}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500">In TEST mode, all notifications go to admin test contacts</p>
          </div>
        </SettingsSection>

        {/* Env vars reminder */}
        <SettingsSection title="API Keys & Credentials">
          <div className="bg-amber-50 border border-amber-200 rounded-none p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Configure in .env.local file:</p>
            <code className="text-xs block space-y-0.5 font-mono">
              {['RAZORPAY_KEY_ID', 'CLOUDINARY_CLOUD_NAME', 'SMTP_HOST / SMTP_USER / SMTP_PASS', 'TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN', 'GOOGLE_PLACES_API_KEY'].map((k) => (
                <span key={k} className="block">{k}</span>
              ))}
            </code>
          </div>
        </SettingsSection>
      </div>
    </div>
  )
}

function SettingsSection({ title, children }: { title: string; icon?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}
