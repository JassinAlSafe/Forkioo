# Forkioo Design System

> "Design is not just what it looks like and feels like. Design is how it works." - Steve Jobs

## Design Philosophy

Our design system is built on three pillars:

1. **Clarity over Complexity** - Financial data is inherently complex. Our job is to make it simple.
2. **Trust through Consistency** - Predictable patterns build confidence in critical financial operations.
3. **Beauty in the Details** - Thoughtful micro-interactions make daily tasks feel effortless.

---

## Color System

### Semantic Colors

```css
/* Primary - Trust & Action */
--primary-50:  #eff6ff;
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;
--primary-600: #2563eb;  /* Main brand color */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;

/* Success - Positive Financial Events */
--success-50:  #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-300: #86efac;
--success-400: #4ade80;
--success-500: #22c55e;
--success-600: #16a34a;  /* Profit, paid invoices */
--success-700: #15803d;
--success-800: #166534;
--success-900: #14532d;

/* Warning - Attention Required */
--warning-50:  #fff7ed;
--warning-100: #ffedd5;
--warning-200: #fed7aa;
--warning-300: #fdba74;
--warning-400: #fb923c;
--warning-500: #f97316;
--warning-600: #ea580c;  /* Overdue, review needed */
--warning-700: #c2410c;
--warning-800: #9a3412;
--warning-900: #7c2d12;

/* Danger - Critical Actions */
--danger-50:  #fef2f2;
--danger-100: #fee2e2;
--danger-200: #fecaca;
--danger-300: #fca5a5;
--danger-400: #f87171;
--danger-500: #ef4444;
--danger-600: #dc2626;  /* Errors, losses, deletions */
--danger-700: #b91c1c;
--danger-800: #991b1b;
--danger-900: #7f1d1d;

/* Neutrals - Interface Structure */
--gray-50:  #f9fafb;   /* Backgrounds, hover states */
--gray-100: #f3f4f6;   /* Subtle backgrounds */
--gray-200: #e5e7eb;   /* Borders, dividers */
--gray-300: #d1d5db;   /* Disabled states */
--gray-400: #9ca3af;   /* Placeholders */
--gray-500: #6b7280;   /* Secondary text */
--gray-600: #4b5563;   /* Body text */
--gray-700: #374151;   /* Emphasized text */
--gray-800: #1f2937;   /* Headings */
--gray-900: #111827;   /* Primary text */
```

### Usage Guidelines

**Primary Blue** - Use for:
- Primary CTAs (Send Invoice, Save, Create)
- Links and interactive elements
- Active navigation states
- Focus indicators

**Success Green** - Use for:
- Positive financial metrics (profit, revenue growth)
- Paid/completed statuses
- Success messages
- Confirmation actions

**Warning Orange** - Use for:
- Overdue invoices/bills
- Items requiring review
- Cautionary messages
- Pending approvals

**Danger Red** - Use for:
- Errors and validation failures
- Losses, expenses exceeding budget
- Destructive actions (delete, void)
- Critical alerts

---

## Typography

### Font Stack

```css
/* Primary Font - Inter */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif;

/* Numbers & Financial Data */
font-family: 'Inter', system-ui, sans-serif;
font-feature-settings: 'tnum'; /* Tabular numbers for alignment */
font-variant-numeric: tabular-nums;
```

**Why Inter?**
- Optimized for screens at small sizes
- Tabular number support (critical for financial tables)
- Excellent readability
- Professional yet approachable

### Type Scale

```css
/* Display */
--text-3xl: 30px;  /* line-height: 36px; font-weight: 700; */
--text-2xl: 24px;  /* line-height: 32px; font-weight: 700; */
--text-xl:  20px;  /* line-height: 28px; font-weight: 600; */

/* Headings */
--text-lg:   18px; /* line-height: 28px; font-weight: 600; */
--text-base: 16px; /* line-height: 24px; font-weight: 600; */

/* Body */
--text-base: 16px; /* line-height: 24px; font-weight: 400; */
--text-sm:   14px; /* line-height: 20px; font-weight: 400; */
--text-xs:   12px; /* line-height: 16px; font-weight: 400; */

/* Financial Numbers (Large) */
--text-financial-xl: 36px; /* line-height: 40px; font-weight: 700; letter-spacing: -0.02em; */
--text-financial-lg: 24px; /* line-height: 32px; font-weight: 600; letter-spacing: -0.01em; */
```

