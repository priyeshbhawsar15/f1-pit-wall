import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const profileId = searchParams.get('profileId');

    const whereProfile = profileId ? { humanProfileId: profileId } : { humanProfileId: { not: null } };

    const participants = await prisma.participant.findMany({
      where: whereProfile,
      include: {
        humanProfile: true,
        session: {
          include: { finalClassifications: true },
        },
      },
    });

    // Group by profileId → trackId → best lap
    const records: Record<string, Record<number, { bestLapMs: number; bestPos: number; profileName: string; profileColor: string; sessionId: string; createdAt: Date }>> = {};

    for (const p of participants) {
      if (!p.humanProfile) continue;
      const pid = p.humanProfile.id;
      const trackId = p.session.trackId;
      const fc = p.session.finalClassifications.find((f) => f.carIndex === p.carIndex);
      if (!fc || fc.bestLapTimeInMS <= 0) continue;

      if (!records[pid]) records[pid] = {};
      const existing = records[pid][trackId];
      if (!existing || fc.bestLapTimeInMS < existing.bestLapMs) {
        records[pid][trackId] = {
          bestLapMs: fc.bestLapTimeInMS,
          bestPos: fc.position,
          profileName: p.humanProfile.name,
          profileColor: p.humanProfile.color,
          sessionId: p.sessionId,
          createdAt: p.session.createdAt,
        };
      }
    }

    // Flatten into array
    const result: any[] = [];
    for (const [pid, tracks] of Object.entries(records)) {
      for (const [trackId, rec] of Object.entries(tracks)) {
        result.push({ profileId: pid, trackId: parseInt(trackId), ...rec });
      }
    }

    result.sort((a, b) => a.trackId - b.trackId || a.bestLapMs - b.bestLapMs);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
