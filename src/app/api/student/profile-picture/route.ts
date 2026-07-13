import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profilePicture } = await request.json();

    if (!profilePicture || !profilePicture.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.userId },
      data: { profilePicture },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: user.userId },
      data: { profilePicture: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
