import { format, formatDistance, formatRelative, isValid } from 'date-fns';

/**
 * Format date to ISO string
 */
export function formatDateISO(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) throw new Error('Invalid date');
  return d.toISOString();
}

/**
 * Format date for display
 */
export function formatDateDisplay(date: Date | string | number, formatStr: string = 'PPpp'): string {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return format(d, formatStr);
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid date';
  return formatDistance(d, new Date(), { addSuffix: true });
}

/**
 * Get time ago in short format
 */
export function getTimeAgo(date: Date | string | number): string {
  const d = new Date(date);
  if (!isValid(d)) return 'Invalid';
  
  const seconds = Math.floor((new Date().getTime() - d.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
