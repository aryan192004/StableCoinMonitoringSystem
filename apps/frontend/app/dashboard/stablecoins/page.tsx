'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout';

export default function StablecoinsPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to USDT detail page by default
    router.push('/dashboard/stablecoins/usdt');
  }, [router]);

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-textSecondary">Loading stablecoin data...</div>
      </div>
    </DashboardLayout>
  );
}
