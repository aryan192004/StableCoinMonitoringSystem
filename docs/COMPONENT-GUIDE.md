# Component Usage Guide

This guide provides practical examples of using each UI component in the design system.

---

## 🔘 Button Component

### Import
```tsx
import { Button } from '@/components/ui';
```

### Variants
```tsx
// Primary (default)
<Button variant="primary">Primary Action</Button>

// Secondary
<Button variant="secondary">Secondary Action</Button>

// Outline
<Button variant="outline">Outline Button</Button>

// Ghost (minimal)
<Button variant="ghost">Ghost Button</Button>

// Danger (destructive actions)
<Button variant="danger">Delete</Button>
```

### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

### States
```tsx
// Loading state
<Button loading>Loading...</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With icon
<Button icon={<span>📊</span>}>View Dashboard</Button>
```

### Real-world Examples
```tsx
// CTA button
<Link href="/dashboard">
  <Button variant="primary" size="lg">
    View Dashboard
  </Button>
</Link>

// Form submit
<Button 
  variant="primary" 
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Changes
</Button>

// Action buttons group
<div className="flex items-center gap-3">
  <Button variant="outline">Cancel</Button>
  <Button variant="primary">Confirm</Button>
</div>
```

---

## 🃏 Card Component

### Import
```tsx
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui';
```

### Basic Usage
```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardBody>
    <p>Card content goes here</p>
  </CardBody>
</Card>
```

### With Actions
```tsx
<Card>
  <CardHeader 
    action={
      <Button variant="ghost" size="sm">View All</Button>
    }
  >
    <CardTitle>Recent Alerts</CardTitle>
  </CardHeader>
  <CardBody>
    {/* Content */}
  </CardBody>
</Card>
```

### Hover Effect
```tsx
<Card hover onClick={() => navigate('/detail')}>
  <CardBody>
    <h3>Clickable Card</h3>
    <p>This card has hover elevation effect</p>
  </CardBody>
</Card>
```

### Custom Padding
```tsx
<Card padding="none">
  {/* No padding - good for tables */}
</Card>

<Card padding="lg">
  {/* Large padding - good for hero sections */}
</Card>
```

### Real-world Examples
```tsx
// Stat card
<Card>
  <CardBody>
    <div className="space-y-2">
      <p className="text-sm text-textSecondary">Total Value Locked</p>
      <h2 className="text-3xl font-semibold">$150.2B</h2>
      <p className="text-sm text-success">+2.4% from yesterday</p>
    </div>
  </CardBody>
</Card>

// List card
<Card>
  <CardHeader>
    <CardTitle>Stablecoins</CardTitle>
    <Button variant="ghost" size="sm">See All</Button>
  </CardHeader>
  <CardBody>
    <ul className="space-y-2">
      {coins.map(coin => <li key={coin.id}>{coin.name}</li>)}
    </ul>
  </CardBody>
</Card>
```

---

## 🏷️ Badge Component

### Import
```tsx
import { Badge, RiskBadge } from '@/components/ui';
```

### Variants
```tsx
<Badge variant="success">Stable</Badge>
<Badge variant="warning">Watch</Badge>
<Badge variant="danger">High Risk</Badge>
<Badge variant="neutral">Pending</Badge>
```

### Sizes
```tsx
<Badge size="sm">Small</Badge>
<Badge size="md">Medium (default)</Badge>
```

### Risk Badge (Auto-color)
```tsx
// Automatically assigns color based on score
<RiskBadge score={0.15} /> // Green "Stable"
<RiskBadge score={0.45} /> // Orange "Watch"
<RiskBadge score={0.85} /> // Red "High Risk"
```

### Real-world Examples
```tsx
// Status indicator
<div className="flex items-center gap-2">
  <h3>Tether (USDT)</h3>
  <Badge variant="success">Active</Badge>
</div>

// Alert severity
<div className="flex items-center gap-2">
  <span>Critical price deviation</span>
  <Badge variant="danger">High</Badge>
</div>

// Risk score display
<div className="flex items-center gap-2">
  <span className="text-textPrimary font-medium">0.32</span>
  <RiskBadge score={0.32} />
</div>
```

---

## 📊 KPICard Component

### Import
```tsx
import { KPICard } from '@/components/ui';
```

### Basic Usage
```tsx
<KPICard
  title="Total Market Cap"
  value="$150.2B"
/>
```

