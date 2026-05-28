'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { TRACK_NAMES, SESSION_TYPES, WEATHER_TYPES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
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
        {/* Main row: branding + session info + nav */}
        <div className="flex items-center gap-5 px-6 py-3">
          <motion.div
            className="flex items-center gap-2.5 mr-1 flex-shrink-0"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg"
              alt="F1"
              style={{ height: 20, width: 'auto', filter: 'brightness(0) invert(1)' }}
            />
            <span className="text-[11px] font-bold text-[var(--muted)] tracking-[0.2em] uppercase" style={FONT_UI}>
              TELEMETRY
            </span>
          </motion.div>

          <div className="divider-v" />

          <motion.div
            className={connected ? 'pill pill-live' : 'pill pill-offline'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            key={connected ? 'live' : 'offline'}
          >
            {connected && <span className="live-dot" />}
            {connected ? 'LIVE' : 'OFFLINE'}
          </motion.div>

          <div className="divider-v" />

          <motion.div
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <MapPin size={12} className="text-[var(--m-blue-dark)]" />
            <span className="font-semibold" style={{ fontFamily: "var(--font-ui)", fontSize: '13px' }}>
              {trackName}
            </span>
            <span className="text-[var(--hairline)] mx-1">|</span>
            <span className="text-[var(--muted)] text-[12px] tracking-wider uppercase">{sessionType}</span>
          </motion.div>

          <div className="divider-v" />

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <div className="flex items-center gap-1">
              <Cloud size={11} className="text-[var(--m-blue-dark)]" />
              <span className="text-[var(--foreground-secondary)]">{weather}</span>
            </div>
            <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
              <Thermometer size={11} className="text-[var(--orange)]" />
              <span className="font-mono text-[12px]">{session?.airTemperature ?? '--'}°</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] ml-0.5">Air</span>
              <span className="font-mono text-[12px] ml-2">{session?.trackTemperature ?? '--'}°</span>
              <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] ml-0.5">Trk</span>
            </div>
          </motion.div>

          <div className="divider-v" />

          <motion.div
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Timer size={11} className="text-[var(--muted-foreground)]" />
            <span className="font-mono font-bold text-[16px] tracking-tight tabular-nums">{timeLeft}</span>
            {session && session.totalLaps > 0 && (
              <span className="text-[var(--muted)] text-[12px] tracking-wide">/ {session.totalLaps} LAPS</span>
            )}
          </motion.div>

          <AnimatePresence>
            {safetyCarLabel && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: -8 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: -8 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="flex items-center gap-2"
              >
                <div className="divider-v" />
                <div className={`pill ${safetyCarLabel === 'Virtual SC' ? 'pill-vsc' : 'pill-sc'}`}>
                  <CircleDot size={9} />
                  {safetyCarLabel.toUpperCase()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Nav links */}
          <nav className="flex items-center gap-1 ml-auto">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors ${
                    isActive
                      ? 'text-[var(--foreground)] border-b-2 border-[var(--foreground)]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
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

        {/* Dashboard view tab row */}
        <div className="border-t border-[var(--hairline)] px-6 flex items-center gap-1">
          {dashTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-bold uppercase tracking-[1.5px] transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? 'text-[var(--foreground)] border-[var(--m-red)]'
                    : 'text-[var(--muted)] border-transparent hover:text-[var(--foreground)]'
                }`}
                style={FONT_UI}
              >
                <Icon size={11} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </header>
    </div>
  );
}
