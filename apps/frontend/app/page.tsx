import Link from 'next/link';
import { Button } from '@/components/ui';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  ExclamationTriangleIcon, 
  FireIcon,
  LightBulbIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CubeIcon,
  RocketLaunchIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Heading + CTAs */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <ChartBarIcon className="w-4 h-4" />
                Real-time monitoring
              </div>
              <h1 className="text-5xl font-bold text-textPrimary leading-tight">
                Institutional-Grade
                <br />
                <span className="text-primary">Stablecoin Intelligence</span>
              </h1>
              <p className="text-xl text-textSecondary leading-relaxed">
                Monitor risk, liquidity, and market dynamics across all major stablecoins. 
                Professional analytics for institutional investors.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="primary" size="lg">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/request-demo">
                <Button variant="primary" size="lg">
                 Request Demo
                </Button>
                </Link>

              </div>
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CurrencyDollarIcon className="w-8 h-8 text-primary" />
                    <div className="text-3xl font-bold text-textPrimary">$150B+</div>
                  </div>
                  <div className="text-sm text-textSecondary">Total Value Monitored</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ClockIcon className="w-8 h-8 text-primary" />
                    <div className="text-3xl font-bold text-textPrimary">24/7</div>
                  </div>
                  <div className="text-sm text-textSecondary">Real-time Tracking</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CubeIcon className="w-8 h-8 text-primary" />
                    <div className="text-3xl font-bold text-textPrimary">15+</div>
                  </div>
                  <div className="text-sm text-textSecondary">Stablecoins Covered</div>
                </div>
              </div>
            </div>

            {/* Right: Dashboard mockup */}
            <div className="relative animate-slide-up">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-3xl" />
              <div className="relative bg-surface rounded-xl2 shadow-card border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="space-y-4">
                  {/* Mock KPI cards */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Total Market Cap', value: '$150.2B', trend: '+2.4%' },
                      { label: 'Avg Risk Score', value: '0.24', trend: '-0.03' },
                    ].map((kpi, i) => (
                      <div key={i} className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-textSecondary mb-1">{kpi.label}</div>
                        <div className="text-lg font-semibold text-textPrimary">{kpi.value}</div>
                        <div className="text-xs text-success">{kpi.trend}</div>
                      </div>
                    ))}
                  </div>
                  {/* Mock chart */}
                  <div className="bg-gray-50 rounded-lg p-4 h-32 flex items-end gap-1">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-primary/30 rounded-t"
                        style={{ height: `${Math.random() * 100}%` }}
                      />
                    ))}
                  </div>
                  {/* Mock table */}
                  <div className="space-y-2">
                    {['USDT', 'USDC', 'DAI'].map((coin, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/20" />
                          <span className="text-sm font-medium">{coin}</span>
                        </div>
                        <div className="text-sm text-success">$1.00</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-textPrimary mb-8">Professional Risk Signals</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { color: 'bg-success', label: 'Stable', desc: 'Low risk indicators', icon: ShieldCheckIcon },
            { color: 'bg-warning', label: 'Watch', desc: 'Elevated monitoring', icon: ExclamationTriangleIcon },
            { color: 'bg-danger', label: 'High Risk', desc: 'Critical attention', icon: FireIcon },
            { color: 'bg-primary', label: 'Insight', desc: 'Key metrics', icon: LightBulbIcon },
          ].map((item, i) => (
            <div key={i} className="bg-surface rounded-xl2 shadow-card p-6 hover:shadow-cardHover transition-shadow">
              <div className={`w-12 h-12 ${item.color} rounded-lg mb-4 flex items-center justify-center`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-textPrimary mb-2">{item.label}</h3>
              <p className="text-sm text-textSecondary">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Typography Showcase */}
      <section className="bg-gray-50 border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-textPrimary mb-8">Clean, Readable Data</h2>
          <div className="bg-surface rounded-xl2 shadow-card p-8 space-y-6">
            <div>
              <h1 className="mb-2">Main Dashboard Heading</h1>
              <p className="text-textSecondary">Primary typography optimized for data readability</p>
            </div>
            <div>
              <h2 className="mb-2">Section Metrics Overview</h2>
              <p className="text-textSecondary">Secondary headings for component organization</p>
            </div>
            <div>
              <h3 className="mb-2">Individual Metric Cards</h3>
              <p className="text-textSecondary">Tertiary headings for granular data points</p>
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div>
                <div className="text-3xl font-semibold text-textPrimary mb-1">$150.2B</div>
                <div className="text-sm text-textSecondary">Large numbers with Inter font</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-success mb-1">0.24</div>
                <div className="text-sm text-textSecondary">Risk scores with color coding</div>
              </div>
              <div>
                <div className="text-3xl font-semibold text-primary mb-1">99.8%</div>
                <div className="text-sm text-textSecondary">Percentage metrics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-2xl shadow-soft p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Start Monitoring Today</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join institutional investors using StableWatch for comprehensive stablecoin intelligence.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="secondary" size="lg">
                <RocketLaunchIcon className="w-5 h-5 mr-2 inline" />
                View Live Dashboard
              </Button>
            </Link>
            <Link href="/contact-sales">
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
              <ArrowTrendingUpIcon className="w-5 h-5 mr-2 inline" />
              Contact Sales
            </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
