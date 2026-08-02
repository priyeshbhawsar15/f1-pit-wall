'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Gauge, Pause, Play, RotateCcw, SkipBack, SkipForward, Timer } from 'lucide-react';
import { TrackStage } from '@/components/TrackStage';
import { Avatar, EmptyState, ErrorState, LoadingState, PageIntro, Stat, StatusPill, Surface } from '@/components/UI';
import { requestJson, useResource } from '@/hooks/useResource';
import type { HumanProfile, ReplayMotion, ReplayResponse, SessionEvent, SessionRow } from '@/lib/frontend-types';
import { cn, eventName, formatGap, formatLapTime, sessionName, trackName } from '@/lib/presentation';

const PAGE_SIZE = 400;

export default function ReplayPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessions = useResource<SessionRow[]>('/api/sessions', []);
  const profiles = useResource<HumanProfile[]>('/api/players', []);
  const moments = useResource<{ events: SessionEvent[]; participants: SessionRow['participants']; sessionCreatedAt: string }>(`/api/sessions/${id}/events`);
  const session = sessions.data?.find((item) => item.id === id) || null;
  const sessionUID = searchParams.get('uid') || session?.sessionUID || '';
  const [motion, setMotion] = useState<ReplayMotion[]>([]);
  const [lapData, setLapData] = useState<ReplayResponse['lapData']>([]);
  const [loadingReplay, setLoadingReplay] = useState(false);
  const [replayError, setReplayError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [frameIndex, setFrameIndex] = useState(0);
  const lastTick = useRef(0);

  const loadReplay = useCallback(async () => {
    if (!sessionUID) return;
    setLoadingReplay(true); setReplayError(null);
    try {
      let cursor: string | null = null;
      let allMotion: ReplayMotion[] = [];
      let allLaps: ReplayResponse['lapData'] = [];
      let more = true;
      let pages = 0;
      while (more && pages < 5) {
        const query = new URLSearchParams({ sessionUID, limitFrames: String(PAGE_SIZE) });
        if (cursor) query.set('cursor', cursor);
        const page: ReplayResponse = await requestJson(`/api/replay?${query}`);
        allMotion = allMotion.concat(page.motion);
        allLaps = allLaps.concat(page.lapData);
        cursor = page.nextCursor;
        more = page.hasMore;
        pages++;
      }
      setMotion(allMotion); setLapData(allLaps); setHasMore(more); setFrameIndex(0);
    } catch (caught) { setReplayError(caught instanceof Error ? caught.message : 'Replay could not be loaded'); }
    finally { setLoadingReplay(false); }
  }, [sessionUID]);

  useEffect(() => { void loadReplay(); }, [loadReplay]);

  const frameTimes = useMemo(() => Array.from(new Set(motion.map((row) => row.time))), [motion]);
  const participantList = moments.data?.participants || session?.participants || [];
  const humanParticipants = participantList.filter((item) => item.humanProfile || item.aiControlled === false).slice(0, 2);
  const primaryCarIndex = humanParticipants[0]?.carIndex ?? motion[0]?.car_index;
  const trackPoints = useMemo(() => {
    if (primaryCarIndex === undefined) return [];
    const points = motion.filter((row) => row.car_index === primaryCarIndex);
    const step = Math.max(1, Math.floor(points.length / 280));
    return points.filter((_, index) => index % step === 0).map((row) => ({ x: row.world_position_x, z: row.world_position_z }));
  }, [motion, primaryCarIndex]);
  useEffect(() => {
    if (!playing || frameTimes.length < 2) return;
    let request = 0;
    const tick = (time: number) => {
      if (!lastTick.current) lastTick.current = time;
      const interval = 100 / speed;
      if (time - lastTick.current >= interval) {
        setFrameIndex((current) => current >= frameTimes.length - 1 ? 0 : current + 1);
        lastTick.current = time;
      }
      request = requestAnimationFrame(tick);
    };
    request = requestAnimationFrame(tick);
    return () => { cancelAnimationFrame(request); lastTick.current = 0; };
  }, [frameTimes.length, playing, speed]);

  const currentTime = frameTimes[frameIndex];
  const cars = useMemo(() => motion.filter((row) => row.time === currentTime).map((row) => {
    const participant = session?.participants.find((item) => item.carIndex === row.car_index) || moments.data?.participants.find((item) => item.carIndex === row.car_index);
    const lap = [...lapData].reverse().find((item) => item.car_index === row.car_index && item.time <= row.time);
    return { i: row.car_index, x: row.world_position_x, z: row.world_position_z, name: participant?.humanProfile?.name || participant?.name || `Car ${row.car_index + 1}`, team: participant?.teamId, position: lap?.car_position, player: Boolean(participant?.humanProfile || participant?.aiControlled === false) };
  }), [currentTime, lapData, moments.data?.participants, motion, session?.participants]);
  const frameLaps = humanParticipants.map((participant) => [...lapData].reverse().find((item) => item.car_index === participant.carIndex && (!currentTime || item.time <= currentTime)));
  const humanGap = frameLaps.length === 2 && frameLaps[0] && frameLaps[1]
    ? Math.abs(frameLaps[0].delta_to_race_leader_ms - frameLaps[1].delta_to_race_leader_ms)
    : null;

  async function assign(carIndex: number, humanProfileId: string | null) {
    await requestJson(`/api/sessions/${id}/assign`, { method: 'PATCH', body: JSON.stringify({ carIndex, humanProfileId }) });
    await moments.reload(); await sessions.reload();
  }

  const initialLoading = sessions.loading || moments.loading || loadingReplay;
  if (initialLoading && !session && motion.length === 0) return <div className="page-shell"><LoadingState label="Loading race replay" /></div>;

  return <div className="page-shell page-shell-wide replay-page">
    <PageIntro title={session ? trackName(session.trackId) : 'Race Replay'} description={session ? `${sessionName(session.sessionType)} · ${session.totalLaps || '—'} laps. The map owns the viewport; the driver evidence follows below.` : 'Historical motion, event markers, and driver context on one race stage.'} backHref="/sessions" meta={<><StatusPill tone={motion.length ? 'live' : 'warning'}>{motion.length ? `${frameTimes.length} frames loaded` : 'No motion loaded'}</StatusPill>{hasMore && <StatusPill tone="blue">Previewing first 2,000 frames</StatusPill>}</>} />

    {replayError ? <ErrorState message={replayError} onRetry={loadReplay} /> : motion.length ? <>
      <section className="replay-theater">
        <TrackStage cars={cars} trackPoints={trackPoints} label="Historical race position" />
        <div className="replay-overlay-top">{humanParticipants.map((participant, index) => { const lap = frameLaps[index]; return <div key={participant.carIndex}><Avatar name={participant.humanProfile?.name || participant.name} color={participant.humanProfile?.color} src={participant.humanProfile?.avatarUrl} size="sm" /><span><strong>{participant.humanProfile?.name || participant.name}</strong><small>P{lap?.car_position || '—'} · L{lap?.current_lap_num || '—'} · {formatGap(lap?.delta_to_race_leader_ms)}</small></span></div>; })}</div>
        <div className="replay-controls"><button aria-label="Restart replay" onClick={() => setFrameIndex(0)}><RotateCcw /></button><button aria-label="Previous frame" onClick={() => setFrameIndex(Math.max(0, frameIndex - 1))}><SkipBack /></button><button className="play-button" aria-label={playing ? 'Pause replay' : 'Play replay'} onClick={() => setPlaying(!playing)}>{playing ? <Pause /> : <Play />}</button><button aria-label="Next frame" onClick={() => setFrameIndex(Math.min(frameTimes.length - 1, frameIndex + 1))}><SkipForward /></button><input aria-label="Replay timeline" type="range" min="0" max={Math.max(0, frameTimes.length - 1)} value={frameIndex} onChange={(event) => setFrameIndex(Number(event.target.value))} /><div className="speed-controls" role="group" aria-label="Playback speed">{[.5, 1, 2, 4].map((rate) => <button key={rate} className={cn(speed === rate && 'active')} onClick={() => setSpeed(rate)}>{rate}×</button>)}</div><span>{frameIndex + 1} / {frameTimes.length}</span></div>
      </section>

      <section className="replay-player-stats">{humanParticipants.map((participant, index) => { const lap = frameLaps[index]; return <article key={participant.carIndex} style={{ '--driver': participant.humanProfile?.color || 'var(--blue)' } as React.CSSProperties}><div className="identity"><Avatar name={participant.humanProfile?.name || participant.name} color={participant.humanProfile?.color} src={participant.humanProfile?.avatarUrl} /><span><strong>{participant.humanProfile?.name || participant.name}</strong><small>Car {participant.carIndex + 1}</small></span></div><Stat label="Track position" value={`P${lap?.car_position || '—'}`} /><Stat label="Current lap" value={lap?.current_lap_num || '—'} /><Stat label="Last lap" value={formatLapTime(lap?.last_lap_time_ms)} /><Stat label="Gap to rival" value={humanGap === null ? 'Unavailable' : formatGap(humanGap)} /></article>; })}</section>

      <div className="replay-context">
        <Surface title="Race moments" caption="Select a moment to orient the replay timeline"><div className="moment-list">{moments.data?.events.length ? moments.data.events.map((event) => <button key={event.id} onClick={() => { if (event.sessionTimeMs && frameTimes.length) setFrameIndex(Math.min(frameTimes.length - 1, Math.floor(event.sessionTimeMs / 100))); }}><i /><span><strong>{eventName(event.eventCode)}</strong><small>{event.sessionTimeMs ? `${Math.floor(event.sessionTimeMs / 60000)}:${String(Math.floor(event.sessionTimeMs / 1000) % 60).padStart(2,'0')}` : 'Time unavailable'}</small></span><Timer /></button>) : <div className="quiet-message">No stored race events for this session.</div>}</div></Surface>
        <Surface title="Driver assignments" caption="Connect anonymous cars to persistent profiles"><div className="assignment-list">{(moments.data?.participants || session?.participants || []).filter((item) => item.aiControlled === false || item.humanProfileId).map((participant) => <label key={participant.carIndex}><span>Car {participant.carIndex + 1} · {participant.name}</span><select className="input" value={participant.humanProfileId || ''} onChange={(event) => assign(participant.carIndex, event.target.value || null)}><option value="">Unassigned</option>{profiles.data?.map((profile) => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>)}</div></Surface>
        <Surface title="Replay capability" caption="Honest about recorded data"><div className="capability-list"><span><Gauge />Motion and lap timing<strong>Available</strong></span><span><Gauge />Historical pedals and ERS<strong className="unavailable">Not recorded by replay API</strong></span></div></Surface>
      </div>
    </> : <EmptyState title="Replay motion is unavailable" message={sessionUID ? 'This session has no persisted motion frames. Race context and assignments remain available.' : 'The session UID is missing. Open replay from the session archive to preserve it.'} action={<button className="button" onClick={loadReplay}>Try replay again</button>} />}
  </div>;
}
