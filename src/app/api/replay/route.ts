import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionUID = searchParams.get('sessionUID');
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!sessionUID) {
      return NextResponse.json({ error: 'sessionUID required' }, { status: 400 });
    }

    // Fetch motion + lap data + car status in the time range for all cars
    let timeFilter = '';
    if (from) timeFilter += ` AND time >= '${from}'`;
    if (to) timeFilter += ` AND time <= '${to}'`;

    const [motion, lapData, carStatus, telemetry] = await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT time, car_index, world_position_x, world_position_z FROM motion_samples ` +
        `WHERE session_uid = ${sessionUID}${timeFilter} ORDER BY time ASC LIMIT 10000`
      ),
      prisma.$queryRawUnsafe(
        `SELECT time, car_index, car_position, current_lap_num, last_lap_time_ms, ` +
        `delta_to_car_in_front_ms, delta_to_race_leader_ms, pit_status, sector ` +
        `FROM lap_data_samples WHERE session_uid = ${sessionUID}${timeFilter} ORDER BY time ASC LIMIT 10000`
      ),
      prisma.$queryRawUnsafe(
        `SELECT time, car_index, visual_tyre_compound, tyres_age_laps, ers_store_energy, ers_deploy_mode ` +
        `FROM car_status_samples WHERE session_uid = ${sessionUID}${timeFilter} ORDER BY time ASC LIMIT 10000`
      ),
      prisma.$queryRawUnsafe(
        `SELECT time, car_index, speed, gear, drs, throttle, brake ` +
        `FROM telemetry_samples WHERE session_uid = ${sessionUID}${timeFilter} ORDER BY time ASC LIMIT 10000`
      ),
    ]);

    return NextResponse.json({ motion, lapData, carStatus, telemetry });
  } catch (error: any) {
    console.error('[API] Replay error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch replay data' }, { status: 500 });
  }
}
