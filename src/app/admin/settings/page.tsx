'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────
interface GW {
  provider: string; label: string; isEnabled: boolean; isTestMode: boolean
  testKeyId: string; testSecret: string; liveKeyId: string; liveSecret: string; extra?: any
}
interface SP {
  name: string; label: string; isEnabled: boolean
  apiKey: string; apiSecret: string; webhookUrl: string; extra?: any
}
interface SiteSetting { key: string; value: any }
interface SmtpConfig { host: string; port: string; user: string; pass: string; from: string }
interface WaConfig { provider: string; apiUrl: string; token: string; fromNumber: string; templateNamespace: string }
interface UpiConfig { vpa: string; payeeName: string; merchantCode: string }
interface TestEnvConfig { email: string; phone: string; testCard: string; testUpi: string; testMode: string }

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'general', label: 'General' },
  { id: 'payment', label: 'Payment Gateways' },
  { id: 'upi', label: 'UPI / QR' },
  { id: 'comms', label: 'Email & WhatsApp' },
  { id: 'shipping', label: 'Shipping Partners' },
  { id: 'testenv', label: 'Test Environment' },
]

const GATEWAYS: GW[] = [
  { provider: 'RAZORPAY', label: 'Razorpay', isEnabled: false, isTestMode: true, testKeyId: '', testSecret: '', liveKeyId: '', liveSecret: '' },
  { provider: 'STRIPE', label: 'Stripe', isEnabled: false, isTestMode: true, testKeyId: '', testSecret: '', liveKeyId: '', liveSecret: '' },
  { provider: 'PAYU', label: 'PayU Money', isEnabled: false, isTestMode: true, testKeyId: '', testSecret: '', liveKeyId: '', liveSecret: '' },
  { provider: 'COD', label: 'Cash on Delivery', isEnabled: true, isTestMode: false, testKeyId: '', testSecret: '', liveKeyId: '', liveSecret: '' },
]

const SHIPPING_PARTNERS: SP[] = [
  { name: 'SHIPROCKET', label: 'Shiprocket', isEnabled: false, apiKey: '', apiSecret: '', webhookUrl: '' },
  { name: 'DELHIVERY', label: 'Delhivery', isEnabled: false, apiKey: '', apiSecret: '', webhookUrl: '' },
  { name: 'DTDC', label: 'DTDC', isEnabled: false, apiKey: '', apiSecret: '', webhookUrl: '' },
  { name: 'BLUEDART', label: 'Blue Dart', isEnabled: false, apiKey: '', apiSecret: '', webhookUrl: '' },
  { name: 'ECOMEXPRESS', label: 'Ecom Express', isEnabled: false, apiKey: '', apiSecret: '', webhookUrl: '' },
  { name: 'CUSTOM', label: 'Custom / Manual', isEnabled: true, apiKey: '', apiSecret: '', webhookUrl: '' },
]

