'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { TRACK_NAMES, SESSION_TYPES, WEATHER_TYPES, TEAM_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  Calendar, MapPin, Cloud, Users, ChevronRight, Radio,
  Trophy, Flag, BarChart3, Clock,
} from 'lucide-react';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

interface SessionRow {
  id: string;
  sessionUID: string;
  trackId: number;
  sessionType: number;
  weather: number;
  totalLaps: number;
  trackLength: number;
  airTemperature: number;
  trackTemperature: number;
  createdAt: string;
  participants: { name: string; teamId: number; carIndex: number }[];
  _count: { events: number; finalClassifications: number };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/sessions')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setSessions(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const uniqueTracks = new Set(sessions.map((s) => s.trackId));
    const totalDrivers = new Set(sessions.flatMap((s) => s.participants.map((p) => p.name)));
    const totalEvents = sessions.reduce((sum, s) => sum + (s._count?.events || 0), 0);
    const totalLaps = sessions.reduce((sum, s) => sum + (s.totalLaps || 0), 0);
    return {
      sessions: sessions.length,
      tracks: uniqueTracks.size,
      drivers: totalDrivers.size,
      events: totalEvents,
      laps: totalLaps,
    };
  }, [sessions]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="red-bar" />
      <header className="f1-header flex items-center gap-3 px-6 py-3">
        <span className="f1-logo-text">F1</span>
        <span className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-[0.15em] uppercase" style={F1_FONT}>
          History
        </span>
        <div className="ml-auto">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <Radio size={12} />
            Live Dashboard
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Analytics summary */}
        {!loading && sessions.length > 0 && (
          <div className="grid grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Sessions', value: stats.sessions, icon: <Flag size={14} className="text-[var(--f1-red)]" /> },
              { label: 'Tracks', value: stats.tracks, icon: <MapPin size={14} className="text-[var(--blue)]" /> },
              { label: 'Drivers', value: stats.drivers, icon: <Users size={14} className="text-[var(--green)]" /> },
              { label: 'Total Laps', value: stats.laps, icon: <BarChart3 size={14} className="text-[var(--yellow)]" /> },
              { label: 'Events', value: stats.events, icon: <Trophy size={14} className="text-[var(--purple)]" /> },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                className="card p-4"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {stat.icon}
                  <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>
                    {stat.label}
                  </span>
                </div>
                <span className="text-2xl font-bold font-mono">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Session list */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-[var(--muted-foreground)]">Loading sessions...</span>
          </div>
        ) : sessions.length === 0 ? (
          <div className="card p-12 text-center">
            <Flag size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No sessions yet</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Start an F1 25 session with UDP telemetry enabled to begin recording data.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}?uid=${s.sessionUID}`}
                className="card block p-4 hover:border-[var(--accent)] transition-all group"
              >
                <div className="flex items-center gap-4">
                  {/* Session type badge */}
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-black text-[var(--accent)]">
                      {SESSION_TYPES[s.sessionType]?.replace('Short ', '') || '?'}
                    </span>
                  </div>

                  {/* Main info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {TRACK_NAMES[s.trackId] || `Track ${s.trackId}`}
                      </span>
                      <span className="text-xs text-[var(--muted-foreground)]">
                        {SESSION_TYPES[s.sessionType] || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[var(--muted-foreground)]">
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(s.createdAt).toLocaleDateString(undefined, {
                          weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Cloud size={10} />
                        {WEATHER_TYPES[s.weather] || '---'} · {s.airTemperature}°C
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {s.participants.length}
                      </span>
                      {s.totalLaps > 0 && (
                        <span>{s.totalLaps} laps</span>
                      )}
                      {s._count?.events > 0 && (
                        <span>{s._count.events} events</span>
                      )}
                    </div>
                  </div>

                  {/* Driver team dots */}
                  <div className="flex -space-x-1 flex-shrink-0">
                    {s.participants.slice(0, 8).map((p, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full ring-1 ring-[var(--card)]"
                        style={{ backgroundColor: TEAM_COLORS[p.teamId] || '#666' }}
                      />
                    ))}
                    {s.participants.length > 8 && (
                      <div className="w-3 h-3 rounded-full bg-[var(--muted)] ring-1 ring-[var(--card)] flex items-center justify-center">
                        <span className="text-[6px] text-white">+</span>
                      </div>
                    )}
                  </div>

                  <ChevronRight size={16} className="text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
