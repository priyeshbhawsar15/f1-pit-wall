import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const seasons = await prisma.season.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        races: {
          include: {
            session: {
              select: { id: true, trackId: true, sessionType: true, createdAt: true },
            },
          },
        },
        _count: { select: { races: true } },
      },
    });
    return NextResponse.json(seasons);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, startDate, endDate, isActive } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Name required' }, { status: 400 });

    const season = await prisma.season.create({
      data: {
        name: name.trim(),
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive: isActive ?? false,
      },
    });

    // If date range given, return preview of matching sessions (don't link yet)
    if (startDate || endDate) {
      const where: any = {};
      if (startDate) where.gte = new Date(startDate);
      if (endDate) where.lte = new Date(endDate);
      const matchingSessions = await prisma.session.findMany({
        where: { createdAt: where },
        select: { id: true, trackId: true, sessionType: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      });
      return NextResponse.json({ season, matchingSessions }, { status: 201 });
    }

    return NextResponse.json({ season, matchingSessions: [] }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
