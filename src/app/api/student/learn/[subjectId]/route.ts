import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = await params;
  const subjectId = resolvedParams.subjectId;

  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify the student has an approved purchase for this subject
  const purchase = await prisma.purchase.findFirst({
    where: {
      studentId: user.userId,
      subjectId: subjectId,
      status: 'APPROVED'
    }
  });

  if (!purchase) {
    return NextResponse.json({ error: 'You do not have access to this course' }, { status: 403 });
  }

  // Fetch sections with nested materials
  const sections = await prisma.section.findMany({
    where: { subjectId: subjectId },
    include: {
      materials: {
        orderBy: { createdAt: 'asc' }
      }
    },
    orderBy: { createdAt: 'asc' }
  });

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId }
  });

  return NextResponse.json({ subject, sections });
}
