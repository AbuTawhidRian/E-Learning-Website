import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name } = await request.json();
    const course = await prisma.mainCourse.create({ data: { name } });
    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const courses = await prisma.mainCourse.findMany({ 
      include: { 
        coreSubjects: { 
          include: { subjects: true } 
        } 
      } 
    });
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("Failed to fetch courses:", error.message);
    return NextResponse.json({ error: 'Database connection failed or tables not created' }, { status: 500 });
  }
}
