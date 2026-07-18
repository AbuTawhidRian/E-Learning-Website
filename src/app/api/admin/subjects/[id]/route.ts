import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, code, price, coreSubjectId, description } = await request.json();
    const subject = await prisma.subject.update({
      where: { id: resolvedParams.id },
      data: { name, code, price: Number(price), coreSubjectId, description }
    });
    return NextResponse.json(subject, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update subject:", error);
    return NextResponse.json({ error: 'Failed to update subject. Code might already exist.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const existing = await prisma.subject.findUnique({
      where: { id: resolvedParams.id },
      include: { sections: true }
    });

    if (existing && existing.sections.length > 0) {
      return NextResponse.json({ error: 'Cannot delete subject because it contains sections. Delete them first.' }, { status: 400 });
    }

    await prisma.subject.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete subject:", error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
