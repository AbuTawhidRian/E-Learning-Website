import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/auth';
import CourseDetailsClient from './CourseDetailsClient';

export default async function CourseDetailsPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;

  const authUser = await getAuthUser();

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        orderBy: { createdAt: 'asc' },
        include: {
          materials: {
            orderBy: { createdAt: 'asc' }
          }
        }
      },
      coreSubject: {
        include: {
          mainCourse: true
        }
      }
    }
  });

  if (!subject) {
    return (
      <div className="container mt-8" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Course not found</h2>
        <a href="/" className="btn btn-primary" style={{ marginTop: '24px' }}>Back to Home</a>
      </div>
    );
  }

  let hasPurchased = false;
  if (authUser) {
    const purchase = await prisma.purchase.findFirst({
      where: {
        studentId: authUser.userId,
        subjectId: subject.id,
        status: 'APPROVED'
      }
    });
    if (purchase) {
      hasPurchased = true;
    }
  }

  const [purchaseCount, reviews] = await Promise.all([
    prisma.purchase.count({
      where: {
        subjectId: subject.id,
        status: 'APPROVED'
      }
    }),
    prisma.review.aggregate({
      where: { subjectId: subject.id },
      _avg: { rating: true },
      _count: { rating: true }
    })
  ]);

  const stats = {
    students: purchaseCount,
    averageRating: reviews._avg.rating ? Number(reviews._avg.rating.toFixed(1)) : 0,
    totalRatings: reviews._count.rating || 0
  };

  const userRole = authUser ? authUser.role : null;

  return <CourseDetailsClient subject={subject} hasPurchased={hasPurchased} stats={stats} userRole={userRole} />;
}

