'use client';

import { motion } from 'framer-motion';
import { Trophy, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { formatLapTime } from '@/lib/utils';
import type { StandingsPlayer } from './StandingsTable';

const BMW_FONT = { fontFamily: 'var(--font-ui)' };

interface StandingsHighlightsProps {
  standings: StandingsPlayer[];
}

export default function StandingsHighlights({ standings }: StandingsHighlightsProps) {
  if (standings.length === 0) return null;

  const mostWins = [...standings].sort((a, b) => b.stats.wins - a.stats.wins)[0];
  const mostOvertakes = [...standings].sort((a, b) => b.stats.overtakes - a.stats.overtakes)[0];
  const mostCollisions = [...standings].sort((a, b) => b.stats.collisions - a.stats.collisions)[0];
  const fastestLap = [...standings]
    .filter((standing) => standing.stats.bestLapMs)
    .sort((a, b) => (a.stats.bestLapMs || 0) - (b.stats.bestLapMs || 0))[0];

  const cards = [
    {
      label: 'Most Wins',
      icon: <Trophy size={14} className="text-yellow-400" />,
      value: mostWins?.name,
      sub: mostWins ? `${mostWins.stats.wins} wins` : '—',
    },
    {
      label: 'Most Overtakes',
      icon: <TrendingUp size={14} className="text-[var(--green)]" />,
      value: mostOvertakes?.name,
      sub: mostOvertakes ? `${mostOvertakes.stats.overtakes} overtakes` : '—',
    },
    {
      label: 'Most Collisions',
      icon: <AlertTriangle size={14} className="text-[var(--f1-red)]" />,
      value: mostCollisions?.name,
      sub: mostCollisions ? `${mostCollisions.stats.collisions} collisions` : '—',
    },
    {
      label: 'Fastest Lap',
      icon: <Zap size={14} className="text-[var(--purple)]" />,
      value: fastestLap?.name,
      sub: fastestLap?.stats.bestLapMs ? formatLapTime(fastestLap.stats.bestLapMs) : '—',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
      {cards.map((card, index) => (
        <motion.div key={card.label} className="card p-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + index * 0.05 }}>
          <div className="flex items-center gap-2 mb-2">
            {card.icon}
            <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>{card.label}</span>
          </div>
          <div className="font-bold text-sm truncate" style={BMW_FONT}>{card.value || '—'}</div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{card.sub}</div>
        </motion.div>
      ))}
    </div>
  );
}
