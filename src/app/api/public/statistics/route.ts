import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [learners, instructors, courses, reviews] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'TEACHER' } }),
      prisma.subject.count(),
      prisma.review.aggregate({ _avg: { rating: true } })
    ]);

    // To prevent empty site looking deserted, we can add a base offset
    // or just return the raw numbers. Let's return raw numbers + some base so it doesn't look like 0.
    // Wait, the user wants "real data". If there are only 2 users, it will show 2.
    // The previous text was "10K+". I will send the real raw numbers.
    const averageRating = reviews._avg.rating || 0;

    return NextResponse.json({
      learners,
      instructors,
      courses,
      averageRating: Number(averageRating.toFixed(1))
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