### With Trend
```tsx
<KPICard
  title="Average Risk Score"
  value="0.24"
  change={-3.2}
  trend="down"
  subtitle="Lower is better"
/>
```

### With Icon
```tsx
<KPICard
  title="Active Stablecoins"
  value="15"
  icon={<span className="text-2xl">🪙</span>}
  subtitle="Being monitored"
/>
```

### All Options
```tsx
<KPICard
  title="Liquidity Depth"
  value="$8.4B"
  change={1.8}
  trend="up"
  icon={<span className="text-2xl">💧</span>}
  subtitle="Combined order books"
  loading={false}
/>
```

### Trend Options
- `trend="up"` - Green upward arrow
- `trend="down"` - Red downward arrow
- `trend="neutral"` - Gray horizontal arrow

### Real-world Examples
```tsx
// Dashboard KPI grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard
    title="Total Market Cap"
    value="$150.2B"
    change={2.4}
    trend="up"
    icon={<span className="text-2xl">💰</span>}
  />
  <KPICard
    title="Average Risk Score"
    value="0.24"
    change={-3.2}
    trend="down"
    icon={<span className="text-2xl">📊</span>}
    subtitle="Lower is better"
  />
  <KPICard
    title="Active Stablecoins"
    value="15"
    trend="neutral"
    icon={<span className="text-2xl">🪙</span>}
  />
</div>
```

---

## 📋 Table Component

### Import
```tsx
import { 
  Table, 
  TableHead, 
  TableBody, 
  TableRow, 
  TableHeader, 
  TableCell 
} from '@/components/ui';
```

### Basic Usage
```tsx
<Table>
  <TableHead>
    <TableRow hover={false}>
      <TableHeader>Name</TableHeader>
      <TableHeader>Price</TableHeader>
      <TableHeader>Market Cap</TableHeader>
    </TableRow>
  </TableHead>
  <TableBody>
    <TableRow>
      <TableCell>USDT</TableCell>
      <TableCell>$1.0001</TableCell>
      <TableCell>$95.4B</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

### Sortable Headers
```tsx
<TableHeader sortable onClick={() => handleSort('name')}>
  Name
</TableHeader>
```

### Clickable Rows
```tsx
<TableRow onClick={() => navigate(`/detail/${id}`)}>
  <TableCell>{name}</TableCell>
