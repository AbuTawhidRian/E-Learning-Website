import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { materialId, completed } = await request.json();

    if (!materialId) {
      return NextResponse.json({ error: 'Material ID is required' }, { status: 400 });
    }

    // Upsert progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_materialId: {
          userId: user.userId,
          materialId: materialId,
        }
      },
      update: {
        completed: completed
      },
      create: {
        userId: user.userId,
        materialId: materialId,
        completed: completed
      }
    });

    return NextResponse.json({ success: true, progress }, { status: 200 });
  } catch (error: any) {
    console.error("Progress Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    // If subjectId is provided, get progress for materials in that subject
    if (subjectId) {
      const progress = await prisma.progress.findMany({
        where: {
          userId: user.userId,
          material: {
            section: {
              subjectId: subjectId
            }
          }
        }
      });
      return NextResponse.json(progress);
    }

    // Else return all progress for user
    const progress = await prisma.progress.findMany({
      where: { userId: user.userId }
    });

    return NextResponse.json(progress);
  } catch (error: any) {
    console.error("Progress GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
