'use client';

import React from 'react';
import clsx from 'clsx';

export const Table: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className="overflow-x-auto">
    <table className={clsx('w-full', className)}>
      {children}
    </table>
  </div>
);

export const TableHead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-gray-50 border-b border-border">
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-border">
    {children}
  </tbody>
);

export const TableRow: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void;
  hover?: boolean;
}> = ({ children, onClick, hover = true }) => (
  <tr
    onClick={onClick}
    className={clsx(
      'transition-colors',
      hover && 'hover:bg-gray-50',
      onClick && 'cursor-pointer'
    )}
  >
    {children}
  </tr>
);

export const TableHeader: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  sortable?: boolean;
}> = ({ children, className, sortable }) => (
  <th
    className={clsx(
      'px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider',
      sortable && 'cursor-pointer hover:text-textPrimary',
      className
    )}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className }) => (
  <td className={clsx('px-6 py-4 text-sm text-textPrimary', className)}>
    {children}
  </td>
);
