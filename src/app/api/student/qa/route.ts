import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) return NextResponse.json({ error: 'Subject ID is required' }, { status: 400 });

    const questions = await prisma.question.findMany({
      where: { subjectId },
      include: {
        student: { select: { id: true, name: true, profilePicture: true } },
        answers: {
          include: { author: { select: { id: true, name: true, role: true, profilePicture: true } } },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(questions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await request.json();

    if (body.action === 'ANSWER') {
      const { questionId, answerBody } = body;
      const answer = await prisma.answer.create({
        data: {
          body: answerBody,
          authorId: user.userId,
          questionId
        },
        include: {
          author: { select: { id: true, name: true, role: true, profilePicture: true } }
        }
      });
      return NextResponse.json({ success: true, answer });
    } else {
      const { subjectId, questionBody, title } = body;
      const question = await prisma.question.create({
        data: {
          title,
          body: questionBody,
          studentId: user.userId,
          subjectId
        },
        include: {
          student: { select: { id: true, name: true, profilePicture: true } },
          answers: true
        }
      });
      return NextResponse.json({ success: true, question });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
