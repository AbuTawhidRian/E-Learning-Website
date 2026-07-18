import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, code, price, coreSubjectId, description } = await request.json();
    const subject = await prisma.subject.create({
      data: { name, code, price: Number(price), coreSubjectId, description },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (error: any) {
    console.error('Error creating subject:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A subject with this code already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
