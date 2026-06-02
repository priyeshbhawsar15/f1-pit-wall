'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { TRACK_NAMES, SESSION_TYPES, TEAM_COLORS } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import RaceMomentsTimeline from '@/components/RaceMomentsTimeline';
import AppHeader from '@/components/AppHeader';

const BMW_FONT = { fontFamily: "var(--font-ui)" };

interface MotionFrame {
  time: string;
  car_index: number;
  world_position_x: number;
  world_position_z: number;
}

interface ReplayData {
  motion: MotionFrame[];
  lapData: any[];
  carStatus: any[];
  telemetry: any[];
}

interface SessionData {
  id: string;
  trackId: number;
  sessionType: number;
  totalLaps: number;
  participants: { name: string; teamId: number; carIndex: number; aiControlled: boolean; humanProfileId: string | null }[];
}

interface HumanProfile {
  id: string;
  name: string;
  color: string;
  avatarUrl: string | null;
}

export default function SessionReplayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const sessionId = params.id as string;
  const sessionUID = searchParams.get('uid') || '';

  const [session, setSession] = useState<SessionData | null>(null);
  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTimeIdx, setCurrentTimeIdx] = useState(0);
  const [profiles, setProfiles] = useState<HumanProfile[]>([]);
  const [assigning, setAssigning] = useState<Record<number, boolean>>({});

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);

  useEffect(() => {
    Promise.all([
      fetch('/api/sessions').then((r) => r.json()),
      fetch('/api/players').then((r) => r.json()),
    ]).then(([sessions, profs]) => {
      const s = sessions.find((s: any) => s.id === sessionId);
      if (s) setSession(s);
      if (Array.isArray(profs)) setProfiles(profs);
    });
  }, [sessionId]);

  async function assignProfile(carIndex: number, humanProfileId: string | null) {
    setAssigning((prev) => ({ ...prev, [carIndex]: true }));
    await fetch(`/api/sessions/${sessionId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carIndex, humanProfileId }),
    });
    setSession((prev) => prev ? {
      ...prev,
      participants: prev.participants.map((p) =>
        p.carIndex === carIndex ? { ...p, humanProfileId } : p
      ),
    } : prev);
    setAssigning((prev) => ({ ...prev, [carIndex]: false }));
  }

  useEffect(() => {
    if (!sessionUID) return;
    setLoading(true);
    fetch(`/api/replay?sessionUID=${sessionUID}`)
      .then((r) => r.json())
      .then((data: ReplayData) => {
        setReplayData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionUID]);

  const timestamps = replayData
    ? Array.from(new Set(replayData.motion.map((m) => m.time))).sort()
    : [];

  const totalFrames = timestamps.length;

  const drawFrame = useCallback((frameIdx: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !replayData || timestamps.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 500;
    ctx.clearRect(0, 0, W, W);

    const currentTime = timestamps[frameIdx];
    const frameCars = replayData.motion.filter((m) => m.time === currentTime);
    if (frameCars.length === 0) return;

    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (const m of replayData.motion) {
      if (m.world_position_x < minX) minX = m.world_position_x;
      if (m.world_position_x > maxX) maxX = m.world_position_x;
      if (m.world_position_z < minZ) minZ = m.world_position_z;
      if (m.world_position_z > maxZ) maxZ = m.world_position_z;
    }

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const pad = 40;
    const drawSize = W - pad * 2;
    const scale = Math.min(drawSize / rangeX, drawSize / rangeZ);
    const mapX = (x: number) => pad + (x - minX) * scale + (drawSize - rangeX * scale) / 2;
    const mapZ = (z: number) => pad + (z - minZ) * scale + (drawSize - rangeZ * scale) / 2;

    const carTrails = new Map<number, MotionFrame[]>();
    for (const m of replayData.motion) {
      if (!carTrails.has(m.car_index)) carTrails.set(m.car_index, []);
      carTrails.get(m.car_index)!.push(m);
    }

    carTrails.forEach((trail) => {
      if (trail.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(mapX(trail[0].world_position_x), mapZ(trail[0].world_position_z));
      for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(mapX(trail[i].world_position_x), mapZ(trail[i].world_position_z));
      }
      ctx.strokeStyle = '#ffffff10';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    for (const car of frameCars) {
      const participant = session?.participants.find((p) => p.carIndex === car.car_index);
      const color = participant ? (TEAM_COLORS[participant.teamId] || '#666') : '#666';
      const cx = mapX(car.world_position_x);
      const cz = mapZ(car.world_position_z);

      ctx.beginPath();
      ctx.arc(cx, cz, 5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (participant) {
        ctx.fillStyle = '#fff';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(participant.name.split(' ').pop() || '', cx, cz - 10);
      }
    }

    ctx.fillStyle = '#555';
    ctx.font = '11px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`Frame ${frameIdx + 1}/${totalFrames}`, 10, W - 10);
  }, [replayData, session, timestamps, totalFrames]);

  useEffect(() => {
    if (!playing || !replayData || timestamps.length === 0) return;

    const step = (time: number) => {
      if (!lastFrameTime.current) lastFrameTime.current = time;
      const delta = time - lastFrameTime.current;

      if (delta > (1000 / 30) / playbackSpeed) {
        lastFrameTime.current = time;
        setCurrentTimeIdx((prev) => {
          const next = prev + 1;
          if (next >= timestamps.length) {
            setPlaying(false);
            return prev;
          }
          return next;
        });
      }

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing, playbackSpeed, replayData, timestamps]);

  useEffect(() => {
    drawFrame(currentTimeIdx);
  }, [currentTimeIdx, drawFrame]);

  const trackName = session ? (TRACK_NAMES[session.trackId] || 'Unknown') : '---';
  const sessionType = session ? (SESSION_TYPES[session.sessionType] || '---') : '---';
  const progressPct = totalFrames > 0 ? ((currentTimeIdx / (totalFrames - 1)) * 100) : 0;
  const sortedParticipants = session
    ? [...session.participants].sort((a, b) => {
        const aLinked = Boolean(a.humanProfileId);
        const bLinked = Boolean(b.humanProfileId);
        if (aLinked !== bLinked) return aLinked ? -1 : 1;
        if (a.aiControlled !== b.aiControlled) return a.aiControlled ? 1 : -1;
        return a.carIndex - b.carIndex;
      })
    : [];

  return (
    <div className="min-h-screen">
      <AppHeader
        title="REPLAY"
        backHref="/sessions"
        meta={
          <>
            <span className="font-bold text-[var(--foreground)]" style={BMW_FONT}>{trackName}</span>
            <span className="text-[var(--muted)] text-[11px] uppercase tracking-wider">{sessionType}</span>
          </>
        }
      />

      <div className="max-w-6xl mx-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[var(--m-red)] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-sm text-[var(--muted-foreground)]">Loading replay data…</span>
          </div>
        ) : !replayData || timestamps.length === 0 ? (
          <div className="card p-12 text-center">
            <Play size={32} className="text-[var(--muted)] mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">No replay data</h3>
            <p className="text-sm text-[var(--muted-foreground)]">Motion data is not available for this session.</p>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-4">
            {/* Track canvas */}
            <div className="col-span-8">
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Track View</span>
                  <span className="text-[10px] font-mono text-[var(--muted)]">{currentTimeIdx + 1} / {totalFrames}</span>
                </div>
                <div className="flex items-center justify-center p-3">
                  <canvas ref={canvasRef} width={500} height={500} className="w-full max-w-[500px] aspect-square" />
                </div>
              </div>
            </div>

            {/* Controls + Legend */}
            <div className="col-span-4 flex flex-col gap-3">
              <div className="card p-4">
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-1 bg-[var(--surface-elevated)] overflow-hidden mb-1" style={{ borderRadius: 0 }}>
                    <div
                      className="h-full bg-[var(--m-red)] transition-all duration-75"
                      style={{ width: `${progressPct}%`, borderRadius: 0 }}
                    />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(0, totalFrames - 1)}
                    value={currentTimeIdx}
                    onChange={(e) => {
                      setCurrentTimeIdx(parseInt(e.target.value, 10));
                      setPlaying(false);
                    }}
                    className="w-full h-3 opacity-0 cursor-pointer -mt-3 relative z-10"
                  />
                </div>

                {/* Transport buttons */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setCurrentTimeIdx(0)}
                    className="p-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    <SkipBack size={14} />
                  </button>
                  <button
                    onClick={() => { setPlaying(!playing); lastFrameTime.current = 0; }}
                    className="p-3 rounded-full bg-[var(--m-red)] hover:bg-[var(--m-red)]/80 transition-colors"
                  >
                    {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                  </button>
                  <button
                    onClick={() => setCurrentTimeIdx(Math.max(0, totalFrames - 1))}
                    className="p-2 bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] transition-colors"
                    style={{ borderRadius: 0 }}
                  >
                    <SkipForward size={14} />
                  </button>
                </div>

                {/* Speed selector */}
                <div className="mt-4">
                  <span className="text-[9px] uppercase tracking-wider text-[var(--muted-foreground)]" style={BMW_FONT}>Speed</span>
                  <div className="tab-bar mt-1">
                    {[0.5, 1, 2, 4].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => setPlaybackSpeed(speed)}
                        className={`tab-item text-[10px] py-1 ${playbackSpeed === speed ? 'active' : ''}`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Driver legend + assignment */}
              {session && (
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Drivers</span>
                    <span className="text-[10px] text-[var(--muted)]">{session.participants.length}</span>
                  </div>
                  <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
                    {sortedParticipants.map((p) => {
                      const linked = profiles.find((pr) => pr.id === p.humanProfileId);
                      return (
                        <div key={p.carIndex}>
                          <div className="flex items-center gap-2 py-0.5">
                            <div className="team-stripe h-4" style={{ backgroundColor: TEAM_COLORS[p.teamId] || '#666' }} />
                            <span className="text-[11px] flex-1 truncate">{p.name}</span>
                            {linked && (
                              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: linked.color }} />
                            )}
                          </div>
                          {!p.aiControlled && (
                            <div className="ml-4 mt-1">
                              <select
                                value={p.humanProfileId || ''}
                                disabled={assigning[p.carIndex]}
                                onChange={(e) => assignProfile(p.carIndex, e.target.value || null)}
                                className="w-full text-[9px] bg-[var(--surface)] border border-[var(--card-border)] px-1.5 py-1 text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--m-blue-dark)] cursor-pointer"
                                style={{ borderRadius: 0 }}
                              >
                                <option value="">— unlinked —</option>
                                {profiles.map((pr) => (
                                  <option key={pr.id} value={pr.id}>{pr.name}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {session && (
          <div className="mt-6">
            <RaceMomentsTimeline sessionId={sessionId} />
          </div>
        )}
      </div>
    </div>
  );
}
