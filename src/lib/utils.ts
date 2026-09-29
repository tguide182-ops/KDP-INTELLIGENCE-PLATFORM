import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatCompactNumber(num: number): string {
  if (num === undefined || num === null) return '0';
  return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
}

export function formatBSR(bsr: number): string {
  if (!bsr) return 'N/A';
  return `#${formatNumber(bsr)}`;
}

export function formatCurrency(amount: number, symbol: string = '$'): string {
  if (amount === undefined || amount === null) return `${symbol}0.00`;
  return `${symbol}${amount.toFixed(2)}`;
}

export function getOpportunityColor(score: number): {
  bg: string;
  text: string;
  border: string;
  badge: string;
  label: string;
} {
  if (score >= 7.5) {
    return {
      bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
      text: 'text-emerald-700 dark:text-emerald-400',
      border: 'border-emerald-500/30',
      badge: 'bg-emerald-500 text-white',
      label: 'Strong Opportunity',
    };
  } else if (score >= 5.5) {
    return {
      bg: 'bg-amber-500/10 dark:bg-amber-500/15',
      text: 'text-amber-700 dark:text-amber-400',
      border: 'border-amber-500/30',
      badge: 'bg-amber-500 text-white',
      label: 'Moderate Potential',
    };
  } else {
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/15',
      text: 'text-rose-700 dark:text-rose-400',
      border: 'border-rose-500/30',
      badge: 'bg-rose-500 text-white',
      label: 'Competitive / Low Demand',
    };
  }
}
