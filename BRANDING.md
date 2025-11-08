# Forkioo Brand Guidelines

## Overview

Forkioo is a modern booking platform designed with simplicity, professionalism, and user experience at its core. Our branding reflects these values through thoughtful typography, a vibrant yet professional color palette, and consistent design patterns.

## Typography

### Font Choices

#### Primary Font: Inter
- **Purpose**: UI elements, body text, navigation
- **Why Inter?**
  - Designed specifically for user interfaces
  - Exceptional readability at all sizes
  - Modern, professional appearance
  - Optimized for digital screens
  - Open source and widely supported

#### Display Font: Lexend
- **Purpose**: Headings, hero text, important callouts
- **Why Lexend?**
  - Designed to improve reading proficiency
  - Distinctive character shapes
  - Perfect for attention-grabbing headlines
  - Pairs beautifully with Inter
  - Maintains professional appearance

### Font Implementation

```typescript
// fonts/index.ts
import { Inter, Lexend } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  display: 'swap',
})
```

### Usage Guidelines

- **Headings (h1-h6)**: Use Lexend with font-display class
- **Body text**: Use Inter (default)
- **Buttons**: Use Inter with medium weight
- **Labels**: Use Inter with medium weight
- **Numbers/Prices**: Use Lexend for emphasis

## Color Palette

### Primary Brand Color: Sky Blue

**Brand 500**: `#0ea5e9` - Main brand color

```
Brand Palette:
50:  #f0f9ff - Lightest backgrounds
100: #e0f2fe - Subtle backgrounds
200: #bae6fd - Borders, dividers
300: #7dd3fc - Hover states
400: #38bdf8 - Interactive elements
500: #0ea5e9 - PRIMARY brand color
600: #0284c7 - Pressed states
700: #0369a1 - Text on light
800: #075985 - Dark text
900: #0c4a6e - Darkest elements
```

**Why Sky Blue?**
- Trustworthy and professional
- Associated with technology and reliability
- Excellent contrast for accessibility
- Stands out without being aggressive
- Modern and energetic

### Accent Color: Fuchsia

**Accent 500**: `#d946ef` - For highlights and special elements

```
Accent Palette:
500: #d946ef - Call-to-action highlights
600: #c026d3 - Hover/active states
```

**Why Fuchsia?**
- Creates visual interest
- Complements sky blue perfectly
- Draws attention to important actions
- Modern and energetic
- Memorable and distinctive

### Semantic Colors

```
Success (Green):
500: #22c55e - Confirmations, success states
600: #16a34a - Success hover states

Warning (Amber):
500: #f59e0b - Warnings, pending states
600: #d97706 - Warning emphasis

Danger (Red):
500: #ef4444 - Errors, destructive actions
600: #dc2626 - Danger emphasis

Neutral (Gray):
50-950: Complete grayscale for text and backgrounds
```

## Design System

### Border Radius

**Forkioo Standard**: `0.75rem` (12px)
- Consistent across all components
- Modern, friendly appearance
- Not too rounded, not too sharp

### Shadows

```css
forkioo-sm: Subtle elevation
forkioo:    Default cards
forkioo-md: Hover states
forkioo-lg: Modals, dropdowns
forkioo-xl: Maximum elevation
```

### Spacing

Follow the 8px grid system:
- Base unit: 8px
- Small gaps: 8px (gap-2)
- Medium gaps: 16px (gap-4)
- Large gaps: 24px (gap-6)
- Section spacing: 48-96px

## Components

### Buttons

```typescript
// Primary - Main actions
<Button variant="primary">Book Now</Button>

// Secondary - Alternative actions
<Button variant="secondary">Learn More</Button>

// Accent - Special highlights
<Button variant="accent">Premium</Button>

// Ghost - Subtle actions
<Button variant="ghost">Cancel</Button>

// Danger - Destructive actions
<Button variant="danger">Delete</Button>
```

**Button States:**
- Hover: Slight darkening
- Active: Scale down (0.95)
- Disabled: 50% opacity
- Focus: Ring with brand color

### Cards

```typescript
// Standard card
<Card>Content</Card>

// Interactive card with hover effect
<Card hover>Content</Card>
```

**Card Features:**
- Consistent padding: 24px
- Subtle shadow
- Border for definition
- Hover: Lift and shadow increase

### Inputs

```typescript
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
/>
```

**Input States:**
- Default: Neutral border
- Focus: Brand color ring
- Error: Danger color
- Disabled: Muted appearance

### Badges

```typescript
<Badge variant="primary">New</Badge>
<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
```

## Animations

### Principles
- Smooth and natural
- Fast but not jarring
- Enhance UX, don't distract

### Standard Animations

```css
animate-fade-in:   0.2s ease-in
animate-slide-up:  0.3s ease-out
animate-slide-down: 0.3s ease-out
animate-scale-in:  0.2s ease-out
```

### Usage
- Page load: Fade in
- New content: Slide up
- Dropdowns: Slide down
- Buttons: Scale on active

## Accessibility

### Color Contrast
- All text meets WCAG AA standards
- Interactive elements have 3:1 minimum
- Focus indicators are clearly visible

### Typography
- Minimum font size: 14px (0.875rem)
- Line height: 1.5 for body text
- Adequate spacing between elements

### Interactive Elements
- All clickable areas minimum 44x44px
- Clear focus states
- Keyboard navigation support

## Usage Examples

### Hero Section
```tsx
<section className="gradient-brand text-white">
  <h1 className="font-display">Modern Booking</h1>
  <p className="text-xl">Made Simple</p>
  <Button variant="primary" size="lg">Get Started</Button>
</section>
```

### Service Card
```tsx
<Card hover>
  <h3 className="font-display">Service Name</h3>
  <Badge variant="primary">60 min</Badge>
  <p className="text-neutral-600">Description</p>
  <Button variant="primary">Book Now</Button>
</Card>
```

### Booking Status
```tsx
<Badge variant="success">Confirmed</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="danger">Cancelled</Badge>
```

## Best Practices

### DO ✅
- Use consistent spacing (8px grid)
- Apply shadow hierarchy correctly
- Use brand colors for primary actions
- Maintain color contrast ratios
- Use display font for headings
- Apply animations sparingly
- Test on multiple screen sizes

### DON'T ❌
- Mix different border radius values
- Use random colors outside the palette
- Over-animate elements
- Ignore accessibility guidelines
- Use too many accent colors
- Create cluttered layouts
- Forget mobile responsiveness

## File Organization

```
src/
├── app/
│   ├── globals.css       # Global styles, Tailwind utilities
│   └── layout.tsx         # Font configuration
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   └── Badge.tsx
│   └── booking/          # Feature-specific components
│       ├── ServiceCard.tsx
│       └── BookingCard.tsx
└── lib/
    └── utils.ts          # Utility functions
```

## Resources

- **Fonts**: [Google Fonts](https://fonts.google.com)
  - Inter: https://fonts.google.com/specimen/Inter
  - Lexend: https://fonts.google.com/specimen/Lexend

- **Colors**: [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)

- **Icons**: Recommend using [Lucide Icons](https://lucide.dev) or [Heroicons](https://heroicons.com)

## Updates

This brand guide should be reviewed:
- Before major releases
- When adding new features
- Quarterly for consistency
- After user feedback

---

**Version**: 1.0
**Last Updated**: November 2024
**Maintained by**: Forkioo Team
