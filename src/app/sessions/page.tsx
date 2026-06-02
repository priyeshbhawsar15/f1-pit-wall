'use client';

import { useEffect, useState, useMemo } from 'react';
import { TRACK_NAMES, TRACK_FLAGS, SESSION_TYPES, WEATHER_TYPES, TEAM_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import {
  MapPin, Cloud, Users, ChevronRight,
  Trophy, Flag, BarChart3, Clock, Trash2,
} from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import RaceResultCard from '@/components/RaceResultCard';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

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
  participants: {
    name: string;
    teamId: number;
    carIndex: number;
    humanProfileId: string | null;
    humanProfile: { id: string; name: string; color: string; avatarUrl: string | null } | null;
  }[];
  finalClassifications: { carIndex: number; position: number; points: number; resultStatus: number }[];
  _count: { events: number; finalClassifications: number };
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadSessions() {
    setLoading(true);
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();
      if (Array.isArray(data)) setSessions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function deleteSession(sessionId: string) {
    if (!window.confirm('Delete this race from history everywhere? This also removes it from seasons and replay data.')) {
      return;
    }
    setDeletingId(sessionId);
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
    } finally {
      setDeletingId(null);
    }
  }

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
      <AppHeader title="HISTORY" />

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
                  <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>
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
            <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin mb-3" />
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
              <RaceResultCard
                key={s.id}
                trackId={s.trackId}
                sessionType={s.sessionType}
                createdAt={s.createdAt}
                href={`/sessions/${s.id}?uid=${s.sessionUID}`}
                details={
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-[var(--muted-foreground)]">
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
                }
                players={s.participants
                  .filter((participant) => participant.humanProfile)
                  .map((participant) => {
                    const profile = participant.humanProfile!;
                    const classification = s.finalClassifications.find((item) => item.carIndex === participant.carIndex);
                    return {
                      id: profile.id,
                      name: profile.name,
                      color: profile.color,
                      avatarUrl: profile.avatarUrl,
                      position: classification?.position ?? null,
                      points: classification?.points ?? 0,
                      resultStatus: classification?.resultStatus ?? null,
                    };
                  })
                  .sort((a, b) => {
                    if (a.position === null && b.position === null) return a.name.localeCompare(b.name);
                    if (a.position === null) return 1;
                    if (b.position === null) return -1;
                    return a.position - b.position;
                  })}
                trailing={<ChevronRight size={16} className="text-[var(--muted)] group-hover:text-[var(--foreground)] transition-colors flex-shrink-0 self-center" />}
                action={
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      deleteSession(s.id);
                    }}
                    disabled={deletingId === s.id}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--f1-red)] hover:text-red-400 self-center disabled:opacity-100 disabled:text-[var(--muted)]"
                  >
                    <Trash2 size={12} />
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
