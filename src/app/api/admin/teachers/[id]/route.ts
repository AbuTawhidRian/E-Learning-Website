import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, email, commissionRate } = await request.json();
    const teacher = await prisma.user.update({
      where: { id: resolvedParams.id },
      data: { name, email, commissionRate: commissionRate ? Number(commissionRate) : null }
    });
    // Remove password from response
    const { password, ...teacherWithoutPassword } = teacher;
    return NextResponse.json(teacherWithoutPassword, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update teacher:", error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const existing = await prisma.user.findUnique({
      where: { id: resolvedParams.id },
      include: { materials: true }
    });

    if (existing && existing.materials.length > 0) {
      return NextResponse.json({ error: 'Cannot delete teacher because they have uploaded materials.' }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id: resolvedParams.id }
    });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Failed to delete teacher:", error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}
