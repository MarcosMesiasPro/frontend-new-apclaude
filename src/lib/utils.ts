import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScore(score: number | null) {
  if (!score) return 'N/A';
  return (score / 10).toFixed(1);
}

export function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export function formatFormat(format: string) {
  if (format === 'TV_SHORT') return 'TV Short';
  return format;
}

export function truncate(str: string, length: number) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

export function timeAgo(dateString: string) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
