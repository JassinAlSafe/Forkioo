# Forkioo

> Modern Booking Made Simple

Forkioo is a professional booking and scheduling platform built for modern businesses. A beautifully designed Bookio clone with exceptional UX, powered by Next.js 14 and Supabase.

## Features

- 🎨 **Beautiful Design** - Professionally crafted UI with Inter & Lexend fonts
- 🔒 **Secure** - Comprehensive Row Level Security policies
- ⚡ **Fast** - Built with Next.js 14 App Router
- 📱 **Responsive** - Mobile-first design approach
- 🎯 **Type-Safe** - Full TypeScript implementation
- 🔐 **Authentication** - Supabase Auth integration
- 💳 **Payments Ready** - Structured for payment integration
- 📊 **Analytics** - Built for tracking and insights

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Fonts**: Inter (UI) + Lexend (Display)

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Forkioo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Set up the database**

   Option A: Using Supabase CLI (recommended)
   ```bash
   npx supabase init
   npx supabase db push
   ```

   Option B: Manual setup
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the migrations in `supabase/migrations/` in order

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
Forkioo/
├── src/
│   ├── app/                 # Next.js app router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout with fonts
│   │   └── page.tsx        # Home page
│   ├── components/
│   │   ├── ui/             # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   └── booking/        # Booking-specific components
│   │       ├── ServiceCard.tsx
│   │       └── BookingCard.tsx
│   └── lib/
│       ├── supabase/       # Supabase client utilities
│       │   ├── client.ts   # Browser client
│       │   ├── server.ts   # Server client
│       │   └── types.ts    # Database types
│       └── utils.ts        # Utility functions
├── supabase/
│   ├── migrations/         # Database migrations
│   │   ├── 20240101000000_initial_schema.sql
│   │   └── 20240101000001_row_level_security.sql
│   ├── config.toml         # Supabase configuration
│   └── SECURITY.md         # Security documentation
├── BRANDING.md             # Brand guidelines
└── README.md               # You are here
```

## Database Schema

### Tables

- **profiles** - User profiles (customer, provider, admin)
- **services** - Services offered by providers
- **availability** - Provider availability schedules
- **bookings** - Booking records

See [Supabase Security Documentation](./supabase/SECURITY.md) for detailed schema and RLS policies.

## Branding

Forkioo features a carefully designed brand identity:

- **Primary Font**: Inter - Modern, highly readable UI font
- **Display Font**: Lexend - Designed for readability in headings
- **Primary Color**: Sky Blue (#0ea5e9) - Professional and trustworthy
- **Accent Color**: Fuchsia (#d946ef) - Energetic highlights

See [BRANDING.md](./BRANDING.md) for complete brand guidelines.

## Security

Forkioo implements enterprise-grade security:

- ✅ Row Level Security (RLS) on all tables
- ✅ Role-based access control
- ✅ Booking conflict prevention
- ✅ Data validation at database level
- ✅ Audit trails with timestamps
- ✅ Protection against privilege escalation

See [Supabase Security Documentation](./supabase/SECURITY.md) for details.

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

### Code Style

- Use TypeScript for all new code
- Follow the existing component structure
- Use Tailwind utility classes
- Maintain accessibility standards
- Write semantic HTML

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## Roadmap

- [ ] Payment integration (Stripe)
- [ ] Email notifications
- [ ] SMS reminders
- [ ] Calendar integrations (Google, Outlook)
- [ ] Video call integration (Zoom, Meet)
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is private and proprietary.

## Support

For issues and questions:
- Check the documentation
- Review [BRANDING.md](./BRANDING.md)
- Review [SECURITY.md](./supabase/SECURITY.md)
- Open an issue on GitHub

---

Built with ❤️ for modern businesses
