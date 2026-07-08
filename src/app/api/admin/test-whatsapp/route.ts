import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || !['ADMIN', 'MASTER_ADMIN'].includes((session.user as any).role))
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider, apiUrl, token, fromNumber, to } = await req.json()
  if (!token || !to) return NextResponse.json({ error: 'token and to required' }, { status: 400 })

  const testMessage = 'This is a test message from Naturalife admin settings. WhatsApp API is configured correctly.'

  try {
    if (provider === 'TWILIO') {
      // Twilio REST API
      const [accountSid, authToken] = token.split(':')
      const body = new URLSearchParams({
        From: `whatsapp:${fromNumber}`,
        To: `whatsapp:+91${to.replace(/^(\+91|91)/, '')}`,
        Body: testMessage,
      })
      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      })
      if (!res.ok) { const d = await res.json(); throw new Error(d.message ?? 'Twilio error') }
    } else if (provider === 'META' || provider === 'INTERAKT' || provider === 'GUPSHUP') {
      // Generic Bearer token API call
      const url = apiUrl || `https://api.interakt.ai/v1/public/message/`
      const toNum = to.replace(/^(\+91|91)/, '')
      const payload = provider === 'META'
        ? { messaging_product: 'whatsapp', to: `91${toNum}`, type: 'text', text: { body: testMessage } }
        : { countryCode: '+91', phoneNumber: toNum, callbackData: 'test', type: 'Text', message: { value: { body: testMessage } } }
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(JSON.stringify(d)) }
    } else if (provider === 'WATI') {
      const toNum = `91${to.replace(/^(\+91|91)/, '')}`
      const url = apiUrl || `https://live-server.wati.io/api/v1/sendSessionMessage/${toNum}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: testMessage }),
      })
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(JSON.stringify(d)) }
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 400 })
  }
}
