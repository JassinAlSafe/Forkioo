# Performance & UX Optimizations

This document outlines the performance optimizations and UX enhancements implemented in Forkioo to ensure a fast, smooth, and professional user experience.

---

## Table of Contents

1. [Loading States](#loading-states)
2. [Animations & Transitions](#animations--transitions)
3. [Performance Best Practices](#performance-best-practices)
4. [Lazy Loading](#lazy-loading)
5. [Optimization Checklist](#optimization-checklist)

---

## Loading States

### Skeleton Loaders

Skeleton loaders provide visual feedback while content is loading, improving perceived performance.

#### Available Components

**Base Skeleton** (`components/ui/skeleton.tsx`):
```tsx
import { Skeleton } from "@/components/ui/skeleton";

<Skeleton className="h-4 w-32" />
```

**Pre-built Skeletons**:
- `SkeletonCard` - For stat cards and metric displays
- `SkeletonTable` - For data tables with headers and rows
- `SkeletonChart` - For chart placeholders
- `SkeletonStats` - Grid of 4 stat cards
- `SkeletonList` - For activity feeds and lists

#### Usage Example

```tsx
export default function DashboardPage() {
  const { data, isLoading } = useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonStats />
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return <Dashboard data={data} />;
}
```

### Loading Spinners

For immediate feedback and loading indicators.

#### Components

**LoadingSpinner** - Versatile spinner with sizes:
```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

<LoadingSpinner size="lg" text="Loading data..." />
```

**PageLoader** - Centered page loader:
```tsx
import { PageLoader } from "@/components/ui/loading-spinner";

<PageLoader />
```

**ButtonSpinner** - For button loading states:
```tsx
import { ButtonSpinner } from "@/components/ui/loading-spinner";

<Button disabled={isLoading}>
  {isLoading ? <ButtonSpinner /> : "Submit"}
</Button>
```

**FullPageLoader** - Full-screen overlay:
```tsx
import { FullPageLoader } from "@/components/ui/loading-spinner";

{isInitializing && <FullPageLoader />}
```

---

## Animations & Transitions

All animations use CSS for optimal performance and are accessible (respects `prefers-reduced-motion`).

### Available Animation Classes

#### Page Transitions

```tsx
// Fade in when component mounts
<div className="page-transition">
  Content
</div>

// Fade in with slight upward movement
<div className="fade-in">
  Content
</div>

// Slide up from bottom
<div className="slide-up">
  Content
</div>
```

#### Micro-interactions

**Button Press Feedback** (automatically applied to all buttons):
```tsx
// Buttons automatically have btn-press class
<Button>Click Me</Button>
// Scales to 98% on active (pressed)
```

**Card Hover Effects**:
```tsx
// Lift on hover
<div className="card-lift">
  Card content
</div>

// Scale on hover
<div className="hover-scale">
  Hoverable content
</div>
```

**Number Transitions** (smooth value changes):
```tsx
<span className="number-transition">
  {value}
</span>
```

#### List Animations

**Staggered Entry** (items appear sequentially):
```tsx
{items.map((item, index) => (
  <div key={item.id} className="stagger-item">
    {item.content}
  </div>
))}
// First 6 items will stagger with 50ms delay each
```

#### Loading Animations

**Pulse** (for placeholders):
```tsx
<div className="animate-pulse bg-gray-200 h-4 w-32" />
```

**Spin** (for spinners):
```tsx
<Loader2 className="animate-spin" />
```

**Shimmer** (loading effect):
```tsx
<div className="shimmer h-4 w-full rounded" />
```

#### Focus States

**Animated Focus Ring**:
```tsx
<input className="focus-ring-animated" />
// Smooth blue ring on focus
```

---

## Performance Best Practices

### React Optimization

#### 1. Memoization

Use `useMemo` for expensive calculations:

```tsx
const expensiveValue = useMemo(() => {
  return items.reduce((sum, item) => sum + item.value, 0);
}, [items]);
```

Use `useCallback` for functions passed to children:

```tsx
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### 2. Component Splitting

Split large components into smaller ones:

```tsx
// ❌ Bad - All in one component
function DashboardPage() {
  // 500 lines of code
}

// ✅ Good - Split into focused components
function DashboardPage() {
  return (
    <>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <RecentActivity />
    </>
  );
}
```

#### 3. Conditional Rendering

Use early returns for loading states:

```tsx
// ✅ Good
function Component() {
  if (isLoading) return <SkeletonCard />;
  if (error) return <ErrorMessage />;

  return <ActualContent data={data} />;
}
```

### Next.js Optimizations

#### 1. Image Optimization

Always use Next.js Image component:

```tsx
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Forkioo"
  width={200}
  height={50}
  priority // For above-the-fold images
/>
```

#### 2. Font Optimization

Fonts are optimized in `app/layout.tsx`:

```tsx
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap", // Prevents FOUT (Flash of Unstyled Text)
});
```

#### 3. Bundle Size

Monitor bundle size:

```bash
npm run build
# Check output for bundle sizes
```

### Data Fetching

#### 1. tRPC Query Optimization

Use appropriate stale times:

```tsx
// Data that changes frequently
const { data } = trpc.invoices.list.useQuery(params, {
  staleTime: 30_000, // 30 seconds
});

// Data that rarely changes
const { data } = trpc.company.getSettings.useQuery(undefined, {
  staleTime: 5 * 60_000, // 5 minutes
});
```

#### 2. Prefetching

Prefetch data on hover:

```tsx
const utils = trpc.useContext();

<Link
  href="/invoices/123"
  onMouseEnter={() => {
    utils.invoices.getById.prefetch({ id: "123" });
  }}
>
  View Invoice
</Link>
```

#### 3. Parallel Queries

Fetch independent data in parallel:

```tsx
// ✅ Good - Parallel
const { data: invoices } = trpc.invoices.list.useQuery();
const { data: expenses } = trpc.expenses.list.useQuery();
const { data: customers } = trpc.customers.list.useQuery();

// ❌ Bad - Sequential
const invoices = await fetchInvoices();
const expenses = await fetchExpenses(); // Waits for invoices
const customers = await fetchCustomers(); // Waits for expenses
```

---

## Lazy Loading

### Component Lazy Loading

Use Next.js dynamic imports for heavy components:

```tsx
import dynamic from "next/dynamic";

const HeavyChart = dynamic(() => import("@/components/charts/heavy-chart"), {
  loading: () => <SkeletonChart />,
  ssr: false, // Optional: disable server-side rendering
});

export default function Page() {
  return <HeavyChart data={data} />;
}
```

### Route-based Code Splitting

Next.js automatically code-splits by route. Each page is a separate bundle.

### Third-party Libraries

Load heavy libraries only when needed:

```tsx
const [ReactPDF, setReactPDF] = useState(null);

const loadPDF = async () => {
  const module = await import("@react-pdf/renderer");
  setReactPDF(() => module);
};

<button onClick={loadPDF}>Generate PDF</button>
```

---

## Optimization Checklist

### Initial Load

- [x] Fonts optimized with `next/font`
- [x] Images use Next.js Image component
- [x] Critical CSS inlined
- [x] Minimal JavaScript on initial load
- [x] Proper meta tags for SEO

### Runtime Performance

- [x] Button press feedback (btn-press)
- [x] Smooth transitions on all interactive elements
- [x] Skeleton loaders for all loading states
- [x] Debounced search inputs
- [x] Virtualized long lists (if applicable)

### Perceived Performance

- [x] Skeleton loaders instead of spinners
- [x] Optimistic UI updates
- [x] Instant feedback on user actions
- [x] Smooth animations (not janky)
- [x] Progressive loading of content

### Accessibility

- [x] Animations respect `prefers-reduced-motion`
- [x] Focus states clearly visible
- [x] Loading states announced to screen readers
- [x] Keyboard navigation works smoothly

---

## Animation Performance Tips

### DO's

✅ Use `transform` and `opacity` for animations (GPU-accelerated):
```css
.element {
  transition: transform 0.2s, opacity 0.2s;
}
.element:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}
```

✅ Use `will-change` for frequently animated elements:
```css
.frequently-animated {
  will-change: transform;
}
```

✅ Keep animations under 300ms for snappy feel:
```css
.quick {
  transition: transform 0.15s ease-out;
}
```

### DON'Ts

❌ Don't animate `width`, `height`, `top`, `left` (causes reflow):
```css
/* Slow */
.element {
  transition: width 0.3s;
}

/* Fast */
.element {
  transition: transform 0.3s;
  transform: scaleX(1.5);
}
```

❌ Don't overuse animations:
```css
/* Too much */
.everything {
  transition: all 0.5s ease-in-out;
}

/* Just right */
.specific {
  transition: transform 0.2s ease-out;
}
```

---

## Measuring Performance

### Lighthouse Scores

Target scores:
- **Performance**: 90+
- **Accessibility**: 95+
- **Best Practices**: 90+
- **SEO**: 95+

Run Lighthouse in Chrome DevTools or:

```bash
npm install -g lighthouse
lighthouse http://localhost:3000
```

### Core Web Vitals

Monitor these metrics:

1. **LCP (Largest Contentful Paint)**: < 2.5s
   - Use Next.js Image
   - Optimize fonts
   - Lazy load below-the-fold content

2. **FID (First Input Delay)**: < 100ms
   - Minimize JavaScript
   - Use code splitting
   - Avoid long tasks

3. **CLS (Cumulative Layout Shift)**: < 0.1
   - Set image dimensions
   - Reserve space for dynamic content
   - Avoid inserting content above existing content

### React DevTools Profiler

1. Open React DevTools
2. Go to Profiler tab
3. Start recording
4. Interact with app
5. Stop recording
6. Analyze render times

Look for:
- Components rendering too frequently
- Slow renders (> 16ms)
- Unnecessary re-renders

---

## Future Optimizations

### Planned

- [ ] Service Worker for offline support
- [ ] Implement virtual scrolling for large lists
- [ ] Add request deduplication
- [ ] Implement optimistic updates for all mutations
- [ ] Add error boundaries for better error handling
- [ ] Implement skeleton screens for all pages

### Consider

- WebP images with fallbacks
- Compression (gzip/brotli)
- CDN for static assets
- Database query optimization
- Redis caching layer

---

## Resources

- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [React Performance](https://react.dev/learn/render-and-commit#optimizing-performance)
- [Web Vitals](https://web.dev/vitals/)
- [CSS Animation Performance](https://web.dev/animations-guide/)

---

**Last Updated**: 2025-11-08
**Version**: 1.0.0
