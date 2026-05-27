import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { sessionIds } = body; // array of session IDs to add
    if (!Array.isArray(sessionIds) || sessionIds.length === 0) {
      return NextResponse.json({ error: 'sessionIds array required' }, { status: 400 });
    }
    await prisma.seasonRace.createMany({
      data: sessionIds.map((sessionId: string) => ({ seasonId: params.id, sessionId })),
      skipDuplicates: true,
    });
    return NextResponse.json({ ok: true, added: sessionIds.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });
    await prisma.seasonRace.deleteMany({
      where: { seasonId: params.id, sessionId },
    });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
