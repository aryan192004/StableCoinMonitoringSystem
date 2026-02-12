# UI Design System Implementation

This document outlines the complete UI redesign for the **Stablecoin Risk & Liquidity Monitoring Platform**, implementing a modern, institutional-grade fintech SaaS aesthetic.

## 🎨 Design Philosophy

**Professional. Institutional. Clean. Minimal.**

The UI is designed to evoke the feel of a "Bloomberg Terminal but modern SaaS version" - prioritizing:
- Data readability and clarity
- Professional aesthetics suitable for institutional investors
- Subtle interactions and smooth animations
- Clean whitespace and organized information hierarchy
- **NOT** flashy neon crypto aesthetics

---

## 📐 Design System

### Color Palette

```css
Primary Blue:   #3B82F6 (hover: #2563EB, dark: #1E40AF)
Success Green:  #22C55E (hover: #16A34A, dark: #15803D)
Warning Orange: #F59E0B (hover: #D97706, dark: #B45309)
Danger Red:     #EF4444 (hover: #DC2626, dark: #B91C1C)

Background:     #F9FAFB
Surface:        #FFFFFF
Border:         #E5E7EB

Text Primary:   #111827
Text Secondary: #6B7280
Text Tertiary:  #9CA3AF
```

### Typography

- **Font Family**: Inter (Google Fonts)
- **Scale**:
  - H1: 32px / 2rem - Page titles
  - H2: 24px / 1.5rem - Section headings
  - H3: 20px / 1.25rem - Card titles
  - Body: 16px / 1rem - Default text
  - Small: 14px / 0.875rem - Metadata, labels
  - XSmall: 12px / 0.75rem - Captions, timestamps

### Spacing System

8px base grid:
- 4px, 8px, 16px, 24px, 32px, 48px, 64px

### Border Radius

- Small: 6px (inputs, buttons)
- Medium: 8px (cards, modals)
- Large (xl2): **14px** (primary cards, hero elements)
- Full: 9999px (badges, avatars)

### Shadows

```css
Card:       0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
Card Hover: 0 4px 12px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)
Soft:       0 2px 8px rgba(59,130,246,0.15)
```

### Animations

- **Fade In**: opacity 0→1, 0.3s ease-in
- **Slide Up**: translateY(10px→0), opacity 0→1, 0.4s ease-out
- **Count Up**: Used for KPI number animations
- **Hover**: 200ms transitions on interactive elements

---

## 🧩 Component Library

### Core UI Components

Located in `apps/frontend/components/ui/`:

#### Button
- **Variants**: primary, secondary, outline, ghost, danger
- **Sizes**: sm, md, lg
- **States**: default, hover, loading, disabled
- **Features**: Icon support, loading spinner

```tsx
<Button variant="primary" size="lg">View Dashboard</Button>
```

#### Card
- Base card with `rounded-xl2` and `shadow-card`
- Optional hover elevation effect
- Composable: `Card`, `CardHeader`, `CardTitle`, `CardBody`

```tsx
<Card hover>
  <CardHeader>
    <CardTitle>Market Overview</CardTitle>
  </CardHeader>
  <CardBody>Content here</CardBody>
</Card>
```

#### Badge
- **Variants**: success, warning, danger, neutral
- **Sizes**: sm, md
- Special: `RiskBadge` component with auto-variant based on risk score

```tsx
<Badge variant="success">Stable</Badge>
<RiskBadge score={0.24} /> {/* Auto-assigns variant */}
```

#### Table
- Composable: `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeader`, `TableCell`
- Sortable header support
- Hover row effects
- Clean borders and spacing

```tsx
<Table>
  <TableHead>
    <TableRow>
      <TableHeader sortable>Name</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>...</TableBody>
</Table>
```

#### KPICard
- Displays metric with value, trend indicator, and optional icon
- Animated count-up effect on numbers
- Color-coded trend arrows (↑↓→)
- Subtitle support for context

```tsx
<KPICard 
  title="Total Market Cap"
  value="$150.2B"
  change={2.4}
  trend="up"
  icon={<span>💰</span>}
/>
```

---

## 📱 Layout Components

Located in `apps/frontend/components/layout/`:

### Sidebar
- Fixed navigation with logo, menu items, and system status
- Active state highlighting with `bg-primary`
- Smooth hover transitions
- System status indicator at bottom

