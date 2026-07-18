import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await request.json();
    const course = await prisma.mainCourse.update({
      where: { id: resolvedParams.id },
      data: { name }
    });
    return NextResponse.json(course, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update course:", error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check for existing core subjects
    const existing = await prisma.mainCourse.findUnique({
      where: { id: resolvedParams.id },
      include: { coreSubjects: true }
    });

    if (existing && existing.coreSubjects.length > 0) {
      return NextResponse.json({ error: 'Cannot delete course because it has associated core subjects. Delete them first.' }, { status: 400 });
    }

    await prisma.mainCourse.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete course:", error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
