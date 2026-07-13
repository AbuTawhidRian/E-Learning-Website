"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AllCourses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const savedCart = localStorage.getItem('educore_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUserRole(data.user.role);
          if (data.user.role === 'STUDENT') {
            fetch('/api/student/purchases')
              .then(res => res.json())
              .then(pData => {
                if (Array.isArray(pData)) setMyPurchases(pData);
              });
          }
        }
      })
      .catch(() => {});

    fetch('/api/admin/main-courses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCourses(data);
        else console.error(data.error || 'Failed to load courses');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (sub: any) => {
    const existing = cart.find(c => c.id === sub.id);
    if (!existing) {
      const newCart = [...cart, sub];
      setCart(newCart);
      localStorage.setItem('educore_cart', JSON.stringify(newCart));
      window.dispatchEvent(new Event('cart_updated'));
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 0' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>All Courses</h1>
      <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '48px' }}>
        Browse our entire catalog of programs, categories, and subjects.
      </p>

      {loading ? (
        <p>Loading all courses...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '64px' }}>
          {courses.map(course => (
            <div key={course.id}>
              <h2 style={{ fontSize: '2rem', marginBottom: '24px', color: 'var(--accent-primary)', borderBottom: '2px solid #d1d7dc', paddingBottom: '8px' }}>
                {course.name}
              </h2>

              {course.coreSubjects?.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No categories in this program yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  {course.coreSubjects?.map((cs: any) => (
                    <div key={cs.id}>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{cs.name}</h3>
                      
                      {cs.subjects?.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No subjects in this category.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                          {cs.subjects?.map((sub: any) => (
                            <div 
                              key={sub.id} 
                              className="course-card" 
                              style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                              onClick={() => router.push(`/course/${sub.id}`)}
                            >
                              <div style={{ height: '140px', background: '#d1d7dc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <span style={{ fontSize: '3rem' }}>📚</span>
                              </div>
                              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h4 style={{ fontSize: '1.1rem', marginBottom: '8px', lineHeight: 1.4, color: 'var(--text-primary)' }}>{sub.name}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>Code: {sub.code}</p>
                                <div style={{ marginTop: 'auto' }}>
                                  <div style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px' }}>৳{sub.price}</div>
                                  
                                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                                    {(() => {
                                      const p = myPurchases.find((p: any) => p.subjectId === sub.id);
                                      const status = p ? p.status : null;

                                      if (userRole === 'ADMIN' || userRole === 'TEACHER') {
                                        return (
                                          <a href={`/learn/${sub.id}`} onClick={(e) => e.stopPropagation()} className="btn btn-secondary" style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                                            Enter Classroom
                                          </a>
                                        );
                                      }
                                      if (status === 'APPROVED') {
                                        return (
                                          <a href={`/learn/${sub.id}`} onClick={(e) => e.stopPropagation()} className="btn btn-secondary" style={{ width: '100%', padding: '10px', textAlign: 'center' }}>
                                            Continue Learning
                                          </a>
                                        );
                                      }
                                      if (status === 'PENDING') {
                                        return (
                                          <button disabled onClick={(e) => e.stopPropagation()} className="btn" style={{ width: '100%', background: '#d1d7dc', color: 'var(--text-secondary)', cursor: 'not-allowed', padding: '10px' }}>
                                            Pending Approval
                                          </button>
                                        );
                                      }
                                      
                                      return (
                                        <>
                                          <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} onClick={(e) => { e.stopPropagation(); addToCart(sub); router.push('/cart'); }}>
                                            Buy Now
                                          </button>
                                          <button className="btn btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', color: 'var(--text-primary)', border: '1px solid #1c1d1f' }} onClick={(e) => { e.stopPropagation(); addToCart(sub); }}>
                                            Add to Cart
                                          </button>
                                        </>
                                      );
                                    })()}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
