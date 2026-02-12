import React from 'react';
import clsx from 'clsx';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className,
}) => {
  const variantStyles = {
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger: 'bg-danger/10 text-danger',
    neutral: 'bg-gray-100 text-textSecondary',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const RiskBadge: React.FC<{ score: number }> = ({ score }) => {
  const getRiskVariant = () => {
    if (score < 0.3) return 'success';
    if (score < 0.7) return 'warning';
    return 'danger';
  };

  const getRiskLabel = () => {
    if (score < 0.3) return 'Stable';
    if (score < 0.7) return 'Watch';
    return 'High Risk';
  };

  return (
    <Badge variant={getRiskVariant()}>
      {getRiskLabel()}
    </Badge>
  );
};
