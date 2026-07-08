import nodemailer from 'nodemailer'
import { prisma } from './prisma'

// ─── SMTP ─────────────────────────────────────────────────────────────────────
// Build a transporter lazily: DB settings take precedence over env vars.
async function getSmtpTransporter() {
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'smtp' } }).catch(() => null)
  const cfg = setting?.value as any
  if (cfg?.host && cfg?.user && cfg?.pass) {
    return nodemailer.createTransport({
      host: cfg.host,
      port: parseInt(cfg.port || '587'),
      secure: cfg.port === '465',
      auth: { user: cfg.user, pass: cfg.pass },
    })
  }
  // Env-var fallback
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

async function getSmtpFrom(): Promise<string> {
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'smtp' } }).catch(() => null)
  const cfg = setting?.value as any
  return cfg?.from || process.env.SMTP_FROM || 'Naturalife <noreply@naturalife.in>'
}

// ─── WhatsApp ─────────────────────────────────────────────────────────────────
export async function sendWhatsAppMessage(
  to: string,
  body: string,
): Promise<{ sent: boolean; simulated: boolean; error?: string }> {
  const toE164 = to.startsWith('+') ? to : `+91${to.replace(/\D/g, '')}`

  // Read WhatsApp config from DB
  const setting = await prisma.siteSettings.findUnique({ where: { key: 'whatsapp' } }).catch(() => null)
  const wa = setting?.value as any

  const logAndReturn = async (status: string, preview: string, sent: boolean, simulated: boolean, error?: string) => {
    await prisma.notificationLog.create({
      data: { event: 'WHATSAPP_MESSAGE', channel: 'WHATSAPP', recipient: to, status, preview: preview.slice(0, 500) },
    }).catch(() => {})
    return { sent, simulated, error }
  }

  if (wa?.token && wa?.apiUrl) {
    try {
      let response: Response
      if (wa.provider === 'TWILIO') {
        // Twilio REST API (Basic auth with SID:token)
        const [sid, token] = (wa.token as string).split(':')
        const fromNumber = wa.fromNumber?.replace(/\D/g, '') || ''
        response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({ From: `whatsapp:+${fromNumber}`, To: `whatsapp:${toE164}`, Body: body }),
        })
      } else if (wa.provider === 'INTERAKT') {
        response = await fetch(wa.apiUrl, {
          method: 'POST',
          headers: { Authorization: `Basic ${wa.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ countryCode: '+91', phoneNumber: to.replace(/\D/g, ''), callbackData: 'order_notification', type: 'Text', template: { name: 'order_update', languageCode: 'en', bodyValues: [body] } }),
        })
      } else {
        // WATI, Meta, Gupshup — Bearer token
        response = await fetch(wa.apiUrl, {
          method: 'POST',
          headers: { Authorization: `Bearer ${wa.token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ messaging_product: 'whatsapp', to: toE164.replace('+', ''), type: 'text', text: { body } }),
        })
      }

      if (!response.ok) {
        const err = await response.text()
        return logAndReturn('FAILED', err, false, false, err)
      }
      return logAndReturn('SENT', body, true, false)
    } catch (err: any) {
      return logAndReturn('FAILED', err?.message ?? 'Network error', false, false, err?.message)
    }
  }

  // No WhatsApp config — simulate
  return logAndReturn('SIMULATED', body, false, true)
}

// ─── Notification events ───────────────────────────────────────────────────────
interface NotificationPayload {
  event: 'ORDER_PLACED' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'RETURN_REQUESTED' | 'REFUND_DONE'
  orderId: string
  recipientEmail?: string
  recipientPhone?: string
}

