import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get('pincode')

  if (!pincode) {
    return NextResponse.json({ error: 'Pincode required' }, { status: 400 })
  }

  try {
    const pincodeNum = parseInt(pincode)
    if (isNaN(pincodeNum)) {
      return NextResponse.json({ error: 'Invalid pincode' }, { status: 400 })
    }

    // Find state mapping
    const mapping = await prisma.statePincode.findFirst({
      where: {
        pincodeFrom: { lte: pincodeNum },
        pincodeTo: { gte: pincodeNum },
      },
      include: { distributor: true },
    })

    if (!mapping) {
      return NextResponse.json(
        {
          state: null,
          stateName: null,
          distributor: null,
          taxRate: null,
          message: 'Pincode not found in our delivery network',
        },
        { status: 404 }
      )
    }

    // Determine tax rate (IGST for different state, CGST+SGST for same state)
    // Assuming company is in a state - you can configure this in settings
    const companyStateCode = 'RJ' // Default to Rajasthan (Jaipur Rugs region)
    const isSameState = mapping.stateCode === companyStateCode

    return NextResponse.json({
      state: mapping.stateCode,
      stateName: mapping.stateName,
      city: '', // Can be enhanced with city database
      distributor: mapping.distributor
        ? {
            id: mapping.distributor.id,
            name: mapping.distributor.companyName,
            email: mapping.distributor.email,
            phone: mapping.distributor.phone,
            whatsapp: mapping.distributor.whatsappNumber,
          }
        : null,
      taxInfo: isSameState ? { type: 'CGST+SGST', rate: '9%+9%' } : { type: 'IGST', rate: '18%' },
      isSameState,
    })
  } catch (error) {
    console.error('Pincode lookup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
