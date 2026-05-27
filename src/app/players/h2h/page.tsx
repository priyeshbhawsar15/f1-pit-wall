'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Swords, Trophy, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { TRACK_NAMES, SESSION_TYPES } from '@/lib/constants';
import { formatLapTime } from '@/lib/utils';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

interface Profile { id: string; name: string; color: string; avatarUrl: string | null; }

function Avatar({ profile, size = 10 }: { profile: Profile; size?: number }) {
  const px = `${size * 4}px`;
  return (
    <div className="rounded-full overflow-hidden flex items-center justify-center font-black text-white flex-shrink-0"
      style={{ width: px, height: px, backgroundColor: profile.color, fontSize: `${size * 1.4}px` }}>
      {profile.avatarUrl
        ? <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
        : profile.name.charAt(0).toUpperCase()}
    </div>
  );
}

function Bar({ valueA, valueB, colorA, colorB }: { valueA: number; valueB: number; colorA: string; colorB: string }) {
  const total = valueA + valueB || 1;
  const pctA = (valueA / total) * 100;
  return (
    <div className="flex h-2 rounded-full overflow-hidden gap-px">
      <div className="transition-all duration-500 rounded-l-full" style={{ width: `${pctA}%`, backgroundColor: colorA }} />
      <div className="transition-all duration-500 rounded-r-full flex-1" style={{ backgroundColor: colorB }} />
    </div>
  );
}

