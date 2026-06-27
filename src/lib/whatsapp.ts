import twilio from 'twilio'

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

interface WhatsAppMessage {
  to: string
  message: string
  event: 'ORDER_PLACED' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'REFUND_DONE'
}

export async function sendWhatsAppMessage(payload: WhatsAppMessage): Promise<boolean> {
  try {
    // Format phone number to E.164 format
    const phoneNumber = payload.to.startsWith('+') ? payload.to : `+91${payload.to}`

    const notificationMode = process.env.NOTIFICATION_MODE || 'LIVE'
    const testNumber = process.env.NOTIFICATION_TEST_WHATSAPP || '+919999900000'

    // In test mode, send to test number
    const finalNumber = notificationMode === 'TEST' ? testNumber : phoneNumber

    await client.messages.create({
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
      to: `whatsapp:${finalNumber}`,
      body: payload.message,
    })

    console.log(`✓ WhatsApp message sent to ${finalNumber}`)
    return true
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    // Don't throw - notifications shouldn't break order flow
    return false
  }
}

export function buildWhatsAppMessage(
  event: 'ORDER_PLACED' | 'ORDER_DISPATCHED' | 'ORDER_DELIVERED' | 'REFUND_DONE',
  order: any
): string {
  const templates: Record<string, string> = {
    ORDER_PLACED: `नमस्ते ${order.user?.name || 'Customer'}! 🙏\n\nआपका ऑर्डर #${order.orderNumber} सफलतापूर्वक प्राप्त हुआ।\n\nकुल राशि: ₹${order.total}\n\nट्रैक करें: https://naturalife.in/orders/${order.orderNumber}\n\nधन्यवाद!`,

    ORDER_DISPATCHED: `खुशखबरी! 📦\n\nआपका ऑर्डर #${order.orderNumber} डिस्पैच हो गया।\n\nट्रैकिंग: ${order.trackingUrl || 'https://naturalife.in/orders/' + order.orderNumber}\n\nशीघ्र डिलीवरी के लिए तैयार रहें!`,

    ORDER_DELIVERED: `🎉 आपका ऑर्डर #${order.orderNumber} डिलीवर हो गया!\n\nNaturallife के साथ खरीदारी करने के लिए धन्यवाद।\n\nअपनी राय साझा करें और कोइन अर्जित करें! ⭐`,

    REFUND_DONE: `✓ आपकी रिफंड ₹${order.total} प्रक्रिया में है।\n\nऑर्डर #${order.orderNumber}\n\n3-5 व्यावसायिक दिनों में आपके खाते में पहुंच जाएगी।`,
  }

  return templates[event] || ''
}
