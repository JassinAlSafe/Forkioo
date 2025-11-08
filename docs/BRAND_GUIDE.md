# Forkioo Brand Style Guide

## Overview

Forkioo is an AI-powered accounting platform designed to be simple, trustworthy, and professional. Our brand conveys clarity, reliability, and modern financial expertise.

---

## Typography System

### Font Families

**Primary UI Font: Inter**
- Usage: Body text, UI components, labels, buttons
- Characteristics: Clean, highly readable, excellent for financial data
- Features: Tabular numbers support for perfect alignment
```css
font-family: var(--font-inter);
```

**Display Font: Plus Jakarta Sans**
- Usage: Headings, hero sections, marketing materials
- Characteristics: Modern, friendly yet professional, distinctive
- Features: Multiple weights (400-800) for hierarchy
```css
font-family: var(--font-display);
```

**Monospace Font: JetBrains Mono**
- Usage: Financial figures, code, data tables
- Characteristics: Highly readable, designed for numbers and code
- Features: Clear number distinction, tabular alignment
```css
font-family: var(--font-mono);
```

### Typography Scale

**Display Sizes** (Use with `font-display`)
- `display-2xl`: 72px/90px - Hero headlines
- `display-xl`: 60px/72px - Major page titles
- `display-lg`: 48px/60px - Section headers
- `display-md`: 36px/44px - Card headers
- `display-sm`: 30px/38px - Subsection titles

**Financial Data Sizes** (Use with `font-mono`)
- `financial-xl`: 36px/40px - Dashboard KPIs
- `financial-lg`: 24px/32px - Report headers
- `financial-md`: 20px/28px - Table headers
- `financial-sm`: 16px/24px - Small values

### Typography Rules

1. **All headings (h1-h6)** automatically use the display font
2. **Financial values** must use `tabular-nums` class for alignment
3. **Currency amounts** should use `font-mono` for clarity
4. **Body text** uses Inter at 14px-16px

---

## Color System

### Brand Colors

**Primary Blue** - Trust & Reliability
```css
--primary: hsl(217, 91%, 60%)
```
- Use for: Primary CTAs, links, active states
- Represents: Trust, professionalism, stability
- Accessibility: AAA compliant on white backgrounds

**Accent Emerald** - Growth & Success
```css
--accent: hsl(142, 76%, 36%)
```
- Use for: Success states, positive financial indicators
- Represents: Growth, profit, positive outcomes

### Semantic Colors

**Success** (Green palette)
- `success-600`: #16a34a - Paid invoices, profits
- Use for: Positive financial data, completed actions

**Warning** (Orange palette)
- `warning-600`: #ea580c - Pending items, alerts
- Use for: Items requiring attention

**Danger** (Red palette)
- `danger-600`: #dc2626 - Overdue invoices, losses
- Use for: Negative financial data, errors

**Neutral** (Gray palette)
- Use for: Drafts, inactive states, backgrounds

### Financial Status Colors

```css
/* Paid Status */
.status-paid {
  bg-success-50, text-success-700, border-success-200
}

/* Pending Status */
.status-pending {
  bg-warning-50, text-warning-700, border-warning-200
}

/* Overdue Status */
.status-overdue {
  bg-danger-50, text-danger-700, border-danger-200
}

/* Draft Status */
.status-draft {
  bg-gray-50, text-gray-700, border-gray-200
}
```

---

## Spacing System

### Consistent Spacing Scale

Use these CSS variables for all spacing:

```css
--space-4xs: 2px
--space-3xs: 4px
--space-2xs: 8px
--space-xs: 12px
--space-sm: 16px
--space-md: 24px
--space-lg: 32px
--space-xl: 48px
--space-2xl: 64px
--space-3xl: 96px
```

### Layout Utilities

**Section Spacing**
```css
.section-spacing /* py-8 md:py-12 lg:py-16 */
```

**Container Spacing**
```css
.container-spacing /* px-4 sm:px-6 lg:px-8 */
```

---

## Shadow System

### Elevation Levels

```css
--shadow-sm: Subtle hover effects
--shadow-md: Cards, modals
--shadow-lg: Dropdowns, popovers
--shadow-xl: Large modals, sheets
```

### Usage

**Cards with Hover**
```css
.card-elevated /* Adds md shadow with lg on hover */
```

---

## Component Patterns

### Financial Value Display

**Positive Values** (Profits, Credits)
```jsx
<span className="financial-value-positive">
  $12,345.67
</span>
```

**Negative Values** (Losses, Debits)
```jsx
<span className="financial-value-negative">
  -$1,234.56
</span>
```

**Neutral Values**
```jsx
<span className="financial-value">
  $5,678.90
</span>
```

### Button Styles

**Primary Financial Action**
```jsx
<button className="btn-financial-primary">
  Create Invoice
</button>
```

