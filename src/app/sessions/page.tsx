'use client';

import Link from 'next/link';
import { ArrowRight, Flag, MapPin, Trash2 } from 'lucide-react';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { requestJson, useResource } from '@/hooks/useResource';
import type { SessionRow } from '@/lib/frontend-types';
import { formatDate, sessionName, trackFlag, trackName, weatherName } from '@/lib/presentation';
import { useState } from 'react';

export default function SessionsPage() {
  const sessions = useResource<SessionRow[]>('/api/sessions', []);
  const [error, setError] = useState<string | null>(null);
  const tracks = new Set(sessions.data?.map((session) => session.trackId) || []);
  const events = sessions.data?.reduce((sum, session) => sum + (session._count?.events || 0), 0) || 0;

  async function removeSession(session: SessionRow) {
    if (!window.confirm(`Delete ${trackName(session.trackId)} from the archive? Replay samples and season links will also be removed.`)) return;
    setError(null);
    try { await requestJson(`/api/sessions/${session.id}`, { method: 'DELETE' }); await sessions.reload(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Session could not be deleted'); }
  }

  return <div className="page-shell">
    <PageIntro title="Race Archive" description="Completed sessions arranged as replay entry points. Find the player result first, then return to the map, timeline, and race context." meta={<><StatusPill tone="blue">{sessions.data?.length || 0} sessions</StatusPill><StatusPill>{tracks.size} circuits</StatusPill><StatusPill tone="warning">{events} moments</StatusPill></>} />
    {error && <div className="inline-error">{error}</div>}
    <Surface title="Session ledger" caption="Most recent telemetry first">
      {sessions.loading ? <LoadingState label="Loading archive" /> : sessions.error ? <ErrorState message={sessions.error} onRetry={sessions.reload} /> : sessions.data?.length ? <div className="session-list">{sessions.data.map((session) => {
        const humans = session.participants.filter((participant) => participant.humanProfile).slice(0, 2);
        return <article className="session-row" key={session.id}><div className="session-track"><span className="track-flag">{trackFlag(session.trackId)}</span><div><strong>{trackName(session.trackId)}</strong><small>{sessionName(session.sessionType)} · {formatDate(session.createdAt)}</small></div></div><div className="session-racers">{humans.length ? humans.map((participant) => { const result = session.finalClassifications.find((item) => item.carIndex === participant.carIndex); const profile = participant.humanProfile!; return <div key={participant.carIndex}><Avatar name={profile.name} color={profile.color} src={profile.avatarUrl} size="sm" /><span><strong>{profile.name}</strong><small>P{result?.position || '—'} · {result?.points || 0} pts</small></span></div>; }) : <span className="unassigned">Player profiles not assigned</span>}</div><div className="session-facts"><Stat label="Race distance" value={`${session.totalLaps || '—'} laps`} /><Stat label="Weather" value={weatherName(session.weather)} /><Stat label="Events" value={session._count?.events || 0} /></div><div className="session-actions"><button className="button button-danger button-icon" aria-label={`Delete ${trackName(session.trackId)} session`} onClick={() => removeSession(session)}><Trash2 /></button><Link className="button" href={`/sessions/${session.id}?uid=${session.sessionUID}`}>Replay<ArrowRight /></Link></div></article>;
      })}</div> : <EmptyState title="No sessions captured" message="Start the telemetry server and complete a session. The race archive will appear here automatically." action={<Link className="button" href="/"><MapPin />Open live theater</Link>} />}
    </Surface>
  </div>;
}
