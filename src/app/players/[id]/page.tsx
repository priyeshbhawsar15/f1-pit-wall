'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trophy, Zap, AlertTriangle, Clock, TrendingUp, Flag, Swords, MapPin } from 'lucide-react';
import { TRACK_NAMES, SESSION_TYPES, RESULT_STATUS, PENALTY_TYPES, INFRINGEMENT_TYPES } from '@/lib/constants';
import { formatLapTime } from '@/lib/utils';
import AppHeader from '@/components/AppHeader';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="stat-block p-3">
      <div className="text-[8px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>{label}</div>
      <div className="text-xl font-black font-mono tabular-nums" style={color ? { color } : undefined}>{value}</div>
      {sub && <div className="text-[9px] text-[var(--muted-foreground)] mt-0.5">{sub}</div>}
    </div>
  );
}

export default function PlayerDetailPage() {
  const { id } = useParams() as { id: string };
  const [data, setData] = useState<any>(null);
  const [standing, setStanding] = useState<any>(null);
  const [trackRecords, setTrackRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/players/${id}`).then((r) => r.json()),
      fetch('/api/standings').then((r) => r.json()),
      fetch(`/api/players/track-records?profileId=${id}`).then((r) => r.json()),
    ]).then(([profile, standings, records]) => {
      setData(profile);
      if (Array.isArray(standings)) {
        setStanding(standings.find((s: any) => s.id === id) || null);
      }
      if (Array.isArray(records)) setTrackRecords(records);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[var(--muted-foreground)]">Player not found.</p>
    </div>
  );

  const stats = standing?.stats;
  const races: any[] = standing?.races || [];
  const penaltyDetails: any[] = standing?.penaltyDetails || [];

  return (
    <div className="min-h-screen">
      <AppHeader
        title="PLAYER"
        backHref="/players"
        meta={
          <>
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: data.color }} />
            <span className="font-bold text-[var(--foreground)]" style={BMW_FONT}>{data.name}</span>
          </>
        }
      />

      <div className="max-w-5xl mx-auto p-6 space-y-6">
        {/* Profile hero */}
        <motion.div className="card p-5 flex items-center gap-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          style={{ borderTop: `2px solid ${data.color}` }}>
          <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-3xl font-black text-white flex-shrink-0"
            style={{ backgroundColor: data.color }}>
            {data.avatarUrl
              ? <img src={data.avatarUrl} alt={data.name} className="w-full h-full object-cover" />
              : data.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-black" style={BMW_FONT}>{data.name}</h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Member since {new Date(data.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href={`/players/h2h?a=${id}`} className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
              <Swords size={12} /> H2H
            </Link>
            <Link href="/players" className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">
              Edit Profile →
            </Link>
          </div>
        </motion.div>

        {/* Stats grid */}
        {stats && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>Career Stats</h2>
            <div className="grid grid-cols-4 gap-2 md:grid-cols-8">
              <StatCard label="Races" value={stats.races} />
              <StatCard label="Points" value={stats.points} color={data.color} />
              <StatCard label="Wins" value={stats.wins} color="#FFD700" />
              <StatCard label="Podiums" value={stats.podiums} />
              <StatCard label="DNFs" value={stats.dnfs} color="var(--f1-red)" />
              <StatCard label="Overtakes" value={stats.overtakes} color="var(--green)" />
              <StatCard label="Collisions" value={stats.collisions} color="var(--f1-red)" />
              <StatCard label="Fastest Laps" value={stats.fastestLaps} color="var(--purple)" />
            </div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              <StatCard label="Avg Position" value={stats.avgPosition ?? '—'} />
              <StatCard label="Penalties" value={stats.penalties} sub={`${stats.penaltySeconds}s total`} color="var(--yellow)" />
              <StatCard label="Pit Stops" value={stats.pitStops} />
              <StatCard label="Best Lap" value={stats.bestLapMs ? formatLapTime(stats.bestLapMs) : '—'} color="var(--purple)" />
            </div>
          </motion.div>
        )}

        {/* Grid vs Finish */}
        {races.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
            <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>Grid vs Finish</h2>
            <div className="card p-4">
              <div className="flex items-end gap-1 h-24 justify-center">
                {races.filter((r) => r.gridPosition > 0 && r.position > 0).slice(-12).map((r: any, i: number) => {
                  const gained = r.gridPosition - r.position;
                  const color = gained > 0 ? 'var(--green)' : gained < 0 ? 'var(--f1-red)' : 'var(--muted-foreground)';
                  const h = Math.min(Math.abs(gained) * 10 + 8, 72);
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1" title={`${TRACK_NAMES[r.trackId]}: Grid P${r.gridPosition} → Finish P${r.position} (${gained > 0 ? '+' : ''}${gained})`}>
                      <span className="text-[8px] font-mono" style={{ color }}>{gained > 0 ? `+${gained}` : gained}</span>
                      <div className="w-full rounded-t-sm min-h-[4px]" style={{ height: `${h}px`, backgroundColor: color, opacity: 0.8 }} />
                      <span className="text-[7px] text-[var(--muted-foreground)] truncate w-full text-center">
                        {(TRACK_NAMES[r.trackId] || '?').slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[9px] text-[var(--muted-foreground)] text-center mt-2">Positions gained/lost vs grid (last 12 races)</p>
            </div>
          </motion.div>
        )}

        {/* Track Records */}
        {trackRecords.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.09 }}>
            <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>Track Records</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {trackRecords.map((rec: any) => (
                <div key={rec.trackId} className="card p-3 flex items-center gap-3">
                  <MapPin size={12} className="text-[var(--f1-red)] flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] font-semibold truncate">{TRACK_NAMES[rec.trackId] || `Track ${rec.trackId}`}</div>
                    <div className="text-xs font-mono text-[var(--purple)] font-bold">{formatLapTime(rec.bestLapMs)}</div>
                    {rec.bestPos && <div className="text-[9px] text-[var(--muted-foreground)]">Finished P{rec.bestPos}</div>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Time Penalties */}
        {penaltyDetails.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.095 }}>
            <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>
              Time Penalties ({penaltyDetails.length})
            </h2>
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Track</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Lap</th>
                    <th className="text-left px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Type</th>
                    <th className="text-left px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Infringement</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--yellow)]" style={BMW_FONT}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {penaltyDetails
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((pen: any, i: number) => (
                    <motion.tr key={i} className="border-b border-[var(--card-border)] hover:bg-white/[0.03] transition-colors"
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                      <td className="px-4 py-2.5">
                        <div className="font-semibold">{TRACK_NAMES[pen.trackId] || `Track ${pen.trackId}`}</div>
                        <div className="text-[9px] text-[var(--muted-foreground)]">
                          {new Date(pen.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono text-[var(--muted-foreground)]">{pen.lapNum}</td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px]" style={{ color: pen.penaltyType <= 1 ? 'var(--f1-red)' : pen.penaltyType === 5 ? 'var(--yellow)' : 'var(--foreground)' }}>
                          {PENALTY_TYPES[pen.penaltyType] || `Type ${pen.penaltyType}`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {INFRINGEMENT_TYPES[pen.infringementType] || `#${pen.infringementType}`}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold" style={{ color: 'var(--yellow)' }}>
                        {pen.time < 255 ? `+${pen.time}s` : '—'}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Race history */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <h2 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)] mb-3" style={BMW_FONT}>
            Race History ({races.length})
          </h2>
          {races.length === 0 ? (
            <div className="card p-8 text-center">
              <Flag size={24} className="text-[var(--muted)] mx-auto mb-2" />
              <p className="text-sm text-[var(--muted-foreground)]">No races linked yet. Assign this profile in a session.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {races.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((r, i) => {
                const posColor = r.position === 1 ? '#FFD700' : r.position === 2 ? '#C0C0C0' : r.position === 3 ? '#CD7F32' : undefined;
                return (
                  <motion.div
                    key={r.sessionId + r.carIndex}
                    className="card p-3 flex items-center gap-4"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-[var(--surface-elevated)]" style={{ borderRadius: 0 }}>
                      <span className="text-[10px] font-black text-[var(--muted-foreground)]">
                        {SESSION_TYPES[r.sessionType]?.replace('Short ', '') || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{TRACK_NAMES[r.trackId] || `Track ${r.trackId}`}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)]">
                        {new Date(r.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 space-y-0.5">
                      {r.position ? (
                        <div className="text-sm font-black font-mono" style={posColor ? { color: posColor } : undefined}>
                          P{r.position}
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-[var(--muted)]">—</div>
                      )}
                      {r.resultStatus > 0 && r.resultStatus !== 2 && r.resultStatus !== 3 && (
                        <div className="text-[9px] text-[var(--f1-red)]">{RESULT_STATUS[r.resultStatus]}</div>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 w-16">
                      <div className="text-xs font-mono text-[var(--muted-foreground)]">
                        {r.bestLapTimeInMS > 0 ? formatLapTime(r.bestLapTimeInMS) : '—'}
                      </div>
                      <div className="text-[9px] text-[var(--yellow)] font-mono">
                        {r.points > 0 ? `+${r.points}pts` : ''}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
