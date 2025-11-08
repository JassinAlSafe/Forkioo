# Forkioo Quick Start Guide

Get Forkioo up and running in 10 minutes! 🚀

---

## Prerequisites Checklist

- [ ] Node.js 18+ installed (`node --version`)
- [ ] PostgreSQL 14+ installed or Docker available
- [ ] Clerk account created (https://clerk.com)
- [ ] Code editor (VS Code recommended)

---

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone <your-repo-url>
cd Forkioo

# Install dependencies
npm install

# This will take 1-2 minutes depending on your internet speed
```

---

## Step 2: Database Setup (3 minutes)

### Option A: Docker (Recommended - Easiest)

```bash
# Start PostgreSQL and Redis with Docker Compose
docker-compose up -d

# Verify containers are running
docker-compose ps
```

### Option B: Local PostgreSQL

```bash
# Create database
psql postgres -c "CREATE USER forkioo WITH PASSWORD 'forkioo_dev';"
psql postgres -c "CREATE DATABASE forkioo_dev OWNER forkioo;"
```

---

## Step 3: Environment Setup (2 minutes)

```bash
# Copy example environment file
cp .env.example .env
```

### Edit `.env` with your values:

```env
# 1. Database URL (if using Docker, this is already correct)
DATABASE_URL="postgresql://forkioo:forkioo_dev@localhost:5432/forkioo_dev"

# 2. Clerk Keys (get from https://dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# 3. App URL (keep as-is for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 4. Environment
NODE_ENV="development"
```

**Getting Clerk Keys:**

1. Go to https://dashboard.clerk.com
2. Create a new application (choose "Next.js" template)
3. Copy the API keys shown
4. Paste into `.env`

---

## Step 4: Initialize Database (2 minutes)

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (creates all tables)
npm run db:migrate
# Press Enter when asked for migration name (will use default)

# Seed database with sample data
npm run db:seed
```

**What this does:**
- ✅ Creates all database tables
- ✅ Creates demo company "Acme Corporation"
- ✅ Creates 30 accounts (chart of accounts)
- ✅ Creates 3 sample customers
- ✅ Creates 2 sample suppliers

---

## Step 5: Start Development Server (1 minute)

```bash
# Start Next.js dev server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## Step 6: Create Your Account

1. Click **"Sign Up"** in the top right
2. Create account with email or Google/GitHub
3. Complete Clerk signup flow
4. You'll be redirected to the dashboard

---

## Step 7: Link User to Company

Since we created a demo company in the seed, we need to link your user to it.

### Option A: Prisma Studio (GUI - Easiest)

```bash
# Open Prisma Studio in a new terminal
npm run db:studio
```

1. Go to http://localhost:5555
2. Click **"User"** table
3. Find your user (should be the only one)
4. **Copy the `id`** value

5. Click **"CompanyUser"** table
6. Click **"Add record"**
7. Fill in:
   - `companyId`: `demo-company-id`
   - `userId`: (paste your user ID)
   - `role`: `owner`
   - Leave other fields as default
8. Click **"Save 1 change"**

### Option B: SQL Query

```bash
# Get your user ID
psql $DATABASE_URL -c "SELECT id, email FROM users;"

# Link to demo company (replace YOUR_USER_ID)
psql $DATABASE_URL -c "
INSERT INTO company_users (id, company_id, user_id, role, created_at)
VALUES (gen_random_uuid(), 'demo-company-id', 'YOUR_USER_ID', 'owner', NOW());
"
```

---

## Step 8: Refresh & Explore! 🎉

1. Refresh your browser at http://localhost:3000
2. You should now see the full dashboard!

### What to Explore:

**📊 Dashboard**
- View financial overview
- See KPI cards (revenue, expenses, etc.)

**📄 Invoices**
- Create your first invoice
- Send to customers
- Record payments

**💰 Expenses**
- Track business expenses
- Categorize spending
- Approve/reject expenses

**👥 Customers**
- Manage customer database
- View outstanding balances

**🏦 Accounts**
- Chart of accounts (30 accounts pre-loaded)
- View account balances
- Hierarchical structure

**📈 Reports**
- Profit & Loss statement
- Balance Sheet
- Cash Flow report

**⚙️ Settings**
- Update company profile
- Configure branding
- Set invoice defaults
- Email settings

---

## Troubleshooting

### "No company access" error

**Solution:** Make sure you completed Step 7 (linking user to company)

```bash
# Verify link exists
psql $DATABASE_URL -c "SELECT * FROM company_users;"
```

### Database connection error

**Solution:** Check PostgreSQL is running

```bash
# If using Docker
docker-compose ps

# If using local PostgreSQL
pg_isready

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Clerk authentication not working

**Solution:** Check environment variables

```bash
# Verify .env has Clerk keys
cat .env | grep CLERK

# Keys should start with:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
# CLERK_SECRET_KEY="sk_test_..."
```

### "Prisma Client not generated" error

**Solution:** Regenerate Prisma Client

```bash
npm run db:generate

# Restart dev server
# Ctrl+C, then npm run dev
```

### Port 3000 already in use

**Solution:** Kill process or use different port

```bash
# Option 1: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Option 2: Use different port
PORT=3001 npm run dev
```

---

## Next Steps

### Learn the Architecture

- 📖 [Backend Setup Guide](./BACKEND_SETUP.md) - Detailed backend documentation
- 🔒 [Database Security](./DATABASE_SECURITY.md) - Security best practices
- 🎨 [Brand Guide](./BRAND_GUIDE.md) - UI design system

### Start Building

1. **Create your first invoice**
   - Go to Invoices → New Invoice
   - Select a customer
   - Add line items
   - Send or save as draft

2. **Record an expense**
   - Go to Expenses → New Expense
   - Upload receipt
   - Categorize
   - Submit for approval

3. **Customize settings**
   - Go to Settings
   - Update company information
   - Set invoice defaults
   - Configure branding colors

### Development Workflow

```bash
# Start database (if using Docker)
docker-compose up -d

# Start dev server
npm run dev

# Open Prisma Studio (optional)
npm run db:studio

# Run type checking
npm run type-check

# View logs
# All output in terminal where you ran npm run dev
```

---

## Common Development Commands

```bash
# Database
npm run db:generate    # Generate Prisma Client
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio GUI
npm run db:seed        # Seed database
npm run db:reset       # Reset database (WARNING: Deletes all data!)

# Development
npm run dev            # Start dev server
npm run build          # Build for production
npm run start          # Start production server
npm run type-check     # TypeScript type checking
npm run lint           # ESLint

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode
```

---

## Project Structure Quick Reference

```
Forkioo/
├── app/                      # Next.js 15 App Router
│   ├── (auth)/              # Authentication pages
│   ├── (dashboard)/         # Protected dashboard pages
│   │   └── dashboard/
│   │       ├── page.tsx     # Main dashboard
│   │       ├── invoices/    # Invoice management
│   │       ├── expenses/    # Expense tracking
│   │       ├── customers/   # Customer CRM
│   │       ├── accounts/    # Chart of accounts
│   │       ├── reports/     # Financial reports
│   │       └── settings/    # Company settings
│   └── api/                 # API routes
│       └── trpc/           # tRPC API endpoint
│
├── server/                  # Backend (tRPC)
│   ├── trpc.ts             # tRPC config & middleware
│   └── routers/            # API routers
│       ├── _app.ts         # Main router
│       ├── invoices.ts     # Invoice endpoints
│       ├── expenses.ts     # Expense endpoints
│       └── ...
│
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # SQL migrations
│   └── seed.ts            # Seed data
│
├── lib/                    # Utilities
│   ├── db.ts              # Prisma client
│   ├── trpc/              # tRPC client config
│   ├── rbac.ts            # Role-based access control
│   └── constants/         # Enums, types, validation
│
├── hooks/                  # Custom React hooks
│   ├── use-invoices.ts
│   ├── use-expenses.ts
│   └── ...
│
├── components/             # React components
│   ├── ui/                # Shadcn/ui components
│   ├── invoices/          # Invoice components
│   └── ...
│
└── docs/                   # Documentation
    ├── QUICK_START.md     # This file!
    ├── BACKEND_SETUP.md   # Backend details
    ├── DATABASE_SECURITY.md
    └── BRAND_GUIDE.md
```

---

## Support & Resources

- 📚 **Documentation**: Check the `docs/` folder
- 🐛 **Issues**: Open an issue on GitHub
- 💬 **Discussions**: GitHub Discussions
- 📧 **Email**: support@forkioo.com

---

## What's Next?

You're all set! Here are some ideas:

1. ✨ **Customize the branding** in Settings
2. 💼 **Create a real invoice** and download the PDF
3. 📊 **View financial reports** with the sample data
4. 🔧 **Explore the code** to understand the architecture
5. 🚀 **Deploy to production** (see BACKEND_SETUP.md)

Happy coding! 🎉

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
