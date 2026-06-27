# Naturalife E-Commerce Platform - Complete Testing Guide

## 🚀 Quick Start

### 1. Install & Setup
```bash
cd D:\naturalife\naturalife-store
npm install
```

### 2. Configure Environment
Edit `.env.local` with your actual credentials:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/naturalife"
NEXTAUTH_SECRET="any-random-secret-key"
NEXTAUTH_URL="http://localhost:3005"

# Razorpay (Test Keys)
RAZORPAY_KEY_ID="rzp_test_xxxxx"
RAZORPAY_KEY_SECRET="xxxxx"

# SMTP (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="Naturalife <your@gmail.com>"

# Twilio WhatsApp
TWILIO_ACCOUNT_SID="ACxxxxx"
TWILIO_AUTH_TOKEN="xxxxx"
TWILIO_WHATSAPP_FROM="+14155238886"

# Test Contacts
NOTIFICATION_TEST_EMAIL="admin@naturalife.in"
NOTIFICATION_TEST_WHATSAPP="+919999900000"
```

### 3. Setup Database
```bash
# Create database (PostgreSQL)
createdb naturalife

# Run migrations
npx prisma migrate dev

# Seed with products
ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed-comprehensive.ts
```

### 4. Start Dev Server
```bash
npm run dev
```
Server runs on `http://localhost:3005`

---

## ✅ Testing Checklist

### A. Admin Panel Login
**URL:** `http://localhost:3005/login`

1. Click "Admin Login" or go to `/admin`
2. Email: `admin@naturalife.in`
3. Password: `admin123`
4. ✓ Should redirect to admin dashboard
5. ✓ Should see "Dashboard", "Products", "Orders", "Customers", "Settings" menu

### B. Shop Page - Products Display
**URL:** `http://localhost:3005/shop`

1. ✓ Should show product grid with at least 25 products
2. ✓ Each product shows: image, name, price, color dots
3. ✓ Click on product → should show detail page
4. ✓ Filter by category works
5. ✓ Filter by price range works
6. ✓ Search by product name works
7. ✓ Sort by price/newest works

### C. Product Detail Page
**URL:** `http://localhost:3005/shop/dm-001` (or any product)

**Color Swatches:**
- [ ] Color radio buttons display with swatch preview
- [ ] Selecting color changes main product image
- [ ] Selected color is highlighted

**Size Selection:**
- [ ] Size buttons display (16x24, 18x30, 24x36, etc.)
- [ ] Can select size
- [ ] Price updates based on selection

**Price Display:**
- [ ] Retail price shows (₹599, etc.)
- [ ] Tax percentage shows (18% GST)
- [ ] Total updates when qty changes
- [ ] Display says "Price exclusive of taxes"

**Wholesale Mode:**
- [ ] "Order Type" toggle exists
- [ ] Toggle to "Wholesale"
- [ ] Prices change to wholesale price (lower)
- [ ] Minimum quantity required (5+)
- [ ] Bulk pricing table shows:
  - 5-19 items: ₹399 each
  - 20-50 items: ₹339 each
  - 51+ items: ₹279 each

**Add to Cart:**
- [ ] "Add to Cart" button works
- [ ] Product appears in cart (click cart icon)
- [ ] Quantity can be updated in cart

### D. Cart Functionality
**URL:** `http://localhost:3005/cart`

1. [ ] Shows added products
2. [ ] Quantity controls (+/- buttons work)
3. [ ] Remove product works
4. [ ] Price summary correct:
   - Subtotal
   - Tax (18% GST)
   - Shipping (₹100 for <₹1000, FREE for ≥₹1000)
5. [ ] "Proceed to Checkout" button
6. [ ] "Continue Shopping" link

### E. Checkout Flow
**URL:** `http://localhost:3005/checkout`

**Address Form:**
- [ ] Full Name field
- [ ] Email field
- [ ] Phone field
- [ ] Address Line 1
- [ ] Pincode field

**Pincode Auto-Fill:**
- [ ] Enter pincode: 400001 (Mumbai)
- [ ] Wait 1 second
- [ ] ✓ State auto-fills to "Maharashtra"
- [ ] ✓ Distributor info shows (if available)
- [ ] ✓ Tax info shows (IGST/CGST+SGST)

