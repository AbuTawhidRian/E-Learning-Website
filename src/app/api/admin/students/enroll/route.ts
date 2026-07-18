import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { studentId, subjectId } = await request.json();

    if (!studentId || !subjectId) {
      return NextResponse.json({ error: 'Missing studentId or subjectId' }, { status: 400 });
    }

    // Check if already enrolled
    const existing = await prisma.purchase.findFirst({
      where: {
        studentId,
        subjectId,
        status: 'APPROVED'
      }
    });

    if (existing) {
      return NextResponse.json({ error: 'Student is already enrolled in this course' }, { status: 400 });
    }

    const purchase = await prisma.purchase.create({
      data: {
        studentId,
        subjectId,
        paymentMethod: 'BKASH', // Default placeholder
        voucherCode: 'MANUAL_ENROLLMENT',
        status: 'APPROVED'
      }
    });

    return NextResponse.json({ success: true, purchase }, { status: 201 });
  } catch (error: any) {
    console.error("Manual Enroll Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
