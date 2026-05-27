import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const profile = await prisma.humanProfile.findUnique({
      where: { id: params.id },
      include: {
        participants: {
          include: {
            session: {
              include: {
                finalClassifications: true,
                events: true,
              },
            },
          },
          orderBy: { session: { createdAt: 'desc' } },
        },
      },
    });
    if (!profile) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { name, color, avatarUrl } = body;
    const profile = await prisma.humanProfile.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(color !== undefined && { color }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
    });
    return NextResponse.json(profile);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.humanProfile.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
