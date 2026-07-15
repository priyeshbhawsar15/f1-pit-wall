'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { TRACK_NAMES, SESSION_TYPES, WEATHER_TYPES } from '@/lib/constants';
import {
  Cloud, Thermometer, Timer, MapPin, CircleDot,
  Radio, History, Users, Trophy, Calendar,
  BarChart3, Settings2,
} from 'lucide-react';

const FONT_UI = { fontFamily: "var(--font-ui)" };

const navLinks = [
  { href: '/', label: 'Live', icon: Radio },
  { href: '/sessions', label: 'History', icon: History },
  { href: '/players', label: 'Players', icon: Users },
  { href: '/standings', label: 'Standings', icon: Trophy },
  { href: '/seasons', label: 'Seasons', icon: Calendar },
];

const dashTabs = [
  { key: 'live' as const, label: 'Live', icon: Radio },
  { key: 'charts' as const, label: 'Charts', icon: BarChart3 },
  { key: 'setup' as const, label: 'Setup', icon: Settings2 },
];

export default function SessionInfo() {
  const pathname = usePathname();
  const session = useTelemetryStore((s) => s.session);
  const connected = useTelemetryStore((s) => s.connected);
  const activeTab = useTelemetryStore((s) => s.activeTab);
  const setActiveTab = useTelemetryStore((s) => s.setActiveTab);

  const trackName = session ? (TRACK_NAMES[session.trackId] || 'Unknown') : '---';
  const sessionType = session ? (SESSION_TYPES[session.sessionType] || '---') : '---';
  const weather = session ? (WEATHER_TYPES[session.weather] || '---') : '---';

  const timeLeft = session
    ? `${Math.floor(session.sessionTimeLeft / 60)}:${(session.sessionTimeLeft % 60).toString().padStart(2, '0')}`
    : '--:--';

  const safetyCarLabel = session
    ? ['', 'Safety Car', 'Virtual SC', 'Formation Lap'][session.safetyCarStatus] || ''
    : '';

  return (
    <div>
      <div className="red-bar" />
      <header className="f1-header text-xs">
        <div className="flex min-h-14 flex-wrap items-center gap-x-5 gap-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5 flex-shrink-0">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
              alt="F1"
              style={{ height: 20, width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-[11px] font-bold text-[var(--muted)] tracking-[0.12em] uppercase" style={FONT_UI}>
              Race telemetry
            </span>
          </div>

          <div
            className={connected ? 'pill pill-live' : 'pill pill-offline'}
          >
            {connected && <span className="live-dot" />}
            {connected ? 'LIVE' : 'OFFLINE'}
          </div>

          <div className="flex min-w-0 items-center gap-1.5">
            <MapPin size={12} className="text-[var(--m-blue-dark)]" />
            <span className="truncate font-semibold" style={{ fontFamily: "var(--font-ui)", fontSize: '13px' }}>
              {trackName}
            </span>
            <span className="text-[var(--muted)]">·</span>
            <span className="text-[var(--muted)] text-[12px]">{sessionType}</span>
            {session?.is2026 === true && (
              <span className="pill text-[10px] bg-[var(--m-red)]/15 text-[#ff6257]" style={FONT_UI}>
                F1 26
              </span>
            )}
          </div>

          {safetyCarLabel && (
            <div className={`pill ${safetyCarLabel === 'Virtual SC' ? 'pill-vsc' : 'pill-sc'}`}>
              <CircleDot size={9} />
              {safetyCarLabel}
            </div>
          )}

          <nav className="order-last flex w-full items-center gap-1 overflow-x-auto lg:order-none lg:ml-auto lg:w-auto" aria-label="Primary navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold transition-colors ${
                    isActive
                      ? 'bg-[var(--surface-elevated)] text-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--foreground)]'
                  }`}
                  style={FONT_UI}
                >
                  <Icon size={12} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto border-t border-[var(--hairline-strong)] px-4 sm:px-6">
          <div className="flex items-center gap-1">
            {dashTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-[11px] font-semibold transition-colors ${
                    activeTab === tab.key
                      ? 'border-[var(--m-red)] text-[var(--foreground)]'
                      : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                  style={FONT_UI}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-5 text-[11px] text-[var(--muted-foreground)] md:flex">
            <span className="flex items-center gap-1.5"><Cloud size={12} />{weather}</span>
            <span className="flex items-center gap-1.5"><Thermometer size={12} />{session?.airTemperature ?? '--'}° air · {session?.trackTemperature ?? '--'}° track</span>
            <span className="flex items-center gap-1.5"><Timer size={12} /><strong className="font-mono text-sm text-[var(--foreground)]">{timeLeft}</strong>{session && session.totalLaps > 0 ? ` · ${session.totalLaps} laps` : ''}</span>
          </div>
        </div>
      </header>
    </div>
  );
}
