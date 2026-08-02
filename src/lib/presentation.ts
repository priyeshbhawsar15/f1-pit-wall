import {
  EVENT_CODES,
  SESSION_TYPES,
  TEAM_COLORS,
  TEAM_NAMES,
  TRACK_FLAGS,
  TRACK_NAMES,
  VISUAL_TYRE_COMPOUNDS,
  WEATHER_TYPES,
} from '@/lib/constants';

export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(' ');
}

export function formatLapTime(ms?: number | null) {
  if (!ms || ms <= 0) return '—';
  const minutes = Math.floor(ms / 60_000);
  const seconds = ((ms % 60_000) / 1000).toFixed(3).padStart(6, '0');
  return `${minutes}:${seconds}`;
}

export function formatGap(ms?: number | null) {
  if (ms === null || ms === undefined || !Number.isFinite(ms)) return '—';
  if (ms === 0) return 'Leader';
  return `${ms > 0 ? '+' : '−'}${(Math.abs(ms) / 1000).toFixed(3)}`;
}

export function formatDate(value?: string | Date | null) {
  if (!value) return 'Date unknown';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Date unknown';
  return new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatTime(value?: string | Date | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function trackName(id?: number | null) {
  if (id === null || id === undefined) return 'Unknown circuit';
  return TRACK_NAMES[id] ?? `Circuit ${id}`;
}

export function trackFlag(id?: number | null) {
  if (id === null || id === undefined) return '◼';
  return TRACK_FLAGS[id] ?? '◼';
}

export function sessionName(id?: number | null) {
  if (id === null || id === undefined) return 'Session';
  return SESSION_TYPES[id] ?? `Session ${id}`;
}

export function weatherName(id?: number | null) {
  if (id === null || id === undefined) return 'Unknown';
  return WEATHER_TYPES[id] ?? `Weather ${id}`;
}

export function teamName(id?: number | null) {
  if (id === null || id === undefined) return 'Independent';
  return TEAM_NAMES[id] ?? `Team ${id}`;
}

export function teamColor(id?: number | null) {
  if (id === null || id === undefined) return '#94a3b8';
  return TEAM_COLORS[id] ?? '#94a3b8';
}

export function tyreInfo(id?: number | null) {
  if (id === null || id === undefined) return { name: 'Unknown', color: '#94a3b8' };
  return VISUAL_TYRE_COMPOUNDS[id] ?? { name: `C${id}`, color: '#94a3b8' };
}

export function eventName(code?: string | null) {
  if (!code) return 'Race event';
  return EVENT_CODES[code] ?? code;
}

export function initials(name?: string | null) {
  if (!name) return '—';
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export function describeError(error: unknown, fallback = 'Something went wrong') {
  return error instanceof Error ? error.message : fallback;
}
