import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });
    const totalTeachers = await prisma.user.count({ where: { role: 'TEACHER' } });
    const totalSubjects = await prisma.subject.count();

    const allPurchases = await prisma.purchase.findMany({
      include: { subject: true }
    });

    const totalRevenue = allPurchases
      .filter(p => p.status === 'APPROVED')
      .reduce((sum, p) => sum + (p.subject?.price || 0), 0);

    const pendingPurchases = await prisma.purchase.findMany({
      where: { status: 'PENDING' },
      include: { student: true, subject: true },
      orderBy: { createdAt: 'desc' }
    });

    const recentPurchases = await prisma.purchase.findMany({
      where: { status: 'APPROVED' },
      include: { student: true, subject: true },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalRevenue,
      pendingPurchases,
      recentPurchases
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
