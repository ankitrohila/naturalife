import nodemailer from 'nodemailer'
import twilio from 'twilio'
import { prisma } from './prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Twilio WhatsApp is only usable with a real Account SID (format "ACxxxxxxxx...").
// With missing/placeholder credentials we run in "simulated" mode: the message
// is logged to NotificationLog instead of actually being sent.
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID ?? ''
const twilioConfigured = /^AC[a-f0-9]{32}$/i.test(TWILIO_SID) && !!process.env.TWILIO_AUTH_TOKEN && !!process.env.TWILIO_WHATSAPP_FROM
const twilioClient = twilioConfigured ? twilio(TWILIO_SID, process.env.TWILIO_AUTH_TOKEN!) : null

export async function sendWhatsAppMessage(to: string, body: string): Promise<{ sent: boolean; simulated: boolean; error?: string }> {
  const toFormatted = to.startsWith('whatsapp:') ? to : `whatsapp:${to.startsWith('+') ? to : `+${to}`}`

  if (!twilioClient) {
    await prisma.notificationLog.create({
      data: { event: 'WHATSAPP_MESSAGE', channel: 'WHATSAPP', recipient: to, status: 'SIMULATED', preview: body.slice(0, 500) },
    })
    return { sent: false, simulated: true }
  }

  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_WHATSAPP_FROM!.startsWith('whatsapp:') ? process.env.TWILIO_WHATSAPP_FROM! : `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: toFormatted,
      body,
    })
    await prisma.notificationLog.create({
      data: { event: 'WHATSAPP_MESSAGE', channel: 'WHATSAPP', recipient: to, status: 'SENT', preview: body.slice(0, 500) },
    })
    return { sent: true, simulated: false }
  } catch (err: any) {
    await prisma.notificationLog.create({
      data: { event: 'WHATSAPP_MESSAGE', channel: 'WHATSAPP', recipient: to, status: 'FAILED', preview: err?.message?.slice(0, 500) ?? 'Unknown error' },
    })
    return { sent: false, simulated: false, error: err?.message }
  }
}

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
    </tr>`
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background: #0A0A0A; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #FAF7F0; border-radius: 8px; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .price-table { width: 100%; margin: 15px 0; }
        .price-row { display: flex; justify-content: space-between; padding: 8px 0; }
        .price-total { display: flex; justify-content: space-between; padding: 12px 0; font-weight: bold; border-top: 2px solid #2E7D32; color: #2E7D32; font-size: 18px; }
        .button { background: #2E7D32; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 15px 0; }
        .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Order Confirmed!</h2>
        </div>
        <div class="content">
          <p>Hi ${order.user.name},</p>
          <p>Thank you for your order! We're delighted to confirm that your order has been placed successfully.</p>

          <div class="section">
            <h3 style="margin: 0 0 10px 0; color: #0A0A0A;">Order Details</h3>
            <strong>Order Number:</strong> ${order.orderNumber}<br/>
            <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN')}<br/>
          </div>

          <table class="items-table">
            ${itemsHtml}
          </table>

          <div class="price-table">
            <div class="price-row">
              <span>Subtotal</span>
              <span>₹${Number(order.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div class="price-row">
              <span>Tax (GST)</span>
              <span>₹${Number(order.taxAmount).toLocaleString('en-IN')}</span>
            </div>
            <div class="price-row">
              <span>Shipping</span>
              <span>${Number(order.shippingCharge) === 0 ? 'FREE' : '₹' + Number(order.shippingCharge)}</span>
            </div>
            <div class="price-total">
              <span>Total</span>
              <span>₹${Number(order.total).toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="section">
            <h3 style="margin: 0 0 10px 0; color: #0A0A0A;">What's Next?</h3>
            <p>Your order has been received and is being processed. You'll receive an email notification when your order is dispatched with tracking information.</p>
            <a href="https://naturalife.in/orders/${order.orderNumber}" class="button">Track Your Order</a>
          </div>

          <p style="color: #666; font-size: 14px;">If you have any questions, contact us at support@naturalife.in or +91 98765 43210</p>
        </div>
        <div class="footer">
          <p>© 2024 Naturalife. Handcrafted Indian Home Textiles</p>
        </div>
      </div>
    </body>
    </html>`
}

export async function sendNotification(payload: NotificationPayload): Promise<void> {
  const settings = await prisma.siteSettings.findUnique({ where: { key: 'notification_mode' } })
  const notificationMode = (settings?.value as any)?.mode || 'TEST'

  // Get order data
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

  const customer = order.user
  const email = payload.recipientEmail || customer.primaryEmail
  const phone = payload.recipientPhone || customer.primaryPhone

  // Route emails based on mode
  const finalEmail = notificationMode === 'TEST' ? process.env.NOTIFICATION_TEST_EMAIL || email : email
  const finalPhone = notificationMode === 'TEST' ? process.env.NOTIFICATION_TEST_WHATSAPP || phone : phone

  // Send email notification
  if (payload.event === 'ORDER_PLACED') {
    const items = order.items.map((item) => ({
      name: item.variant.product.name,
      qty: item.quantity,
      price: Number(item.unitPrice),
    }))

    const emailHtml = buildOrderPlacedHTML(order, items)

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: finalEmail,
      subject: `Order Confirmed: ${order.orderNumber}`,
      html: emailHtml,
    })

    // Log notification
    await prisma.notificationLog.create({
      data: {
        event: 'ORDER_PLACED',
        channel: 'EMAIL',
        recipient: finalEmail,
        status: 'SENT',
        preview: `Order ${order.orderNumber} email sent`,
      },
    })

    // Send WhatsApp invoice notification
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3005'
    const invoiceUrl = `${baseUrl}/api/invoices/${order.id}`
    const waMessage = `${formatWhatsAppMessage('ORDER_PLACED', order)}\n\nDownload your invoice: ${invoiceUrl}`
    await sendWhatsAppMessage(finalPhone, waMessage)
  }

  // Add similar handlers for other events...
}

// Helper function to format WhatsApp message
export function formatWhatsAppMessage(event: string, order: any): string {
  const messages: Record<string, string> = {
    ORDER_PLACED: `Hi ${order.user.name}! Your order #${order.orderNumber} has been placed. Total: ₹${order.total}. Track: https://naturalife.in/orders/${order.orderNumber}`,
    ORDER_DISPATCHED: `Great news! Your order #${order.orderNumber} has been dispatched. Tracking: ${order.trackingUrl || 'https://naturalife.in/orders/' + order.orderNumber}`,
    ORDER_DELIVERED: `Your order #${order.orderNumber} has been delivered! Thank you for shopping with Naturalife. Share your review! 🌟`,
    RETURN_REQUESTED: `Your return request for order #${order.orderNumber} has been initiated. Pickup will be arranged soon.`,
    REFUND_DONE: `Refund of ₹${order.total} for order #${order.orderNumber} has been processed. It may take 3-5 business days to reflect.`,
  }
  return messages[event] || ''
}
