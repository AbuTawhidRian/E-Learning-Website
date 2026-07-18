import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title } = await request.json();
    const updated = await prisma.section.update({
      where: { id: resolvedParams.id },
      data: { title }
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("Failed to update section:", error);
    return NextResponse.json({ error: 'Failed to update section' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const existing = await prisma.section.findUnique({
      where: { id: resolvedParams.id },
      include: { materials: true }
    });

    if (existing && existing.materials.length > 0) {
      return NextResponse.json({ error: 'Cannot delete section because it contains materials. Delete them first.' }, { status: 400 });
    }

    await prisma.section.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Failed to delete section:", error);
    return NextResponse.json({ error: 'Failed to delete section' }, { status: 500 });
  }
}
