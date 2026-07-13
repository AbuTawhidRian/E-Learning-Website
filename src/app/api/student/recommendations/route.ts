import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';

export async function GET() {
  const user = await getAuthUser();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Fetch the student's latest education
    const education = await prisma.education.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'desc' }
    });

    if (!education || education.degree.includes('SSC') || education.degree.includes('HSC')) {
      return NextResponse.json({ recommendations: [] });
    }

    let searchKeywords: string[] = [];

    // 2. Use the student's provided studying subject (major or degree) as the search keyword
    if (education) {
      // Use major if provided, otherwise fall back to degree
      const searchSource = education.major || education.degree;
      
      if (searchSource) {
        const sourceText = searchSource.trim();
        // Add the full text as a keyword
        searchKeywords.push(sourceText);
        
        // Also add individual words (longer than 2 characters) for partial matches
        const words = sourceText.split(/\s+/).filter(w => w.length > 2);
        searchKeywords.push(...words);
      }
    }

    // 3. Find matching subjects
    let recommendedSubjects: any[] = [];
    
    if (searchKeywords.length > 0) {
      // Use basic OR matching for keywords in the subject name
      recommendedSubjects = await prisma.subject.findMany({
        where: {
          OR: searchKeywords.map(keyword => ({
            name: {
              contains: keyword,
              mode: 'insensitive'
            }
          }))
        },
        take: 3,
        include: {
          coreSubject: {
            include: {
              mainCourse: true
            }
          }
        }
      });
    }

    // 4. Fallback if no specific matches found or no education listed
    if (recommendedSubjects.length === 0) {
      recommendedSubjects = await prisma.subject.findMany({
        take: 3,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          coreSubject: {
            include: {
              mainCourse: true
            }
          }
        }
      });
    }

    return NextResponse.json({ recommendations: recommendedSubjects });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
