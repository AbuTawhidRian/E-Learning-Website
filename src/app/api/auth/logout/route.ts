import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const user = await getAuthUser();
    if (user) {
      await prisma.user.update({
        where: { id: user.userId },
        data: { currentSessionId: null }
      });
    }
  } catch (error) {
    console.error('Error during logout DB update:', error);
  }

  const response = NextResponse.json({ message: 'Logged out successfully' });
  response.cookies.set('token', '', { maxAge: 0, path: '/' });
  return response;
}
