'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import AppHeader from '@/components/AppHeader';
import StandingsTable, { type StandingsPlayer } from '@/components/StandingsTable';
import StandingsHighlights from '@/components/StandingsHighlights';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface Season { id: string; name: string; isActive: boolean; }

export default function StandingsPage() {
  const [standings, setStandings] = useState<StandingsPlayer[]>([]);
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

  return (
    <div className="min-h-screen">
      <AppHeader title="STANDINGS" />

      <div className="max-w-6xl mx-auto p-6">
        {/* Filters */}
        <motion.div className="card p-4 mb-6 flex flex-wrap items-end gap-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>Season</label>
            <select
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]"
            >
              <option value="">All Sessions</option>
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>{s.name}{s.isActive ? ' ●' : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]" />
          </div>
          <div>
            <label className="block text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] mb-1" style={BMW_FONT}>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="bg-[var(--surface)] border border-[var(--card-border)] rounded-sm px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--m-blue-dark)]" />
          </div>
          <button
            onClick={loadStandings}
            className="flex items-center gap-2 bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 text-white text-xs font-bold px-4 py-1.5 rounded-sm transition-colors"
            style={BMW_FONT}
          >
            <Filter size={12} /> Apply
          </button>
          {(seasonId || from || to) && (
            <button onClick={() => { setSeasonId(''); setFrom(''); setTo(''); }} className="text-xs text-[var(--muted-foreground)] hover:text-white transition-colors">Clear</button>
          )}
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : standings.length === 0 ? (
          <StandingsTable standings={standings} />
        ) : (
          <StandingsTable standings={standings} />
        )}

        {/* Quick stat cards */}
        {!loading && standings.length > 0 && (
          <StandingsHighlights standings={standings} />
        )}
      </div>
    </div>
  );
}
