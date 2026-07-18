import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, subjectId } = await request.json();
    const section = await prisma.section.create({
      data: { title, subjectId },
    });
    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const subjectId = searchParams.get('subjectId');

  if (!subjectId) return NextResponse.json({ error: 'subjectId required' }, { status: 400 });

  try {
    const sections = await prisma.section.findMany({
      where: { subjectId },
      include: {
        materials: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    
    return NextResponse.json(sections);
  } catch (error: any) {
    console.error("Sections GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