### Navbar
- Search bar (left)
- Notifications and settings icons (right)
- User profile dropdown (right)

### DashboardLayout
- Combines Sidebar + Navbar + content area
- Flex layout with proper overflow handling
- Consistent spacing and padding

---

## 📄 Pages Implemented

### Landing Page (`/`)

**Sections**:
1. **Hero Section**: Split layout
   - Left: Heading, subheading, CTAs, key stats (3 metrics)
   - Right: Dashboard mockup with browser chrome
2. **Color Showcase**: 4 cards showing risk signal colors
3. **Typography Showcase**: Demonstrates heading hierarchy and number formatting
4. **CTA Section**: Gradient background with dual CTAs

### Dashboard Pages

All dashboard pages use `DashboardLayout` wrapper.

#### 1. Markets Overview (`/dashboard`)
- 4 KPI cards (Market Cap, Risk Score, Active Coins, Liquidity)
- Stablecoin rankings table with:
  - Name, Price, Market Cap, Volume, Peg Deviation, Risk Score, 24h Change
  - Sortable headers
  - Risk badges with color coding
  - Click-to-detail functionality

#### 2. Stablecoin Detail (`/dashboard/stablecoins/[id]`)
- Header with coin logo, name, status badge, action buttons
- 4 metric KPI cards
- Price history chart (bar visualization with hover states)
- Reserve composition chart (horizontal stacked bar)
- Liquidity depth by exchange (progress bars with badges)

#### 3. Liquidity Monitoring (`/dashboard/liquidity`)
- Exchange overview cards (4 exchanges with TVL, spread, status)
- Order book depth visualization
  - Bid/Ask chart with color coding (green/red)
  - Central price marker
  - Depth tables below chart
- DEX liquidity pools section with TVL, volume, APY

#### 4. Alerts (`/dashboard/alerts`)
- Summary KPI cards (Active Alerts, Triggered Today, Response Time)
- Recent alert triggers with severity badges
- Alert configuration table with status, triggers, actions
- Create new alert form with dropdowns and inputs

#### 5. Analytics (`/dashboard/analytics`)
- 4 advanced metric KPI cards
- Market cap distribution chart
- Price correlation matrix
- Historical trends (30-day stacked chart)
- Risk breakdown, exchange concentration, stability metrics

---

## 🎭 Micro-Interactions

1. **Hover Effects**:
   - Cards: shadow elevation increase
   - Buttons: slight bg color change
   - Table rows: subtle bg gray highlight
   - Charts: bar opacity increase

2. **Loading States**:
   - Button spinner during async actions
   - Skeleton loading for KPI values
   - Pulsing status indicators

3. **Transitions**:
   - All interactive elements: 200ms duration
   - Page entry animations: fade-in, slide-up
   - Chart bars: 500ms ease transitions

4. **Status Indicators**:
   - Pulsing green dot for "live" data
   - Animated alert severity dots
   - Count-up animation on KPI numbers

---

## 🚀 Usage

### Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm --filter @stablecoin/frontend dev

# Visit http://localhost:3000
```

### Component Import

```tsx
// UI components
import { Button, Card, Badge, KPICard, Table } from '@/components/ui';

// Layout components
import { DashboardLayout } from '@/components/layout';
```

### Adding Custom Theme Colors

Edit `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      yourColor: '#HEX',
    },
  },
}
```

---

## 📦 Dependencies

- **Next.js 14**: App Router, server components
- **React 18**: UI library
- **Tailwind CSS 3**: Utility-first styling
- **clsx**: Conditional class names
- **Inter Font**: Google Fonts

---

## 🎯 Design Principles Applied

1. ✅ **Clarity over cleverness**: Clean data presentation
2. ✅ **Whitespace is content**: Generous spacing for breathing room
3. ✅ **Consistency**: Unified component patterns and spacing
4. ✅ **Hierarchy**: Clear visual distinction between primary/secondary info
5. ✅ **Accessibility**: Color contrast ratios, focus states
6. ✅ **Performance**: Lightweight animations, optimized re-renders

---

## 📚 References

- Design inspiration: Bloomberg Terminal, Stripe Dashboard, Linear
- Color system: Tailwind CSS color palette (Blue, Green, Orange, Red)
- Typography: Inter font family (San Francisco alternative)

---

**Built for institutional investors. Designed for clarity. Engineered for performance.**
