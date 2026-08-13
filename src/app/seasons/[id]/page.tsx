'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Flag, Trophy, X } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { requestJson, useResource } from '@/hooks/useResource';
import type { SeasonDetail, SessionRow, StandingsPlayer } from '@/lib/frontend-types';
import { formatDate, sessionName, trackName } from '@/lib/presentation';

export default function SeasonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const season = useResource<SeasonDetail>(`/api/seasons/${id}`);
  const standings = useResource<StandingsPlayer[]>(`/api/standings?seasonId=${id}`, []);
  const sessions = useResource<SessionRow[]>('/api/sessions', []);

  if (season.loading) return <div className="page-shell"><LoadingState label="Loading season" /></div>;
  if (season.error || !season.data) return <div className="page-shell"><ErrorState message={season.error || 'Season not found'} onRetry={season.reload} /></div>;
  const data = season.data;
  const linked = new Set(data.races.map((race) => race.session.id));
  const available = sessions.data?.filter((session) => !linked.has(session.id)) || [];

  async function addRace(sessionId: string) { await requestJson(`/api/seasons/${id}/races`, { method: 'POST', body: JSON.stringify({ sessionIds: [sessionId] }) }); await season.reload(); await standings.reload(); }
  async function removeRace(sessionId: string) { await requestJson(`/api/seasons/${id}/races?sessionId=${sessionId}`, { method: 'DELETE' }); await season.reload(); await standings.reload(); }

  return <div className="page-shell">
    <PageIntro title={data.name} description="One championship, one readable arc: current order first, then the race calendar that produced it." backHref="/seasons" meta={<><StatusPill tone={data.isActive ? 'live' : 'neutral'}>{data.isActive ? 'Active season' : 'Archived season'}</StatusPill><StatusPill tone="blue">{data.races.length} rounds</StatusPill></>} />
    <div className="season-hero"><div><span>Championship window</span><strong>{formatDate(data.startDate)} — {formatDate(data.endDate)}</strong></div><div><span>Completed rounds</span><strong>{data.races.length}</strong></div><div><span>Leader</span><strong>{standings.data?.[0]?.name || 'Unclassified'}</strong></div></div>
    <div className="two-col">
      <Surface title="Season standings" caption="Points earned only in linked rounds">{standings.loading ? <LoadingState label="Calculating championship" /> : standings.error ? <ErrorState message={standings.error} onRetry={standings.reload} /> : standings.data?.length ? <div className="season-standings">{standings.data.map((player, index) => <Link href={`/players/${player.id}`} key={player.id}><b>P{index + 1}</b><Avatar name={player.name} color={player.color} src={player.avatarUrl} size="sm" /><span><strong>{player.name}</strong><small>{player.stats.wins} wins · {player.stats.podiums} podiums</small></span><em>{player.stats.points} pts</em></Link>)}</div> : <EmptyState title="No points yet" message="Link classified sessions to begin the championship." />}</Surface>
      <Surface title="Add a round" caption="Unlinked sessions from the race archive">{available.length ? <div className="available-races">{available.slice(0, 8).map((session) => <button key={session.id} onClick={() => addRace(session.id)}><Flag /><span><strong>{trackName(session.trackId)}</strong><small>{sessionName(session.sessionType)} · {formatDate(session.createdAt)}</small></span><b>+ Add</b></button>)}</div> : <div className="quiet-message">Every available session is already linked to this season.</div>}</Surface>
    </div>
    <Surface title="Race calendar" caption="Each round opens directly into its map-dominant replay" className="calendar-surface">{data.races.length ? <div className="calendar-list">{data.races.map((race, index) => <article key={race.session.id}><span className="round-number">R{index + 1}</span><div><strong>{trackName(race.session.trackId)}</strong><small>{sessionName(race.session.sessionType)} · {formatDate(race.session.createdAt)}</small></div><div className="calendar-winner"><Trophy />{race.session.finalClassifications.sort((a,b) => a.position - b.position)[0]?.position === 1 ? race.session.participants.find((p) => p.carIndex === race.session.finalClassifications.sort((a,b) => a.position - b.position)[0].carIndex)?.name || 'Winner recorded' : 'Result pending'}</div><button className="button button-danger button-icon" aria-label={`Remove ${trackName(race.session.trackId)} from season`} onClick={() => removeRace(race.session.id)}><X /></button><Link className="button" href={`/sessions/${race.session.id}?uid=${race.session.sessionUID}`}>Replay<ArrowRight /></Link></article>)}</div> : <EmptyState title="Calendar is empty" message="Add sessions from the archive to build the season timeline." />}</Surface>
  </div>;
}
