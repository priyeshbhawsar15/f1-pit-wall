import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function parseOptionalDate(value: string | null): Date | null {
  if (!value) return null;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${value}`);
  }

  return parsed;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUID = searchParams.get('sessionUID');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const cursor = searchParams.get('cursor');
    const limitFrames = parseInt(searchParams.get('limitFrames') || '400', 10);

    if (!sessionUID) {
      return NextResponse.json({ error: 'sessionUID required' }, { status: 400 });
    }

    if (Number.isNaN(limitFrames) || limitFrames < 1) {
      return NextResponse.json({ error: 'limitFrames must be a positive integer' }, { status: 400 });
    }

    let parsedSessionUID: bigint;
    try {
      parsedSessionUID = BigInt(sessionUID);
    } catch {
      return NextResponse.json({ error: 'sessionUID must be a valid bigint' }, { status: 400 });
    }

    const parsedFrom = parseOptionalDate(from);
    const parsedTo = parseOptionalDate(to);
    const parsedCursor = parseOptionalDate(cursor);
    const boundedFrameLimit = Math.min(limitFrames, 1000);

    const frameWhereConditions: Prisma.Sql[] = [Prisma.sql`session_uid = ${parsedSessionUID}`];

    if (parsedFrom) frameWhereConditions.push(Prisma.sql`time >= ${parsedFrom}`);
    if (parsedTo) frameWhereConditions.push(Prisma.sql`time <= ${parsedTo}`);
    if (parsedCursor) frameWhereConditions.push(Prisma.sql`time > ${parsedCursor}`);

    const frameWhereClause = Prisma.sql`WHERE ${Prisma.join(frameWhereConditions, ' AND ')}`;

    const frameTimes = await prisma.$queryRaw<Array<{ time: Date }>>(Prisma.sql`
      SELECT DISTINCT time
      FROM motion_samples
      ${frameWhereClause}
      ORDER BY time ASC
      LIMIT ${boundedFrameLimit + 1}
    `);

    const hasMore = frameTimes.length > boundedFrameLimit;
    const frames = hasMore ? frameTimes.slice(0, boundedFrameLimit) : frameTimes;

    if (frames.length === 0) {
      return NextResponse.json({
        motion: [],
        lapData: [],
        carStatus: [],
        telemetry: [],
        nextCursor: null,
        hasMore: false,
      });
    }

    const frameStart = frames[0].time;
    const frameEnd = frames[frames.length - 1].time;
    const windowWhereClause = Prisma.sql`
      WHERE session_uid = ${parsedSessionUID}
      AND time >= ${frameStart}
      AND time <= ${frameEnd}
    `;

    const [motion, lapData] = await Promise.all([
      prisma.$queryRaw(Prisma.sql`
        SELECT time, car_index, world_position_x, world_position_z
        FROM motion_samples
        ${windowWhereClause}
        ORDER BY time ASC, car_index ASC
      `),
      prisma.$queryRaw(Prisma.sql`
        SELECT time, car_index, car_position, current_lap_num, last_lap_time_ms,
          delta_to_car_in_front_ms, delta_to_race_leader_ms, pit_status, sector
        FROM lap_data_samples
        ${windowWhereClause}
        ORDER BY time ASC, car_index ASC
      `),
    ]);

    return NextResponse.json({
      motion,
      lapData,
      carStatus: [],
      telemetry: [],
      nextCursor: hasMore ? frameEnd.toISOString() : null,
      hasMore,
    });
  } catch (error: any) {
    console.error('[API] Replay error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch replay data' }, { status: 500 });
  }
}
