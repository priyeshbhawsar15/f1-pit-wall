'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Radio, History, Trophy, Zap, AlertTriangle, TrendingUp, Users, Filter } from 'lucide-react';
import { formatLapTime } from '@/lib/utils';

const F1_FONT = { fontFamily: "'F1', 'Arial Black', sans-serif" };

interface Season { id: string; name: string; isActive: boolean; }
interface PlayerStanding {
  id: string; name: string; color: string; avatarUrl: string | null;
  stats: {
    races: number; points: number; wins: number; podiums: number; dnfs: number;
    collisions: number; overtakes: number; fastestLaps: number; penalties: number;
    penaltySeconds: number; pitStops: number; avgPosition: number | null; bestLapMs: number | null;
  };
}

export default function StandingsPage() {
  const [standings, setStandings] = useState<PlayerStanding[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasonId, setSeasonId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  async function loadStandings() {
    setLoading(true);
    const params = new URLSearchParams();
    if (seasonId) params.set('seasonId', seasonId);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    const res = await fetch(`/api/standings?${params}`);
    const data = await res.json();
    if (Array.isArray(data)) setStandings(data);
    setLoading(false);
  }

  useEffect(() => {
    fetch('/api/seasons').then((r) => r.json()).then((data) => {
      if (Array.isArray(data)) setSeasons(data);
    });
    loadStandings();
  }, []);

  const COLUMNS = [
    { key: 'points', label: 'PTS', color: undefined },
    { key: 'wins', label: 'Wins', color: '#FFD700' },
    { key: 'podiums', label: 'Podiums', color: undefined },
    { key: 'dnfs', label: 'DNFs', color: 'var(--f1-red)' },
    { key: 'overtakes', label: 'Overtakes', color: 'var(--green)' },
    { key: 'collisions', label: 'Collisions', color: 'var(--f1-red)' },
    { key: 'fastestLaps', label: 'FL', color: 'var(--purple)' },
    { key: 'penalties', label: 'Pens', color: 'var(--yellow)' },
    { key: 'avgPosition', label: 'Avg Pos', color: undefined },
  ] as const;

  return (
    <div className="min-h-screen">
      <div className="red-bar" />
      <header className="f1-header flex items-center gap-3 px-6 py-3">
        <span className="f1-logo-text">F1</span>
        <span className="text-[10px] font-bold text-[var(--muted-foreground)] tracking-[0.15em] uppercase" style={F1_FONT}>
          Standings
        </span>
        <div className="ml-auto flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"><Radio size={12} /> Live</Link>
          <Link href="/sessions" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"><History size={12} /> History</Link>
          <Link href="/players" className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)] hover:text-white transition-colors"><Users size={12} /> Players</Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <motion.div className="card p-4 mb-6 flex flex-wrap items-end gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>Season</label>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">All Sessions</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.isActive ? ' ●' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={F1_FONT}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent)]" />
          </div>
          <button
            onClick={loadStandings}
            className="flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-dim)] text-white text-xs font-bold px-4 py-1.5 rounded-sm transition-colors"
            style={F1_FONT}
          >
            <Filter size={12} /> Apply
          </button>
          {(seasonId || from || to) && (
            <button onClick={() => { setSeasonId(''); setFrom(''); setTo(''); }} className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">Clear</button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : standings.length === 0 ? (
          <div className="card p-12 text-center">
            <Trophy size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No standings yet</h3>
            <p className="text-sm text-[var(--muted-foreground)]">
              Create player profiles and assign them to sessions to see standings.
            </p>
          </div>
        ) : (
          <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <div className="card-header">
              <span className="card-title">Driver Championship</span>
              <span className="text-[9px] text-[var(--muted)]">{standings.length} players</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[var(--card-border)]">
                    <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] w-8" style={F1_FONT}>#</th>
                    <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Driver</th>
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Races</th>
                    {COLUMNS.map((c) => (
                      <th key={c.key} className="text-center px-3 py-2 text-[9px] uppercase tracking-wider" style={{ ...F1_FONT, color: c.color || 'var(--muted-foreground)' }}>{c.label}</th>
                    ))}
                    <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>Best Lap</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((p, i) => {
                    const posColor = i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : undefined;
                    return (
                      <motion.tr
                        key={p.id}
                        className="border-b border-[var(--card-border)] hover:bg-white/[0.03] transition-colors cursor-pointer"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        onClick={() => window.location.href = `/players/${p.id}`}
                      >
                        <td className="px-4 py-3">
                          <span className="text-sm font-black font-mono tabular-nums" style={posColor ? { color: posColor } : { color: 'var(--muted-foreground)' }}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-black text-white"
                              style={{ backgroundColor: p.color }}>
                              {p.avatarUrl
                                ? <img src={p.avatarUrl} alt={p.name} className="w-full h-full object-cover" />
                                : p.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold" style={F1_FONT}>{p.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-center text-[var(--muted-foreground)] font-mono">{p.stats.races}</td>
                        {COLUMNS.map((c) => {
                          const val = p.stats[c.key as keyof typeof p.stats];
                          return (
                            <td key={c.key} className="px-3 py-3 text-center font-mono font-bold tabular-nums"
                              style={c.color ? { color: c.color } : undefined}>
                              {val ?? '—'}
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center font-mono text-[var(--purple)]">
                          {p.stats.bestLapMs ? formatLapTime(p.stats.bestLapMs) : '—'}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Quick stat cards */}
        {!loading && standings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Most Wins', icon: <Trophy size={14} className="text-yellow-400" />, value: standings.sort((a,b) => b.stats.wins - a.stats.wins)[0]?.name, sub: `${standings[0]?.stats.wins} wins` },
              { label: 'Most Overtakes', icon: <TrendingUp size={14} className="text-[var(--green)]" />, value: [...standings].sort((a,b) => b.stats.overtakes - a.stats.overtakes)[0]?.name, sub: `${[...standings].sort((a,b) => b.stats.overtakes - a.stats.overtakes)[0]?.stats.overtakes} overtakes` },
              { label: 'Most Collisions', icon: <AlertTriangle size={14} className="text-[var(--f1-red)]" />, value: [...standings].sort((a,b) => b.stats.collisions - a.stats.collisions)[0]?.name, sub: `${[...standings].sort((a,b) => b.stats.collisions - a.stats.collisions)[0]?.stats.collisions} collisions` },
              { label: 'Fastest Lap', icon: <Zap size={14} className="text-[var(--purple)]" />, value: [...standings].filter(s => s.stats.bestLapMs).sort((a,b) => (a.stats.bestLapMs||0) - (b.stats.bestLapMs||0))[0]?.name, sub: [...standings].filter(s => s.stats.bestLapMs).sort((a,b) => (a.stats.bestLapMs||0) - (b.stats.bestLapMs||0))[0]?.stats.bestLapMs ? formatLapTime([...standings].filter(s => s.stats.bestLapMs).sort((a,b) => (a.stats.bestLapMs||0) - (b.stats.bestLapMs||0))[0].stats.bestLapMs!) : '—' },
            ].map((card, i) => (
              <motion.div key={card.label} className="card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                <div className="flex items-center gap-2 mb-2">{card.icon}<span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={F1_FONT}>{card.label}</span></div>
                <div className="font-bold text-sm truncate" style={F1_FONT}>{card.value || '—'}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{card.sub}</div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
