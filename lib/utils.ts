import clsx, { type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function getNextSunday(): string {
  const today = new Date();
  const day = today.getDay();
  const daysUntilSunday = day === 0 ? 7 : 7 - day;
  const nextSunday = new Date(today);
  nextSunday.setDate(today.getDate() + daysUntilSunday);
  return nextSunday.toISOString().split('T')[0];
}

export function sanitizePlayerName(name: string): string {
  // Remove dangerous characters and extra spaces
  return name
    .replace(/[<>{}[\]\\|`]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function generateShareMessage(
  date: string,
  feeAmount: number,
  feeBreakdown: any,
  matchLink: string
): string {
  let message = `Cricket Match - ${formatDate(date)}\n\n`;

  if (feeBreakdown?.is_detailed && feeBreakdown.items?.length > 0) {
    // Detailed breakdown
    feeBreakdown.items.forEach((item: any) => {
      message += `${item.title}: ${formatCurrency(item.amount)}\n`;
    });
    message += `\nMatch fee per head: ${formatCurrency(feeAmount)}\n`;
  } else {
    // Simple amount
    message += `Match fee per head: ${formatCurrency(feeAmount)}\n`;
  }

  message += `\nJoin and pay here:\n${matchLink}`;

  return message;
}