**Success Action** (Approve, Accept)
```jsx
<button className="btn-financial-success">
  Approve Expense
</button>
```

---

## Best Practices

### Typography

1. ✅ **DO** use `font-display` for all headings
2. ✅ **DO** use `font-mono` for all financial amounts
3. ✅ **DO** use `tabular-nums` for number alignment
4. ❌ **DON'T** mix fonts within the same context
5. ❌ **DON'T** use decorative fonts for data

### Colors

1. ✅ **DO** use semantic colors (success/warning/danger) for status
2. ✅ **DO** ensure WCAG AAA contrast ratios
3. ✅ **DO** use status utility classes for consistency
4. ❌ **DON'T** use red/green as the only indicator (accessibility)
5. ❌ **DON'T** create custom status colors

### Spacing

1. ✅ **DO** use the spacing scale variables
2. ✅ **DO** maintain consistent padding in similar components
3. ✅ **DO** use responsive spacing utilities
4. ❌ **DON'T** use arbitrary spacing values
5. ❌ **DON'T** mix Tailwind spacing with custom values

### Shadows

1. ✅ **DO** use shadows to establish visual hierarchy
2. ✅ **DO** use card-elevated for interactive cards
3. ❌ **DON'T** overuse heavy shadows
4. ❌ **DON'T** use shadows on flat UI elements

---

## Accessibility

### WCAG Compliance

- All text must meet WCAG AA (4.5:1 contrast minimum)
- Interactive elements must meet AAA (7:1 contrast)
- Focus states must be clearly visible
- Financial data must not rely solely on color

### Focus States

All interactive elements use:
```css
.focus-ring /* focus:ring-2 focus:ring-ring focus:ring-offset-2 */
```

### Semantic HTML

1. Use proper heading hierarchy (h1 → h2 → h3)
2. Use semantic HTML elements
3. Include ARIA labels for icons and actions
4. Ensure keyboard navigation works

---

## Usage Examples

### Dashboard Card

```jsx
<div className="card-elevated rounded-lg border bg-white p-6">
  <h3 className="text-lg font-semibold text-gray-900">
    Total Revenue
  </h3>
  <p className="financial-value-positive text-financial-xl mt-2">
    $125,432.00
  </p>
  <p className="text-sm text-success-600 mt-1">
    +12.5% from last month
  </p>
</div>
```

### Invoice Status Badge

```jsx
<span className="status-paid inline-flex rounded-full px-3 py-1 text-xs font-medium">
  Paid
</span>
```

### Financial Table

```jsx
<table className="w-full">
  <thead>
    <tr>
      <th className="text-financial-sm font-display">Invoice #</th>
      <th className="text-financial-sm font-display text-right">Amount</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="font-mono">INV-001</td>
      <td className="financial-value text-right">$1,234.56</td>
    </tr>
  </tbody>
</table>
```

---

## Logo Usage

### Logo Specifications

**Primary Logo**
- Min width: 120px
- Clear space: 20px on all sides
- File formats: SVG (preferred), PNG

**Favicon**
- Sizes: 16x16, 32x32, 180x180
- Format: ICO, PNG

### Logo Variations

1. **Full Color** - Primary use
2. **White** - On dark backgrounds
3. **Monochrome** - Single color applications

---

## Voice & Tone

### Brand Voice

**Professional but Approachable**
- Clear and direct language
- Avoid jargon unless necessary
- Friendly without being casual

**Confident and Helpful**
- "Create your first invoice" not "Try creating an invoice"
- "You've saved $X this month" not "Savings: $X"

### UI Copy Guidelines

1. **Buttons**: Action-oriented verbs (Create, Send, Approve)
2. **Errors**: Clear explanation + solution
3. **Success**: Confirm action taken
4. **Empty States**: Guide next steps

---

## File Structure

```
/styles
  └── globals.css          # Brand styles and utilities
/public
  └── /brand
      ├── logo.svg         # Primary logo
      ├── logo-white.svg   # White variant
      └── favicon.ico      # Favicon
/docs
  └── BRAND_GUIDE.md       # This file
```

---

## Quick Reference

### CSS Classes Cheat Sheet

**Typography**
- `font-display` - Headings
- `font-mono` - Financial data
- `tabular-nums` - Aligned numbers

**Financial Values**
- `financial-value` - Base
- `financial-value-positive` - Green
- `financial-value-negative` - Red

**Status**
- `status-paid` - Success
- `status-pending` - Warning
- `status-overdue` - Danger
- `status-draft` - Neutral

**Effects**
- `card-elevated` - Shadow with hover
- `smooth-transition` - Animations
- `focus-ring` - Accessibility

---

## Maintenance

This brand guide should be reviewed quarterly and updated when:
- New components are added
- User feedback suggests improvements
- Accessibility standards change
- Brand strategy evolves

**Last Updated**: 2025-11-08
**Version**: 1.0.0
