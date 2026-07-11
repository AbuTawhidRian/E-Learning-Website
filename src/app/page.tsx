"use client";
import { useEffect, useState } from 'react';

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/admin/main-courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        else console.error(data.error || 'Failed to load courses');
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex-col gap-6">
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>Master Your Future</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
          Explore our premium courses, learn from top educators, and unlock your potential with our immersive learning platform.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {courses.map(course => (
        <div key={course.id} style={{ marginBottom: '40px' }}>
          <h2 style={{ color: 'var(--accent-primary)', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
            {course.name}
          </h2>
          
          {course.coreSubjects?.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No categories added yet.</p>}
          
          <div className="flex-col gap-6">
            {course.coreSubjects?.map((cs: any) => (
              <div key={cs.id} className="glass-panel" style={{ background: 'rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '16px', color: '#fff' }}>📁 {cs.name}</h3>
                
                {cs.subjects?.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No subjects in this category.</p>}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
                  {cs.subjects?.map((sub: any) => (
                    <div key={sub.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <h4 style={{ color: 'var(--accent-secondary)' }}>{sub.name}</h4>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>Code: {sub.code}</p>
                      <div className="flex justify-between items-center">
                        <span style={{ fontWeight: 'bold' }}>৳{sub.price}</span>
                        <a href={`/buy/${sub.id}`} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.9rem', textDecoration: 'none' }}>Enroll Now</a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
        {courses.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <p>Loading courses or no courses available...</p>
          </div>
        )}
      </div>
    </div>
  );
}
