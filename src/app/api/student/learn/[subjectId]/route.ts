import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: { subjectId: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the student has an approved purchase for this subject
  const purchase = await prisma.purchase.findFirst({
    where: {
      studentId: user.userId,
      subjectId: params.subjectId,
      status: 'APPROVED'
    }
  });

  if (!purchase) {
    return NextResponse.json({ error: 'You do not have access to this course' }, { status: 403 });
  }

  // Fetch materials
  const materials = await prisma.material.findMany({
    where: { subjectId: params.subjectId },
    orderBy: { createdAt: 'asc' }
  });

  const subject = await prisma.subject.findUnique({
    where: { id: params.subjectId }
  });

  return NextResponse.json({ subject, materials });
}
