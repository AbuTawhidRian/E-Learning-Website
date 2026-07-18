import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all approved purchases
    const purchases = await prisma.purchase.findMany({
      where: { status: 'APPROVED' },
      include: { subject: true }
    });

    let totalRevenue = 0;
    const salesByDay: Record<string, number> = {};

    // Initialize last 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      salesByDay[dateStr] = 0;
    }

    purchases.forEach(p => {
      totalRevenue += p.subject.price;
      
      const dateStr = new Date(p.createdAt).toISOString().split('T')[0];
      if (salesByDay[dateStr] !== undefined) {
        salesByDay[dateStr] += p.subject.price;
      }
    });

    const chartData = Object.keys(salesByDay).map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      revenue: salesByDay[date]
    }));

    // Get total active students
    const totalStudents = await prisma.user.count({ where: { role: 'STUDENT' } });

    // Most popular courses
    const subjectPurchases = await prisma.purchase.groupBy({
      by: ['subjectId'],
      where: { status: 'APPROVED' },
      _count: {
        subjectId: true
      },
      orderBy: {
        _count: { subjectId: 'desc' }
      },
      take: 5
    });

    const popularCourses = await Promise.all(
      subjectPurchases.map(async (sp) => {
        const subject = await prisma.subject.findUnique({ where: { id: sp.subjectId } });
        return {
          id: subject?.id,
          name: subject?.name,
          code: subject?.code,
          price: subject?.price,
          enrollments: sp._count.subjectId
        };
      })
    );

    return NextResponse.json({
      totalRevenue,
      totalStudents,
      chartData,
      popularCourses
    });

  } catch (error: any) {
    console.error("Analytics GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
