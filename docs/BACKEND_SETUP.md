# Forkioo Backend Setup Guide

## Overview

Forkioo's backend is built with:
- **Next.js 15** with App Router
- **tRPC** for type-safe API
- **Prisma ORM** for database access
- **PostgreSQL** as the database
- **Clerk** for authentication
- **Multi-tenant architecture** with company-based isolation

This guide will walk you through setting up the entire backend infrastructure from scratch.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Prisma Setup](#prisma-setup)
5. [tRPC Architecture](#trpc-architecture)
6. [Security Model](#security-model)
7. [Testing the Backend](#testing-the-backend)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)

---

## Prerequisites

### Required Software

```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# PostgreSQL 14+
psql --version  # Should be 14.x or higher

# Optional: Docker (for containerized PostgreSQL)
docker --version
```

### Required Accounts

1. **Clerk Account** (for authentication)
   - Sign up at https://clerk.com
   - Create a new application
   - Copy API keys

2. **SendGrid Account** (for email sending)
   - Sign up at https://sendgrid.com
   - Create API key for transactional emails

---

## Database Setup

### Option 1: Local PostgreSQL (Recommended for Development)

```bash
# Install PostgreSQL (macOS)
brew install postgresql@15
brew services start postgresql@15

# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# Install PostgreSQL (Windows)
# Download installer from https://www.postgresql.org/download/windows/
```

**Create Database:**

```bash
# Access PostgreSQL
psql postgres

# Create user and database
CREATE USER forkioo WITH PASSWORD 'your_secure_password';
CREATE DATABASE forkioo_dev OWNER forkioo;
GRANT ALL PRIVILEGES ON DATABASE forkioo_dev TO forkioo;
\q
```

**Verify Connection:**

```bash
psql -U forkioo -d forkioo_dev -h localhost
# Enter password when prompted
```

### Option 2: Docker PostgreSQL

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: forkioo-db
    environment:
      POSTGRES_USER: forkioo
      POSTGRES_PASSWORD: forkioo_dev_password
      POSTGRES_DB: forkioo_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: forkioo-redis
    ports:
      - "6379:6379"
    restart: unless-stopped

volumes:
  postgres_data:
```

**Start Services:**

```bash
docker-compose up -d
docker-compose logs -f postgres  # Check logs
```

### Option 3: Cloud PostgreSQL (Production)

**Recommended Providers:**
- **Supabase** (https://supabase.com) - Free tier available
- **Neon** (https://neon.tech) - Serverless PostgreSQL
- **Railway** (https://railway.app) - Simple deployment
- **AWS RDS** - Enterprise-grade

**After creating a database, copy the connection string.**

---

## Environment Configuration

### 1. Copy Example Environment File

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env`:

```env
# ==============================================
# DATABASE
# ==============================================
DATABASE_URL="postgresql://forkioo:your_password@localhost:5432/forkioo_dev"

# For connection pooling (production):
# DATABASE_URL="postgresql://user:password@host:5432/db?pgbouncer=true&connection_limit=1"

# ==============================================
# AUTHENTICATION - Clerk
# ==============================================
# Get these from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Optional: Clerk webhook secret (for user sync)
CLERK_WEBHOOK_SECRET="whsec_..."

# ==============================================
# APPLICATION
# ==============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"

# ==============================================
# EMAIL - SendGrid
# ==============================================
# REQUIRED for sending invoices
# Get your API key from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY="SG.xxxxxxxxxxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="invoices@yourdomain.com"
SENDGRID_FROM_NAME="Your Company Name"

# ==============================================
# OPTIONAL: REDIS (for caching)
# ==============================================
REDIS_URL="redis://localhost:6379"

# ==============================================
# OPTIONAL: FILE STORAGE (Cloudflare R2)
# ==============================================
# CLOUDFLARE_ACCOUNT_ID="..."
# R2_ACCESS_KEY_ID="..."
# R2_SECRET_ACCESS_KEY="..."
# R2_BUCKET_NAME="forkioo-documents"

# ==============================================
# OPTIONAL: BANK INTEGRATION (Plaid)
# ==============================================
# PLAID_CLIENT_ID="..."
# PLAID_SECRET="..."
# PLAID_ENV="sandbox"  # sandbox, development, production

# ==============================================
# OPTIONAL: ERROR TRACKING (Sentry)
# ==============================================
# NEXT_PUBLIC_SENTRY_DSN="..."
# SENTRY_AUTH_TOKEN="..."
```

### 3. Verify Configuration

```bash
# Check if .env is loaded
npm run dev

# You should NOT see any environment variable errors
```

---

## Prisma Setup

### 1. Generate Prisma Client

```bash
# Generate TypeScript types from schema
npm run db:generate
```

This creates:
- `node_modules/.prisma/client` - Generated Prisma Client
- TypeScript types for all models

### 2. Run Migrations

```bash
# Apply all migrations to database
npm run db:migrate

# Name your migration when prompted:
# Example: "init", "add_expenses", "add_bank_integration"
```

**What this does:**
- Creates all tables in PostgreSQL
- Applies indexes and constraints
- Creates `prisma/migrations/` folder with SQL files

### 3. Seed Initial Data (Optional)

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create demo company
  const company = await prisma.company.upsert({
    where: { id: "demo-company-id" },
    update: {},
    create: {
      id: "demo-company-id",
      name: "Demo Company LLC",
      businessType: "llc",
      currency: "USD",
      fiscalYearEnd: "12-31",
      countryCode: "US",
      settings: {
        invoicePrefix: "INV-",
        defaultPaymentTermsDays: 30,
        primaryColor: "#3b82f6",
      },
    },
  });

  console.log("✅ Created demo company:", company.name);

  // Create chart of accounts
  const accounts = await Promise.all([
    // Assets
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "1000",
        name: "Cash",
        type: "asset",
        subType: "current_asset",
        isBankAccount: true,
        isSystem: true,
        currentBalance: 0,
      },
    }),
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "1200",
        name: "Accounts Receivable",
        type: "asset",
        subType: "current_asset",
        isControlAccount: true,
        isSystem: true,
        currentBalance: 0,
      },
    }),

    // Liabilities
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "2000",
        name: "Accounts Payable",
        type: "liability",
        subType: "current_liability",
        isControlAccount: true,
        isSystem: true,
        currentBalance: 0,
      },
    }),

    // Equity
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "3000",
        name: "Owner's Equity",
        type: "equity",
        isSystem: true,
        currentBalance: 0,
      },
    }),

    // Revenue
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "4000",
        name: "Sales Revenue",
        type: "revenue",
        isSystem: true,
        currentBalance: 0,
      },
    }),

    // Expenses
    prisma.account.create({
      data: {
        companyId: company.id,
        code: "5000",
        name: "Operating Expenses",
        type: "expense",
        isSystem: true,
        currentBalance: 0,
      },
    }),
  ]);

  console.log(`✅ Created ${accounts.length} accounts`);

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run seed:**