### Usage Examples

```tsx
// Page title
<h1 className="text-2xl font-bold text-gray-900">Invoices</h1>

// Section heading
<h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>

// Card title
<h3 className="text-base font-semibold text-gray-700">Profit This Month</h3>

// Body text
<p className="text-base text-gray-600">No invoices created yet.</p>

// Captions, labels
<span className="text-sm text-gray-500">Last updated 2 minutes ago</span>

// Financial metrics (dashboard)
<div className="text-financial-xl font-bold text-gray-900">$12,450</div>
```

---

## Spacing System

8px base unit for consistent, harmonious layouts.

```css
--spacing-0:  0px;
--spacing-1:  4px;   /* 0.5 × base */
--spacing-2:  8px;   /* 1 × base */
--spacing-3:  12px;  /* 1.5 × base */
--spacing-4:  16px;  /* 2 × base */
--spacing-5:  20px;  /* 2.5 × base */
--spacing-6:  24px;  /* 3 × base */
--spacing-8:  32px;  /* 4 × base */
--spacing-10: 40px;  /* 5 × base */
--spacing-12: 48px;  /* 6 × base */
--spacing-16: 64px;  /* 8 × base */
--spacing-20: 80px;  /* 10 × base */
--spacing-24: 96px;  /* 12 × base */
```

### Layout Spacing

- **Section gaps**: 48px (`spacing-12`) - between major page sections
- **Card gaps**: 24px (`spacing-6`) - between cards in a grid
- **Card padding**: 24px (`spacing-6`) - internal card padding
- **Form field gaps**: 16px (`spacing-4`) - vertical spacing between form fields
- **Inline element gaps**: 8px (`spacing-2`) - horizontal gaps (buttons, tags)

---

## Layout & Grid

### Container Widths

```css
/* Max widths for centered content */
--container-sm:  640px;   /* Forms, narrow content */
--container-md:  768px;   /* Standard content */
--container-lg:  1024px;  /* Wide content */
--container-xl:  1280px;  /* Full dashboard */
--container-2xl: 1536px;  /* Ultra-wide (future) */
```

### Responsive Breakpoints

```css
/* Mobile first approach */
@media (min-width: 640px)  { /* sm */ }
@media (min-width: 768px)  { /* md - tablet */ }
@media (min-width: 1024px) { /* lg - desktop */ }
@media (min-width: 1280px) { /* xl - large desktop */ }
```

### Dashboard Layout

```
┌────────────────────────────────────────────────┐
│  Sidebar (240px)  │  Main Content              │
│                   │                            │
│  ┌─────────────┐  │  ┌──────────────────────┐ │
│  │ Logo        │  │  │  Topbar (64px)       │ │
│  └─────────────┘  │  └──────────────────────┘ │
│                   │                            │
│  Navigation       │  ┌──────────────────────┐ │
│  • Dashboard      │  │                      │ │
│  • Invoices       │  │  Page Content        │ │
│  • Expenses       │  │                      │ │
│  • Banking        │  │                      │ │
│  • Reports        │  │                      │ │
│                   │  └──────────────────────┘ │
│                   │                            │
└────────────────────────────────────────────────┘

Mobile: Sidebar collapses to hamburger menu
Tablet: Sidebar becomes icon-only (64px)
Desktop: Full sidebar (240px)
```

---

## Component Library

### Buttons