function buildOrderPlacedHTML(order: any, items: any[]): string {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.name}</strong><br/>
        Qty: ${item.qty}
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #e5e5e5; text-align: right;">
        ₹${(item.price * item.qty).toLocaleString('en-IN')}
      </td>
    </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 0; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: #2E7D32; color: white; padding: 24px; text-align: center; }
    .content { padding: 24px; }
    .section { margin: 20px 0; padding: 16px; background: #FAF7F0; }
    .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .price-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .price-total { display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; border-top: 2px solid #2E7D32; color: #2E7D32; font-size: 18px; }
    .button { background: #2E7D32; color: white; padding: 12px 30px; text-decoration: none; display: inline-block; margin: 15px 0; }
    .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2 style="margin:0">Order Confirmed!</h2></div>
    <div class="content">
      <p>Hi ${order.user.name},</p>
      <p>Thank you for your order! We're delighted to confirm that your order has been placed successfully.</p>
      <div class="section">
        <strong>Order Number:</strong> ${order.orderNumber}<br/>
        <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}
      </div>
      <table class="items-table">${itemsHtml}</table>
      <div>
        <div class="price-row"><span>Subtotal</span><span>₹${Number(order.subtotal).toLocaleString('en-IN')}</span></div>
        <div class="price-row"><span>Tax (GST)</span><span>₹${Number(order.taxAmount).toLocaleString('en-IN')}</span></div>
        <div class="price-row"><span>Shipping</span><span>${Number(order.shippingCharge) === 0 ? 'FREE' : '₹' + Number(order.shippingCharge)}</span></div>
        <div class="price-total"><span>Total</span><span>₹${Number(order.total).toLocaleString('en-IN')}</span></div>
      </div>
      <div class="section">
        <p>Your order is being processed. You'll receive tracking info once dispatched.</p>
        <a href="https://naturalife.in/account/orders" class="button">View My Orders</a>
      </div>
      <p style="color:#666;font-size:14px">Questions? Contact us at support@naturalife.in</p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Naturalife. Handcrafted Indian Home Textiles</div>
  </div>
</body>
</html>`
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const modeSetting = await prisma.siteSettings.findUnique({ where: { key: 'notification_mode' } }).catch(() => null)
  const testEnvSetting = await prisma.siteSettings.findUnique({ where: { key: 'test_env' } }).catch(() => null)
  const notificationMode = (modeSetting?.value as any)?.mode || (testEnvSetting?.value as any)?.testMode || 'TEST'
  const testEmail = (testEnvSetting?.value as any)?.email || process.env.NOTIFICATION_TEST_EMAIL || ''
  const testPhone = (testEnvSetting?.value as any)?.phone || process.env.NOTIFICATION_TEST_WHATSAPP || ''

  const order = await prisma.order.findUnique({
    where: { id: payload.orderId },
    include: {
      user: true,
      items: { include: { variant: { include: { product: true } } } },
      address: true,
      distributor: true,
    },
  })
  if (!order) throw new Error('Order not found')

  const rawEmail = payload.recipientEmail || order.user.primaryEmail
  const rawPhone = payload.recipientPhone || order.user.primaryPhone || ''
  const finalEmail = notificationMode === 'TEST' && testEmail ? testEmail : rawEmail
  const finalPhone = notificationMode === 'TEST' && testPhone ? testPhone : rawPhone

  if (payload.event === 'ORDER_PLACED') {
    const items = order.items.map((item) => ({
      name: item.variant.product.name,
      qty: item.quantity,
      price: Number(item.unitPrice),
    }))

    // Email
    try {
      const transporter = await getSmtpTransporter()
      const from = await getSmtpFrom()
      await transporter.sendMail({
        from,
        to: finalEmail,
        subject: `Order Confirmed: ${order.orderNumber}`,
        html: buildOrderPlacedHTML(order, items),
      })
      await prisma.notificationLog.create({
        data: { event: 'ORDER_PLACED', channel: 'EMAIL', recipient: finalEmail, status: 'SENT', preview: `Order ${order.orderNumber} email sent` },
      }).catch(() => {})
    } catch (err: any) {
      await prisma.notificationLog.create({
        data: { event: 'ORDER_PLACED', channel: 'EMAIL', recipient: finalEmail, status: 'FAILED', preview: err?.message?.slice(0, 500) ?? 'Email failed' },
      }).catch(() => {})
    }

    // WhatsApp
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005'
    const waMessage = formatWhatsAppMessage('ORDER_PLACED', order) + `\n\nInvoice: ${baseUrl}/api/invoices/${order.id}`
    await sendWhatsAppMessage(finalPhone, waMessage)
  }
}

export function formatWhatsAppMessage(event: string, order: any): string {
  const messages: Record<string, string> = {
    ORDER_PLACED: `Hi ${order.user.name}! Your order #${order.orderNumber} has been placed. Total: ₹${Number(order.total).toLocaleString('en-IN')}.`,
    ORDER_DISPATCHED: `Your order #${order.orderNumber} has been dispatched! Track: ${order.trackingUrl || 'https://naturalife.in/account/orders'}`,
    ORDER_DELIVERED: `Your order #${order.orderNumber} has been delivered! Thank you for shopping with Naturalife.`,
    RETURN_REQUESTED: `Your return request for order #${order.orderNumber} has been initiated. Pickup will be arranged soon.`,
    REFUND_DONE: `Refund of ₹${Number(order.total).toLocaleString('en-IN')} for order #${order.orderNumber} has been processed. Allow 3-5 business days.`,
  }
  return messages[event] || ''
}
