'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

import {
  HomeIcon,
  CurrencyDollarIcon,
  BellIcon,
  ChartBarIcon,
  NewspaperIcon,
  BeakerIcon,
  BriefcaseIcon,
ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Markets Overview', href: '/dashboard', icon: HomeIcon, exact: true },
  { name: 'Stablecoins', href: '/dashboard/stablecoins', icon: CurrencyDollarIcon },
  { name: 'Liquidity Monitor', href: '/dashboard/liquidity', icon: BeakerIcon },
  { name: 'Alerts', href: '/dashboard/alerts', icon: BellIcon },
  { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
  { name: 'Market Updates', href: '/dashboard/updates', icon: NewspaperIcon },
  { name: 'My Portfolio', href: '/dashboard/portfolio', icon: BriefcaseIcon },
   { name: 'Capital Flows', href: '/dashboard/flows', icon: ArrowsRightLeftIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <aside className={clsx('w-64 bg-surface border-r border-border flex flex-col', className)}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-black font-bold text-lg shadow-soft">
            S
          </div>
          <span className="font-semibold text-lg text-textPrimary">StableWatch</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon; // ✅ IMPORTANT

          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-black shadow-sm'
                  : 'text-textSecondary hover:bg-surfaceHover hover:text-textPrimary'
              )}
            >
              {/* ✅ Render icon as component */}
              <Icon className="w-5 h-5 opacity-90" />

              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="px-3 py-2.5 rounded-lg bg-surfaceElevated text-xs text-textTertiary">
          <div className="font-medium text-textSecondary mb-1">System Status</div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>All systems operational</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