```tsx
// Primary Button (main actions)
<button className="
  px-4 py-2
  bg-primary-600 hover:bg-primary-700 active:bg-primary-800
  text-white font-medium text-sm
  rounded-lg
  shadow-sm hover:shadow
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Send Invoice
</button>

// Secondary Button (alternative actions)
<button className="
  px-4 py-2
  bg-white hover:bg-gray-50 active:bg-gray-100
  text-gray-700 font-medium text-sm
  border border-gray-300
  rounded-lg
  shadow-sm
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Save Draft
</button>

// Danger Button (destructive actions)
<button className="
  px-4 py-2
  bg-danger-600 hover:bg-danger-700
  text-white font-medium text-sm
  rounded-lg
  shadow-sm
  transition-all duration-150
  focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2
">
  Delete
</button>

// Ghost Button (tertiary actions)
<button className="
  px-4 py-2
  bg-transparent hover:bg-gray-100 active:bg-gray-200
  text-gray-700 font-medium text-sm
  rounded-lg
  transition-colors duration-150
">
  Cancel
</button>
```

### Inputs

```tsx
// Text Input
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Invoice Number
  </label>
  <input
    type="text"
    className="
      w-full px-3 py-2
      bg-white
      border border-gray-300 focus:border-primary-500
      rounded-lg
      text-gray-900 text-sm
      placeholder:text-gray-400
      shadow-sm
      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-0
      transition-colors
      disabled:bg-gray-50 disabled:text-gray-500
    "
    placeholder="INV-001"
  />
</div>

// With Error State
<div className="space-y-1">
  <label className="block text-sm font-medium text-gray-700">
    Email
  </label>
  <input
    type="email"
    className="
      w-full px-3 py-2
      bg-white
      border border-danger-300 focus:border-danger-500
      rounded-lg
      text-gray-900 text-sm
      focus:outline-none focus:ring-2 focus:ring-danger-500
    "
  />
  <p className="text-xs text-danger-600">Please enter a valid email</p>
</div>

// Currency Input
<div className="relative">
  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    <span className="text-gray-500 text-sm">$</span>
  </div>
  <input
    type="number"
    className="
      w-full pl-7 pr-3 py-2
      border border-gray-300 focus:border-primary-500
      rounded-lg
      text-gray-900 text-sm
      tabular-nums
      focus:outline-none focus:ring-2 focus:ring-primary-500
    "
    placeholder="0.00"
  />
</div>
```

### Cards

```tsx
// Metric Card (Dashboard)
<div className="
  p-6
  bg-white
  border border-gray-200
  rounded-xl
  shadow-sm hover:shadow-md
  transition-shadow
">
  <div className="flex items-center justify-between">
    <h3 className="text-sm font-medium text-gray-600">Total Revenue</h3>
    <span className="text-success-600 text-xs font-medium bg-success-50 px-2 py-1 rounded">
      +12%
    </span>
  </div>
  <p className="mt-2 text-3xl font-bold text-gray-900 tabular-nums">
    $48,352
  </p>
  <p className="mt-1 text-sm text-gray-500">
    vs $43,157 last month
  </p>
</div>

// List Card (Invoices, Transactions)
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  shadow-sm
  overflow-hidden
">
  <div className="px-6 py-4 border-b border-gray-200">
    <h3 className="text-lg font-semibold text-gray-900">Recent Invoices</h3>
  </div>
  <div className="divide-y divide-gray-200">
    {/* List items */}
  </div>
</div>
```

### Status Badges

```tsx
// Status Badge Component
function StatusBadge({ status }: { status: InvoiceStatus }) {
  const variants = {
    draft: 'bg-gray-100 text-gray-700',
    sent: 'bg-primary-100 text-primary-700',
    paid: 'bg-success-100 text-success-700',
    overdue: 'bg-danger-100 text-danger-700',
    partial: 'bg-warning-100 text-warning-700',
  };

  return (
    <span className={`
      inline-flex items-center
      px-2.5 py-0.5
      text-xs font-medium
      rounded-full
      ${variants[status]}
    `}>
      {status}
    </span>
  );
}
```

### Data Tables

