import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Parse "dd/mm/yyyy" to JS Date
export function parseVnDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.trim().split('/');
  if (parts.length !== 3) return null;
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
}

// Format Date to "dd/mm/yyyy"
export function formatVnDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

// Calculate days remaining between expiry and today (or custom today)
export function getDaysRemaining(expiryStr: string | undefined, todayStr?: string): number | null {
  if (!expiryStr) return null;
  const expiryDate = parseVnDate(expiryStr);
  if (!expiryDate) return null;
  
  let baseDate = new Date();
  if (todayStr) {
    const customToday = parseVnDate(todayStr);
    if (customToday) baseDate = customToday;
  }
  
  // Set time components to 0 for exact day diff
  expiryDate.setHours(0, 0, 0, 0);
  baseDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - baseDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
