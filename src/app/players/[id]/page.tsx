'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight, Flag, Swords } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { useResource } from '@/hooks/useResource';
import type { HumanProfile, StandingsPlayer } from '@/lib/frontend-types';
import { formatDate, formatLapTime, sessionName, trackName } from '@/lib/presentation';

interface ProfileDetail extends HumanProfile {
  participants: Array<{ carIndex: number; session: { id: string; trackId: number; sessionType: number; createdAt: string; finalClassifications: Array<{ carIndex: number; position: number; points: number; bestLapTimeInMS: number }> } }>;
}

export default function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const profile = useResource<ProfileDetail>(`/api/players/${id}`);
  const standings = useResource<StandingsPlayer[]>('/api/standings', []);
  const records = useResource<Array<{ trackId: number; bestLapMs: number; sessionId: string }>>(`/api/players/track-records?profileId=${id}`, []);
  const standing = standings.data?.find((item) => item.id === id);

  if (profile.loading) return <div className="page-shell"><LoadingState label="Loading driver record" /></div>;
  if (profile.error || !profile.data) return <div className="page-shell"><ErrorState message={profile.error || 'Driver not found'} onRetry={profile.reload} /></div>;
  const driver = profile.data;

  return <div className="page-shell">
    <PageIntro title={driver.name} description="Career trajectory, race craft, and the sessions that built it. Open any entry to return to the track and replay the story." backHref="/players" meta={<><StatusPill tone="blue">{standing?.stats.races || driver.participants.length} races</StatusPill>{records.data?.length ? <StatusPill tone="live">{records.data.length} track records</StatusPill> : null}</>} actions={<Link className="button button-quiet" href={`/players/h2h?a=${id}`}><Swords />Build matchup</Link>} />
    <section className="profile-stage" style={{ '--profile-color': driver.color } as React.CSSProperties}><Avatar name={driver.name} color={driver.color} src={driver.avatarUrl} size="lg" /><div><span>Driver identity</span><h2>{driver.name}</h2><p>{driver._count?.participants || driver.participants.length} participant assignments connect this profile to the archive.</p></div><div className="profile-number">{driver.name.slice(0, 3).toUpperCase()}</div></section>
    {standings.error ? <ErrorState message={standings.error} onRetry={standings.reload} /> : <div className="career-grid"><Stat label="Career points" value={standing?.stats.points ?? 0} /><Stat label="Wins" value={standing?.stats.wins ?? 0} /><Stat label="Podiums" value={standing?.stats.podiums ?? 0} /><Stat label="Average finish" value={standing?.stats.avgPosition ?? '—'} /><Stat label="Overtakes" value={standing?.stats.overtakes ?? 0} /><Stat label="Best lap" value={formatLapTime(standing?.stats.bestLapMs)} /></div>}
    <div className="two-col">
      <Surface title="Race record" caption="Newest classified sessions first">{standing?.races?.length ? <div className="race-ledger">{standing.races.map((race) => <Link key={race.sessionId} className="player-race-row" href={`/sessions/${race.sessionId}`}><Flag /><div><strong>{trackName(race.trackId)}</strong><span>{sessionName(race.sessionType)} · {formatDate(race.createdAt)}</span></div><b>P{race.position ?? '—'}</b><small>{race.points} pts</small><ArrowRight /></Link>)}</div> : <EmptyState title="No classified races" message="Assign this profile to session participants to build their record." action={<Link className="button" href="/sessions">Open session archive</Link>} />}</Surface>
      <Surface title="Circuit benchmarks" caption="Fastest personal laps by track">{records.loading ? <LoadingState label="Loading track records" /> : records.data?.length ? <div className="record-list">{records.data.map((record) => <Link key={`${record.trackId}-${record.sessionId}`} href={`/sessions/${record.sessionId}`}><span>{trackName(record.trackId)}</span><strong>{formatLapTime(record.bestLapMs)}</strong></Link>)}</div> : <div className="quiet-message">No personal track records have been captured yet.</div>}</Surface>
    </div>
  </div>;
}
