'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Flag, Plus, Trash2, Trophy, TrendingUp, Zap } from 'lucide-react';
import { TRACK_NAMES, SESSION_TYPES } from '@/lib/constants';
import { formatLapTime } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface SeasonDetail {
  id: string; name: string; isActive: boolean; startDate: string | null; endDate: string | null;
  races: {
    session: {
      id: string; trackId: number; sessionType: number; createdAt: string;
      participants: { carIndex: number; humanProfileId: string | null; humanProfile: { id: string; name: string; color: string } | null }[];
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

function ChampionshipPredictor({ standings, completedRaces }: { standings: PlayerStats[]; completedRaces: number }) {
  const [extraRaces, setExtraRaces] = useState(3);

  const projected = standings.map((p) => {
    const avgPts = completedRaces > 0 ? p.points / completedRaces : 0;
    return { ...p, projected: Math.round(p.points + avgPts * extraRaces) };
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
                    <span className="text-[9px] text-[var(--muted-foreground)] ml-2">({p.points} now)</span>
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
          Projection based on average {completedRaces > 0 ? Math.round(standings.reduce((s, p) => s + p.points, 0) / standings.length / completedRaces * 10) / 10 : 0} pts/race per player over {completedRaces} completed races.
        </p>
      </div>
    </motion.div>
  );
}

export default function SeasonDetailPage() {
  const { id } = useParams() as { id: string };
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [allSessions, setAllSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddRace, setShowAddRace] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);

  async function load() {
    const [seasonRes, sessionsRes] = await Promise.all([
      fetch(`/api/seasons/${id}`).then((r) => r.json()),
      fetch('/api/sessions').then((r) => r.json()),
    ]);
    setSeason(seasonRes);
    if (Array.isArray(sessionsRes)) setAllSessions(sessionsRes);
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
    load();
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

  const standings = computeStandings(season);
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
          {standings.length === 0 ? (
            <div className="card p-8 text-center">
              <Trophy size={24} className="text-[var(--muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--muted-foreground)]">No human players linked to any race in this season yet.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] w-8" style={BMW_FONT}>#</th>
                    <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Driver</th>
                    {season.races.map((r) => (
                      <th key={r.session.id} className="text-center px-2 py-2 text-[8px] text-[var(--muted-foreground)] max-w-[40px]" title={TRACK_NAMES[r.session.trackId]}>
                        {(TRACK_NAMES[r.session.trackId] || '?').slice(0, 3).toUpperCase()}
                      </th>
                    ))}
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--yellow)]" style={BMW_FONT}>PTS</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-yellow-400" style={BMW_FONT}>W</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--green)]" style={BMW_FONT}>OVT</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--purple)]" style={BMW_FONT}>FL</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((p, i) => {
                    const posColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined;
                    return (
                      <tr key={p.id} className="border-b border-[var(--card-border)] hover:bg-white/[0.03] transition-colors cursor-pointer"
                        onClick={() => window.location.href = `/players/${p.id}`}>
                        <td className="px-4 py-3 font-black font-mono text-sm" style={posColor ? { color: posColor } : { color: 'var(--muted-foreground)' }}>{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-black text-white" style={{ backgroundColor: p.color }}>
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold" style={BMW_FONT}>{p.name}</span>
                          </div>
                        </td>
                        {season.races.map((r) => {
                          const result = p.raceResults.find((rr) => rr.sessionId === r.session.id);
                          const pc = result?.position === 1 ? '#FFD700' : result?.position === 2 ? '#C0C0C0' : result?.position === 3 ? '#CD7F32' : undefined;
                          return (
                            <td key={r.session.id} className="px-2 py-3 text-center font-mono text-xs">
                              {result ? (
                                <span style={pc ? { color: pc } : { color: 'var(--muted-foreground)' }}>
                                  {result.position ? `P${result.position}` : '—'}
                                </span>
                              ) : <span className="text-[var(--muted)]">—</span>}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-black font-mono tabular-nums" style={{ color: 'var(--yellow)' }}>{p.points}</td>
                        <td className="px-3 py-3 text-center font-mono text-yellow-400">{p.wins}</td>
                        <td className="px-3 py-3 text-center font-mono text-[var(--green)]">{p.overtakes}</td>
                        <td className="px-3 py-3 text-center font-mono text-[var(--purple)]">{p.fastestLaps}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

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
              <motion.div key={r.session.id} className="card p-3 flex items-center gap-3 group"
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-[var(--surface-elevated)]" style={{ borderRadius: 0 }}>
                  <span className="text-[9px] font-black text-[var(--foreground)]">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{TRACK_NAMES[r.session.trackId] || `Track ${r.session.trackId}`}</div>
                  <div className="text-[10px] text-[var(--muted-foreground)]">
                    {SESSION_TYPES[r.session.sessionType]} · {new Date(r.session.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {r.session.participants.filter((p) => p.humanProfile).map((p) => (
                    <div key={p.carIndex} className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black text-white"
                      title={p.humanProfile!.name} style={{ backgroundColor: p.humanProfile!.color }}>
                      {p.humanProfile!.name.charAt(0).toUpperCase()}
                    </div>
                  ))}
                </div>
                <button onClick={() => removeRace(r.session.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--f1-red)] hover:text-red-400">
                  <Trash2 size={12} />
                </button>
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