```bash
npm run db:seed
```

### 4. Prisma Studio (Database GUI)

```bash
# Open Prisma Studio in browser
npm run db:studio
```

Access at: http://localhost:5555

---

## tRPC Architecture

### Overview

Forkioo uses tRPC for type-safe API routes. All backend logic is in `server/routers/`.

### File Structure

```
server/
├── trpc.ts              # tRPC initialization & middleware
└── routers/
    ├── _app.ts          # Main router (combines all routers)
    ├── health.ts        # Health check endpoint
    ├── company.ts       # Company profile & settings
    ├── invoices.ts      # Invoice CRUD operations
    ├── customers.ts     # Customer management
    ├── expenses.ts      # Expense tracking
    ├── accounts.ts      # Chart of accounts
    └── reports.ts       # Financial reports
```

### Creating a New Router

**Example: `server/routers/products.ts`**

```typescript
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, createTRPCRouter } from "../trpc";
import { db } from "@/lib/db";

export const productsRouter = createTRPCRouter({
  /**
   * List all products for the company
   */
  list: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Get user's company
      const companyUser = await db.companyUser.findFirst({
        where: { userId: ctx.userId },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No company access",
        });
      }

      // CRITICAL: Always filter by companyId for multi-tenancy
      const products = await db.product.findMany({
        where: {
          companyId: companyUser.companyId, // REQUIRED
          ...(input.search && {
            name: { contains: input.search, mode: "insensitive" },
          }),
        },
        take: input.limit,
        orderBy: { name: "asc" },
      });

      return products;
    }),

  /**
   * Create a new product
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        price: z.number().positive(),
        sku: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const companyUser = await db.companyUser.findFirst({
        where: { userId: ctx.userId },
      });

      if (!companyUser) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No company access",
        });
      }

      const product = await db.product.create({
        data: {
          companyId: companyUser.companyId,
          name: input.name,
          price: input.price,
          sku: input.sku,
        },
      });

      return product;
    }),
});
```

