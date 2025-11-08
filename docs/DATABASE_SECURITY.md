# Forkioo Database Security Guide

## Overview

This guide outlines security best practices for Forkioo's Prisma-based database layer. Since we're using Prisma with PostgreSQL (not Supabase), security is enforced through middleware, tRPC procedures, and proper data validation.

---

## Multi-Tenant Security

### Core Principle: Company Isolation

All data must be scoped to the authenticated user's company. **Never** allow cross-company data access.

### Current Implementation

✅ **tRPC Protected Procedure Pattern**
```typescript
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
      companyId: companyUser.companyId,
      companyUser,
      role: companyUser.role,
    },
  });
});
```

### Required Filters

**All queries** MUST include company filter:
```typescript
// ✅ CORRECT
const invoices = await db.invoice.findMany({
  where: {
    companyId: ctx.companyId,  // REQUIRED
    status: "paid",
  },
});

// ❌ WRONG - Missing company filter
const invoices = await db.invoice.findMany({
  where: {
    status: "paid",  // Dangerous! Accesses all companies
  },
});
```

---

## Role-Based Access Control (RBAC)

### User Roles

```typescript
enum UserRole {
  OWNER = "owner",      // Full access
  ADMIN = "admin",      // Most operations
  MEMBER = "member",    // Limited access
  VIEWER = "viewer",    // Read-only
}
```

### Permission Checks

```typescript
// Check if user has required role
function requireRole(minRole: UserRole, userRole: UserRole): boolean {
  const hierarchy = {
    owner: 4,
    admin: 3,
    member: 2,
    viewer: 1,
  };

  return hierarchy[userRole] >= hierarchy[minRole];
}

// Usage in tRPC router
approve: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Only ADMIN or OWNER can approve
    if (!requireRole("admin", ctx.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Insufficient permissions",
      });
    }

    return db.expense.update({
      where: {
        id: input.id,
        companyId: ctx.companyId,  // Company filter!
      },
      data: { status: "approved" },
    });
  });
```

---

## Input Validation

### Zod Schemas

**All inputs** must be validated with Zod:

```typescript
// ✅ CORRECT - Validated input
create: protectedProcedure
  .input(z.object({
    amount: z.number().positive().max(999999999),
    description: z.string().min(1).max(1000),
    customerId: z.string().uuid(),
  }))
  .mutation(async ({ ctx, input }) => {
    // Input is type-safe and validated
  });

// ❌ WRONG - No validation
create: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    // input is 'any' - dangerous!
  });
```

### Validation Best Practices

1. **String lengths**: Always set min/max
2. **Numbers**: Use .positive() or .nonnegative()
3. **Emails**: Use .email()
4. **UUIDs**: Use .uuid()
5. **Enums**: Use z.enum() or z.nativeEnum()
6. **Dates**: Use z.date() or .coerce.date()

### Example: Complete Validation

```typescript
const createInvoiceSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  customerName: z.string().min(1).max(255),
  customerEmail: z.string().email().optional(),
  invoiceDate: z.date(),
  dueDate: z.date(),
  lines: z.array(z.object({
    description: z.string().min(1).max(1000),
    quantity: z.number().positive().max(999999),
    unitPrice: z.number().nonnegative().max(999999999),
    taxRate: z.number().min(0).max(100),
  })).min(1).max(100), // At least 1 line, max 100
  notes: z.string().max(5000).optional(),
});
```

---

## SQL Injection Prevention

### Prisma Safety

Prisma automatically prevents SQL injection through parameterized queries.

✅ **Safe** (Prisma ORM)
```typescript
await db.invoice.findMany({
  where: {
    invoiceNumber: userInput,  // Automatically parameterized
  },
});
```

❌ **Dangerous** (Raw SQL - avoid unless necessary)
```typescript
// If you MUST use raw SQL, use parameterized queries:
await db.$queryRaw`
  SELECT * FROM invoices
  WHERE invoice_number = ${userInput}
`;

// NEVER do string concatenation:
await db.$executeRawUnsafe(
  `SELECT * FROM invoices WHERE invoice_number = '${userInput}'`
); // DANGEROUS!
```

---

## Sensitive Data Protection

### Never Log Sensitive Data

```typescript
// ❌ WRONG
console.log("Creating invoice:", input);  // May contain PII

// ✅ CORRECT
console.log("Creating invoice", {
  id: invoice.id,
  companyId: ctx.companyId,
});
```

### Redact Sensitive Fields

```typescript
// Exclude sensitive fields from API responses
const publicUserInfo = {
  id: user.id,
  name: user.name,
  // DON'T include: email, phone, taxId
};
```

### Encryption at Rest

- Database: Use PostgreSQL encryption features
- Credentials: Use environment variables
- API Keys: Store hashed, never plaintext

---

## Rate Limiting & Abuse Prevention

### Implement Rate Limits

```typescript
// Example: Limit invoice creation
const rateLimiter = new Map<string, number[]>();

create: protectedProcedure
  .input(createInvoiceSchema)
  .mutation(async ({ ctx, input }) => {
    const now = Date.now();
    const userRequests = rateLimiter.get(ctx.userId) || [];

    // Remove requests older than 1 minute
    const recentRequests = userRequests.filter(
      (time) => now - time < 60000
    );

    if (recentRequests.length >= 10) {
      throw new TRPCError({
        code: "TOO_MANY_REQUESTS",
        message: "Rate limit exceeded",
      });
    }

    recentRequests.push(now);
    rateLimiter.set(ctx.userId, recentRequests);

    // Proceed with creation...
  });
```

