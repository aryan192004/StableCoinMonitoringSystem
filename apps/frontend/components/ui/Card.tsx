'use client';

import React from 'react';
import clsx from 'clsx';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={clsx(
        'bg-surface rounded-xl2 shadow-card',
        hover && 'transition-all duration-200 hover:shadow-cardHover cursor-pointer',
        paddingStyles[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  action?: React.ReactNode;
}> = ({
  children,
  className,
  action,
}) => (
  <div className={clsx('flex items-center justify-between mb-4 pb-3 border-b border-border', className)}>
    <div>{children}</div>
    {action && <div>{action}</div>}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <h3 className={clsx('text-lg font-semibold text-textPrimary', className)}>
    {children}
  </h3>
);

export const CardBody: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx(className)}>
    {children}
  </div>
);
