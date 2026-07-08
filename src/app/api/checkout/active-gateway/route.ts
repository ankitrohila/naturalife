import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint — returns only the publishable key, never secrets.
export async function GET() {
  try {
    const [gw, upiSetting] = await Promise.all([
      prisma.gatewayConfig.findFirst({ where: { isEnabled: true, provider: { in: ['RAZORPAY', 'STRIPE', 'PAYU'] } } }),
      prisma.siteSettings.findUnique({ where: { key: 'upi' } }),
    ])

    const upi = upiSetting?.value as any
    const upiVpa = upi?.vpa || process.env.UPI_VPA || ''

    if (!gw) {
      return NextResponse.json({ provider: 'NONE', publicKey: '', isTestMode: true, upiVpa })
    }

    const publicKey = gw.isTestMode ? gw.testKeyId : gw.liveKeyId

    return NextResponse.json({
      provider: gw.provider,
      publicKey,
      isTestMode: gw.isTestMode,
      upiVpa,
    })
  } catch {
    return NextResponse.json({ provider: 'NONE', publicKey: '', isTestMode: true, upiVpa: process.env.UPI_VPA || '' })
  }
}
