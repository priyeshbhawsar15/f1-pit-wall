import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [events, session] = await Promise.all([
      prisma.event.findMany({
        where: { sessionId: params.id },
        orderBy: { timestamp: 'asc' },
        select: {
          id: true,
          eventCode: true,
          timestamp: true,
          sessionTimeMs: true,
          details: true,
        },
      }),
      prisma.session.findUnique({
        where: { id: params.id },
        include: { participants: { include: { humanProfile: true } } },
      }),
    ]);

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({
      events,
      participants: session.participants,
      sessionCreatedAt: session.createdAt,
    });
  } catch (error: any) {
    console.error('[API] Session events error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
