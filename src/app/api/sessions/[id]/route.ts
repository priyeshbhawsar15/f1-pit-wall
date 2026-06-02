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

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`DELETE FROM motion_samples WHERE session_uid = ${session.sessionUID}`;
      await tx.$executeRaw`DELETE FROM telemetry_samples WHERE session_uid = ${session.sessionUID}`;
      await tx.$executeRaw`DELETE FROM lap_data_samples WHERE session_uid = ${session.sessionUID}`;
      const [{ table_name: carStatusTableName }] = await tx.$queryRawUnsafe<Array<{ table_name: string | null }>>(
        `SELECT to_regclass('public.car_status_samples') AS table_name`
      );
      if (carStatusTableName) {
        await tx.$executeRaw`DELETE FROM car_status_samples WHERE session_uid = ${session.sessionUID}`;
      }
      await tx.$executeRaw`DELETE FROM car_damage_samples WHERE session_uid = ${session.sessionUID}`;
      await tx.session.delete({ where: { id: session.id } });
    });

    return NextResponse.json({ ok: true, id: session.id });
  } catch (error: any) {
    console.error('[API] Session delete error:', error.message);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