export default function AdminSettingsPage() {
  const searchParams = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') ?? 'general')

  useEffect(() => {
    const t = searchParams.get('tab')
    if (t) setTab(t)
  }, [searchParams])
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState('')
  const [gateways, setGateways] = useState<GW[]>(GATEWAYS)
  const [shippingPartners, setShippingPartners] = useState<SP[]>(SHIPPING_PARTNERS)
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({})
  const [smtp, setSmtp] = useState<SmtpConfig>({ host: 'smtp.gmail.com', port: '587', user: '', pass: '', from: '' })
  const [wa, setWa] = useState<WaConfig>({ provider: 'INTERAKT', apiUrl: '', token: '', fromNumber: '', templateNamespace: '' })
  const [upi, setUpi] = useState<UpiConfig>({ vpa: '', payeeName: 'Naturalife', merchantCode: '' })
  const [testEnv, setTestEnv] = useState<TestEnvConfig>({ email: 'rohilla77@gmail.com', phone: '8950205038', testCard: '4111111111111111', testUpi: 'success@razorpay', testMode: 'TEST' })

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 4000) }

  const load = useCallback(async () => {
    const [gwRes, spRes, ssRes] = await Promise.all([
      fetch('/api/admin/gateways').then(r => r.json()).catch(() => []),
      fetch('/api/admin/shipping-partners').then(r => r.json()).catch(() => []),
      fetch('/api/admin/site-settings-all').then(r => r.json()).catch(() => ({})),
    ])
    if (gwRes?.length) {
      setGateways(GATEWAYS.map(g => gwRes.find((r: GW) => r.provider === g.provider) ?? g))
    }
    if (spRes?.length) {
      setShippingPartners(SHIPPING_PARTNERS.map(s => spRes.find((r: SP) => r.name === s.name) ?? s))
    }
    if (ssRes) {
      setSiteSettings(ssRes)
      if (ssRes.smtp) setSmtp({ ...smtp, ...ssRes.smtp })
      if (ssRes.whatsapp) setWa({ ...wa, ...ssRes.whatsapp })
      if (ssRes.upi) setUpi({ ...upi, ...ssRes.upi })
      if (ssRes.test_env) setTestEnv({ ...testEnv, ...ssRes.test_env })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => { load() }, [load])

  // ─── Save handlers ─────────────────────────────────────────────────────────
  const saveGateway = async (gw: GW) => {
    setBusy(gw.provider)
    const res = await fetch('/api/admin/gateways', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gw) })
    setBusy('')
    showToast(res.ok ? `${gw.label} saved` : 'Save failed')
  }

  const saveShipping = async (sp: SP) => {
    setBusy(sp.name)
    const res = await fetch('/api/admin/shipping-partners', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sp) })
    setBusy('')
    showToast(res.ok ? `${sp.label} saved` : 'Save failed')
  }

  const saveSettings = async (key: string, value: any, label: string) => {
    setBusy(key)
    const res = await fetch('/api/admin/site-settings-all', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) })
    setBusy('')
    showToast(res.ok ? `${label} saved` : 'Save failed')
  }

  const testSmtp = async () => {
    setBusy('test-smtp')
    const res = await fetch('/api/admin/test-smtp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(smtp) })
    const d = await res.json()
    setBusy('')
    showToast(d.ok ? 'Test email sent! Check inbox.' : `SMTP failed: ${d.error}`)
  }

  const testWhatsapp = async () => {
    setBusy('test-wa')
    const res = await fetch('/api/admin/test-whatsapp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...wa, to: testEnv.phone }) })
    const d = await res.json()
    setBusy('')
    showToast(d.ok ? `WhatsApp sent to ${testEnv.phone}` : `WA failed: ${d.error}`)
  }

  return (
    <div>
      {toast && <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-5 py-3 shadow-xl">{toast}</div>}

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings & Configuration</h1>
      </div>

      {/* Tab bar */}
      <div className="flex gap-0 border-b border-gray-200 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? 'border-green-600 text-green-700' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── General ── */}
      {tab === 'general' && (
        <GeneralTab siteSettings={siteSettings} saveSettings={saveSettings} busy={busy} />
      )}

      {/* ── Payment Gateways ── */}
      {tab === 'payment' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
            <strong>Security note:</strong> Keys are stored in the database. For production, consider using environment variables for highest security.
            In TEST mode, the gateway uses sandbox credentials and no real money is charged.
          </div>
          {gateways.map((gw, idx) => (
            <Section key={gw.provider} title={gw.label}>
              <div className="grid grid-cols-2 gap-4">
                {/* Enable toggle */}
                <div className="col-span-2 flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={gw.isEnabled}
                      onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, isEnabled: e.target.checked } : g))}
                      className="w-4 h-4 accent-green-600" />
                    <span className="text-sm font-medium">Enabled</span>
                  </label>
                  {gw.provider !== 'COD' && (
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={gw.isTestMode}
                        onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, isTestMode: e.target.checked } : g))}
                        className="w-4 h-4 accent-orange-500" />
                      <span className="text-sm font-medium text-orange-700">Test Mode (sandbox)</span>
                    </label>
                  )}
                </div>

                {gw.provider !== 'COD' && (
                  <>
                    <div className="col-span-2">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-orange-50 border border-orange-100">
                        <p className="col-span-2 text-xs font-semibold text-orange-700 uppercase tracking-wide">Test / Sandbox Keys</p>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{gw.provider === 'PAYU' ? 'Merchant Key' : 'Key ID / Publishable Key'}</label>
                          <input value={gw.testKeyId} onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, testKeyId: e.target.value } : g))}
                            placeholder={gw.provider === 'RAZORPAY' ? 'rzp_test_...' : gw.provider === 'STRIPE' ? 'pk_test_...' : 'test_key...'}
                            className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{gw.provider === 'PAYU' ? 'Salt' : 'Secret Key'}</label>
                          <input type="password" value={gw.testSecret} onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, testSecret: e.target.value } : g))}
                            placeholder="••••••••••••"
                            className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 border border-green-100">
                        <p className="col-span-2 text-xs font-semibold text-green-700 uppercase tracking-wide">Live / Production Keys</p>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{gw.provider === 'PAYU' ? 'Merchant Key' : 'Key ID / Publishable Key'}</label>
                          <input value={gw.liveKeyId} onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, liveKeyId: e.target.value } : g))}
                            placeholder={gw.provider === 'RAZORPAY' ? 'rzp_live_...' : gw.provider === 'STRIPE' ? 'pk_live_...' : 'live_key...'}
                            className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">{gw.provider === 'PAYU' ? 'Salt' : 'Secret Key'}</label>
                          <input type="password" value={gw.liveSecret} onChange={e => setGateways(prev => prev.map((g, i) => i === idx ? { ...g, liveSecret: e.target.value } : g))}
                            placeholder="••••••••••••"
                            className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                        </div>
                      </div>
                    </div>
                    {gw.provider === 'RAZORPAY' && (
                      <div className="col-span-2 bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100">
                        <strong>Test cards:</strong> 4111 1111 1111 1111 (Visa) / 5267 3181 8797 5449 (Mastercard) — any future date, CVV 123<br/>
                        <strong>Test UPI:</strong> success@razorpay (success) / failure@razorpay (failure)<br/>
                        <strong>Test NetBanking:</strong> any bank, use test credentials shown in Razorpay modal
                      </div>
                    )}
                    {gw.provider === 'STRIPE' && (
                      <div className="col-span-2 bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100">
                        <strong>Test card:</strong> 4242 4242 4242 4242 — any future date, CVC 424<br/>
                        <strong>3D Secure test:</strong> 4000 0027 6000 3184<br/>
                        <strong>Decline test:</strong> 4000 0000 0000 0002
                      </div>
                    )}
                    {gw.provider === 'PAYU' && (
                      <div className="col-span-2 bg-gray-50 p-3 text-xs text-gray-600 border border-gray-100">
                        <strong>Test key:</strong> gtKFFx | <strong>Test salt:</strong> eCwWELxi<br/>
                        <strong>Test card:</strong> 4012001037141112 — Exp: 05/25, CVV: 123
                      </div>
                    )}
                  </>
                )}

                <div className="col-span-2 flex justify-end">
                  <button onClick={() => saveGateway(gw)} disabled={busy === gw.provider}
                    className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
                    style={{ backgroundColor: 'var(--green)' }}>
                    {busy === gw.provider ? 'Saving...' : `Save ${gw.label}`}
                  </button>
                </div>
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* ── UPI / QR ── */}
      {tab === 'upi' && (
        <Section title="UPI & QR Code Payment">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">UPI VPA (Virtual Payment Address)</label>
              <input value={upi.vpa} onChange={e => setUpi(u => ({ ...u, vpa: e.target.value }))}
                placeholder="yourname@oksbi / yourname@paytm"
                className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Payee Name</label>
              <input value={upi.payeeName} onChange={e => setUpi(u => ({ ...u, payeeName: e.target.value }))}
                placeholder="Naturalife"
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Merchant Code (optional)</label>
              <input value={upi.merchantCode} onChange={e => setUpi(u => ({ ...u, merchantCode: e.target.value }))}
                placeholder="For PayTM / PhonePe merchant"
                className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
            </div>
          </div>
          <div className="mt-4 bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
            <strong>How it works:</strong> When a customer selects UPI at checkout, a QR code is generated using the UPI VPA above.
            The customer scans with any UPI app (GPay, PhonePe, Paytm, etc.). For automated verification, configure a Razorpay or Stripe webhook.
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => saveSettings('upi', upi, 'UPI settings')} disabled={busy === 'upi'}
              className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
              style={{ backgroundColor: 'var(--green)' }}>
              {busy === 'upi' ? 'Saving...' : 'Save UPI Settings'}
            </button>
          </div>
        </Section>
      )}

      {/* ── Email & WhatsApp ── */}
      {tab === 'comms' && (
        <div className="space-y-5">
          {/* SMTP */}
          <Section title="SMTP Email Configuration">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">SMTP Host</label>
                <input value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))}
                  placeholder="smtp.gmail.com"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Port</label>
                <input value={smtp.port} onChange={e => setSmtp(s => ({ ...s, port: e.target.value }))}
                  placeholder="587"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Username / Email</label>
                <input value={smtp.user} onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))}
                  placeholder="rohilla77@gmail.com"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Password / App Password</label>
                <input type="password" value={smtp.pass} onChange={e => setSmtp(s => ({ ...s, pass: e.target.value }))}
                  placeholder="Gmail App Password (16 chars)"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">From Name & Email</label>
                <input value={smtp.from} onChange={e => setSmtp(s => ({ ...s, from: e.target.value }))}
                  placeholder="Naturalife &lt;rohilla77@gmail.com&gt;"
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
              </div>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-100 p-3 text-xs text-amber-800">
              <strong>Gmail tip:</strong> Enable 2FA on your Google account, then create an <em>App Password</em> at myaccount.google.com/apppasswords.
              Use the 16-char app password (not your Gmail password) here.
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={testSmtp} disabled={busy === 'test-smtp'}
                className="px-4 py-2 text-sm border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50">
                {busy === 'test-smtp' ? 'Sending...' : `Send test to ${testEnv.email}`}
              </button>
              <button onClick={() => saveSettings('smtp', smtp, 'SMTP')} disabled={busy === 'smtp'}
                className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--green)' }}>
                {busy === 'smtp' ? 'Saving...' : 'Save SMTP'}
              </button>
            </div>
          </Section>

          {/* WhatsApp */}
          <Section title="WhatsApp Business API">
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-600 mb-1">Provider</label>
              <select value={wa.provider} onChange={e => setWa(w => ({ ...w, provider: e.target.value }))}
                className="border border-gray-200 px-3 py-2 text-sm rounded-none w-48">
                <option value="INTERAKT">Interakt</option>
                <option value="WATI">WATI</option>
                <option value="TWILIO">Twilio</option>
                <option value="META">Meta (WhatsApp Cloud API)</option>
                <option value="GUPSHUP">Gupshup</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">API URL / Endpoint</label>
                <input value={wa.apiUrl} onChange={e => setWa(w => ({ ...w, apiUrl: e.target.value }))}
                  placeholder="https://api.interakt.ai/v1/public/message/"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">API Token / Auth Key</label>
                <input type="password" value={wa.token} onChange={e => setWa(w => ({ ...w, token: e.target.value }))}
                  placeholder="Bearer token or API key"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">From Number (WhatsApp)</label>
                <input value={wa.fromNumber} onChange={e => setWa(w => ({ ...w, fromNumber: e.target.value }))}
                  placeholder="+918950205038"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Template Namespace (optional)</label>
                <input value={wa.templateNamespace} onChange={e => setWa(w => ({ ...w, templateNamespace: e.target.value }))}
                  placeholder="Meta template namespace"
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
              </div>
            </div>
            <div className="mt-4 flex gap-3 justify-end">
              <button onClick={testWhatsapp} disabled={busy === 'test-wa'}
                className="px-4 py-2 text-sm border border-gray-300 rounded-none hover:bg-gray-50 disabled:opacity-50">
                {busy === 'test-wa' ? 'Sending...' : `Send test to ${testEnv.phone}`}
              </button>
              <button onClick={() => saveSettings('whatsapp', wa, 'WhatsApp')} disabled={busy === 'whatsapp'}
                className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--green)' }}>
                {busy === 'whatsapp' ? 'Saving...' : 'Save WhatsApp'}
              </button>
            </div>
          </Section>
        </div>
      )}

      {/* ── Shipping Partners ── */}
      {tab === 'shipping' && (
        <div className="space-y-4">
          {shippingPartners.map((sp, idx) => (
            <Section key={sp.name} title={sp.label}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" checked={sp.isEnabled}
                    onChange={e => setShippingPartners(prev => prev.map((s, i) => i === idx ? { ...s, isEnabled: e.target.checked } : s))}
                    className="w-4 h-4 accent-green-600" id={`sp-${sp.name}`} />
                  <label htmlFor={`sp-${sp.name}`} className="text-sm font-medium">Enabled</label>
                </div>
                {sp.name !== 'CUSTOM' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">API Key</label>
                      <input type="password" value={sp.apiKey}
                        onChange={e => setShippingPartners(prev => prev.map((s, i) => i === idx ? { ...s, apiKey: e.target.value } : s))}
                        placeholder="API key"
                        className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">API Secret / Password</label>
                      <input type="password" value={sp.apiSecret}
                        onChange={e => setShippingPartners(prev => prev.map((s, i) => i === idx ? { ...s, apiSecret: e.target.value } : s))}
                        placeholder="API secret"
                        className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Webhook URL (for auto status updates)</label>
                      <input value={sp.webhookUrl}
                        onChange={e => setShippingPartners(prev => prev.map((s, i) => i === idx ? { ...s, webhookUrl: e.target.value } : s))}
                        placeholder="https://naturalife-kappa.vercel.app/api/webhooks/shipping"
                        className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                    </div>
                  </>
                )}
                {sp.name === 'CUSTOM' && (
                  <div className="col-span-2 bg-gray-50 p-3 text-sm text-gray-600 border border-gray-100">
                    Custom / Manual shipping — tracking numbers and courier details can be entered manually on each order in the Orders admin panel.
                  </div>
                )}
                <div className="col-span-2 flex justify-end">
                  <button onClick={() => saveShipping(sp)} disabled={busy === sp.name}
                    className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
                    style={{ backgroundColor: 'var(--green)' }}>
                    {busy === sp.name ? 'Saving...' : `Save ${sp.label}`}
                  </button>
                </div>
              </div>
            </Section>
          ))}
        </div>
      )}

      {/* ── Test Environment ── */}
      {tab === 'testenv' && (
        <div className="space-y-5">
          <Section title="Test Contact Details">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Test Email (receives all test notifications)</label>
                <input value={testEnv.email} onChange={e => setTestEnv(t => ({ ...t, email: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Test WhatsApp Mobile Number</label>
                <input value={testEnv.phone} onChange={e => setTestEnv(t => ({ ...t, phone: e.target.value }))}
                  placeholder="9876543210"
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
              </div>
            </div>
          </Section>

          <Section title="Test Payment Credentials">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Test Card Number</label>
                <input value={testEnv.testCard} onChange={e => setTestEnv(t => ({ ...t, testCard: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                <p className="text-xs text-gray-400 mt-1">Exp: any future date • CVV: 123 • OTP: 1234 (Razorpay test)</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Test UPI ID</label>
                <input value={testEnv.testUpi} onChange={e => setTestEnv(t => ({ ...t, testUpi: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm font-mono rounded-none" />
                <p className="text-xs text-gray-400 mt-1">success@razorpay (auto-succeeds) | failure@razorpay (auto-fails)</p>
              </div>
            </div>

            <div className="mt-5 p-4 bg-gray-50 border border-gray-100 rounded-none">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Reference — Razorpay Test Cards</h4>
              <table className="w-full text-xs text-gray-600">
                <thead><tr className="border-b border-gray-200">
                  <th className="text-left py-1 pr-4">Card Number</th>
                  <th className="text-left py-1 pr-4">Network</th>
                  <th className="text-left py-1">Result</th>
                </tr></thead>
                <tbody className="font-mono">
                  {[
                    ['4111 1111 1111 1111', 'Visa', 'Success'],
                    ['5267 3181 8797 5449', 'Mastercard', 'Success'],
                    ['4000 0000 0000 0002', 'Visa', 'Declined'],
                    ['4000 0025 0000 3155', 'Visa', '3D Secure Auth'],
                  ].map(([num, net, res]) => (
                    <tr key={num} className="border-b border-gray-100">
                      <td className="py-1.5 pr-4">{num}</td>
                      <td className="py-1.5 pr-4 font-sans">{net}</td>
                      <td className={`py-1.5 font-sans font-medium ${res === 'Success' ? 'text-green-600' : res === 'Declined' ? 'text-red-600' : 'text-orange-600'}`}>{res}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                <div><strong>CVV:</strong> 123</div>
                <div><strong>Expiry:</strong> Any future date</div>
                <div><strong>OTP (3DS):</strong> 1234</div>
                <div><strong>UPI success:</strong> success@razorpay</div>
              </div>
            </div>
          </Section>

          <Section title="Notification Mode">
            <div className="flex gap-3 mb-4">
              {(['TEST', 'LIVE'] as const).map(mode => (
                <button key={mode} onClick={() => setTestEnv(t => ({ ...t, testMode: mode }))}
                  className={`px-6 py-2 text-sm font-semibold rounded-none transition-colors ${testEnv.testMode === mode
                    ? mode === 'TEST' ? 'bg-orange-500 text-white' : 'bg-green-600 text-white'
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                  {mode} MODE
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500 mb-4">
              In TEST mode all email/WhatsApp notifications are sent to <strong>{testEnv.email}</strong> / <strong>+91{testEnv.phone}</strong> instead of the real customer.
            </p>
            <div className="flex justify-end">
              <button onClick={() => saveSettings('test_env', testEnv, 'Test environment')} disabled={busy === 'test_env'}
                className="px-5 py-2 text-sm text-white font-medium rounded-none disabled:opacity-50"
                style={{ backgroundColor: 'var(--green)' }}>
                {busy === 'test_env' ? 'Saving...' : 'Save Test Settings'}
              </button>
            </div>
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm overflow-hidden rounded-none">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
        <h2 className="font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  )
}

function SettingField({ label, settingKey, defaultVal, busy, onSave }: {
  label: string; settingKey: string; defaultVal: string; busy: string
  onSave: (key: string, val: string, label: string) => void
}) {
  const [val, setVal] = useState(defaultVal)
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      <div className="flex gap-2">
        <input value={val} onChange={e => setVal(e.target.value)} className="flex-1 border border-gray-200 px-3 py-2 text-sm rounded-none" />
        <button onClick={() => onSave(settingKey, val, label)} disabled={busy === settingKey}
          className="px-3 py-2 text-xs bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 whitespace-nowrap">
          {busy === settingKey ? '...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

function GeneralTab({ siteSettings, saveSettings, busy }: {
  siteSettings: Record<string, any>
  saveSettings: (key: string, value: any, label: string) => void
  busy: string
}) {
  const FIELDS = [
    { label: 'Company Name', key: 'company_name', def: 'Naturalife' },
    { label: 'GST Number', key: 'company_gst', def: '' },
    { label: 'Phone', key: 'company_phone', def: '' },
    { label: 'Email', key: 'company_email', def: '' },
    { label: 'WhatsApp Number', key: 'company_whatsapp', def: '' },
    { label: 'Free Shipping above (₹)', key: 'free_shipping_threshold', def: '1000' },
    { label: 'Domestic Shipping Fee (₹)', key: 'domestic_shipping_fee', def: '100' },
  ]
  return (
    <Section title="General Site Settings">
      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map(f => (
          <SettingField key={f.key} label={f.label} settingKey={f.key}
            defaultVal={siteSettings[f.key]?.value ?? f.def}
            busy={busy} onSave={(k, v, l) => saveSettings(k, { value: v }, l)} />
        ))}
      </div>
    </Section>
  )
}
