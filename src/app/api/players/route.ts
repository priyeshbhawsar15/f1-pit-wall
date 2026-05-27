import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const profiles = await prisma.humanProfile.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { participants: true } },
      },
    });
    return NextResponse.json(profiles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, avatarUrl } = body;
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const profile = await prisma.humanProfile.create({
      data: { name: name.trim(), color: color || '#E10600', avatarUrl: avatarUrl || null },
    });
    return NextResponse.json(profile, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
