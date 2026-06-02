'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flag, Plus, Trash2, Trophy, TrendingUp } from 'lucide-react';
import { TRACK_NAMES, SESSION_TYPES } from '@/lib/constants';
import AppHeader from '@/components/AppHeader';
import StandingsTable, { type StandingsPlayer } from '@/components/StandingsTable';
import StandingsHighlights from '@/components/StandingsHighlights';
import RaceResultCard from '@/components/RaceResultCard';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface SeasonDetail {
  id: string; name: string; isActive: boolean; startDate: string | null; endDate: string | null;
  races: {
    session: {
      id: string; sessionUID: string; trackId: number; sessionType: number; createdAt: string;
      participants: { carIndex: number; humanProfileId: string | null; humanProfile: { id: string; name: string; color: string; avatarUrl: string | null } | null }[];
      finalClassifications: { carIndex: number; position: number; points: number; bestLapTimeInMS: number; resultStatus: number; gridPosition: number }[];
      events: { eventCode: string; details: any }[];
    };
  }[];
}

interface PlayerStats {
  id: string; name: string; color: string; avatarUrl?: string;
  points: number; wins: number; podiums: number; races: number; dnfs: number;
  overtakes: number; collisions: number; fastestLaps: number; bestLapMs: number | null;
  raceResults: { trackId: number; sessionType: number; position: number | null; points: number; sessionId: string }[];
}

