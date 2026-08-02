'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Filter, Trophy } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { useResource } from '@/hooks/useResource';
import type { SeasonSummary, StandingsPlayer } from '@/lib/frontend-types';
import { formatLapTime } from '@/lib/presentation';

export default function StandingsPage() {
  const seasons = useResource<SeasonSummary[]>('/api/seasons', []);
  const [filters, setFilters] = useState({ seasonId: '', from: '', to: '' });
  const [applied, setApplied] = useState(filters);
  const query = new URLSearchParams(Object.entries(applied).filter(([, value]) => value));
  const standings = useResource<StandingsPlayer[]>(`/api/standings?${query}`, []);
  const leader = standings.data?.[0];

  return <div className="page-shell">
    <PageIntro title="Championship Order" description="A points ledger that keeps the rivalry readable. Filter the archive by season or dates, then open any driver’s record." meta={<>{leader && <StatusPill tone="live">Leader · {leader.name}</StatusPill>}<StatusPill tone="blue">{standings.data?.length || 0} classified drivers</StatusPill></>} />
    <Surface title="Championship scope" caption="Filter only when the question changes" className="filter-surface"><form className="filter-row" onSubmit={(event) => { event.preventDefault(); setApplied(filters); }}><label>Season<select className="input" value={filters.seasonId} onChange={(event) => setFilters({ ...filters, seasonId: event.target.value })}><option value="">All sessions</option>{seasons.data?.map((season) => <option key={season.id} value={season.id}>{season.name}</option>)}</select></label><label>From<input className="input" type="date" value={filters.from} onChange={(event) => setFilters({ ...filters, from: event.target.value })} /></label><label>To<input className="input" type="date" value={filters.to} onChange={(event) => setFilters({ ...filters, to: event.target.value })} /></label><button className="button"><Filter />Apply scope</button></form></Surface>
    {standings.loading ? <LoadingState label="Calculating standings" /> : standings.error ? <ErrorState message={standings.error} onRetry={standings.reload} /> : standings.data?.length ? <>
      <div className="standings-leaders">{standings.data.slice(0, 3).map((player, index) => <Link href={`/players/${player.id}`} key={player.id} className={`leader-block place-${index + 1}`}><span>P{index + 1}</span><Avatar name={player.name} color={player.color} src={player.avatarUrl} size={index === 0 ? 'lg' : 'md'} /><div><strong>{player.name}</strong><small>{player.stats.wins} wins · {player.stats.podiums} podiums</small></div><b>{player.stats.points}<small>PTS</small></b></Link>)}</div>
      <Surface title="Full standings" caption="Points first; race texture stays one click away"><div className="ledger-scroll"><table className="data-ledger"><thead><tr><th>Pos</th><th>Driver</th><th>Points</th><th>Wins</th><th>Podiums</th><th>Avg finish</th><th>Best lap</th><th>Incidents</th></tr></thead><tbody>{standings.data.map((player, index) => <tr key={player.id}><td className="rank">{index + 1}</td><td><Link className="identity" href={`/players/${player.id}`}><Avatar name={player.name} color={player.color} src={player.avatarUrl} size="sm" /><span><strong>{player.name}</strong><small>{player.stats.races} races</small></span></Link></td><td><Stat label="" value={player.stats.points} /></td><td className="tabular">{player.stats.wins}</td><td className="tabular">{player.stats.podiums}</td><td className="tabular">{player.stats.avgPosition ?? '—'}</td><td className="tabular">{formatLapTime(player.stats.bestLapMs)}</td><td className="tabular">{player.stats.collisions + player.stats.penalties}</td></tr>)}</tbody></table></div></Surface>
    </> : <EmptyState title="No championship data" message="Assign driver profiles to classified sessions to populate the standings." action={<Link className="button" href="/sessions">Review sessions</Link>} />}
  </div>;
}
