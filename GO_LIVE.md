# Naturalife — Go Live & Payments Guide

The site currently runs in **test mode**: orders are created, invoices generate,
and online payment shows a **UPI Scan-&-Pay QR**. To take it live you need real
service credentials. Everything below is set in `.env.local` (local) and in your
host's **Environment Variables** (production).

---

## 1. Database (production)
Use a managed Postgres (Supabase / Neon / Railway).
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/naturalife?sslmode=require"
```
Then run once against production:
```
npx prisma db push
npx ts-node prisma/seed-comprehensive.ts   # admin + categories + products
```

## 2. Email (so order/invoice mails actually deliver)
Gmail needs an **App Password** (not your normal password):
1. Google Account → Security → enable **2-Step Verification**
2. Security → **App passwords** → create one → copy the 16-char code
```
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="rohilla77@gmail.com"
SMTP_PASS="xxxxxxxxxxxxxxxx"   # the 16-char app password
SMTP_FROM="Naturalife <rohilla77@gmail.com>"
NOTIFICATION_TEST_EMAIL="rohilla77@gmail.com"
ADMIN_EMAIL="rohilla77@gmail.com"
```
Switch notification mode to LIVE in **Admin → Settings → Notification Mode** to
send to real customers instead of the test address.

## 3. WhatsApp (Twilio)
1. Create a Twilio account → enable the WhatsApp sender (sandbox for testing).
```
TWILIO_ACCOUNT_SID="ACxxxxxxxx"
TWILIO_AUTH_TOKEN="xxxxxxxx"
TWILIO_WHATSAPP_FROM="+14155238886"     # your Twilio WhatsApp number
NOTIFICATION_TEST_WHATSAPP="+918950205038"
```

## 4. Online Payments — two options

### Option A (already working): UPI Scan-&-Pay QR
At checkout, "Online Payment" generates a **UPI QR** for the order amount.
Customers scan with GPay/PhonePe/Paytm and pay to your UPI ID.
```
UPI_VPA="your-upi-id@oksbi"          # e.g. 8950205038@ybl
UPI_PAYEE_NAME="Naturalife"
```
This needs **no gateway account** and works immediately. (Payment is marked
PENDING until you confirm receipt — good for COD-style UPI.)

### Option B (automated gateway): Razorpay
For automatic verification, cards, net-banking, and auto-capture:
1. Create a Razorpay account → KYC → get **live** keys.
2. Set:
```
RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxx"
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_live_xxxxxxxx"
```
The code auto-detects real keys (`rzp_...`, not containing "dummy") and switches
from the test/UPI-QR flow to the full Razorpay checkout automatically.

## 5. Auth secret & site URL
```
NEXTAUTH_SECRET="<run: openssl rand -base64 32>"
NEXTAUTH_URL="https://your-domain.com"
```

## 6. Deploy
- Push to GitHub, import the repo in **Vercel**.
- Add all the env vars above in Vercel → Project → Settings → Environment Variables.
- Set the Postgres `DATABASE_URL` to your managed DB.
- Deploy. Run the seed step (section 1) against production once.

---

## Where admin sections reflect on the site
| Admin section | Reflects on |
|---|---|
| Products / Add Product / Categories | Shop, product pages, homepage grid, related products |
| Orders | Customer account, invoices, status emails |
| Marketing → Testimonials | Homepage "Happy Customers" section |
| Marketing → Promotional Offers | Exit-intent popup / campaign copy |
| CMS Pages | Footer policy links → `/pages/<slug>` |
| Settings | Shipping fees, GST, coins, notification mode |

> Note: Marketing currently lists offers/testimonials read-only. Inline
> add/edit forms are the next enhancement (the data already drives the site).
