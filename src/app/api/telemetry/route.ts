import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUID = searchParams.get('sessionUID');
    const carIndex = searchParams.get('carIndex');
    const table = searchParams.get('table') || 'telemetry_samples';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit') || '500', 10);

    const allowedTables = [
      'telemetry_samples', 'motion_samples', 'lap_data_samples',
      'car_status_samples', 'car_damage_samples',
    ];
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 });
    }

    if (!sessionUID) {
      return NextResponse.json({ error: 'sessionUID required' }, { status: 400 });
    }

    let whereClause = `WHERE session_uid = ${sessionUID}`;
    if (carIndex !== null && carIndex !== undefined) {
      whereClause += ` AND car_index = ${parseInt(carIndex, 10)}`;
    }
    if (from) {
      whereClause += ` AND time >= '${from}'`;
    }
    if (to) {
      whereClause += ` AND time <= '${to}'`;
    }

    const query = `SELECT * FROM ${table} ${whereClause} ORDER BY time ASC LIMIT ${limit}`;
    const rows = await prisma.$queryRawUnsafe(query);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('[API] Telemetry error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch telemetry' }, { status: 500 });
  }
}
