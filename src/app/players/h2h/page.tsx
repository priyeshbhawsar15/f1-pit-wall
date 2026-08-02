'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Flag, Swords, Trophy } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { useResource } from '@/hooks/useResource';
import type { HumanProfile } from '@/lib/frontend-types';
import { formatDate, formatLapTime, sessionName, trackName } from '@/lib/presentation';

interface H2HData {
  profileA: HumanProfile;
  profileB: HumanProfile;
  sharedRaces: number;
  stats: Record<'a' | 'b', { wins: number; podiums: number; points: number; collisions: number; overtakesOn: number; fastestLaps: number }>;
  races: Array<{ sessionId: string; trackId: number; sessionType: number; createdAt: string; a: { position: number | null; points: number; bestLapMs: number }; b: { position: number | null; points: number; bestLapMs: number } }>;
}

function H2HContent() {
  const params = useSearchParams();
  const profiles = useResource<HumanProfile[]>('/api/players', []);
  const [a, setA] = useState(params.get('a') || '');
  const [b, setB] = useState(params.get('b') || '');
  const url = a && b && a !== b ? `/api/players/h2h?a=${encodeURIComponent(a)}&b=${encodeURIComponent(b)}` : null;
  const matchup = useResource<H2HData>(url);

  useEffect(() => {
    if (!a && profiles.data?.[0]) setA(profiles.data[0].id);
    if (!b && profiles.data?.[1]) setB(profiles.data[1].id);
  }, [a, b, profiles.data]);

  const data = matchup.data;
  return <div className="page-shell">
    <PageIntro title="Head to Head" description="A rivalry ledger, not a pile of disconnected stats. See the scoreline, decisive advantages, and every race the two drivers shared." backHref="/players" meta={<StatusPill tone="warning">Shared history</StatusPill>} />
    <Surface title="Choose the grid" caption="Select two distinct driver profiles" className="h2h-selector"><div className="h2h-selectors"><label>Driver one<select className="input" value={a} onChange={(event) => setA(event.target.value)}><option value="">Select driver</option>{profiles.data?.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label><Swords aria-hidden="true" /><label>Driver two<select className="input" value={b} onChange={(event) => setB(event.target.value)}><option value="">Select driver</option>{profiles.data?.map((profile) => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label></div></Surface>
    {profiles.loading || matchup.loading ? <LoadingState label="Building rivalry" /> : profiles.error ? <ErrorState message={profiles.error} onRetry={profiles.reload} /> : a === b && a ? <EmptyState title="Pick two different drivers" message="A driver cannot race themselves in the rivalry ledger." /> : !url ? <EmptyState title="The grid needs two drivers" message="Create or select two profiles to compare their shared results." action={<Link className="button" href="/players">Manage profiles</Link>} /> : matchup.error ? <ErrorState message={matchup.error} onRetry={matchup.reload} /> : data && <>
      <section className="h2h-scoreboard">
        <article><Avatar name={data.profileA.name} color={data.profileA.color} src={data.profileA.avatarUrl} size="lg" /><h2>{data.profileA.name}</h2><strong>{data.stats.a.wins}</strong><span>race wins</span></article>
        <div className="h2h-spine"><span>{data.sharedRaces} shared races</span><b>{data.stats.a.points}<small>PTS</small>{data.stats.b.points}</b><em>{data.stats.a.points === data.stats.b.points ? 'Level on points' : `${data.stats.a.points > data.stats.b.points ? data.profileA.name : data.profileB.name} leads the rivalry`}</em></div>
        <article><Avatar name={data.profileB.name} color={data.profileB.color} src={data.profileB.avatarUrl} size="lg" /><h2>{data.profileB.name}</h2><strong>{data.stats.b.wins}</strong><span>race wins</span></article>
      </section>
      <div className="h2h-metrics"><Stat label="Podiums" value={`${data.stats.a.podiums} — ${data.stats.b.podiums}`} /><Stat label="Passes on rival" value={`${data.stats.a.overtakesOn} — ${data.stats.b.overtakesOn}`} /><Stat label="Fastest laps" value={`${data.stats.a.fastestLaps} — ${data.stats.b.fastestLaps}`} /><Stat label="Shared collisions" value={Math.max(data.stats.a.collisions, data.stats.b.collisions)} /></div>
      <Surface title="Shared race ledger" caption="Every encounter links back to its replay">
        {data.races.length ? <div className="race-ledger">{[...data.races].reverse().map((race) => <Link key={race.sessionId} href={`/sessions/${race.sessionId}`} className="race-ledger-row"><Flag /><div><strong>{trackName(race.trackId)}</strong><span>{sessionName(race.sessionType)} · {formatDate(race.createdAt)}</span></div><div className="race-result"><span>{data.profileA.name}</span><b>P{race.a.position || '—'}</b><small>{formatLapTime(race.a.bestLapMs)}</small></div><div className="race-result"><span>{data.profileB.name}</span><b>P{race.b.position || '—'}</b><small>{formatLapTime(race.b.bestLapMs)}</small></div><ArrowRight /></Link>)}</div> : <EmptyState title="No shared races yet" message="Assign both profiles to the same historical session and this rivalry will start recording." />}
      </Surface>
    </>}
  </div>;
}

export default function HeadToHeadPage() { return <Suspense fallback={<div className="page-shell"><LoadingState /></div>}><H2HContent /></Suspense>; }