function H2HContent() {
  const searchParams = useSearchParams();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedA, setSelectedA] = useState(searchParams.get('a') || '');
  const [selectedB, setSelectedB] = useState(searchParams.get('b') || '');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/players').then((r) => r.json()).then((d) => { if (Array.isArray(d)) setProfiles(d); });
  }, []);

  async function loadH2H() {
    if (!selectedA || !selectedB || selectedA === selectedB) return;
    setLoading(true);
    const res = await fetch(`/api/players/h2h?a=${selectedA}&b=${selectedB}`);
    const d = await res.json();
    setData(d);
    setLoading(false);
  }

  const profileA = profiles.find((p) => p.id === selectedA);
  const profileB = profiles.find((p) => p.id === selectedB);

  const STAT_ROWS = data ? [
    { label: 'Points', a: data.stats.a.points, b: data.stats.b.points, icon: <Trophy size={12} className="text-yellow-400" /> },
    { label: 'Wins', a: data.stats.a.wins, b: data.stats.b.wins, icon: <Trophy size={12} className="text-yellow-400" /> },
    { label: 'Podiums', a: data.stats.a.podiums, b: data.stats.b.podiums, icon: <Trophy size={12} className="text-[var(--muted-foreground)]" /> },
    { label: 'Overtakes on opponent', a: data.stats.a.overtakesOn, b: data.stats.b.overtakesOn, icon: <TrendingUp size={12} className="text-[var(--green)]" /> },
    { label: 'Collisions together', a: data.stats.a.collisions, b: data.stats.b.collisions, icon: <AlertTriangle size={12} className="text-[var(--f1-red)]" /> },
    { label: 'Fastest Laps', a: data.stats.a.fastestLaps, b: data.stats.b.fastestLaps, icon: <Zap size={12} className="text-[var(--purple)]" /> },
  ] : [];

  return (
    <div className="min-h-screen">
      <div className="red-bar" />
      <header className="f1-header flex items-center gap-3 px-6 py-3">
        <Link href="/players" className="text-[var(--muted-foreground)] hover:text-white transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="divider-v" />
        <span className="f1-logo-text">F1</span>
        <span className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-[0.15em] uppercase" style={F1_FONT}>
          Head-to-Head
        </span>
      </header>

      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Selector */}
        <motion.div className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>Player A</label>
              <select value={selectedA} onChange={(e) => setSelectedA(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]">
                <option value="">Select player…</option>
                {profiles.filter((p) => p.id !== selectedB).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center gap-1 mt-4">
              <Swords size={20} className="text-[var(--accent)]" />
              <span className="text-[9px] text-[var(--muted-foreground)] font-bold" style={F1_FONT}>VS</span>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>Player B</label>
              <select value={selectedB} onChange={(e) => setSelectedB(e.target.value)}
                className="w-full bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent)]">
                <option value="">Select player…</option>
                {profiles.filter((p) => p.id !== selectedA).map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={loadH2H} disabled={!selectedA || !selectedB || selectedA === selectedB || loading}
            className="mt-4 w-full bg-[var(--accent)] hover:bg-[var(--accent-dim)] disabled:opacity-40 text-white text-sm font-bold py-2 rounded-sm transition-colors flex items-center justify-center gap-2"
            style={F1_FONT}>
            <Swords size={14} /> {loading ? 'Loading…' : 'Compare'}
          </button>
        </motion.div>

        {data && profileA && profileB && (
          <>
            {/* Hero names */}
            <motion.div className="card p-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <div className="flex items-center gap-3">
                  <Avatar profile={profileA} size={14} />
                  <div>
                    <div className="font-black text-lg" style={{ ...F1_FONT, color: profileA.color }}>{profileA.name}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{data.stats.a.wins}W · {data.stats.a.points}pts</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-[var(--muted-foreground)]" style={F1_FONT}>{data.sharedRaces} shared races</div>
                </div>
                <div className="flex items-center gap-3 justify-end text-right">
                  <div>
                    <div className="font-black text-lg" style={{ ...F1_FONT, color: profileB.color }}>{profileB.name}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)]">{data.stats.b.wins}W · {data.stats.b.points}pts</div>
                  </div>
                  <Avatar profile={profileB} size={14} />
                </div>
              </div>
            </motion.div>

            {data.sharedRaces === 0 ? (
              <div className="card p-8 text-center">
                <Swords size={24} className="text-[var(--muted)] mx-auto mb-2" />
                <p className="text-sm text-[var(--muted-foreground)]">No shared sessions found. Assign both profiles to the same session.</p>
              </div>
            ) : (
              <>
                {/* Stat bars */}
                <motion.div className="card p-5 space-y-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <h3 className="text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Comparison</h3>
                  {STAT_ROWS.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: row.a > row.b ? profileA.color : row.a === row.b ? 'var(--muted-foreground)' : 'var(--muted-foreground)' }}>{row.a}</span>
                        <div className="flex items-center gap-1.5">
                          {row.icon}
                          <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>{row.label}</span>
                        </div>
                        <span className="font-mono text-sm font-bold tabular-nums" style={{ color: row.b > row.a ? profileB.color : 'var(--muted-foreground)' }}>{row.b}</span>
                      </div>
                      <Bar valueA={row.a} valueB={row.b} colorA={profileA.color} colorB={profileB.color} />
                    </div>
                  ))}
                </motion.div>

                {/* Race-by-race */}
                <motion.div className="card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                  <div className="card-header">
                    <span className="card-title">Race by Race</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-[var(--card-border)]">
                          <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Track</th>
                          <th className="text-center px-3 py-2 text-[9px]" style={{ ...F1_FONT, color: profileA.color }}>{profileA.name}</th>
                          <th className="text-center px-3 py-2 text-[9px]" style={{ ...F1_FONT, color: profileB.color }}>{profileB.name}</th>
                          <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Winner</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.races.map((r: any, i: number) => {
                          const aWon = r.a.position && r.b.position && r.a.position < r.b.position;
                          const bWon = r.a.position && r.b.position && r.b.position < r.a.position;
                          return (
                            <tr key={r.sessionId} className="border-b border-[var(--card-border)] hover:bg-white/[0.03]">
                              <td className="px-4 py-2.5">
                                <div className="font-semibold">{TRACK_NAMES[r.trackId] || `Track ${r.trackId}`}</div>
                                <div className="text-[9px] text-[var(--muted-foreground)]">{SESSION_TYPES[r.sessionType]} · {new Date(r.createdAt).toLocaleDateString()}</div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="font-mono font-bold" style={aWon ? { color: profileA.color } : undefined}>
                                  {r.a.position ? `P${r.a.position}` : '—'}
                                </span>
                                <div className="text-[9px] text-[var(--muted-foreground)]">+{r.a.points}pts</div>
                              </td>
                              <td className="px-3 py-2.5 text-center">
                                <span className="font-mono font-bold" style={bWon ? { color: profileB.color } : undefined}>
                                  {r.b.position ? `P${r.b.position}` : '—'}
                                </span>
                                <div className="text-[9px] text-[var(--muted-foreground)]">+{r.b.points}pts</div>
                              </td>
                              <td className="px-3 py-2.5 text-center font-bold text-xs" style={aWon ? { color: profileA.color } : bWon ? { color: profileB.color } : { color: 'var(--muted-foreground)' }}>
                                {aWon ? profileA.name : bWon ? profileB.name : '—'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function H2HPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" /></div>}>
      <H2HContent />
    </Suspense>
  );
}