---

## Audit Logging

### Track Sensitive Operations

```typescript
async function auditLog(params: {
  userId: string;
  companyId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details?: any;
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      companyId: params.companyId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      details: params.details,
      timestamp: new Date(),
    },
  });
}

// Usage
await auditLog({
  userId: ctx.userId,
  companyId: ctx.companyId,
  action: "invoice.delete",
  resourceType: "invoice",
  resourceId: invoice.id,
});
```

### What to Log

✅ **DO Log:**
- User authentication events
- Permission changes
- Data deletions
- Financial transaction approvals
- Settings changes

❌ **DON'T Log:**
- User passwords
- API keys
- Personal identification numbers
- Full request/response bodies

---

## Database Connection Security

### Environment Variables

```env
# ✅ CORRECT - Use connection string
DATABASE_URL="postgresql://user:password@host:5432/db?sslmode=require"

# ❌ WRONG - Don't commit credentials
DB_USER="myuser"
DB_PASS="mypassword"
```

### Connection Pool

```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Configure connection pool
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["metrics"]
}
```

### SSL/TLS

Always use SSL for database connections:
```
DATABASE_URL="postgresql://...?sslmode=require"
```

---

## Prisma Middleware Security

### Add Security Checks

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Soft delete middleware
prisma.$use(async (params, next) => {
  if (params.action === "delete") {
    // Convert delete to update (soft delete)
    params.action = "update";
    params.args["data"] = { deletedAt: new Date() };
  }

  if (params.action === "findMany" || params.action === "findFirst") {
    // Exclude soft-deleted records
    params.args.where = {
      ...params.args.where,
      deletedAt: null,
    };
  }

  return next(params);
});

export { prisma as db };
```

---

## Security Checklist

### Before Deploying

- [ ] All tRPC procedures use `protectedProcedure`
- [ ] All queries include `companyId` filter
- [ ] All inputs are validated with Zod
- [ ] Role checks for sensitive operations
- [ ] Rate limiting implemented
- [ ] Audit logging for critical actions
- [ ] No sensitive data in logs
- [ ] Database uses SSL connection
- [ ] Environment variables properly configured
- [ ] No hardcoded credentials

### Regular Security Audits

**Weekly:**
- Review new code for security issues
- Check for unauthorized data access patterns

**Monthly:**
- Review audit logs for suspicious activity
- Update dependencies
- Check for SQL injection vulnerabilities

**Quarterly:**
- Full security audit
- Penetration testing
- Update security documentation

---

## Common Vulnerabilities & Fixes

### 1. Missing Company Filter

❌ **Vulnerable**
```typescript
const invoice = await db.invoice.findUnique({
  where: { id: input.id },
});
```

✅ **Fixed**
```typescript
const invoice = await db.invoice.findFirst({
  where: {
    id: input.id,
    companyId: ctx.companyId,
  },
});
```

### 2. No Permission Check

❌ **Vulnerable**
```typescript
delete: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(({ ctx, input }) => {
    return db.invoice.delete({ where: { id: input.id } });
  });
```

✅ **Fixed**
```typescript
delete: protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ ctx, input }) => {
    // Check ownership
    const invoice = await db.invoice.findFirst({
      where: { id: input.id, companyId: ctx.companyId },
    });

    if (!invoice) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    // Check permissions
    if (!requireRole("admin", ctx.role)) {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return db.invoice.delete({
      where: { id: input.id },
    });
  });
```

### 3. Mass Assignment

❌ **Vulnerable**
```typescript
update: protectedProcedure
  .mutation(({ ctx, input }) => {
    return db.invoice.update({
      where: { id: input.id },
      data: input,  // User can modify ANY field!
    });
  });
```

✅ **Fixed**
```typescript
update: protectedProcedure
  .input(z.object({
    id: z.string(),
    // Explicitly define allowed fields
    description: z.string(),
    amount: z.number().positive(),
  }))
  .mutation(({ ctx, input }) => {
    const { id, ...data } = input;
    return db.invoice.update({
      where: { id, companyId: ctx.companyId },
      data,  // Only allowed fields
    });
  });
```

---

## Emergency Response

### If Security Breach Detected

1. **Immediate Actions**:
   - Revoke all API tokens
   - Force password reset for all users
   - Lock affected accounts
   - Disable compromised features

2. **Investigation**:
   - Review audit logs
   - Identify attack vector
   - Assess damage scope
   - Identify affected users

3. **Remediation**:
   - Fix vulnerability
   - Deploy patch immediately
   - Notify affected users
   - Report to authorities if required

4. **Prevention**:
   - Update security procedures
   - Add monitoring for similar attacks
   - Train team on new threats
   - Update this documentation

---

## Resources

### Internal Documentation
- [Brand Guide](./BRAND_GUIDE.md)
- [API Documentation](../server/routers/README.md)
- [Database Schema](../prisma/schema.prisma)

### External Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Prisma Security Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [tRPC Security](https://trpc.io/docs/server/authorization)

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
**Maintainer**: Security Team
