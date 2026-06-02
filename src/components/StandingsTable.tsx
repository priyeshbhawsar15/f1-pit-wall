'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { formatLapTime } from '@/lib/utils';

const BMW_FONT = { fontFamily: 'var(--font-ui)' };

export interface StandingsPlayerStats {
  races: number;
  points: number;
  wins: number;
  podiums: number;
  dnfs: number;
  collisions: number;
  overtakes: number;
  fastestLaps: number;
  penalties: number;
  penaltySeconds: number;
  pitStops: number;
  avgPosition: number | null;
  bestLapMs: number | null;
}

export interface StandingsPlayer {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
  stats: StandingsPlayerStats;
}

export const STANDINGS_COLUMNS = [
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

interface StandingsTableProps {
  standings: StandingsPlayer[];
  headerTitle?: string;
  emptyTitle?: string;
  emptyMessage?: string;
}

export default function StandingsTable({
  standings,
  headerTitle = 'Driver Championship',
  emptyTitle = 'No standings yet',
  emptyMessage = 'Create player profiles and assign them to sessions to see standings.',
}: StandingsTableProps) {
  if (standings.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Trophy size={32} className="text-[var(--muted)] mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-1">{emptyTitle}</h3>
        <p className="text-sm text-[var(--muted-foreground)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
      <div className="card-header">
        <span className="card-title">{headerTitle}</span>
        <span className="text-[9px] text-[var(--muted)]">{standings.length} players</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--card-border)]">
              <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)] w-8" style={BMW_FONT}>#</th>
              <th className="text-left px-4 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Driver</th>
              <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Races</th>
              {STANDINGS_COLUMNS.map((column) => (
                <th key={column.key} className="text-center px-3 py-2 text-[9px] uppercase tracking-wider" style={{ ...BMW_FONT, color: column.color || 'var(--muted-foreground)' }}>
                  {column.label}
                </th>
              ))}
              <th className="text-center px-3 py-2 text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Best Lap</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((player, index) => {
              const positionColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : undefined;
              return (
                <motion.tr
                  key={player.id}
                  className="border-b border-[var(--card-border)] hover:bg-white/[0.03] transition-colors cursor-pointer"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  onClick={() => { window.location.href = `/players/${player.id}`; }}
                >
                  <td className="px-4 py-3">
                    <span className="text-sm font-black font-mono tabular-nums" style={positionColor ? { color: positionColor } : { color: 'var(--muted-foreground)' }}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-xs font-black text-white" style={{ backgroundColor: player.color }}>
                        {player.avatarUrl
                          ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                          : player.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold" style={BMW_FONT}>{player.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-center text-[var(--muted-foreground)] font-mono">{player.stats.races}</td>
                  {STANDINGS_COLUMNS.map((column) => {
                    const value = player.stats[column.key as keyof StandingsPlayerStats];
                    return (
                      <td key={column.key} className="px-3 py-3 text-center font-mono font-bold tabular-nums" style={column.color ? { color: column.color } : undefined}>
                        {value ?? '—'}
                      </td>
                    );
                  })}
                  <td className="px-3 py-3 text-center font-mono text-[var(--purple)]">
                    {player.stats.bestLapMs ? formatLapTime(player.stats.bestLapMs) : '—'}
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
