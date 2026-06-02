'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, AlertTriangle, Trophy, Flag, TrendingUp, ShieldAlert, Clock } from 'lucide-react';
import { EVENT_CODES } from '@/lib/constants';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

function formatRaceTime(event: RaceEvent, sessionStart: string | null): string {
  const elapsed = typeof event.sessionTimeMs === 'number'
    ? Math.max(0, Math.floor(event.sessionTimeMs / 1000))
    : sessionStart
      ? Math.max(0, Math.floor((new Date(event.timestamp).getTime() - new Date(sessionStart).getTime()) / 1000))
      : -1;

  if (elapsed < 0) return '--:--';
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface Participant {
  carIndex: number;
  name: string;
  humanProfileId: string | null;
  humanProfile: { name: string; color: string } | null;
}

interface RaceEvent {
  id: string;
  eventCode: string;
  timestamp: string;
  sessionTimeMs: number | null;
  details: any;
}

interface Props {
  sessionId: string;
}

const EVENT_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  OVTK: { icon: <TrendingUp size={11} />, color: 'var(--green)', label: 'Overtake' },
  COLL: { icon: <AlertTriangle size={11} />, color: 'var(--f1-red)', label: 'Collision' },
  FTLP: { icon: <Zap size={11} />, color: 'var(--purple)', label: 'Fastest Lap' },
  PENA: { icon: <ShieldAlert size={11} />, color: 'var(--yellow)', label: 'Penalty' },
  RTMT: { icon: <Flag size={11} />, color: 'var(--f1-red)', label: 'Retirement' },
  RCWN: { icon: <Trophy size={11} />, color: '#FFD700', label: 'Race Winner' },
  SCAR: { icon: <Clock size={11} />, color: 'var(--blue)', label: 'Safety Car' },
  DRSE: { icon: <Zap size={11} />, color: 'var(--green)', label: 'DRS Enabled' },
  RDFL: { icon: <Flag size={11} />, color: 'var(--f1-red)', label: 'Red Flag' },
  CHQF: { icon: <Trophy size={11} />, color: '#FFD700', label: 'Chequered Flag' },
};

function getDriverName(idx: number | undefined, participants: Participant[]): string {
  if (idx === undefined || idx === null) return '?';
  const p = participants.find((p) => p.carIndex === idx);
  return p ? (p.humanProfile?.name || p.name) : `Car ${idx}`;
}

function getDriverColor(idx: number | undefined, participants: Participant[]): string {
  if (idx === undefined || idx === null) return 'var(--muted-foreground)';
  const p = participants.find((p) => p.carIndex === idx);
  return p?.humanProfile?.color || 'var(--foreground)';
}

function describeEvent(code: string, details: any, participants: Participant[]): string {
  const ovtk = details?.overtake;
  const coll = details?.collision;
  const ftlp = details?.fastestLap;
  const pena = details?.penalty;
  const rtmt = details?.retirement;
  const rcwn = details?.raceWinner;
  switch (code) {
    case 'OVTK': return `${getDriverName(ovtk?.overtakingVehicleIdx, participants)} overtook ${getDriverName(ovtk?.beingOvertakenVehicleIdx, participants)}`;
    case 'COLL': return `${getDriverName(coll?.vehicle1Idx, participants)} & ${getDriverName(coll?.vehicle2Idx, participants)} collided`;
    case 'FTLP': return `${getDriverName(ftlp?.vehicleIdx, participants)} set fastest lap`;
    case 'PENA': return `${getDriverName(pena?.vehicleIdx, participants)} — ${pena?.infringementType ?? 'penalty'}`;
    case 'RTMT': return `${getDriverName(rtmt?.vehicleIdx, participants)} retired`;
    case 'RCWN': return `${getDriverName(rcwn?.vehicleIdx, participants)} wins!`;
    case 'SCAR': return 'Safety Car deployed';
    case 'DRSE': return 'DRS enabled';
    case 'RDFL': return 'Red flag';
    case 'CHQF': return 'Chequered flag';
    default: return EVENT_CODES[code] || code;
  }
}

const SHOWN_CODES = ['OVTK', 'COLL', 'FTLP', 'PENA', 'RTMT', 'RCWN', 'SCAR', 'RDFL', 'CHQF'];

export default function RaceMomentsTimeline({ sessionId }: Props) {
  const [events, setEvents] = useState<RaceEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [sessionStart, setSessionStart] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch(`/api/sessions/${sessionId}/events`)
      .then((r) => r.json())
      .then((data) => {
        if (data.events) setEvents(data.events);
        if (data.participants) setParticipants(data.participants);
        if (data.sessionCreatedAt) setSessionStart(data.sessionCreatedAt);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId]);

  const filtered = events.filter((e) => {
    if (!SHOWN_CODES.includes(e.eventCode)) return false;
    if (filter === 'all') return true;
    return e.eventCode === filter;
  });

  const filterOptions = [
    { key: 'all', label: 'All' },
    { key: 'OVTK', label: 'Overtakes' },
    { key: 'COLL', label: 'Collisions' },
    { key: 'FTLP', label: 'Fastest Laps' },
    { key: 'PENA', label: 'Penalties' },
  ];

  if (loading) return (
    <div className="card p-6 flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-title">Race Moments</span>
        <span className="text-[9px] text-[var(--muted)]">{filtered.length} events</span>
      </div>
      <div className="p-3">
        {/* Filter chips */}
        <div className="flex gap-1.5 mb-3 flex-wrap">
          {filterOptions.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-[9px] px-2 py-0.5 rounded-sm font-bold uppercase tracking-wider transition-colors ${
                filter === f.key ? 'bg-[var(--m-red)] text-white' : 'bg-[var(--surface)] text-[var(--muted-foreground)] hover:text-white'
              }`}
              style={BMW_FONT}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)] text-center py-6">No events recorded for this session.</p>
        ) : (
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            <AnimatePresence initial={false}>
              {filtered.map((ev, i) => {
                const meta = EVENT_META[ev.eventCode];
                if (!meta) return null;
                return (
                  <motion.div
                    key={ev.id}
                    className="flex items-start gap-2.5 p-2 rounded-sm bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div className="flex-shrink-0 mt-0.5 p-1 rounded-sm" style={{ backgroundColor: `${meta.color}20`, color: meta.color }}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold" style={{ ...BMW_FONT, color: meta.color }}>
                        {meta.label}
                      </div>
                      <div className="text-[11px] text-[var(--foreground)]">
                        {describeEvent(ev.eventCode, ev.details, participants)}
                      </div>
                    </div>
                    <div className="text-[9px] text-[var(--muted-foreground)] flex-shrink-0 font-mono" title={new Date(ev.timestamp).toLocaleTimeString()}>
                      +{formatRaceTime(ev, sessionStart)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