function computeStandings(season: SeasonDetail): PlayerStats[] {
  const map = new Map<string, PlayerStats>();

  for (const race of season.races) {
    const s = race.session;
    const humanParticipants = s.participants.filter((p) => p.humanProfile);

    for (const p of humanParticipants) {
      const profile = p.humanProfile!;
      if (!map.has(profile.id)) {
        map.set(profile.id, {
          id: profile.id, name: profile.name, color: profile.color,
          points: 0, wins: 0, podiums: 0, races: 0, dnfs: 0,
          overtakes: 0, collisions: 0, fastestLaps: 0, bestLapMs: null, raceResults: [],
        });
      }
      const ps = map.get(profile.id)!;
      const fc = s.finalClassifications.find((f) => f.carIndex === p.carIndex);

      ps.races++;
      if (fc) {
        ps.points += fc.points;
        if (fc.position === 1) ps.wins++;
        if (fc.position && fc.position <= 3) ps.podiums++;
        if ([4, 7].includes(fc.resultStatus)) ps.dnfs++;
        if (fc.bestLapTimeInMS > 0 && (ps.bestLapMs === null || fc.bestLapTimeInMS < ps.bestLapMs)) {
          ps.bestLapMs = fc.bestLapTimeInMS;
        }
      }

      for (const ev of s.events) {
        const d = ev.details as any;
        if (ev.eventCode === 'OVTK' && d?.overtake?.overtakingVehicleIdx === p.carIndex) ps.overtakes++;
        if (ev.eventCode === 'COLL' && (d?.collision?.vehicle1Idx === p.carIndex || d?.collision?.vehicle2Idx === p.carIndex)) ps.collisions++;
        if (ev.eventCode === 'FTLP' && d?.fastestLap?.vehicleIdx === p.carIndex) ps.fastestLaps++;
      }

      ps.raceResults.push({ trackId: s.trackId, sessionType: s.sessionType, position: fc?.position ?? null, points: fc?.points ?? 0, sessionId: s.id });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.points - a.points);
}

function ChampionshipPredictor({ standings, completedRaces }: { standings: StandingsPlayer[]; completedRaces: number }) {
  const [extraRaces, setExtraRaces] = useState(3);

  const projected = standings.map((p) => {
    const avgPts = completedRaces > 0 ? p.stats.points / completedRaces : 0;
    return { ...p, projected: Math.round(p.stats.points + avgPts * extraRaces) };
  }).sort((a, b) => b.projected - a.projected);

  const maxPts = projected[0]?.projected || 1;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      <div className="card p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>
            Championship Predictor
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[9px] text-[var(--muted-foreground)]" style={BMW_FONT}>Remaining races:</span>
            <input
              type="number" min={1} max={30} value={extraRaces}
              onChange={(e) => setExtraRaces(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-12 bg-[var(--surface)] border border-[var(--card-border)] px-2 py-0.5 text-xs text-center focus:outline-none focus:border-[var(--m-blue-dark)]"
              style={{ borderRadius: 0 }}
            />
          </div>
        </div>
        <div className="space-y-3">
          {projected.map((p, i) => {
            const barWidth = (p.projected / maxPts) * 100;
            const posColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined;
            return (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black w-4" style={posColor ? { color: posColor } : { color: 'var(--muted-foreground)' }}>{i + 1}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: p.color }}>
                      {p.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold" style={BMW_FONT}>{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black font-mono tabular-nums" style={{ color: p.color }}>{p.projected}</span>
                    <span className="text-[9px] text-[var(--muted-foreground)] ml-1">pts</span>
                    <span className="text-[9px] text-[var(--muted-foreground)] ml-2">({p.stats.points} now)</span>
                  </div>
                </div>
                <div className="h-1.5 bg-[var(--surface)] overflow-hidden" style={{ borderRadius: 0 }}>
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: p.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${barWidth}%` }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-[9px] text-[var(--muted-foreground)] mt-3">
          Projection based on average {completedRaces > 0 ? Math.round(standings.reduce((sum, player) => sum + player.stats.points, 0) / standings.length / completedRaces * 10) / 10 : 0} pts/race per player over {completedRaces} completed races.
        </p>
      </div>
    </motion.div>
  );
}

export default function SeasonDetailPage() {
  const { id } = useParams() as { id: string };
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [standings, setStandings] = useState<StandingsPlayer[]>([]);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRace, setShowAddRace] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function load() {
    const [seasonRes, sessionsRes, standingsRes] = await Promise.all([
      fetch(`/api/seasons/${id}`).then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
      fetch(`/api/standings?seasonId=${id}`).then((r) => r.json()),
    ]);
    setSeason(seasonRes);
    if (Array.isArray(sessionsRes)) setAllSessions(sessionsRes);
    if (Array.isArray(standingsRes)) setStandings(standingsRes);
    setLoading(false);
  }

  useEffect(() => { load(); }, [id]);

  async function addRace(sessionId: string) {
    setAddingId(sessionId);
    await fetch(`/api/seasons/${id}/races`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds: [sessionId] }),
    });
    await load();
    setAddingId(null);
  }

  async function removeRace(sessionId: string) {
    await fetch(`/api/seasons/${id}/races?sessionId=${sessionId}`, { method: 'DELETE' });
    await load();
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!season) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted-foreground)]">Season not found.</p>
    </div>
  );

  const linkedSessionIds = new Set(season.races.map((r) => r.session.id));
  const unlinkedSessions = allSessions.filter((s: any) => !linkedSessionIds.has(s.id));

  const totalRaces = season.races.length;
  const tracks = Array.from(new Set(season.races.map((r) => r.session.trackId)));

  return (
    <div className="min-h-screen">
      <AppHeader
        title="SEASON"
        backHref="/seasons"
        meta={
          <>
            <span className="font-bold text-[var(--foreground)]" style={BMW_FONT}>{season.name}</span>
            {season.isActive && (
              <span className="pill pill-live text-[8px]"><span className="live-dot" /> ACTIVE</span>
            )}
          </>
        }
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Summary bar */}
        <motion.div className="grid grid-cols-3 gap-3" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {[
            { label: 'Races', value: totalRaces, icon: <Flag size={14} className="text-[var(--f1-red)]" /> },
            { label: 'Tracks', value: tracks.length, icon: <TrendingUp size={14} className="text-[var(--blue)]" /> },
            { label: 'Drivers', value: standings.length, icon: <Trophy size={14} className="text-yellow-400" /> },
          ].map((stat) => (
            <div key={stat.label} className="card p-4 flex items-center gap-3">
              {stat.icon}
              <div>
                <div className="text-xl font-black font-mono">{stat.value}</div>
                <div className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>{stat.label}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Standings */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>Driver Standings</h2>
          <StandingsTable
            standings={standings}
            emptyTitle="No standings yet"
            emptyMessage="No human players linked to any race in this season yet."
          />
        </motion.div>

        {standings.length > 0 && <StandingsHighlights standings={standings} />}

        {/* Championship Predictor — only shown when season is active and has standings */}
        {season.isActive && standings.length > 0 && totalRaces > 0 && (
          <ChampionshipPredictor standings={standings} completedRaces={totalRaces} />
        )}

        {/* Race list */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Races ({totalRaces})</h2>
            <button onClick={() => setShowAddRace(!showAddRace)}
              className="flex items-center gap-1 text-[9px] bg-[var(--surface)] hover:bg-[var(--surface-hover)] px-2 py-1 rounded-sm transition-colors" style={BMW_FONT}>
              <Plus size={10} /> Add Race
            </button>
          </div>

          {showAddRace && unlinkedSessions.length > 0 && (
            <motion.div className="card p-3 mb-3 space-y-1 max-h-48 overflow-y-auto"
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <p className="text-[9px] text-[var(--muted-foreground)] mb-2" style={BMW_FONT}>Select a session to add:</p>
              {unlinkedSessions.map((s: any) => (
                <button key={s.id} onClick={() => addRace(s.id)} disabled={addingId === s.id}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-sm bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors text-left">
                  <div>
                    <span className="text-xs font-semibold">{TRACK_NAMES[s.trackId] || `Track ${s.trackId}`}</span>
                    <span className="text-[10px] text-[var(--muted-foreground)] ml-2">{SESSION_TYPES[s.sessionType]}</span>
                  </div>
                  <span className="text-[9px] text-[var(--muted-foreground)]">{new Date(s.createdAt).toLocaleDateString()}</span>
                </button>
              ))}
            </motion.div>
          )}

          <div className="space-y-1.5">
            {season.races.map((r, i) => (
              <motion.div key={r.session.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <RaceResultCard
                  trackId={r.session.trackId}
                  sessionType={r.session.sessionType}
                  createdAt={r.session.createdAt}
                  href={`/sessions/${r.session.id}?uid=${r.session.sessionUID}`}
                  players={r.session.participants
                    .filter((participant) => participant.humanProfile)
                    .map((participant) => {
                      const profile = participant.humanProfile!;
                      const classification = r.session.finalClassifications.find((item) => item.carIndex === participant.carIndex);
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
                  action={
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        removeRace(r.session.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--f1-red)] hover:text-red-400"
                    >
                      <Trash2 size={12} />
                    </button>
                  }
                />
              </motion.div>
            ))}
            {season.races.length === 0 && (
              <div className="card p-8 text-center">
                <Flag size={24} className="text-[var(--muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">No races in this season yet.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
