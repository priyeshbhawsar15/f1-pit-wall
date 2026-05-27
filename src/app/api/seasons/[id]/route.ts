import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const season = await prisma.season.findUnique({
      where: { id: params.id },
      include: {
        races: {
          include: {
            session: {
              include: {
                participants: { include: { humanProfile: true } },
                finalClassifications: true,
                events: {
                  where: { eventCode: { in: ['COLL', 'OVTK', 'FTLP', 'PENA', 'RTMT', 'RCWN'] } },
                },
              },
            },
          },
          orderBy: { session: { createdAt: 'asc' } },
        },
      },
    });
    if (!season) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(season);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;
    const season = await prisma.season.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(season);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.season.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
