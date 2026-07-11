import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const purchases = await prisma.purchase.findMany({
    include: { student: true, subject: true },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(purchases);
}

export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { purchaseId, status } = await request.json();

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { subject: { include: { sections: { include: { materials: true } } } } }
    });

    if (!purchase) return NextResponse.json({ error: 'Purchase not found' }, { status: 404 });

    const updatedPurchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status }
    });

    if (status === 'APPROVED' && purchase.status === 'PENDING') {
      const allMaterials = purchase.subject.sections.flatMap(s => s.materials);
      const teacherIds = Array.from(new Set(allMaterials.map(m => m.teacherId)));
      
      for (const teacherId of teacherIds) {
        const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
        if (teacher && teacher.commissionRate) {
          await prisma.commission.create({
            data: {
              teacherId,
              purchaseId,
              amount: teacher.commissionRate,
              status: 'UNPAID'
            }
          });
        }
      }
    }

    return NextResponse.json(updatedPurchase);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
