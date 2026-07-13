'use client';

import React, { useEffect, useState } from 'react';

export default function CourseRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/recommendations')
      .then(res => res.json())
      .then(data => {
        if (data.recommendations && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
      })
      .catch(err => console.error('Failed to load recommendations:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ marginTop: '40px', color: 'var(--text-secondary)' }}>Loading recommendations...</div>;
  }

  if (recommendations.length === 0) {
    return null; // Don't show the section if no recommendations are found
  }

  return (
    <div style={{ marginTop: '64px', borderTop: '1px solid #e2e8f0', paddingTop: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span style={{ fontSize: '1.8rem' }}>🎯</span>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--accent-primary)' }}>
          Recommended For You
        </h2>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Based on your education profile, here are some courses that might be the perfect next step for you.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        {recommendations.map((subject: any) => (
          <div key={subject.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: '#ffffff', transition: 'transform 0.2s', cursor: 'pointer' }}
               onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
               onClick={() => window.location.href = `/courses`} // Ideally this would link to a specific course detail page
          >
            <div style={{ 
              background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', 
              borderRadius: '8px', 
              height: '140px', 
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              fontSize: '3rem'
            }}>
              📚
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 8px 0', color: '#1e293b' }}>
              {subject.name}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0 0 16px 0', flex: 1 }}>
              {subject.coreSubject?.mainCourse?.name || 'Professional Course'}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
              <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: '1.1rem' }}>
                ৳{subject.price}
              </span>
              <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
