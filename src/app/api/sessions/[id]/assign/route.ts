import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { carIndex, humanProfileId } = body;
    if (carIndex === undefined) {
      return NextResponse.json({ error: 'carIndex required' }, { status: 400 });
    }
    const participant = await prisma.participant.findUnique({
      where: { sessionId_carIndex: { sessionId: params.id, carIndex } },
    });
    if (!participant) return NextResponse.json({ error: 'Participant not found' }, { status: 404 });

    const updated = await prisma.participant.update({
      where: { sessionId_carIndex: { sessionId: params.id, carIndex } },
      data: { humanProfileId: humanProfileId || null },
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
