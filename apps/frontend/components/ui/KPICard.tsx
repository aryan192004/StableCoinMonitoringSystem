import React from 'react';
import { Card } from './Card';
import clsx from 'clsx';

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  loading?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  icon,
  trend = 'neutral',
  subtitle,
  loading = false,
}) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-danger',
    neutral: 'text-textSecondary',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card hover className="animate-slide-up">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-textSecondary mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          ) : (
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-semibold text-textPrimary animate-count-up">
                {value}
              </h3>
              {change !== undefined && (
                <span className={clsx('text-sm font-medium flex items-center gap-0.5', trendColors[trend])}>
                  <span>{trendIcons[trend]}</span>
                  <span>{Math.abs(change)}%</span>
                </span>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-textTertiary mt-1">{subtitle}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};
