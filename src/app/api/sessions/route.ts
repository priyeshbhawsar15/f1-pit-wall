import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        participants: {
          orderBy: { carIndex: 'asc' },
          include: { humanProfile: true },
        },
        finalClassifications: true,
        _count: { select: { events: true, finalClassifications: true } },
      },
      take: 50,
    });

    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('[API] Sessions error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}
