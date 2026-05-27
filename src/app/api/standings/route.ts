import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const seasonId = searchParams.get('seasonId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    // Build session filter
    const sessionWhere: any = {};
    if (seasonId) {
      sessionWhere.seasonRaces = { some: { seasonId } };
    }
    if (from || to) {
      sessionWhere.createdAt = {};
      if (from) sessionWhere.createdAt.gte = new Date(from);
      if (to) sessionWhere.createdAt.lte = new Date(to);
    }

    const profiles = await prisma.humanProfile.findMany({
      include: {
        participants: {
          where: {
            session: sessionWhere,
          },
          include: {
            session: {
              include: {
                finalClassifications: true,
                events: {
                  where: { eventCode: { in: ['COLL', 'OVTK', 'FTLP', 'PENA', 'RTMT', 'RCWN'] } },
                },
              },
            },
          },
        },
      },
    });

    const standings = profiles.map((profile) => {
      let points = 0;
      let wins = 0;
      let podiums = 0;
      let dnfs = 0;
      let collisions = 0;
      let overtakes = 0;
      let fastestLaps = 0;
      let penalties = 0;
      let penaltySeconds = 0;
      let pitStops = 0;
      let totalFinishPosition = 0;
      let racesWithFinish = 0;
      let bestLapMs = Infinity;
      const races: any[] = [];
      const penaltyDetails: any[] = [];

      for (const p of profile.participants) {
        const fc = p.session.finalClassifications.find((f) => f.carIndex === p.carIndex);
        const events = p.session.events;

        if (fc) {
          points += fc.points;
          if (fc.position === 1) wins++;
          if (fc.position <= 3) podiums++;
          if ([4, 7].includes(fc.resultStatus)) dnfs++; // DNF or Retired
          pitStops += fc.numPitStops;
          if (fc.resultStatus >= 2 && fc.resultStatus <= 3) {
            totalFinishPosition += fc.position;
            racesWithFinish++;
          }
          if (fc.bestLapTimeInMS > 0 && fc.bestLapTimeInMS < bestLapMs) {
            bestLapMs = fc.bestLapTimeInMS;
          }
        }

        // Count events for this car
        for (const ev of events) {
          const d = ev.details as any;
          if (ev.eventCode === 'COLL') {
            const c = d?.collision;
            if (c?.vehicle1Idx === p.carIndex || c?.vehicle2Idx === p.carIndex) collisions++;
          }
          if (ev.eventCode === 'OVTK') {
            if (d?.overtake?.overtakingVehicleIdx === p.carIndex) overtakes++;
          }
          if (ev.eventCode === 'FTLP') {
            if (d?.fastestLap?.vehicleIdx === p.carIndex) fastestLaps++;
          }
          if (ev.eventCode === 'PENA') {
            const pen = d?.penalty;
            if (pen?.vehicleIdx === p.carIndex) {
              penalties++;
              const t = pen?.time ?? 0;
              if (t < 255) penaltySeconds += t;
              penaltyDetails.push({
                sessionId: p.sessionId,
                trackId: p.session.trackId,
                sessionType: p.session.sessionType,
                createdAt: p.session.createdAt,
                lapNum: pen?.lapNum ?? 0,
                penaltyType: pen?.penaltyType ?? 0,
                infringementType: pen?.infringementType ?? 0,
                time: t,
              });
            }
          }
        }

        races.push({
          sessionId: p.sessionId,
          trackId: p.session.trackId,
          sessionType: p.session.sessionType,
          createdAt: p.session.createdAt,
          carIndex: p.carIndex,
          position: fc?.position ?? null,
          gridPosition: fc?.gridPosition ?? null,
          points: fc?.points ?? 0,
          bestLapTimeInMS: fc?.bestLapTimeInMS ?? 0,
          resultStatus: fc?.resultStatus ?? 0,
          numPitStops: fc?.numPitStops ?? 0,
          penaltiesTime: fc?.penaltiesTime ?? 0,
        });
      }

      return {
        id: profile.id,
        name: profile.name,
        color: profile.color,
        avatarUrl: profile.avatarUrl,
        stats: {
          races: races.length,
          points,
          wins,
          podiums,
          dnfs,
          collisions,
          overtakes,
          fastestLaps,
          penalties,
          penaltySeconds,
          pitStops,
          avgPosition: racesWithFinish > 0 ? Math.round((totalFinishPosition / racesWithFinish) * 10) / 10 : null,
          bestLapMs: bestLapMs === Infinity ? null : bestLapMs,
        },
        races,
        penaltyDetails,
      };
    });

    standings.sort((a, b) => b.stats.points - a.stats.points);
    return NextResponse.json(standings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
