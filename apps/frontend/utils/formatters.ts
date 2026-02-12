/**
 * Format number as currency with specified decimal places
 */
export function formatCurrency(value: number, decimals: number = 2): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Format percentage with + or - sign
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Format peg deviation with color coding
 */
export function formatPegDeviation(deviation: number): {
  text: string;
  color: string;
} {
  const absDeviation = Math.abs(deviation);
  let color = 'text-green-500';
  
  if (absDeviation > 0.5) {
    color = 'text-red-500';
  } else if (absDeviation > 0.2) {
    color = 'text-yellow-500';
  }
  
  return {
    text: formatPercentage(deviation, 3),
    color,
  };
}

/**
 * Calculate risk level based on score
 */
export function getRiskLevel(score: number): {
  level: 'low' | 'medium' | 'high';
  color: string;
  bgColor: string;
} {
  if (score < 0.3) {
    return {
      level: 'low',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    };
  } else if (score < 0.7) {
    return {
      level: 'medium',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  } else {
    return {
      level: 'high',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  }
}