```tsx
// Table Component
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    {/* Header */}
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Invoice #
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Customer
        </th>
        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Amount
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
      </tr>
    </thead>

    {/* Body */}
    <tbody className="bg-white divide-y divide-gray-200">
      <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          INV-001
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
          Acme Corp
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right tabular-nums">
          $1,250.00
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <StatusBadge status="sent" />
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

### Empty States

```tsx
// Empty State Component
<div className="
  flex flex-col items-center justify-center
  py-12 px-4
  text-center
">
  {/* Icon */}
  <div className="
    w-16 h-16
    bg-gray-100
    rounded-full
    flex items-center justify-center
    mb-4
  ">
    <InvoiceIcon className="w-8 h-8 text-gray-400" />
  </div>

  {/* Message */}
  <h3 className="text-lg font-semibold text-gray-900 mb-2">
    No invoices yet
  </h3>
  <p className="text-gray-600 mb-6 max-w-sm">
    Get started by creating your first invoice. It only takes a minute.
  </p>

  {/* Action */}
  <button className="btn-primary">
    Create Invoice
  </button>
</div>
```

### Modals

```tsx
// Modal Overlay + Content
<div className="fixed inset-0 z-50 overflow-y-auto">
  {/* Backdrop */}
  <div className="
    fixed inset-0
    bg-gray-900 bg-opacity-50
    transition-opacity
  " />

  {/* Modal */}
  <div className="flex min-h-full items-center justify-center p-4">
    <div className="
      relative
      bg-white
      rounded-xl
      shadow-2xl
      max-w-lg w-full
      p-6
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Delete Invoice
        </h3>
        <button className="text-gray-400 hover:text-gray-600">
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this invoice? This action cannot be undone.
      </p>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button className="btn-secondary">Cancel</button>
        <button className="btn-danger">Delete</button>
      </div>
    </div>
  </div>
</div>
```

### Toasts (Notifications)

```tsx
// Toast Notification (Top Right)
<div className="
  fixed top-4 right-4 z-50
  max-w-sm w-full
  bg-white
  border-l-4 border-success-500
  rounded-lg
  shadow-lg
  p-4
  animate-slide-in-right
">
  <div className="flex items-start">
    <CheckCircleIcon className="w-5 h-5 text-success-500 mt-0.5" />
    <div className="ml-3 flex-1">
      <p className="text-sm font-medium text-gray-900">
        Invoice sent successfully
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Email sent to john@acme.com
      </p>
    </div>
    <button className="ml-4 text-gray-400 hover:text-gray-600">
      <CloseIcon className="w-4 h-4" />
    </button>
  </div>
</div>
```

---

## Navigation

### Sidebar Navigation

```tsx
<nav className="flex flex-col gap-1 p-3">
  {/* Active Item */}
  <a href="/dashboard" className="
    flex items-center gap-3
    px-3 py-2
    bg-primary-50
    text-primary-700
    font-medium text-sm
    rounded-lg
    transition-colors
  ">
    <DashboardIcon className="w-5 h-5" />
    Dashboard
  </a>

  {/* Inactive Item */}
  <a href="/invoices" className="
    flex items-center gap-3
    px-3 py-2
    text-gray-700
    hover:bg-gray-100
    font-medium text-sm
    rounded-lg
    transition-colors
  ">
    <InvoiceIcon className="w-5 h-5" />
    Invoices
  </a>
</nav>
```

### Top Bar

```tsx
<header className="
  h-16
  bg-white
  border-b border-gray-200
  flex items-center justify-between
  px-6
">
  {/* Left: Breadcrumbs or Page Title */}
  <div>
    <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
  </div>

  {/* Right: Actions */}
  <div className="flex items-center gap-3">
    {/* Search */}
    <button className="btn-ghost">
      <SearchIcon className="w-5 h-5" />
    </button>

    {/* Notifications */}
    <button className="btn-ghost relative">
      <BellIcon className="w-5 h-5" />
      <span className="absolute top-0 right-0 w-2 h-2 bg-danger-500 rounded-full" />
    </button>

    {/* User Menu */}
    <button className="flex items-center gap-2">
      <img
        src="/avatar.jpg"
        className="w-8 h-8 rounded-full"
        alt="User"
      />
    </button>
  </div>