</TableRow>
```

### Real-world Example
```tsx
<div className="bg-surface rounded-xl2 shadow-card">
  <div className="px-6 py-4 border-b border-border">
    <h3 className="font-semibold text-textPrimary">Stablecoin Rankings</h3>
  </div>
  <Table>
    <TableHead>
      <TableRow hover={false}>
        <TableHeader sortable>Name</TableHeader>
        <TableHeader sortable>Price</TableHeader>
        <TableHeader sortable>Market Cap</TableHeader>
        <TableHeader>Risk Score</TableHeader>
      </TableRow>
    </TableHead>
    <TableBody>
      {stablecoins.map((coin) => (
        <TableRow 
          key={coin.id} 
          onClick={() => navigate(`/detail/${coin.id}`)}
        >
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10">
                {coin.symbol.charAt(0)}
              </div>
              <div>
                <div className="font-medium">{coin.name}</div>
                <div className="text-xs text-textSecondary">{coin.symbol}</div>
              </div>
            </div>
          </TableCell>
          <TableCell className="font-medium">{coin.price}</TableCell>
          <TableCell>{coin.marketCap}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <span>{coin.riskScore.toFixed(2)}</span>
              <RiskBadge score={coin.riskScore} />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</div>
```

---

## 🎨 Layout Components

### DashboardLayout
```tsx
import { DashboardLayout } from '@/components/layout';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <h1>Page Title</h1>
      <p>Page content goes here</p>
    </DashboardLayout>
  );
}
```

### Sidebar Navigation
The Sidebar component is automatically included in `DashboardLayout`. Navigation items:
- Markets Overview → `/dashboard`
- Stablecoins → `/dashboard/stablecoins`
- Liquidity Monitor → `/dashboard/liquidity`
- Alerts → `/dashboard/alerts`
- Analytics → `/dashboard/analytics`

### Navbar
The Navbar component is automatically included in `DashboardLayout` and includes:
- Search bar (left)
- Notification bell icon (center-right)
- Settings icon (center-right)
- User profile (right)

---

## 🎭 Common Patterns

### Grid Layouts
```tsx
// 4-column responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
  <KPICard {...} />
</div>

// 2-column layout
<div className="grid lg:grid-cols-2 gap-6">
  <Card>Left content</Card>
  <Card>Right content</Card>
</div>
```

### Page Header
```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="mb-2">Page Title</h1>
    <p className="text-textSecondary">Page description</p>
  </div>
  <div className="flex items-center gap-3">
    <Button variant="outline">Secondary Action</Button>
    <Button variant="primary">Primary Action</Button>
  </div>
</div>
```

### Loading State
```tsx
{loading ? (
  <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
) : (
  <h3>{value}</h3>
)}
```

### Empty State
```tsx
<Card>
  <CardBody>
    <div className="text-center py-12">
      <span className="text-4xl mb-4 block">📊</span>
      <h3 className="text-lg font-semibold text-textPrimary mb-2">
        No data available
      </h3>
      <p className="text-textSecondary mb-4">
        Start monitoring stablecoins to see analytics
      </p>
      <Button variant="primary">Get Started</Button>
    </div>
  </CardBody>
</Card>
```

---

## 🎨 Utility Classes

### Custom Classes (from globals.css)

```tsx
// Card style
<div className="card">{/* rounded-xl2 bg-surface shadow-card p-6 */}</div>

// Primary button
<button className="btn-primary">{/* Full button styling */}</button>

// Secondary button
<button className="btn-secondary">{/* Full button styling */}</button>

// Badge variants
<span className="badge-success">{/* Green badge */}</span>
<span className="badge-warning">{/* Orange badge */}</span>
<span className="badge-danger">{/* Red badge */}</span>
<span className="badge-neutral">{/* Gray badge */}</span>
```

### Animation Classes

```tsx
// Fade in on mount
<div className="animate-fade-in">{/* 0.3s opacity fade */}</div>

// Slide up on mount
<div className="animate-slide-up">{/* translateY + opacity */}</div>

// Count up animation
<div className="animate-count-up">{/* For numbers */}</div>
```

---

## 📱 Responsive Design

### Breakpoints
```tsx
// Mobile-first approach
<div className="
  grid 
  grid-cols-1          /* Mobile: 1 column */
  md:grid-cols-2       /* Tablet: 2 columns */
  lg:grid-cols-4       /* Desktop: 4 columns */
  gap-6
">
  {/* Content */}
</div>
```

### Hide/Show at Breakpoints
```tsx
// Hide on mobile, show on desktop
<div className="hidden lg:block">{/* Desktop only */}</div>

// Show on mobile, hide on desktop
<div className="lg:hidden">{/* Mobile only */}</div>
```

---

## 🎯 Best Practices

1. **Use Composable Components**
   ```tsx
   // Good: Composable
   <Card>
     <CardHeader><CardTitle>Title</CardTitle></CardHeader>
     <CardBody>Content</CardBody>
   </Card>
   
   // Avoid: Monolithic
   <Card title="Title" body="Content" />
   ```

2. **Consistent Spacing**
   ```tsx
   // Use design system spacing
   <div className="space-y-6">{/* 24px vertical spacing */}</div>
   <div className="gap-4">{/* 16px gap in flex/grid */}</div>
   ```

3. **Color Usage**
   ```tsx
   // Use semantic colors
   <span className="text-success">{/* Green for positive */}</span>
   <span className="text-danger">{/* Red for negative */}</span>
   <span className="text-textSecondary">{/* Gray for secondary */}</span>
   ```

4. **Loading States**
   ```tsx
   // Always handle loading
   <KPICard loading={isLoading} {...props} />
   ```

5. **Accessibility**
   ```tsx
   // Add proper ARIA labels
   <button aria-label="Close modal" onClick={close}>×</button>
   ```

---

## 🔗 Quick Reference

### Component Checklist
- ✅ Button - 5 variants, 3 sizes
- ✅ Card - Composable with subcomponents
- ✅ Badge - 4 variants, auto-coloring
- ✅ Table - Full composition support
- ✅ KPICard - With trends and icons
- ✅ DashboardLayout - With Sidebar + Navbar

### Import Paths
```tsx
import { Button, Card, Badge, KPICard, Table } from '@/components/ui';
import { DashboardLayout } from '@/components/layout';
```

### Color Variables
```
primary: #3B82F6
success: #22C55E
warning: #F59E0B
danger: #EF4444
```

---

For more details, see [UI Design System](./UI-DESIGN-SYSTEM.md)
