"use client";
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null | false>(null);
  const [myPurchases, setMyPurchases] = useState<any[]>([]);
  const router = useRouter();

  const topCoursesRef = useRef<HTMLDivElement>(null);
  const programsRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Navigation state
  const [selectedMainCourse, setSelectedMainCourse] = useState<any | null>(null);
  const [selectedCoreSubject, setSelectedCoreSubject] = useState<any | null>(null);

  // Search, Filter, and Sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [priceFilter, setPriceFilter] = useState('ALL'); // 'ALL', 'FREE', 'PAID'
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'DEFAULT', 'PRICE_LOW_HIGH', 'PRICE_HIGH_LOW', 'NEWEST'

  // Statistics state
  const [statistics, setStatistics] = useState({ learners: 0, instructors: 0, courses: 0, averageRating: 0 });

  useEffect(() => {
    fetch('/api/public/statistics')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStatistics(data);
      })
      .catch(console.error);

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
        } else {
          setUserRole(false);
        }
      })
      .catch(() => { setUserRole(false); });

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
    if (existing) {
      setToastMessage('Course is already in your cart!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newCart = [...cart, sub];
    setCart(newCart);
    localStorage.setItem('educore_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart_updated')); // Notify CartIcon
    setToastMessage('Added to cart!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const getSmartDescription = (name: string, type: 'main' | 'core') => {
    const lower = name.toLowerCase();
    if (type === 'main') {
      if (lower.includes('business') || lower.includes('bba')) return 'A comprehensive program designed to build future business leaders, entrepreneurs, and executives.';
      if (lower.includes('science') || lower.includes('it') || lower.includes('tech') || lower.includes('cse')) return 'Dive deep into the world of technology, computing, and scientific innovation.';
      if (lower.includes('art') || lower.includes('design')) return 'Unleash your creativity with our world-class design and arts curriculum.';
      if (lower.includes('english') || lower.includes('language')) return 'Master communication skills and explore global literature and linguistics.';
      return 'An immersive, career-focused learning path tailored for your ultimate success.';
    }
    if (type === 'core') {
      if (lower.includes('account') || lower.includes('finance') || lower.includes('econ')) return 'Master the language of business and learn how to navigate financial markets.';
      if (lower.includes('market') || lower.includes('brand')) return 'Discover how to build brands, attract customers, and drive revenue growth.';
      if (lower.includes('manage') || lower.includes('lead')) return 'Develop the critical leadership skills required to manage teams and scale organizations.';
      if (lower.includes('web') || lower.includes('software') || lower.includes('code')) return 'Learn modern programming languages and build production-ready applications.';
      if (lower.includes('math') || lower.includes('stat')) return 'Build a strong foundation in analytical thinking and complex problem-solving.';
      return 'Master the fundamental concepts, theories, and practical skills in this core discipline.';
    }
    return '';
  };

  const handleBackToMain = () => {
    setSelectedMainCourse(null);
    setSelectedCoreSubject(null);
  };

  const handleBackToCore = () => {
    setSelectedCoreSubject(null);
  };

  const renderSubjectCard = (sub: any) => {
    const p = myPurchases.find((p: any) => p.subjectId === sub.id);
    const status = p ? p.status : null;
    
    return (
      <div 
        key={sub.id} 
        className="course-card" 
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
        onClick={() => router.push(`/course/${sub.id}`)}
      >
        <div style={{ height: '160px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 4px 6px rgba(245,158,11,0.15))' }}>📚</span>
        </div>
        
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '8px', lineHeight: 1.4, color: '#0f172a' }}>{sub.name}</h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px' }}>
            Code: {sub.code}
          </p>
          
          <div style={{ marginTop: 'auto' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>
              ৳{sub.price}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
              {(() => {
                if (userRole === 'ADMIN' || userRole === 'TEACHER') {
                  return (
                    <a href={`/learn/${sub.id}`} onClick={(e) => e.stopPropagation()} className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none' }}>
                      Enter Classroom
                    </a>
                  );
                }
                if (status === 'APPROVED') {
                  return (
                    <a href={`/learn/${sub.id}`} onClick={(e) => e.stopPropagation()} className="btn" style={{ width: '100%', padding: '12px', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none' }}>
                      Continue Learning
                    </a>
                  );
                }
                if (status === 'PENDING') {
                  return (
                    <button disabled onClick={(e) => e.stopPropagation()} className="btn" style={{ width: '100%', background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed', padding: '12px', borderRadius: '12px', fontWeight: 700, border: 'none' }}>
                      Pending Approval
                    </button>
                  );
                }
                
                return (
                  <>
                    <button className="btn" style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)', color: 'white', borderRadius: '12px', fontWeight: 700, border: 'none', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }} onClick={(e) => { e.stopPropagation(); addToCart(sub); router.push('/cart'); }}>
                      Buy Now
                    </button>
                    <button className="btn" style={{ width: '100%', padding: '12px', background: '#ffffff', color: '#0f172a', border: '1px solid rgba(226, 232, 240, 0.8)', borderRadius: '12px', fontWeight: 700, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onClick={(e) => { e.stopPropagation(); addToCart(sub); }}>
                      Add to Cart
                    </button>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const allSubjects = courses.flatMap(course => 
    (course.coreSubjects || []).flatMap((cs: any) => cs.subjects || [])
  );
  const topCourses = allSubjects.slice(0, 10);

  const getFilteredAndSortedSubjects = (subjectsList: any[]) => {
    let filtered = [...subjectsList];
    
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
    }
    
    // Price filter
    if (priceFilter === 'FREE') {
      filtered = filtered.filter(s => s.price === 0);
    } else if (priceFilter === 'PAID') {
      filtered = filtered.filter(s => s.price > 0);
    }
    
    // Sort
    if (sortBy === 'PRICE_LOW_HIGH') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'PRICE_HIGH_LOW') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'NEWEST') {
      filtered.reverse(); 
    }
    
    return filtered;
  };

  const renderFilterBar = () => (
    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center', background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Price:</span>
        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d7dc', outline: 'none' }}>
          <option value="ALL">All Prices</option>
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
        </select>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Sort By:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d7dc', outline: 'none' }}>
          <option value="DEFAULT">Most Popular</option>
          <option value="NEWEST">Newest</option>
          <option value="PRICE_LOW_HIGH">Price: Low to High</option>
          <option value="PRICE_HIGH_LOW">Price: High to Low</option>
        </select>
      </div>
      {(searchQuery || priceFilter !== 'ALL' || sortBy !== 'DEFAULT') && (
        <button onClick={() => { setSearchQuery(''); setPriceFilter('ALL'); setSortBy('DEFAULT'); }} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}>
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', margin: '-32px' }}>
      
      {/* Hero Section - Premium Design */}
      <section className="animate-stagger-1" style={{ position: 'relative', padding: '100px 32px', background: 'radial-gradient(circle at top right, rgba(245, 158, 11, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.08), transparent 40%), #f8fafc', borderBottom: '1px solid rgba(226, 232, 240, 0.8)', overflow: 'hidden' }}>
        {/* Subtle background decoration */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.1) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, paddingRight: '40px' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '24px', color: '#0f172a' }}>
              Expand your career opportunities with <span style={{ color: 'var(--accent-primary)' }}>easylearnbd</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#475569', marginBottom: '40px', lineHeight: 1.6, maxWidth: '600px' }}>
              Whether you want to learn business, technology, or design, we have the right curriculum to help you achieve your goals. Learn from experts and get practical experience.
            </p>
            
            {/* Premium Global Search Bar */}
            <div 
              style={{ 
                marginBottom: '40px', 
                display: 'flex', 
                alignItems: 'center',
                maxWidth: '600px',
                background: '#ffffff',
                borderRadius: '16px',
                padding: '8px 8px 8px 24px',
                boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)',
                transition: 'box-shadow 0.3s ease',
              }}
              onFocus={(e) => e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(245, 158, 11, 0.3), 0 0 0 2px var(--accent-primary)'}
              onBlur={(e) => e.currentTarget.style.boxShadow = '0 10px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)'}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input 
                type="text" 
                placeholder="What do you want to learn today?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  flex: 1, 
                  padding: '12px 16px', 
                  fontSize: '1.15rem', 
                  border: 'none', 
                  background: 'transparent',
                  outline: 'none',
                  color: '#0f172a',
                  width: '100%',
                  minWidth: 0,
                  margin: 0,
                  boxShadow: 'none'
                }}
              />
              <button 
                onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} 
                style={{ 
                  padding: '14px 32px', 
                  background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '12px', 
                  fontWeight: 700, 
                  fontSize: '1.05rem',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)' }}
              >
                Search
              </button>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="#courses" className="btn" style={{ padding: '16px 32px', fontSize: '1.1rem', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', border: 'none' }}>
                Explore Programs
              </a>
              {userRole === false && (
                <a href="/register" className="btn btn-secondary" style={{ padding: '16px 32px', fontSize: '1.1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)', border: '1px solid rgba(226, 232, 240, 0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                  Sign Up
                </a>
              )}
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {/* Abstract Premium Illustration/Graphic */}
            <div style={{ width: '400px', height: '400px', position: 'relative' }}>
               <div style={{ position: 'absolute', top: '10%', right: '10%', width: '100%', height: '100%', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)', transform: 'rotate(6deg)', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}></div>
               <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '24px', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', border: '1px solid rgba(226, 232, 240, 0.8)', display: 'flex', flexDirection: 'column', padding: '32px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)', zIndex: 2 }}>
                 <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(245, 158, 11, 0.05) 100%)', marginBottom: '24px' }}></div>
                 <div style={{ width: '80%', height: '12px', borderRadius: '6px', background: '#e2e8f0', marginBottom: '16px' }}></div>
                 <div style={{ width: '60%', height: '12px', borderRadius: '6px', background: '#f1f5f9', marginBottom: '40px' }}></div>
                 
                 <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}></div>
                   <div style={{ flex: 1, borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}></div>
                 </div>
                 <div style={{ display: 'flex', gap: '16px' }}>
                   <div style={{ width: '60px', height: '60px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}></div>
                   <div style={{ flex: 1, borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0' }}></div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Statistics Section */}
      <section style={{ padding: '60px 32px', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                {statistics.learners > 0 ? `${statistics.learners}+` : '0'}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Active Learners</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                {statistics.instructors > 0 ? `${statistics.instructors}+` : '0'}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Expert Instructors</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                {statistics.courses > 0 ? `${statistics.courses}+` : '0'}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Professional Courses</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent-primary)', marginBottom: '8px' }}>
                {statistics.averageRating > 0 ? statistics.averageRating : '0'}
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Catalog Area */}
      <section id="courses" className="animate-stagger-2" style={{ padding: '60px 32px', background: '#ffffff', flex: 1 }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '8px' }}>Broad selection of courses</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Choose from highly curated, professional learning paths with new additions published every month.</p>
          </div>

          {loading ? (
            <div style={{ padding: '40px', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
              Loading programs...
            </div>
          ) : (
            <div>
              {/* Navigation Breadcrumbs */}
              {(selectedMainCourse || selectedCoreSubject) && (
                <div style={{ marginBottom: '24px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  <button onClick={handleBackToMain} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>All Programs</button>
                  
                  {selectedMainCourse && (
                    <>
                      <span>&gt;</span>
                      <button onClick={handleBackToCore} style={{ background: 'none', border: 'none', color: selectedCoreSubject ? 'var(--accent-primary)' : 'var(--text-primary)', cursor: selectedCoreSubject ? 'pointer' : 'default', fontWeight: 'bold' }}>
                        {selectedMainCourse.name}
                      </button>
                    </>
                  )}

                  {selectedCoreSubject && (
                    <>
                      <span>&gt;</span>
                      <span style={{ color: 'var(--text-primary)' }}>{selectedCoreSubject.name}</span>
                    </>
                  )}
                </div>
              )}

              {/* Search Results / Main View Switcher */}
              {searchQuery.trim() !== '' ? (
                <div>
                  <h3 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Search Results for "{searchQuery}"</h3>
                  {renderFilterBar()}
                  {(() => {
                    const filtered = getFilteredAndSortedSubjects(allSubjects);
                    return filtered.length === 0 ? (
                      <p style={{ color: 'var(--text-secondary)' }}>No courses found matching your criteria.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {filtered.map(renderSubjectCard)}
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <>
                  {/* View 1: Main Courses (Programs) */}
                  {!selectedMainCourse && (
                    <>
                      {topCourses.length > 0 && (
                        <div style={{ marginBottom: '60px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.8rem', margin: 0 }}>Top Courses</h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => scrollContainer(topCoursesRef, 'left')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>&larr;</button>
                              <button onClick={() => scrollContainer(topCoursesRef, 'right')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>&rarr;</button>
                            </div>
                          </div>
                          <div ref={topCoursesRef} className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '24px', scrollSnapType: 'x mandatory', paddingBottom: '16px', scrollBehavior: 'smooth' }}>
                            {topCourses.map(sub => (
                              <div key={sub.id} style={{ minWidth: '300px', scrollSnapAlign: 'start', flexShrink: 0 }}>
                                {renderSubjectCard(sub)}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                          <h3 style={{ fontSize: '1.8rem', margin: 0 }}>All Programs</h3>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <a href="/courses" style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>See all &rarr;</a>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => scrollContainer(programsRef, 'left')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>&larr;</button>
                              <button onClick={() => scrollContainer(programsRef, 'right')} className="btn btn-secondary" style={{ padding: '8px 12px' }}>&rarr;</button>
                            </div>
                          </div>
                        </div>
                        
                        <div ref={programsRef} className="hide-scrollbar" style={{ display: 'flex', overflowX: 'auto', gap: '24px', scrollSnapType: 'x mandatory', paddingBottom: '16px', scrollBehavior: 'smooth' }}>
                          {courses.map(course => (
                            <div key={course.id} className="program-card" onClick={() => setSelectedMainCourse(course)} style={{ minWidth: '300px', scrollSnapAlign: 'start', flexShrink: 0, margin: 0 }}>
                              <h3 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>{course.name}</h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.5 }}>
                                {getSmartDescription(course.name, 'main')}
                              </p>
                              <button className="btn btn-secondary" style={{ width: '100%' }}>View Categories</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {/* View 2: Core Subjects (Categories) */}
                  {selectedMainCourse && !selectedCoreSubject && (
                    <div>
                      <h3 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Categories in {selectedMainCourse.name}</h3>
                      {selectedMainCourse.coreSubjects?.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No categories available for this program yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                          {selectedMainCourse.coreSubjects?.map((cs: any) => (
                            <div key={cs.id} className="core-subject-card" onClick={() => setSelectedCoreSubject(cs)}>
                              <h4 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>{cs.name}</h4>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                                {getSmartDescription(cs.name, 'core')}
                              </p>
                              <span style={{ color: 'var(--accent-primary)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                Explore Subjects &rarr;
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* View 3: Actual Subjects (Courses to Buy) */}
                  {selectedMainCourse && selectedCoreSubject && (
                    <div>
                      <h3 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Courses in {selectedCoreSubject.name}</h3>
                      {renderFilterBar()}
                      {selectedCoreSubject.subjects?.length === 0 ? (
                        <p style={{ color: 'var(--text-secondary)' }}>No courses available in this category yet.</p>
                      ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                          {getFilteredAndSortedSubjects(selectedCoreSubject.subjects).map(renderSubjectCard)}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Instructor Showcase Section */}
      <section style={{ padding: '80px 32px', background: '#ffffff', borderTop: '1px solid #d1d7dc' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px', textAlign: 'center', color: '#0f172a' }}>Learn from the best</h2>
          <p style={{ fontSize: '1.1rem', color: '#64748b', textAlign: 'center', marginBottom: '48px', maxWidth: '600px', margin: '0 auto 48px' }}>
            Our expert instructors are industry professionals who are passionate about sharing their knowledge and helping you succeed.
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
            {/* Instructor 1 */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                MR
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Mahmudur Rahman</h3>
              <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.95rem' }}>Senior Software Engineer</p>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Former tech lead at a top agency. Specializes in full-stack web development and scalable system design. Taught over 5,000 students.
              </p>
            </div>
            
            {/* Instructor 2 */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(59,130,246,0.2)' }}>
                SK
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Sadia Khan</h3>
              <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.95rem' }}>Chartered Accountant</p>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                With 10+ years in corporate finance, Sadia simplifies complex accounting principles into actionable knowledge for business professionals.
              </p>
            </div>
            
            {/* Instructor 3 */}
            <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '24px' }}>
              <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold', margin: '0 auto 24px', boxShadow: '0 10px 20px rgba(16,185,129,0.2)' }}>
                TA
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a' }}>Tanvir Ahmed</h3>
              <p style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '16px', fontSize: '0.95rem' }}>Digital Marketing Lead</p>
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                Expert in performance marketing and brand strategy. Helps students build real-world marketing campaigns that drive revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials Section */}
      <section style={{ padding: '80px 32px', background: '#f7f9fa', borderTop: '1px solid #d1d7dc' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '40px', textAlign: 'center' }}>How learners like you are achieving their goals</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            
            {/* Review 1 */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none', background: '#ffffff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(226,232,240,0.8)' }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '16px' }}>★★★★★</div>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                  "I started learning Web Development from scratch here. The courses are incredibly well-structured, and I was able to land my first freelance client within 3 months! Highly recommended."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  SA
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Sadik Ahmed</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Freelance Web Developer</p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none', background: '#ffffff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(226,232,240,0.8)' }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '16px' }}>★★★★★</div>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                  "The business and accounting programs on easylearnbd are phenomenal. It gave me the exact practical knowledge I needed to pass my professional exams. Thank you!"
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                  FT
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Fahim Tariq</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Business Analyst</p>
                </div>
              </div>
            </div>

            {/* Review 3 */}
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: 'none', background: '#ffffff', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05), 0 0 0 1px rgba(226,232,240,0.8)' }}>
              <div>
                <div style={{ color: '#f59e0b', fontSize: '1.2rem', marginBottom: '16px' }}>★★★★★</div>
                <p style={{ fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '24px' }}>
                  "I love the lifetime access feature. I can re-watch the complex data structures lectures anytime I need to brush up for an interview. The instructors are top-notch."
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(16,185,129,0.3)' }}>
                  NR
                </div>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 700 }}>Nusrat Rahman</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Software Engineering Student</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer Area */}
      <footer style={{ borderTop: '1px solid #d1d7dc', padding: '40px 32px', background: '#ffffff', color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>
        &copy; {new Date().getFullYear()} easylearnbd.com. All rights reserved.
      </footer>

      {/* Toast Notification */}
      {toastMessage && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          background: '#1e293b',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 9999,
          animation: 'slideUpFade 0.3s ease forwards'
        }}>
          {toastMessage}
        </div>,
        document.body
      )}
    </div>
  );
}
