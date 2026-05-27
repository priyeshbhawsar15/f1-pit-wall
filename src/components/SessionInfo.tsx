'use client';

import Link from 'next/link';
import { useTelemetryStore } from '@/stores/telemetryStore';
import { TRACK_NAMES, SESSION_TYPES, WEATHER_TYPES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cloud, Thermometer, Timer, MapPin, CircleDot, History, Users, Trophy, Calendar,
} from 'lucide-react';

export default function SessionInfo() {
  const session = useTelemetryStore((s) => s.session);
  const connected = useTelemetryStore((s) => s.connected);

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
      {/* Red accent bar — signature F1 broadcast element */}
      <div className="red-bar" />

      <header className="f1-header flex items-center gap-3 px-4 py-2.5 text-xs">
        {/* F1 Branding */}
        <motion.div
          className="flex items-center gap-2.5 mr-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <span className="f1-logo-text">F1</span>
          <span className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-[0.15em] uppercase"
                style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>
            Telemetry
          </span>
        </motion.div>

        <div className="divider-v" />

        {/* Connection status */}
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

        {/* Track + Session type */}
        <motion.div
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <MapPin size={12} className="text-[var(--f1-red)]" />
          <span className="font-semibold" style={{ fontFamily: "'F1', 'Arial Black', sans-serif", fontSize: '11px' }}>
            {trackName}
          </span>
          <span className="text-[var(--muted)] mx-0.5">|</span>
          <span className="text-[var(--muted-foreground)] text-[10px]">{sessionType}</span>
        </motion.div>

        <div className="divider-v" />

        {/* Weather + temps */}
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center gap-1">
            <Cloud size={11} className="text-[var(--blue)]" />
            <span className="text-[var(--foreground-secondary)]">{weather}</span>
          </div>
          <div className="flex items-center gap-1 text-[var(--muted-foreground)]">
            <Thermometer size={11} className="text-[var(--orange)]" />
            <span className="font-mono text-[10px]">{session?.airTemperature ?? '--'}°</span>
            <span className="text-[8px] uppercase tracking-wider opacity-60">Air</span>
            <span className="font-mono text-[10px]">{session?.trackTemperature ?? '--'}°</span>
            <span className="text-[8px] uppercase tracking-wider opacity-60">Trk</span>
          </div>
        </motion.div>

        <div className="divider-v" />

        {/* Session timer */}
        <motion.div
          className="flex items-center gap-1.5"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <Timer size={11} className="text-[var(--muted-foreground)]" />
          <span className="font-mono font-bold text-sm tracking-tight">{timeLeft}</span>
          {session && session.totalLaps > 0 && (
            <span className="text-[var(--muted-foreground)] text-[10px]">/ {session.totalLaps}L</span>
          )}
        </motion.div>

        {/* Safety Car — animated entry */}
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

        {/* Spacer + nav links */}
        <div className="ml-auto flex items-center gap-3">
          <Link href="/sessions" className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <History size={11} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>History</span>
          </Link>
          <Link href="/players" className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <Users size={11} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Players</span>
          </Link>
          <Link href="/standings" className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <Trophy size={11} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Standings</span>
          </Link>
          <Link href="/seasons" className="flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
            <Calendar size={11} />
            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'F1', 'Arial Black', sans-serif" }}>Seasons</span>
          </Link>
        </div>
      </header>
    </div>
  );
}
