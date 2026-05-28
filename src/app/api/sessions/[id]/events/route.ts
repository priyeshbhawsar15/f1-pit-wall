import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const [events, session] = await Promise.all([
      prisma.event.findMany({
        where: { sessionId: params.id },
        orderBy: { timestamp: 'asc' },
      }),
      prisma.session.findUnique({
        where: { id: params.id },
        include: { participants: { include: { humanProfile: true } } },
      }),
    ]);
    return NextResponse.json({
      events,
      participants: session?.participants ?? [],
      sessionCreatedAt: session?.createdAt ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
