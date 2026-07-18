import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { title, type, url, teacherId, sectionId, isPublic } = await request.json();
    const material = await prisma.material.create({
      data: { title, type, url, teacherId, sectionId, isPublic: Boolean(isPublic) },
    });
    return NextResponse.json(material, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get('sectionId');

  if (!sectionId) return NextResponse.json({ error: 'sectionId required' }, { status: 400 });

  const materials = await prisma.material.findMany({
    where: { sectionId },
    orderBy: { createdAt: 'asc' }
  });
  
  return NextResponse.json(materials);
}
