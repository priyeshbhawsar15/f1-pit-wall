import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      select: { id: true, sessionUID: true },
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const timescaleTables = [
      'motion_samples',
      'telemetry_samples',
      'lap_data_samples',
      'car_status_samples',
      'car_damage_samples',
    ];

    for (const table of timescaleTables) {
      const [{ exists }] = await prisma.$queryRawUnsafe<Array<{ exists: boolean }>>(
        `SELECT to_regclass($1) IS NOT NULL AS exists`, `public.${table}`
      );
      if (exists) {
        await prisma.$executeRawUnsafe(
          `DELETE FROM ${table} WHERE session_uid = $1`, session.sessionUID
        );
      }
    }

    await prisma.session.delete({ where: { id: session.id } });

    return NextResponse.json({ ok: true, id: session.id });
  } catch (error: any) {
    console.error('[API] Session delete error:', error.message);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
