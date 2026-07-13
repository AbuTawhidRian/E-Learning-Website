import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const educations = await prisma.education.findMany({
      where: { userId: user.userId },
      orderBy: { passingYear: 'desc' },
    });

    return NextResponse.json(educations);
  } catch (error) {
    console.error('Error fetching education:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { degree, major, institution, passingYear } = await req.json();

    if (!degree || !institution || !passingYear) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const education = await prisma.education.create({
      data: {
        userId: user.userId,
        degree,
        major,
        institution,
        passingYear,
      },
    });

    return NextResponse.json(education);
  } catch (error) {
    console.error('Error adding education:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
