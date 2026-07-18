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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesByDay: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      salesByDay[d.toISOString().split('T')[0]] = 0;
    }

    allPurchases.forEach(p => {
      if (p.status === 'APPROVED') {
        const dateStr = new Date(p.createdAt).toISOString().split('T')[0];
        if (salesByDay[dateStr] !== undefined) {
          salesByDay[dateStr] += p.subject?.price || 0;
        }
      }
    });

    const chartData = Object.keys(salesByDay).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: salesByDay[date]
    }));

    const subjectPurchases = await prisma.purchase.groupBy({
      by: ['subjectId'],
      where: { status: 'APPROVED' },
      _count: { subjectId: true },
      orderBy: { _count: { subjectId: 'desc' } },
      take: 5
    });

    const popularCourses = await Promise.all(
      subjectPurchases.map(async (sp) => {
        const subject = await prisma.subject.findUnique({ where: { id: sp.subjectId } });
        return {
          id: subject?.id,
          name: subject?.name,
          enrollments: sp._count.subjectId
        };
      })
    );

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalSubjects,
      totalRevenue,
      pendingPurchases,
      recentPurchases,
      chartData,
      popularCourses
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