**Add to main router (`server/routers/_app.ts`):**

```typescript
import { productsRouter } from "./products";

export const appRouter = createTRPCRouter({
  // ... existing routers
  products: productsRouter,
});
```

### Using tRPC in Frontend

```typescript
// hooks/use-products.ts
import { trpc } from "@/lib/trpc/client";

export function useProducts() {
  return {
    list: (params?: { search?: string }) =>
      trpc.products.list.useQuery(params || {}),

    create: trpc.products.create.useMutation({
      onSuccess: () => {
        // Invalidate cache
        trpc.useContext().products.list.invalidate();
      },
    }),
  };
}
```

---

## Security Model

### Multi-Tenant Isolation

**CRITICAL RULE**: Every database query MUST filter by `companyId`.

#### ✅ Correct Pattern

```typescript
const invoices = await db.invoice.findMany({
  where: {
    companyId: ctx.companyId,  // ALWAYS REQUIRED
    status: "paid",
  },
});
```

#### ❌ Wrong Pattern (Security Vulnerability!)

```typescript
// DANGEROUS - Accesses ALL companies' data
const invoices = await db.invoice.findMany({
  where: {
    status: "paid",  // Missing companyId filter
  },
});
```

### Enhanced Protected Procedure

Update `server/trpc.ts` to automatically inject `companyId`:

```typescript
/**
 * Enhanced protected procedure with company context
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Get company membership
  const companyUser = await db.companyUser.findFirst({
    where: { userId: ctx.userId },
    include: { company: true },
  });

  if (!companyUser) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No company access",
    });
  }

  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId,
      companyId: companyUser.companyId,
      companyUser,
      role: companyUser.role,
    },
  });
});
```

### Role-Based Access Control (RBAC)

```typescript
// lib/rbac.ts
export const UserRole = {
  OWNER: "owner",
  ADMIN: "admin",
  ACCOUNTANT: "accountant",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

const roleHierarchy = {
  owner: 5,
  admin: 4,
  accountant: 3,
  member: 2,
  viewer: 1,
};

export function requireRole(
  userRole: string,
  minRole: keyof typeof roleHierarchy
): boolean {
  return roleHierarchy[userRole as keyof typeof roleHierarchy] >= roleHierarchy[minRole];
}

// Usage in router
approve: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    if (!requireRole(ctx.role, "admin")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can approve expenses",
      });
    }

    // ... approval logic
  });
```

### Input Validation

**Always validate inputs with Zod:**

```typescript
const createInvoiceSchema = z.object({
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  lines: z.array(
    z.object({
      description: z.string().min(1).max(1000),
      quantity: z.number().positive().max(999999),
      unitPrice: z.number().nonnegative().max(999999999),
      taxRate: z.number().min(0).max(100),
    })
  ).min(1).max(100),
  notes: z.string().max(5000).optional(),
});
```

See `docs/DATABASE_SECURITY.md` for complete security guidelines.

---

## Testing the Backend

### 1. Health Check

```bash
# Start dev server
npm run dev

# Test health endpoint
curl http://localhost:3000/api/trpc/health.check
```

