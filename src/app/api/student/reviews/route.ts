import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });

    const reviews = await prisma.review.findMany({
      where: { subjectId },
      include: {
        student: { select: { id: true, name: true, profilePicture: true } },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'STUDENT') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { subjectId, rating, comment } = await request.json();

    if (!rating || !comment) {
      return NextResponse.json({ error: 'Rating and comment are required' }, { status: 400 });
    }

    // A student can review a subject. We need to find the teacher of this subject.
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      include: {
        sections: {
          include: { materials: true }
        }
      }
    });

    if (!subject) return NextResponse.json({ error: 'Subject not found' }, { status: 404 });

    // Since materials have teacherId, let's just pick the teacher from the first material
    let teacherId = '';
    for (const sec of subject.sections) {
      if (sec.materials.length > 0) {
        teacherId = sec.materials[0].teacherId;
        break;
      }
    }

    if (!teacherId) return NextResponse.json({ error: 'No teacher found for this course' }, { status: 400 });

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        subjectId,
        studentId: user.userId,
        teacherId
      },
      include: {
        student: { select: { id: true, name: true, profilePicture: true } }
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