**Country Selector:**
- [ ] Dropdown shows: India, USA, UK, Australia, Canada, Germany, France
- [ ] Selecting India: shipping = ₹100 (if <₹1000)
- [ ] Selecting USA: shipping = $200 USD (flat)
- [ ] Other countries: $200 USD (flat)

**Coupon & Coins:**
- [ ] Coupon input field (optional)
- [ ] Coin redemption slider (if user has coins)
- [ ] Price updates with discount applied

**Payment Method:**
- [ ] Online Payment option (GPay, UPI, Cards, Net Banking)
- [ ] Cash on Delivery (COD) option
- [ ] Payment method button selection works

**Order Summary:**
- [ ] Right sidebar shows:
  - Items list with qty
  - Subtotal
  - Tax
  - Shipping
  - Discount (if applied)
  - **Total**
- [ ] Price displays correctly

**Place Order:**
- [ ] Click "Pay Now" (online) or "Place Order (COD)"
- [ ] ✓ Should show order success page with order number

### F. Order Success Page
**URL:** `http://localhost:3005/order-success?id=<order-id>`

- [ ] Shows "Order Confirmed" message
- [ ] Order number displays
- [ ] Order items listed
- [ ] Total amount shows
- [ ] "Track Your Order" button (goes to `/account`)

### G. Invoice Generation
**Test Invoice API:**
```bash
# After placing an order, get the order ID and test:
curl http://localhost:3005/api/invoices/[ORDER_ID]

# In browser:
http://localhost:3005/api/invoices/clq123abc (example order ID)
```

- [ ] Invoice HTML loads
- [ ] Shows company header: "NATURALIFE"
- [ ] Shows invoice number and date
- [ ] Shows customer billing address
- [ ] Shows delivery address
- [ ] Shows items table with:
  - Product name
  - Quantity
  - Unit price
  - Tax (18%)
  - Total
- [ ] Shows totals:
  - Subtotal
  - Tax amount
  - Shipping charge
  - Grand total
- [ ] Shows payment method
- [ ] Shows company GST number
- [ ] Printable (looks good when printed to PDF)

### H. Email Notifications
**Sender Setup:** Ensure SMTP is configured

1. **On Order Placement:**
   - Check admin email (NOTIFICATION_TEST_EMAIL)
   - ✓ Should receive email with order details
   - ✓ Email shows: Order #, items, total, tracking link

2. **Manual Notification Test:**
   - Go to Admin → Orders
   - Click on an order
   - Click "Update Status"
   - Change status to "DISPATCHED"
   - Check "Notify Customer"
   - Submit
   - ✓ Check customer email for notification

### I. WhatsApp Notifications
**Setup:** Configure Twilio WhatsApp API

1. **Manual WhatsApp Test:**
   - Go to Admin → Settings
   - Check TWILIO configuration
   - Go to Admin → Orders
   - For wholesale order, update status to "DISPATCHED"
   - Enable "Notify Distributor"
   - ✓ Distributor should receive WhatsApp message

### J. Admin Panel Full Test
**URL:** `http://localhost:3005/admin` (with admin login)

**Dashboard:**
- [ ] Stats cards show:
  - Today's orders
  - Revenue (Retail vs Wholesale)
  - Active customers
  - Low stock alerts
- [ ] Charts display (if data exists)
- [ ] Recent orders table

**Products:**
- [ ] View all products (25+ listed)
- [ ] Click product → shows details
- [ ] Edit product:
  - [ ] Change name
  - [ ] Update price
  - [ ] Toggle Featured/Sale badges
  - [ ] Save changes
- [ ] Create new product:
  - [ ] Fill form
  - [ ] Add category
  - [ ] Add variants
  - [ ] Save
- [ ] Search products by name

**Orders:**
- [ ] View all orders placed during testing
- [ ] Click order → shows full details
- [ ] Update order status:
  - [ ] PLACED → CONFIRMED → PACKED → DISPATCHED → DELIVERED
  - [ ] Each status sends notification
- [ ] Manual distributor reassignment (for wholesale)
- [ ] Add tracking number (on DISPATCHED)
- [ ] Return/Refund section

**Customers:**
- [ ] View customer list
- [ ] Click customer → shows:
  - [ ] Profile info
  - [ ] Order history
  - [ ] Coin balance
  - [ ] Addresses
