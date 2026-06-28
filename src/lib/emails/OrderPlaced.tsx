import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface OrderPlacedEmailProps {
  orderNumber: string
  customerName: string
  email: string
  items: Array<{ name: string; qty: number; price: number }>
  subtotal: number
  tax: number
  shipping: number
  total: number
  orderDate: string
}

export const OrderPlacedEmail = ({ orderNumber, customerName, email, items, subtotal, tax, shipping, total, orderDate }: OrderPlacedEmailProps) => (
  <Html>
    <Head />
    <Preview>Order #{orderNumber} confirmed - Naturalife</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Header */}
        <Section style={header}>
          <Img src="https://naturalife.co.in/wp-content/uploads/2020/07/naturalifelogo.png" width="40" height="40" alt="Naturalife" />
          <Text style={headerText}>Order Confirmed</Text>
        </Section>

        <Hr style={hr} />

        {/* Greeting */}
        <Text style={greeting}>Hi {customerName},</Text>
        <Text style={body}>
          Thank you for your order! We're delighted to confirm that your order has been placed successfully.
        </Text>

        {/* Order Details */}
        <Section style={orderSection}>
          <Text style={sectionTitle}>Order Details</Text>
          <Row>
            <Text style={labelText}>Order Number:</Text>
            <Text style={valueText}>{orderNumber}</Text>
          </Row>
          <Row>
            <Text style={labelText}>Order Date:</Text>
            <Text style={valueText}>{orderDate}</Text>
          </Row>
        </Section>

        <Hr style={hr} />

        {/* Items Table */}
        <Section style={itemsSection}>
          <Text style={sectionTitle}>Items</Text>
          {items.map((item) => (
            <Row key={item.name} style={itemRow}>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemQty}>× {item.qty}</Text>
              <Text style={itemPrice}>₹{(item.price * item.qty).toLocaleString('en-IN')}</Text>
            </Row>
          ))}
        </Section>

        <Hr style={hr} />

        {/* Price Breakdown */}
        <Section style={priceSection}>
          <Row style={priceLine}>
            <Text style={priceLabel}>Subtotal:</Text>
            <Text style={priceValue}>₹{subtotal.toLocaleString('en-IN')}</Text>
          </Row>
          <Row style={priceLine}>
            <Text style={priceLabel}>Tax (GST):</Text>
            <Text style={priceValue}>₹{tax.toLocaleString('en-IN')}</Text>
          </Row>
          <Row style={priceLine}>
            <Text style={priceLabel}>Shipping:</Text>
            <Text style={priceValue}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</Text>
          </Row>
          <Row style={totalLine}>
            <Text style={totalLabel}>Total:</Text>
            <Text style={totalValue}>₹{total.toLocaleString('en-IN')}</Text>
          </Row>
        </Section>

        <Hr style={hr} />

        {/* Next Steps */}
        <Section style={nextSteps}>
          <Text style={sectionTitle}>What's Next?</Text>
          <Text style={body}>
            Your order has been received and is being processed. You'll receive an email notification when your order is dispatched with tracking information.
          </Text>
          <Button style={button} href={`https://naturalife.in/orders/${orderNumber}`}>
            Track Your Order
          </Button>
        </Section>

        <Hr style={hr} />

        {/* Footer */}
        <Section style={footer}>
          <Text style={footerText}>
            If you have any questions, please contact us at{' '}
            <Link href="mailto:support@naturalife.in" style={link}>
              support@naturalife.in
            </Link>{' '}
            or call{' '}
            <Link href="tel:+919876543210" style={link}>
              +91 98765 43210
            </Link>
          </Text>
          <Text style={footerText}>
            © 2024 Naturalife. All rights reserved. | 🌿 Handcrafted Indian Home Textiles
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI","Roboto","Oxygen","Ubuntu","Cantarell","Fira Sans","Droid Sans","Helvetica Neue",sans-serif',
}

const container = {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '20px',
}

const header = {
  textAlign: 'center' as const,
  paddingBottom: '20px',
}

const headerText = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#0A0A0A',
  marginTop: '10px',
  marginBottom: '0',
}

const hr = {
  borderColor: '#e5e5e5',
  margin: '20px 0',
}

const greeting = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#2C2C2C',
}

const body = {
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.6',
}

const orderSection = {
  backgroundColor: '#FAF7F0',
  padding: '15px',
  borderRadius: '8px',
  marginBottom: '20px',
}

const sectionTitle = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#0A0A0A',
  marginBottom: '12px',
}

const labelText = {
  fontSize: '13px',
  color: '#666',
  marginRight: '10px',
}

const valueText = {
  fontSize: '13px',
  fontWeight: '500',
  color: '#2C2C2C',
}

const itemsSection = {
  marginBottom: '20px',
}

const itemRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingBottom: '10px',
  borderBottomColor: '#e5e5e5',
  borderBottomWidth: '1px',
}

const itemName = {
  fontSize: '14px',
  color: '#2C2C2C',
  fontWeight: '500',
  flex: 1,
}

const itemQty = {
  fontSize: '13px',
  color: '#666',
  marginRight: '20px',
}

const itemPrice = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#2C2C2C',
  minWidth: '80px',
  textAlign: 'right' as const,
}

const priceSection = {
  backgroundColor: '#F5EFE0',
  padding: '15px',
  borderRadius: '8px',
}

const priceLine = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '8px',
}

const priceLabel = {
  fontSize: '13px',
  color: '#666',
}

const priceValue = {
  fontSize: '13px',
  color: '#2C2C2C',
  fontWeight: '500',
}

const totalLine = {
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: '12px',
  paddingTopColor: '#2E7D32',
  paddingTopWidth: '1px',
  paddingTop: '12px',
}

const totalLabel = {
  fontSize: '16px',
  fontWeight: 'bold',
  color: '#2C2C2C',
}

const totalValue = {
  fontSize: '18px',
  fontWeight: 'bold',
  color: '#2E7D32',
}

const nextSteps = {
  backgroundColor: '#FAF7F0',
  padding: '20px',
  borderRadius: '8px',
}

const button = {
  backgroundColor: '#2E7D32',
  color: '#ffffff',
  padding: '12px 30px',
  borderRadius: '6px',
  textDecoration: 'none',
  fontWeight: 'bold',
  display: 'inline-block',
  marginTop: '15px',
  marginBottom: '15px',
}

const footer = {
  backgroundColor: '#f5f5f5',
  padding: '20px',
  borderRadius: '8px',
  marginTop: '20px',
  textAlign: 'center' as const,
}

const footerText = {
  fontSize: '12px',
  color: '#666',
  lineHeight: '1.6',
  margin: '5px 0',
}

const link = {
  color: '#2E7D32',
  textDecoration: 'underline',
}
