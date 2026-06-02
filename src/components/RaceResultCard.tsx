'use client';

import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { TRACK_FLAGS, TRACK_NAMES, SESSION_TYPES, RESULT_STATUS } from '@/lib/constants';

export interface RaceResultCardPlayer {
  id: string;
  name: string;
  color: string;
  avatarUrl?: string | null;
  position: number | null;
  points: number;
  resultStatus?: number | null;
}

interface RaceResultCardProps {
  trackId: number;
  sessionType: number;
  createdAt: string;
  players: RaceResultCardPlayer[];
  details?: ReactNode;
  badge?: ReactNode;
  trailing?: ReactNode;
  action?: ReactNode;
  href?: string;
  emptyPlayersText?: string;
  className?: string;
}

export default function RaceResultCard({
  trackId,
  sessionType,
  createdAt,
  players,
  details,
  badge,
  trailing,
  action,
  href,
  emptyPlayersText = 'No linked players',
  className = '',
}: RaceResultCardProps) {
  const router = useRouter();
  const clickable = Boolean(href);

  return (
    <div
      className={`card p-3 group ${clickable ? 'cursor-pointer hover:border-[var(--m-blue-dark)] transition-all' : ''} ${className}`.trim()}
      onClick={clickable ? () => router.push(href!) : undefined}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 bg-[var(--surface-elevated)]" style={{ borderRadius: 0 }}>
          {badge || (
            <span className="text-[30px] leading-none scale-[1.15]" role="img" aria-label={TRACK_NAMES[trackId] || `Track ${trackId}`}>
              {TRACK_FLAGS[trackId] || '🏁'}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">{TRACK_NAMES[trackId] || `Track ${trackId}`}</span>
            <span className="text-xs text-[var(--muted-foreground)]">{SESSION_TYPES[sessionType] || 'Unknown'}</span>
          </div>
          <div className="text-[10px] text-[var(--muted-foreground)] mt-1">
            {details || new Date(createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </div>
          <div className="mt-2">
            {players.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {players.map((player) => {
                  const positionColor = player.position === 1 ? '#FFD700' : player.position === 2 ? '#C0C0C0' : player.position === 3 ? '#CD7F32' : undefined;
                  const statusLabel = player.position ? `P${player.position}` : (player.resultStatus ? RESULT_STATUS[player.resultStatus] || '—' : '—');
                  return (
                    <div key={player.id} className="flex items-center gap-2 px-2 py-1 bg-[var(--surface)] border border-[var(--card-border)] min-w-[120px]" style={{ borderRadius: 0 }}>
                      <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center text-[8px] font-black text-white" style={{ backgroundColor: player.color }}>
                        {player.avatarUrl
                          ? <img src={player.avatarUrl} alt={player.name} className="w-full h-full object-cover" />
                          : player.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold truncate">{player.name}</div>
                        <div className="text-[9px] font-mono text-[var(--muted-foreground)]">{player.points} pts</div>
                      </div>
                      <div className="text-[10px] font-black font-mono" style={positionColor ? { color: positionColor } : undefined}>
                        {statusLabel}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-[10px] text-[var(--muted-foreground)]">{emptyPlayersText}</div>
            )}
          </div>
        </div>
        {trailing}
        {action}
      </div>
    </div>
  );
}
