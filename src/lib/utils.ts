import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLapTime(ms: number): string {
  if (ms === 0) return '--:--.---';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${millis.toString().padStart(3, '0')}`;
}

export function formatDelta(ms: number): string {
  if (ms === 0) return '---.---';
  const sign = ms >= 0 ? '+' : '-';
  const abs = Math.abs(ms);
  const seconds = Math.floor(abs / 1000);
  const millis = abs % 1000;
  return `${sign}${seconds}.${millis.toString().padStart(3, '0')}`;
}

export function formatGap(ms: number): string {
  if (ms === 0) return '---';
  const seconds = (ms / 1000).toFixed(3);
  return `+${seconds}`;
}