</header>
```

---

## Animations & Transitions

### Transition Speeds

```css
--transition-fast: 150ms;
--transition-base: 200ms;
--transition-slow: 300ms;
```

### Common Animations

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide In from Right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Slide Up */
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Skeleton Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

### Usage

```tsx
// Animated card appearance
<div className="animate-[slideUp_300ms_ease-out]">
  {/* Card content */}
</div>

// Loading skeleton
<div className="
  h-4 bg-gray-200 rounded
  animate-pulse
" />

// Modal backdrop
<div className="
  fixed inset-0 bg-black
  transition-opacity duration-300
  opacity-50
" />
```

---

## Iconography

### Icon System

- **Library**: Heroicons (by Tailwind Labs)
- **Sizes**: 16px (sm), 20px (base), 24px (lg)
- **Style**: Outline for navigation/buttons, Solid for status indicators

```tsx
import {
  HomeIcon,           // Dashboard
  DocumentTextIcon,   // Invoices
  CreditCardIcon,     // Expenses
  BanknotesIcon,      // Banking
  ChartBarIcon,       // Reports
  Cog6ToothIcon,      // Settings
  UserGroupIcon,      // Team
  CheckCircleIcon,    // Success
  ExclamationCircleIcon, // Warning
  XCircleIcon,        // Error
} from '@heroicons/react/24/outline';
```

---

## Accessibility

### Focus States

All interactive elements must have clear focus indicators:

```css
/* Focus ring */
focus:outline-none
focus:ring-2
focus:ring-primary-500
focus:ring-offset-2
```

### Color Contrast

- Text: Minimum WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Interactive elements: Clear hover/active/focus states
- Status indicators: Don't rely on color alone (use icons + text)

### Keyboard Navigation

- Tab order follows visual hierarchy
- Modals trap focus
- Keyboard shortcuts (Cmd+K for search, Esc to close)
- Skip links for screen readers

### Screen Reader Support

```tsx
// Descriptive labels
<button aria-label="Delete invoice INV-001">
  <TrashIcon className="w-4 h-4" />
</button>

// Status indicators
<span aria-label="Invoice status: paid">
  <StatusBadge status="paid" />
</span>

// Loading states
<div role="status" aria-live="polite">
  Loading invoices...
</div>
```

---

## Responsive Design Patterns

### Mobile-First Components

```tsx
// Responsive card grid
<div className="
  grid
  grid-cols-1      /* Mobile: 1 column */
  md:grid-cols-2   /* Tablet: 2 columns */
  lg:grid-cols-3   /* Desktop: 3 columns */
  gap-6
">
  {/* Cards */}
</div>

// Responsive table → Card list on mobile
<div className="hidden md:block">
  {/* Table (desktop) */}
  <Table />
</div>
<div className="md:hidden">
  {/* Card list (mobile) */}
  <CardList />
</div>

// Responsive navigation
<nav className="
  fixed bottom-0 left-0 right-0    /* Mobile: bottom nav */
  md:static                         /* Desktop: sidebar */
">
```

---

## Design Tokens (Tailwind Config)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: { /* ... */ },
        success: { /* ... */ },
        warning: { /* ... */ },
        danger: { /* ... */ },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'financial-xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'financial-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
      },
      animation: {
        'slide-up': 'slideUp 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

---

## Component Development Checklist

When building a new component, ensure:

- [ ] Follows design system colors, spacing, typography
- [ ] Has hover, active, focus, disabled states
- [ ] Works on mobile, tablet, desktop
- [ ] Keyboard accessible (tab navigation, enter to submit)
- [ ] Screen reader friendly (aria labels, semantic HTML)
- [ ] Loading states defined
- [ ] Error states defined
- [ ] Empty states defined
- [ ] Animations are subtle and fast (< 300ms)
- [ ] Meets WCAG AA contrast ratios

---

*"Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away."*

Our design system is a living document. As we build, we refine. Every pixel serves a purpose.
