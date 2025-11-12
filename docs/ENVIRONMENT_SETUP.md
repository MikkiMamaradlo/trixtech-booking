# Environment Configuration Guide

## Quick Start

1. Copy `.env.local.example` to `.env.local`
2. Fill in your MongoDB and Stripe credentials
3. Run: `npx ts-node scripts/init-db.ts`
4. Run: `npm run dev`

---

## Local Development Setup

### MongoDB Setup (Choose One)

**Option A: Local MongoDB**
- Install from https://docs.mongodb.com/manual/installation/
- Start service: `brew services start mongodb-community` (macOS) or `net start MongoDB` (Windows)
- Connection: `mongodb://localhost:27017`

**Option B: MongoDB Atlas (Cloud)**
- Create free cluster at https://www.mongodb.com/cloud/atlas
- Click "Connect" → "Drivers"
- Copy connection string and replace `username:password`

### Stripe Test Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy "Secret Key" and "Publishable Key"
3. Add to `.env.local`
4. For webhook testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Database Setup

\`\`\`bash
# Copy template
cp .env.local.example .env.local

# Edit with your credentials
# Then initialize database:
npx ts-node scripts/init-db.ts

# Seed test data (optional)
npx ts-node scripts/seed-db.ts
\`\`\`

### Start Development

\`\`\`bash
npm run dev
\`\`\`

Test credentials (after seeding):
- Admin: `admin@trixtech.com` / `password123`
- Customer: `customer@trixtech.com` / `password123`

---

## Production Deployment (Vercel)

### 1. MongoDB Atlas
- Create production cluster
- Set IP whitelist to allow deployment server
- Copy production connection string

### 2. Vercel Environment Variables
Go to Project Settings → Environment Variables and add:

\`\`\`
MONGODB_URI=your-production-connection-string
MONGODB_DB_NAME=trixtech-prod
JWT_SECRET=your-generated-secret-key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_live_your_key
NODE_ENV=production
\`\`\`

### 3. Generate Secure JWT Secret

\`\`\`bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
\`\`\`

### 4. Deploy

\`\`\`bash
git push origin main
# Vercel auto-deploys, or use: vercel --prod
\`\`\`

---

## Environment Variables Reference

| Variable | Purpose | Example |
|----------|---------|---------|
| `MONGODB_URI` | Database connection | `mongodb+srv://user:pass@cluster.mongodb.net/` |
| `MONGODB_DB_NAME` | Database name | `trixtech` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Generated |
| `STRIPE_SECRET_KEY` | Stripe API secret | `sk_test_xxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key (client-side) | `pk_test_xxx` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_test_xxx` |

---

## Troubleshooting

**"MONGODB_URI is not defined"**
- Ensure `.env.local` exists with correct variable
- Restart dev server: `npm run dev`

**"Cannot connect to MongoDB"**
- Local: Run `mongosh` to verify MongoDB is running
- Atlas: Check IP whitelist and connection string

**"Stripe API Error"**
- Verify keys are from same environment (test/live)
- Ensure no extra spaces in keys
- For webhooks: run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

**"JWT_SECRET not configured"**
- Add `JWT_SECRET` to `.env.local` (min 32 characters)
- Restart dev server

---

## Security Best Practices

- Never commit `.env.local` (already in .gitignore)
- Use strong JWT_SECRET (32+ random characters)
- Rotate secrets periodically
- Use HTTPS only in production
- IP whitelist MongoDB Atlas to known servers
- Use live Stripe keys only in production

---

## Database Initialization

Run once to set up collections:
\`\`\`bash
npx ts-node scripts/init-db.ts
\`\`\`

Optionally seed test data:
\`\`\`bash
npx ts-node scripts/seed-db.ts
\`\`\`

This creates admin account, test services, and sample data.
