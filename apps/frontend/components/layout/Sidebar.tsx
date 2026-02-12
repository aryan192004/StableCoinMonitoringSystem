'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: 'Markets Overview', href: '/dashboard', icon: '📊' },
  { name: 'Stablecoins', href: '/dashboard/stablecoins', icon: '💰' },
  { name: 'Liquidity Monitor', href: '/dashboard/liquidity', icon: '💧' },
  { name: 'Alerts', href: '/dashboard/alerts', icon: '🔔' },
  { name: 'Analytics', href: '/dashboard/analytics', icon: '📈' },
];

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <aside className={clsx('w-64 bg-surface border-r border-border flex flex-col', className)}>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-bold text-lg shadow-soft">
            S
          </div>
          <span className="font-semibold text-lg text-textPrimary">StableWatch</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-textSecondary hover:bg-gray-100 hover:text-textPrimary'
              )}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="px-3 py-2.5 rounded-lg bg-gray-50 text-xs text-textTertiary">
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
