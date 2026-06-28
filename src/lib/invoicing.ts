import { prisma } from './prisma'

interface InvoiceData {
  orderNumber: string
  orderDate: string
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  items: Array<{
    name: string
    qty: number
    price: number
    tax: number
    total: number
  }>
  subtotal: number
  taxAmount: number
  shippingCharge: number
  discount: number
  total: number
  paymentMethod: string
  companyGST: string
  companyAddress: string
  companyPhone: string
}

export async function generateInvoiceHTML(order: any): Promise<string> {
  const items = order.items.map((item: any) => ({
    name: item.variant?.product?.name || 'Product',
    qty: item.quantity,
    price: Number(item.unitPrice),
    tax: Number(item.taxAmount),
    total: Number(item.subtotal) + Number(item.taxAmount),
  }))

  const invoiceData: InvoiceData = {
    orderNumber: order.orderNumber,
    orderDate: new Date(order.createdAt).toLocaleDateString('en-IN'),
    customerName: order.user?.name || 'Customer',
    customerEmail: order.user?.primaryEmail || '',
    customerPhone: order.user?.primaryPhone || '',
    deliveryAddress: `${order.address?.line1}, ${order.address?.city}, ${order.address?.state}`,
    items,
    subtotal: Number(order.subtotal),
    taxAmount: Number(order.taxAmount),
    shippingCharge: Number(order.shippingCharge),
    discount: Number(order.discount),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
    companyGST: '29AABCU9603R1Z0',
    companyAddress: '123 Craft Lane, Jaipur, Rajasthan 302001',
    companyPhone: '+91 98765 43210',
  }

  return generateInvoiceTemplate(invoiceData)
}

function generateInvoiceTemplate(data: InvoiceData): string {
  const itemsHTML = data.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${item.qty}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.tax.toLocaleString('en-IN')}</td>
      <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: right;">₹${item.total.toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      margin: 0;
      padding: 20px;
      background: white;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px;
      border: 1px solid #ddd;
      background: white;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2E7D32;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .company-info h1 {
      color: #0A0A0A;
      margin: 0;
      font-size: 32px;
    }
    .company-info p {
      color: #666;
      margin: 5px 0;
      font-size: 13px;
    }
    .invoice-details {
      text-align: right;
      font-size: 13px;
    }
    .invoice-details h2 {
      color: #2E7D32;
      margin: 0;
      font-size: 18px;
    }
    .invoice-details p {
      margin: 3px 0;
      color: #666;
    }
    .section {
      margin-bottom: 30px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      color: #0A0A0A;
      border-bottom: 2px solid #FAF7F0;
      padding-bottom: 5px;
      margin-bottom: 10px;
    }
    .section-content {
      font-size: 13px;
      line-height: 1.6;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    table th {
      background: #F5EFE0;
      color: #2C2C2C;
      padding: 10px;
      text-align: left;
      border-bottom: 2px solid #0A0A0A;
      font-weight: bold;
      font-size: 13px;
    }
    table td {
      padding: 8px;
      font-size: 13px;
    }
    .totals {
      width: 100%;
      margin-top: 20px;
    }
    .total-row {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
      font-size: 13px;
    }
    .total-label {
      width: 150px;
      text-align: right;
      padding-right: 20px;
      color: #666;
    }
    .total-value {
      width: 100px;
      text-align: right;
      padding-right: 10px;
    }
    .total-row.grand-total {
      border-top: 2px solid #0A0A0A;
      border-bottom: 2px solid #0A0A0A;
      padding: 10px 0;
      font-weight: bold;
      font-size: 16px;
      color: #2E7D32;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      color: #999;
      font-size: 12px;
    }
    .payment-method {
      background: #FAF7F0;
      padding: 10px;
      border-radius: 4px;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="company-info">
        <h1 style="color: #2E7D32;">NATURALIFE</h1>
        <p><strong>GST No:</strong> ${data.companyGST}</p>
        <p><strong>Address:</strong> ${data.companyAddress}</p>
        <p><strong>Phone:</strong> ${data.companyPhone}</p>
      </div>
      <div class="invoice-details">
        <h2>INVOICE</h2>
        <p><strong>Invoice #:</strong> ${data.orderNumber}</p>
        <p><strong>Date:</strong> ${data.orderDate}</p>
      </div>
    </div>

    <!-- Billing & Delivery Info -->
    <div style="display: flex; gap: 40px; margin-bottom: 30px;">
      <div style="flex: 1;">
        <div class="section-title">BILL TO</div>
        <div class="section-content">
          <p><strong>${data.customerName}</strong></p>
          <p>Email: ${data.customerEmail}</p>
          <p>Phone: ${data.customerPhone}</p>
        </div>
      </div>
      <div style="flex: 1;">
        <div class="section-title">DELIVER TO</div>
        <div class="section-content">
          <p>${data.deliveryAddress}</p>
        </div>
      </div>
    </div>

    <!-- Items Table -->
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align: center; width: 80px;">Qty</th>
          <th style="text-align: right; width: 100px;">Unit Price</th>
          <th style="text-align: right; width: 100px;">Tax (18%)</th>
          <th style="text-align: right; width: 100px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="totals">
      <div class="total-row">
        <div class="total-label">Subtotal:</div>
        <div class="total-value">₹${data.subtotal.toLocaleString('en-IN')}</div>
      </div>
      <div class="total-row">
        <div class="total-label">Tax (18% GST):</div>
        <div class="total-value">₹${data.taxAmount.toLocaleString('en-IN')}</div>
      </div>
      <div class="total-row">
        <div class="total-label">Shipping:</div>
        <div class="total-value">₹${data.shippingCharge.toLocaleString('en-IN')}</div>
      </div>
      ${data.discount > 0 ? `
      <div class="total-row">
        <div class="total-label">Discount:</div>
        <div class="total-value">-₹${data.discount.toLocaleString('en-IN')}</div>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <div class="total-label">TOTAL AMOUNT:</div>
        <div class="total-value">₹${data.total.toLocaleString('en-IN')}</div>
      </div>
    </div>

    <!-- Payment Method -->
    <div class="section" style="margin-top: 30px;">
      <div class="payment-method">
        <strong>Payment Method:</strong> ${data.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
      </div>
    </div>

    <!-- Terms -->
    <div class="section" style="margin-top: 40px; background: #F5EFE0; padding: 15px; border-radius: 4px;">
      <div class="section-title">Terms & Conditions</div>
      <div class="section-content" style="font-size: 12px;">
        <ul style="margin: 5px 0; padding-left: 20px;">
          <li>All goods sold are final and non-returnable unless damaged</li>
          <li>Returns accepted within 7 days with original packaging</li>
          <li>Refunds will be processed within 7-10 business days</li>
          <li>Shipping charges are non-refundable</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Thank you for shopping at Naturalife! For support, contact us at support@naturalife.in</p>
      <p style="margin-top: 10px; border-top: 1px solid #ddd; padding-top: 10px;">
        This is a computer-generated invoice and does not require a signature.
      </p>
    </div>
  </div>
</body>
</html>`
}

// Helper function to download invoice
export async function downloadInvoice(orderId: string): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      address: true,
      items: {
        include: { variant: { include: { product: true } } },
      },
    },
  })

  if (!order) throw new Error('Order not found')
  return await generateInvoiceHTML(order)
}
