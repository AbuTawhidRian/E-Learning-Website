import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, mainCourseId } = await request.json();
    const coreSubject = await prisma.coreSubject.update({
      where: { id: resolvedParams.id },
      data: { name, mainCourseId }
    });
    return NextResponse.json(coreSubject, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update core subject:", error);
    return NextResponse.json({ error: 'Failed to update core subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const existing = await prisma.coreSubject.findUnique({
      where: { id: resolvedParams.id },
      include: { subjects: true }
    });

    if (existing && existing.subjects.length > 0) {
      return NextResponse.json({ error: 'Cannot delete core subject because it contains subjects. Delete them first.' }, { status: 400 });
    }

    await prisma.coreSubject.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete core subject:", error);
    return NextResponse.json({ error: 'Failed to delete core subject' }, { status: 500 });
  }
}
