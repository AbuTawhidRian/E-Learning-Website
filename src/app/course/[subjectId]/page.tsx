import { prisma } from '@/lib/prisma';
import CourseDetailsClient from './CourseDetailsClient';

export default async function CourseDetailsPage({ params }: { params: Promise<{ subjectId: string }> }) {
  const { subjectId } = await params;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      sections: {
        include: {
          materials: true
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

  return <CourseDetailsClient subject={subject} />;
}
