'use client'

export function WhatsAppOrderQR({ size = 200 }: { size?: number }) {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? ''
  const message = encodeURIComponent("Hi, I'd like to place an order with Naturalife.")
  const waLink = `https://wa.me/${whatsappNumber}?text=${message}`
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(waLink)}`

  return (
    <div className="inline-flex flex-col items-center gap-2 p-4 bg-white border border-[var(--line)]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={qrUrl} alt="Scan to order on WhatsApp" width={size} height={size} />
      <p className="text-xs text-gray-500 text-center max-w-[200px]">Scan with your phone camera to start an order on WhatsApp</p>
      <a href={qrUrl} download="naturalife-whatsapp-order-qr.png" className="text-xs font-medium hover:underline" style={{ color: 'var(--green)' }}>
        Download QR Code
      </a>
    </div>
  )
}
