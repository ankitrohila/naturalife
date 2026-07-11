# Vercel Deployment Environment Variables Setup Guide

## Critical Variables (Required for Basic Operation)

These must be set or the app will crash:

```
DATABASE_URL=postgresql://username:password@host:port/dbname
AUTH_SECRET=your-secure-random-string-min-32-chars
NEXTAUTH_URL=https://naturalife-gamma.vercel.app
```

## Email Configuration (SMTP)

For sending emails (registration, orders, notifications):

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@naturalife.co.in
ADMIN_EMAIL=admin@naturalife.co.in
```

## Payment Gateway (Razorpay)

For processing payments:

```
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
UPI_VPA=merchant@upi
UPI_PAYEE_NAME=Naturalife
```

## WhatsApp Integration (Twilio)

For WhatsApp notifications:

```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
NEXT_PUBLIC_WHATSAPP_NUMBER=919999900000
```

## Google Maps & Places

For location-based features:

```
GOOGLE_PLACES_API_KEY=your-google-places-api-key
GOOGLE_PLACE_ID=your-google-place-id
```

## Notifications Configuration

For testing and notification mode:

```
NOTIFICATION_MODE=PRODUCTION
NOTIFICATION_TEST_EMAIL=test@example.com
NOTIFICATION_TEST_WHATSAPP=919999900000
```

## Public Variables (can be exposed)

```
NEXT_PUBLIC_WHATSAPP_NUMBER=919999900000
```

---

## Setup Instructions

1. Go to: https://vercel.com/rohillaankit-project/naturalife/settings/environment-variables

2. Add each variable as follows:
   - **Name**: Exact variable name (e.g., `DATABASE_URL`)
   - **Value**: Your actual value
   - **Environments**: Select "Production", "Preview", and "Development" (or as needed)

3. **Minimum viable set** to get the site running:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `AUTH_SECRET` (Generate with: `openssl rand -hex 16`)
   - `NEXTAUTH_URL` (Set to: `https://naturalife-gamma.vercel.app`)
   - `SMTP_FROM` (Any email address for system notifications)

4. After adding variables, click **"Save"**

5. **Redeploy** by:
   - Clicking "Deployments" tab
   - Clicking the latest deployment
   - Clicking "Redeploy"
   - Or push a commit to trigger automatic redeploy

---

## Troubleshooting

**Error: "This page couldn't load - A server error occurred"**
- Check that `DATABASE_URL` and `AUTH_SECRET` are set
- Verify `NEXTAUTH_URL` matches your deployment domain
- Check Vercel build logs for specific errors

**"Cannot find module" errors**
- Run: `npm ci && npm run build` locally to verify
- Check that all dependencies are correctly listed in package.json

**Email/WhatsApp not working**
- These are optional - app works without them
- Verify credentials are correct in environment variables
- Check Vercel logs in real-time: `vercel logs`

---

## To Deploy After Setting Variables

Option 1 (Recommended):
```bash
git push origin main
# This automatically triggers Vercel redeploy via GitHub integration
```

Option 2 (Using Vercel CLI - requires authentication):
```bash
vercel --prod
```

Option 3 (Vercel Dashboard):
- Go to "Deployments" tab
- Click the three dots on latest deployment
- Click "Redeploy"

