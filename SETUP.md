# Forkioo Setup Guide

> Quick start guide to get Forkioo running locally and deployed to production

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (recommended) or npm
- **Git**
- **PostgreSQL** 15+ (for local dev) OR Railway account
- **Accounts** (for production):
  - [Clerk](https://clerk.com) (auth - free tier: 5K MAUs)
  - [Railway](https://railway.app) (database - free trial)
  - [Upstash](https://upstash.com) (Redis - free tier: 10K requests/day)
  - [Vercel](https://vercel.com) (hosting - free tier)
  - [Cloudflare](https://cloudflare.com) (R2 storage - free tier: 10GB)

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JassinAlSafe/Forkioo.git
cd Forkioo
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# OR using npm
npm install
```

### 3. Set Up Local Database

**Option A: Docker (Easiest)**

```bash
# Start PostgreSQL + Redis locally
docker-compose up -d

# Verify containers are running
docker ps
```

**Option B: Manual Installation**

Install PostgreSQL 15+ and Redis locally, then create a database:

```bash
# Create database
createdb forkioo_dev

# Verify connection
psql forkioo_dev
```

### 4. Configure Environment Variables

Create `.env.local` file in the project root:

```bash
# Database
DATABASE_URL="postgresql://forkioo:password@localhost:5432/forkioo_dev"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: Clerk webhook secret (for user sync)
CLERK_WEBHOOK_SECRET="whsec_..."

# Redis (local)
REDIS_URL="redis://localhost:6379"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: For development
NODE_ENV="development"
```

**Get Clerk Keys:**
1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Create a new application
3. Copy publishable key and secret key
4. Add `http://localhost:3000` to allowed origins

### 5. Run Database Migrations

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# (Optional) Seed database with sample data
pnpm db:seed
```

### 6. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) 🎉

### 7. Testing Invoice Features

Once the app is running, you can test the complete invoice workflow:

**First Time Setup:**
1. Sign in with Clerk (create account if needed)
2. You'll automatically be assigned to a company (this happens on first login)
3. Navigate to **Dashboard → Invoices**

**Creating Your First Invoice:**
1. Click "New Invoice" button
2. Fill in customer information:
   - Customer name (required)
   - Customer email (optional)
   - Invoice date (defaults to today)
   - Due date (defaults to 30 days)
3. Add line items:
   - Description, quantity, unit price
   - Tax rate (optional, e.g., 0.20 for 20%)
   - Click "+ Add Line Item" for multiple lines
4. Add notes and payment terms (optional)
5. Choose action:
   - **Save as Draft**: Saves without sending
   - **Send Invoice**: Marks as sent (email delivery coming in Phase 2C)

**Managing Invoices:**
- **Search**: Filter by invoice number, customer name, or email
- **Status Filter**: View invoices by status (Draft, Sent, Paid, Overdue, etc.)
- **Actions**:
  - **View**: Opens invoice details (modal/page coming soon)
  - **Send**: Changes status to "sent" (for drafts)
  - **Download**: Generates PDF (coming in Phase 2C)
  - **Delete**: Removes invoice (drafts only)

**Features Implemented (Phase 2A-2B):**
- ✅ Complete invoice creation form with validation
- ✅ Dynamic line items with real-time total calculations
- ✅ Customer management (auto-creates contacts)
- ✅ Invoice list with search and filtering
- ✅ Status tracking (draft, sent, viewed, partial, paid, overdue, void)
- ✅ Real-time stats dashboard (Total, Paid, Pending, Overdue)
- ✅ Multi-tenant data isolation (company-based)
- ✅ Full database persistence with Prisma + PostgreSQL

**Coming Next (Phase 2C):**
- 🔜 PDF generation
- 🔜 Email delivery via SendGrid
- 🔜 Invoice detail view
- 🔜 Payment recording
- 🔜 Customer management UI
- 🔜 Toast notifications (replacing alerts)

**Troubleshooting:**

If you get "You don't belong to any company" error:
```bash
# Option 1: Seed database with test company and user
pnpm db:seed

# Option 2: Manual setup via Prisma Studio
pnpm db:studio
# Create a Company, User, and CompanyUser linking them
```

If Prisma client is not generated:
```bash
# Re-generate Prisma client
npx prisma generate

# If issues persist, try:
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
npm install
npx prisma generate
```

---

## Production Deployment

### 1. Set Up Railway (Database)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init

# Add PostgreSQL
railway add --plugin postgresql

# Get connection string
railway variables
```

Copy the `DATABASE_URL` for later.

### 2. Set Up Upstash (Redis)

1. Go to [console.upstash.com](https://console.upstash.com)
2. Create new Redis database (choose region close to your users)
3. Copy `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

### 3. Set Up Clerk (Production)

1. Go to your Clerk dashboard
2. Add production domain (e.g., `forkioo.app`)
3. Copy production keys (different from dev keys)
4. Configure:
   - **Sign-in options**: Email + Google + GitHub
   - **User profile**: Email, name, avatar
   - **2FA**: Enable (important for financial app)

### 4. Set Up Cloudflare R2 (File Storage)

1. Go to Cloudflare Dashboard → R2
2. Create bucket: `forkioo-documents`
3. Create API token with read/write permissions
4. Copy: `CLOUDFLARE_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard:
```

**Environment Variables (Production):**

```bash
# Database
DATABASE_URL="postgresql://..." # From Railway

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_live_..."
CLERK_SECRET_KEY="sk_live_..."
CLERK_WEBHOOK_SECRET="whsec_..."

# Redis
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID="..."
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_BUCKET_NAME="forkioo-documents"

# App
NEXT_PUBLIC_APP_URL="https://forkioo.app"
NODE_ENV="production"

# Optional: Plaid (for bank integration)
PLAID_CLIENT_ID="..."
PLAID_SECRET="..."
PLAID_ENV="sandbox" # or "production"

# Optional: SendGrid (for emails)
SENDGRID_API_KEY="..."

# Optional: Sentry (for error tracking)
NEXT_PUBLIC_SENTRY_DSN="..."
SENTRY_AUTH_TOKEN="..."
```

### 6. Run Production Migrations

```bash
# Set production DATABASE_URL
export DATABASE_URL="postgresql://..." # Railway URL

# Run migrations
pnpm db:migrate

# Verify
railway run prisma studio
```

### 7. Configure Clerk Webhooks

To sync users between Clerk and your database:

1. Go to Clerk Dashboard → Webhooks
2. Add endpoint: `https://forkioo.app/api/webhooks/clerk`
3. Subscribe to events: `user.created`, `user.updated`, `user.deleted`
4. Copy webhook secret → Add to Vercel env vars as `CLERK_WEBHOOK_SECRET`

---

## Useful Commands

### Database

```bash
# Generate Prisma client after schema changes
pnpm db:generate

# Create and run migration
pnpm db:migrate

# Open Prisma Studio (database GUI)
pnpm db:studio

# Seed database
pnpm db:seed

# Reset database (⚠️ deletes all data)
pnpm db:reset
```

### Development

```bash
# Start dev server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format
```

### Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run E2E tests
pnpm test:e2e

# Run tests with coverage
pnpm test:coverage
```

### Build

```bash
# Build for production
pnpm build

# Start production server locally
pnpm start

# Analyze bundle size
pnpm analyze
```

---

## Project Structure

```
forkioo/
├── src/
│   ├── app/                    # Next.js 16 App Router
│   │   ├── (auth)/            # Auth pages (sign-in, sign-up)
│   │   ├── (dashboard)/       # Main app (protected routes)
│   │   ├── api/               # API routes + webhooks
│   │   └── layout.tsx         # Root layout
│   │
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── invoices/         # Invoice-specific components
│   │   ├── dashboard/        # Dashboard widgets
│   │   └── ...
│   │
│   ├── server/               # Server-side code
│   │   ├── api/             # tRPC routers
│   │   ├── db/              # Database client (Prisma)
│   │   ├── services/        # Business logic
│   │   └── lib/             # Server utilities
│   │
│   ├── lib/                 # Shared utilities
│   │   ├── utils.ts        # Helper functions
│   │   ├── validations.ts  # Zod schemas
│   │   └── constants.ts    # App constants
│   │
│   └── styles/             # Global styles
│       └── globals.css     # Tailwind + custom CSS
│
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # Migration history
│   └── seed.ts            # Database seeding
│
├── public/                # Static assets
├── tests/                 # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local            # Local environment variables
├── docker-compose.yml    # Local development services
├── package.json
├── tsconfig.json
└── tailwind.config.js
```

---

## Tech Stack Reference

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 16 (App Router) | React framework with SSR/SSG |
| | TypeScript | Type safety |
| | Tailwind CSS | Utility-first styling |
| | shadcn/ui | Beautiful, accessible components |
| **State** | Zustand | Client state management |
| | TanStack Query | Server state & caching |
| **Backend** | Next.js API Routes | API endpoints |
| | tRPC | Type-safe APIs (no codegen) |
| | Prisma | Type-safe ORM |
| **Database** | PostgreSQL (Railway) | Relational database |
| **Cache/Queue** | Upstash Redis | Serverless Redis |
| **Auth** | Clerk | User authentication |
| **Storage** | Cloudflare R2 | Object storage (receipts, PDFs) |
| **Hosting** | Vercel | Frontend + API hosting |
| **Monitoring** | Sentry | Error tracking |
| **Email** | SendGrid / Resend | Transactional emails |

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
psql $DATABASE_URL

# Reset connection pool
railway restart
```

### Clerk Authentication Not Working

- Verify publishable key starts with `pk_test_` (dev) or `pk_live_` (prod)
- Check allowed origins include your domain
- Ensure webhook secret is correct
- Check browser console for CORS errors

### Redis Connection Issues

```bash
# Test Upstash connection
curl $UPSTASH_REDIS_REST_URL/ping \
  -H "Authorization: Bearer $UPSTASH_REDIS_REST_TOKEN"
```

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Type check for errors
pnpm type-check
```

---

## Getting Help

- **Documentation**: See `/docs` folder for detailed guides
- **GitHub Issues**: [github.com/JassinAlSafe/Forkioo/issues](https://github.com/JassinAlSafe/Forkioo/issues)
- **Discussions**: [github.com/JassinAlSafe/Forkioo/discussions](https://github.com/JassinAlSafe/Forkioo/discussions)

---

## Next Steps

1. ✅ Local development running
2. 📖 Read [VISION.md](./VISION.md) to understand product goals
3. 🏗️ Read [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
4. 🎨 Read [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) for UI guidelines
5. 🚀 Start building features from [Phase 1 roadmap](./VISION.md#phase-1-foundation-weeks-1-2)

**Happy coding! Let's build something great.** 🚀
