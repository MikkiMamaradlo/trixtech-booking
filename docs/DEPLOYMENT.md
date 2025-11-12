# TRIXTECH Booking System - Deployment Guide

## Architecture Overview

The system is split into two independent applications:
- **Backend**: Express.js API running on port 5000
- **Frontend**: Next.js application running on port 3000

## Local Development Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Stripe account (test keys)

### Backend Setup

1. Navigate to backend folder:
   \`\`\`bash
   cd backend
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env` file from `.env.example`:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

4. Fill in your environment variables:
   - MongoDB URI (local: `mongodb://localhost:27017/trixtech`)
   - JWT Secret (generate: `openssl rand -base64 32`)
   - Stripe test keys from https://dashboard.stripe.com/test/apikeys

5. Start the backend:
   \`\`\`bash
   npm run dev
   \`\`\`

   Backend should run on http://localhost:5000

### Frontend Setup

1. Navigate to root folder:
   \`\`\`bash
   cd ..
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Create `.env.local`:
   \`\`\`bash
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   \`\`\`

4. Start the frontend:
   \`\`\`bash
   npm run dev
   \`\`\`

   Frontend should run on http://localhost:3000

### Test Credentials
- Email: `admin@trixtech.com`
- Password: `password123`

## Deployment Options

### Option 1: Deploy to Vercel (Frontend) + Render/Railway (Backend)

#### Deploy Backend to Render:

1. Create account at https://render.com
2. Push backend code to GitHub
3. Create new Web Service
4. Connect GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables: Copy from `.env.production`
6. Deploy

#### Deploy Frontend to Vercel:

1. Create account at https://vercel.com
2. Import GitHub repository
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com/api`
4. Deploy

### Option 2: Deploy Both to Vercel (Backend as Serverless Functions)

Not recommended - Express.js needs persistent connections.

### Option 3: Docker + Cloud (AWS, GCP, DigitalOcean)

#### Create Docker Setup

Create `backend/Dockerfile`:
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
\`\`\`

Create `Dockerfile` (frontend):
\`\`\`dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm install --production
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

#### Deploy to DigitalOcean App Platform:

1. Create account at https://www.digitalocean.com
2. Create App Platform project
3. Connect GitHub
4. Add backend service (Dockerfile)
5. Add frontend service (Dockerfile)
6. Set environment variables
7. Deploy

## MongoDB Atlas Setup

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create new cluster (free tier available)
3. Create database user with password
4. Get connection string
5. Replace `username:password` in connection string
6. Add connection string to `.env`

## Stripe Setup

1. Create account at https://stripe.com
2. Get API keys from https://dashboard.stripe.com/test/apikeys
3. Add to `.env`:
   - `STRIPE_SECRET_KEY=sk_test_...`
   - `STRIPE_PUBLISHABLE_KEY=pk_test_...`
4. Set up webhooks for production

## Security Checklist

- Never commit `.env` files
- Use strong JWT secret (min 32 chars)
- Enable HTTPS in production
- Set CORS properly for your domain
- Use environment variables for all secrets
- Regularly update dependencies: `npm audit`
- Use HTTPS for MongoDB connections
- Enable Stripe webhook verification

## Troubleshooting

### Backend won't start
- Check MongoDB connection
- Verify PORT is available
- Check NODE_ENV setting

### Frontend can't connect to backend
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Stripe payments failing
- Verify Stripe keys are correct
- Check webhook configuration
- Review Stripe logs in dashboard