- [ ] Export to CSV (if available)

**Distributors:**
- [ ] View all distributors by state
- [ ] See state-pincode mappings
- [ ] View orders assigned to each distributor

**Settings:**
- [ ] General: Company name, GST, address
- [ ] Shipping: Free shipping threshold, fees
- [ ] Payment: Razorpay keys (masked)
- [ ] Coins: Earn rate, redemption rate
- [ ] SMTP: Send test email
- [ ] WhatsApp: Test message (requires Twilio)

### K. Wholesale Order - Full Cycle
**Simulating B2B/Distributor Order:**

1. Browse products
2. Click "Wholesale" toggle on product page
3. Select quantity: 25 pieces
4. Price shows: ₹339 each (bulk discount applied)
5. Add to cart
6. Checkout:
   - Enter distributor pincode: 401107 (Mumbai area)
   - Distributor auto-assigned
7. Place order
8. ✓ Admin receives email
9. ✓ Assigned distributor receives WhatsApp notification
10. ✓ Customer receives email confirmation

### L. Retail Order - Full Cycle
**Simulating Consumer Order:**

1. Browse products
2. Retail mode (default)
3. Select single product, qty 1-5
4. Price: ₹599 (retail price)
5. Add to cart
6. Checkout:
   - Enter residential address
   - Pincode: 560001 (Bangalore)
7. Select payment: GPay/COD
8. Place order
9. ✓ Customer receives email with invoice
10. ✓ Admin receives order notification
11. ✓ No distributor notification (retail order)

### M. Performance & Mobile
**Desktop:**
- [ ] All pages load in <3 seconds
- [ ] Buttons responsive on hover
- [ ] Images load properly
- [ ] No console errors (F12)

**Mobile (DevTools - iPhone 12):**
- [ ] `http://localhost:3005/shop` - products visible
- [ ] Filters work on mobile
- [ ] Cart accessible
- [ ] Checkout form responsive
- [ ] Payment buttons accessible

---

## 🔍 Debugging

### Check Console for Errors
```bash
F12 → Console tab
```

### Check Network Requests
```bash
F12 → Network tab
- Verify /api/* endpoints return 200/201
- Check payload and response
```

### View Server Logs
```bash
# Terminal where `npm run dev` is running
Should show API requests, no error messages
```

### Database Verification
```bash
# Check if products were seeded
psql -U postgres -d naturalife
SELECT COUNT(*) FROM "Product";  # Should show 25+
SELECT COUNT(*) FROM "ProductVariant";  # Should show 100+
```

---

## 📊 Test Results Summary

Create a checklist and mark items as you test:

```
ADMIN PANEL LOGIN        [✓] [✗]
SHOP PRODUCTS DISPLAY    [✓] [✗]
PRODUCT DETAIL PAGE      [✓] [✗]
COLOR SWATCHES           [✓] [✗]
PRICE CALCULATION        [✓] [✗]
WHOLESALE PRICING        [✓] [✗]
CART FUNCTIONALITY       [✓] [✗]
CHECKOUT FLOW            [✓] [✗]
PINCODE AUTO-FILL        [✓] [✗]
PAYMENT INTEGRATION      [✓] [✗]
ORDER SUCCESS PAGE       [✓] [✗]
EMAIL NOTIFICATIONS      [✓] [✗]
INVOICE GENERATION       [✓] [✗]
WHATSAPP NOTIFICATIONS   [✓] [✗]
ADMIN PRODUCT MGMT       [✓] [✗]
ADMIN ORDER MGMT         [✓] [✗]
ADMIN SETTINGS           [✓] [✗]
MOBILE RESPONSIVENESS    [✓] [✗]
```

---

## 🚀 Deployment Checklist

Once all testing passes:

```bash
# Commit changes
git add .
git commit -m "Complete platform with all features tested"

# Push to GitHub
git push origin main

# Deploy to Vercel
# (Connect GitHub repo to Vercel account)
# Vercel will auto-deploy on push
```

---

## 📞 Support

For issues:
1. Check console errors (F12)
2. Check server logs (terminal)
3. Verify environment variables
4. Test specific API endpoint with curl
5. Check database (psql)