### 2. Create Test User

1. Visit http://localhost:3000
2. Click "Sign Up" (Clerk will handle this)
3. Complete signup flow

### 3. Create Company & User Mapping

```typescript
// Run in Prisma Studio or create a script
const user = await db.user.create({
  data: {
    email: "test@example.com",
    fullName: "Test User",
    clerkUserId: "<clerk-user-id>",  // Get from Clerk dashboard
  },
});

const company = await db.company.create({
  data: {
    name: "Test Company",
    currency: "USD",
  },
});

await db.companyUser.create({
  data: {
    userId: user.id,
    companyId: company.id,
    role: "owner",
  },
});
```

### 4. Test tRPC Endpoints

Use the frontend to test, or use a tool like **tRPC Panel**:

```bash
npm install --save-dev trpc-panel

# Add to server/routers/_app.ts
import { renderTrpcPanel } from "trpc-panel";

// In API route
if (process.env.NODE_ENV === "development") {
  return new Response(renderTrpcPanel(appRouter, { url: "/api/trpc" }));
}
```

Access at: http://localhost:3000/api/panel

---

## Development Workflow

### Daily Development

```bash
# 1. Start database (if using Docker)
docker-compose up -d

# 2. Start dev server
npm run dev

# 3. Open Prisma Studio (optional)
npm run db:studio

# 4. Make changes to code
# 5. Run type check
npm run type-check
```

### Making Schema Changes

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npm run db:migrate

# Name the migration descriptively:
# "add_products_table"
# "add_tax_fields_to_invoice"

# 3. Regenerate Prisma Client
npm run db:generate

# 4. Update seed file if needed
# 5. Test changes
```

### Resetting Database

```bash
# WARNING: This deletes ALL data!
npm run db:reset

# Re-seed
npm run db:seed
```

---

## Deployment

### Environment Setup

1. **Set up production database** (Supabase, Neon, RDS)
2. **Configure environment variables** in hosting platform
3. **Run migrations** in production

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add DATABASE_URL, CLERK keys, etc.

# Deploy to production
vercel --prod
```

### Database Migrations in Production

```bash
# Option 1: Run during build (Vercel)
# Add to package.json build script:
"build": "prisma migrate deploy && prisma generate && next build"

# Option 2: Manual migration
# SSH into server or use platform CLI
npx prisma migrate deploy
```

### Health Monitoring

```bash
# Check database connection
curl https://your-domain.com/api/trpc/health.check

# Expected response:
{
  "status": "ok",
  "timestamp": "2024-11-08T12:00:00.000Z",
  "database": "connected"
}
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Test connection manually
psql $DATABASE_URL

# Check if PostgreSQL is running
ps aux | grep postgres

# Check Docker logs
docker-compose logs postgres
```

### Migration Errors

```bash
# Reset migrations (DEVELOPMENT ONLY!)
npm run db:reset

# Apply specific migration
npx prisma migrate resolve --applied <migration-name>

# Force sync without migrations (use cautiously)
npm run db:push
```

### Prisma Client Out of Sync

```bash
# Regenerate client
npm run db:generate

# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

### Type Errors

```bash
# Regenerate all types
npm run db:generate
npm run type-check

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P -> "TypeScript: Restart TS Server"
```

---

## Additional Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **tRPC Docs**: https://trpc.io/docs
- **Clerk Docs**: https://clerk.com/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Forkioo Security Guide**: [./DATABASE_SECURITY.md](./DATABASE_SECURITY.md)
- **Forkioo Brand Guide**: [./BRAND_GUIDE.md](./BRAND_GUIDE.md)

---

## Next Steps

1. ✅ Complete backend setup following this guide
2. 📝 Review [DATABASE_SECURITY.md](./DATABASE_SECURITY.md) for security best practices
3. 🎨 Review [BRAND_GUIDE.md](./BRAND_GUIDE.md) for UI consistency
4. 🔧 Set up your development environment
5. 🚀 Start building features!

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
**Maintainer**: Development Team
