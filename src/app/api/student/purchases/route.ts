import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subjectId, subjectIds, voucherCode, paymentMethod, couponId, discountAmount } = await request.json();
    
    // Support both single purchase and cart array purchase
    const idsToProcess = subjectIds || (subjectId ? [subjectId] : []);
    
    if (idsToProcess.length === 0) {
      return NextResponse.json({ error: 'No subjects provided' }, { status: 400 });
    }

    // Check for existing purchases
    const existingPurchases = await prisma.purchase.findMany({
      where: {
        studentId: user.userId,
        subjectId: { in: idsToProcess },
        status: { in: ['PENDING', 'APPROVED'] }
      }
    });

    if (existingPurchases.length > 0) {
      return NextResponse.json({ error: 'You have already purchased or requested one or more of these courses' }, { status: 400 });
    }

    const purchases = await Promise.all(
      idsToProcess.map((id: string) => 
        prisma.purchase.create({
          data: {
            studentId: user.userId,
            subjectId: id,
            voucherCode,
            paymentMethod,
            couponId,
            discountAmount,
            status: 'PENDING'
          }
        })
      )
    );

    return NextResponse.json(purchases, { status: 201 });
  } catch (error) {
    console.error(error);
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
