import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const events = await prisma.event.findMany({
      where: { sessionId: params.id },
      orderBy: { timestamp: 'asc' },
    });
    const session = await prisma.session.findUnique({
      where: { id: params.id },
      include: { participants: { include: { humanProfile: true } } },
    });
    return NextResponse.json({ events, participants: session?.participants ?? [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
