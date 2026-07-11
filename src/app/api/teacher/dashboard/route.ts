import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'TEACHER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const materials = await prisma.material.findMany({
      where: { teacherId: user.userId },
      include: { section: { include: { subject: true } } }
    });

    const commissions = await prisma.commission.findMany({
      where: { teacherId: user.userId }
    });

    const reviews = await prisma.review.findMany({
      where: { teacherId: user.userId },
      include: { student: true, subject: true }
    });

    const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

    return NextResponse.json({
      totalCoursesAssigned: materials.length,
      totalCommission,
      commissions,
      reviews,
      materials
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
