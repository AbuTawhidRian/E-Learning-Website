import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subjectId, voucherCode, paymentMethod } = await request.json();

    const purchase = await prisma.purchase.create({
      data: {
        studentId: user.userId,
        subjectId,
        voucherCode,
        paymentMethod,
        status: 'PENDING'
      }
    });

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const purchases = await prisma.purchase.findMany({
    where: { studentId: user.userId },
    include: { subject: true }
  });
  return NextResponse.json(purchases);
}
