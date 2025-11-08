# Forkioo

> AI-powered accounting software for small businesses that actually helps.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)

---

## 🎯 Vision

Traditional accounting software shows you *what happened*. Forkioo tells you *what to do next*.

- ⚡ **First invoice in 60 seconds** - No complex setup required
- 🤖 **AI that learns** - Smart categorization that improves with use
- ✅ **Smart to-do list** - Know exactly what needs attention
- 💰 **Generous free tier** - 10 invoices/month, no credit card required

**Read more:** [VISION.md](./VISION.md) • [COMPETITIVE_ANALYSIS.md](./COMPETITIVE_ANALYSIS.md)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm ([Install](https://pnpm.io/installation))
- Docker ([Install](https://docs.docker.com/get-docker/))

### 1. Clone and Install

```bash
git clone https://github.com/JassinAlSafe/Forkioo.git
cd Forkioo
pnpm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Clerk keys:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

Get keys: [dashboard.clerk.com](https://dashboard.clerk.com)

### 3. Start Local Services

```bash
docker-compose up -d
```

This starts PostgreSQL + Redis + MailHog locally.

### 4. Run Migrations

```bash
pnpm db:migrate
```

### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 📚 Documentation

- **[SETUP.md](./SETUP.md)** - Complete setup guide (local + production)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture & database schema
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - UI components & design guidelines
- **[VISION.md](./VISION.md)** - Product vision & roadmap

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16 (App Router) + TypeScript + Tailwind CSS |
| **UI** | shadcn/ui + Radix UI |
| **State** | Zustand + TanStack Query |
| **Backend** | tRPC + Prisma ORM |
| **Database** | PostgreSQL (Railway) |
| **Auth** | Clerk |
| **Cache** | Upstash Redis |
| **Deployment** | Vercel |

---

## 📂 Project Structure

```
forkioo/
├── app/                # Next.js App Router
│   ├── (auth)/        # Auth pages
│   ├── (dashboard)/   # Main app
│   └── api/           # API routes
├── components/        # React components
├── lib/               # Utilities
├── prisma/            # Database schema
├── server/            # tRPC routers
└── research/          # Competitive analysis
```

---

## 🧪 Development

```bash
# Run dev server
pnpm dev

# Type check
pnpm type-check

# Lint
pnpm lint

# Format code
pnpm format

# Database
pnpm db:studio      # Open Prisma Studio
pnpm db:migrate     # Run migrations
pnpm db:seed        # Seed database
```

---

## 🚢 Deployment

See [SETUP.md](./SETUP.md#production-deployment) for detailed deployment instructions.

**Quick Deploy to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FJassinAlSafe%2FForkioo)

---

## 🗺️ Roadmap

### Phase 1: Foundation (Weeks 1-2) ✅ In Progress
- [x] Project setup
- [x] Authentication (Clerk)
- [ ] Dashboard shell
- [ ] Design system implementation

### Phase 2: Invoicing MVP (Weeks 3-4)
- [ ] Create & send invoices
- [ ] Track invoice status
- [ ] Payment recording

### Phase 3: Bank Integration (Weeks 5-6)
- [ ] Plaid integration
- [ ] Transaction import
- [ ] AI categorization

**Full roadmap:** [VISION.md](./VISION.md#implementation-roadmap)

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Clerk](https://clerk.com/)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io/)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Made with ❤️ by the Forkioo team**

[Website](https://forkioo.app) • [Docs](./SETUP.md) • [Issues](https://github.com/JassinAlSafe/Forkioo/issues)
