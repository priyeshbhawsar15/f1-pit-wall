import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idA = searchParams.get('a');
    const idB = searchParams.get('b');
    if (!idA || !idB) return NextResponse.json({ error: 'Both player IDs required' }, { status: 400 });

    const [profileA, profileB] = await Promise.all([
      prisma.humanProfile.findUnique({ where: { id: idA } }),
      prisma.humanProfile.findUnique({ where: { id: idB } }),
    ]);
    if (!profileA || !profileB) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    // Find sessions where both players participated
    const participantsA = await prisma.participant.findMany({
      where: { humanProfileId: idA },
      select: { sessionId: true, carIndex: true },
    });
    const participantsB = await prisma.participant.findMany({
      where: { humanProfileId: idB },
      select: { sessionId: true, carIndex: true },
    });

    const sessionIdsA = new Set(participantsA.map((p) => p.sessionId));
    const sharedSessionIds = participantsB
      .map((p) => p.sessionId)
      .filter((id) => sessionIdsA.has(id));

    const sharedSessions = await prisma.session.findMany({
      where: { id: { in: sharedSessionIds } },
      include: {
        finalClassifications: true,
        events: { where: { eventCode: { in: ['OVTK', 'COLL', 'FTLP', 'PENA'] } } },
      },
      orderBy: { createdAt: 'asc' },
    });

    const stats = {
      a: { wins: 0, podiums: 0, points: 0, collisions: 0, overtakesOn: 0, overtakesBy: 0, fastestLaps: 0 },
      b: { wins: 0, podiums: 0, points: 0, collisions: 0, overtakesOn: 0, overtakesBy: 0, fastestLaps: 0 },
    };

    const races: any[] = [];

    for (const session of sharedSessions) {
      const pA = participantsA.find((p) => p.sessionId === session.id)!;
      const pB = participantsB.find((p) => p.sessionId === session.id)!;
      const fcA = session.finalClassifications.find((f) => f.carIndex === pA.carIndex);
      const fcB = session.finalClassifications.find((f) => f.carIndex === pB.carIndex);

      if (fcA) {
        stats.a.points += fcA.points;
        if (fcA.position === 1) stats.a.wins++;
        if (fcA.position && fcA.position <= 3) stats.a.podiums++;
      }
      if (fcB) {
        stats.b.points += fcB.points;
        if (fcB.position === 1) stats.b.wins++;
        if (fcB.position && fcB.position <= 3) stats.b.podiums++;
      }

      for (const ev of session.events) {
        const d = ev.details as any;
        if (ev.eventCode === 'COLL') {
          const c = d?.collision;
          const involved = [c?.vehicle1Idx, c?.vehicle2Idx];
          if (involved.includes(pA.carIndex) && involved.includes(pB.carIndex)) {
            stats.a.collisions++;
            stats.b.collisions++;
          }
        }
        if (ev.eventCode === 'OVTK') {
          const o = d?.overtake;
          if (o?.overtakingVehicleIdx === pA.carIndex && o?.beingOvertakenVehicleIdx === pB.carIndex) stats.a.overtakesOn++;
          if (o?.overtakingVehicleIdx === pB.carIndex && o?.beingOvertakenVehicleIdx === pA.carIndex) stats.b.overtakesOn++;
        }
        if (ev.eventCode === 'FTLP') {
          if (d?.fastestLap?.vehicleIdx === pA.carIndex) stats.a.fastestLaps++;
          if (d?.fastestLap?.vehicleIdx === pB.carIndex) stats.b.fastestLaps++;
        }
      }

      races.push({
        sessionId: session.id,
        trackId: session.trackId,
        sessionType: session.sessionType,
        createdAt: session.createdAt,
        a: { position: fcA?.position ?? null, points: fcA?.points ?? 0, bestLapMs: fcA?.bestLapTimeInMS ?? 0 },
        b: { position: fcB?.position ?? null, points: fcB?.points ?? 0, bestLapMs: fcB?.bestLapTimeInMS ?? 0 },
      });
    }

    return NextResponse.json({
      profileA: { id: profileA.id, name: profileA.name, color: profileA.color, avatarUrl: profileA.avatarUrl },
      profileB: { id: profileB.id, name: profileB.name, color: profileB.color, avatarUrl: profileB.avatarUrl },
      sharedRaces: races.length,
      stats,
      races,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
