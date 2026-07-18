"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

// -- SVG Icons --
const IconPlay = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>;
const IconDoc = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconLock = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconMonitor = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const IconInfinity = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.3 9.3a4.5 4.5 0 0 0 0 6.4 4.5 4.5 0 0 0 6.4 0l2.6-2.6"></path><path d="M19.7 14.7a4.5 4.5 0 0 0 0-6.4 4.5 4.5 0 0 0-6.4 0l-2.6 2.6"></path><line x1="12" y1="12" x2="12.01" y2="12"></line></svg>;
const IconStar = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconChevron = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
const IconCheck = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function CourseDetailsClient({ subject, hasPurchased, stats, userRole }: { subject: any, hasPurchased?: boolean, stats?: { students: number, averageRating: number, totalRatings: number }, userRole?: string | null }) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewMaterial, setPreviewMaterial] = useState<any | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [subject.sections?.[0]?.id]: true
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? true : !prev[id]
    }));
  };

  const addToCart = () => {
    let cart = [];
    const savedCart = localStorage.getItem('educore_cart');
    if (savedCart) {
      cart = JSON.parse(savedCart);
    }
    const existing = cart.find((c: any) => c.id === subject.id);
    if (existing) {
      setToastMessage('Course is already in your cart!');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    const newCart = [...cart, subject];
    localStorage.setItem('educore_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart_updated'));
    setToastMessage('Added to cart!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const buyNow = () => {
    addToCart();
    setTimeout(() => {
      router.push('/cart');
    }, 500);
  };

  const videoCount = subject.sections?.reduce((sum: number, s: any) => sum + s.materials.filter((m: any) => m.type === 'VIDEO').length, 0) || 0;
  const noteCount = subject.sections?.reduce((sum: number, s: any) => sum + s.materials.filter((m: any) => m.type === 'NOTE').length, 0) || 0;

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Premium Dark Slate Hero Section */}
      <div style={{ position: 'relative', background: '#020617', color: '#ffffff', padding: '80px 0', overflow: 'hidden' }}>
        {/* Ambient background glow */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(2,6,23,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
        <div style={{ position: 'absolute', bottom: '-100px', left: '-100px', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(2,6,23,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>

        <div className="container" style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '64px', alignItems: 'center' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600, display: 'flex', gap: '8px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              <span>{subject.coreSubject?.mainCourse?.name}</span>
              <span>•</span>
              <span style={{ color: '#38bdf8' }}>{subject.coreSubject?.name}</span>
            </div>
            
            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, margin: 0, lineHeight: 1.1, color: '#f8fafc', letterSpacing: '-1px' }}>
              {subject.name}
            </h1>
            
            <p style={{ fontSize: '1.15rem', margin: 0, lineHeight: 1.6, color: '#cbd5e1', maxWidth: '600px', fontWeight: 400 }}>
              {subject.description || `Master ${subject.name} with comprehensive materials, expert instructors, and lifetime access to this complete curriculum.`}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px', flexWrap: 'wrap' }}>
              {(stats?.students ?? 0) >= 10 && (
                <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', padding: '6px 12px', fontSize: '0.8rem', fontWeight: 700, borderRadius: '20px', border: '1px solid rgba(245,158,11,0.3)', letterSpacing: '0.5px' }}>BESTSELLER</span>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '1.1rem' }}>{stats?.averageRating || '0'}</span>
                <div style={{ display: 'flex', gap: '2px' }}>{[1,2,3,4,5].map(i => <IconStar key={i} />)}</div>
              </div>
              <span style={{ fontSize: '0.95rem', color: '#94a3b8', textDecoration: 'underline', cursor: 'pointer' }}>({stats?.totalRatings || 0} ratings)</span>
              <span style={{ fontSize: '0.95rem', color: '#f1f5f9' }}>{stats?.students || 0} students enrolled</span>
            </div>
          </div>

          {/* Premium Glassmorphic Checkout Panel */}
          <div style={{ background: 'rgba(30,41,59,0.5)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', padding: '8px', backdropFilter: 'blur(16px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ background: '#0f172a', borderRadius: '16px', padding: '24px' }}>
              <div 
                style={{ background: 'linear-gradient(135deg, #1e293b 0%, #020617 100%)', height: '220px', borderRadius: '12px', position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}
                onClick={() => {
                  const firstPublic = subject.sections?.flatMap((s: any) => s.materials).find((m: any) => m.type === 'VIDEO' && m.isPublic);
                  if (firstPublic) setPreviewMaterial(firstPublic);
                }}
                onMouseEnter={(e) => {
                  const btn = document.getElementById('play-btn-overlay');
                  if (btn) { btn.style.transform = 'scale(1.1)'; btn.style.background = '#38bdf8'; btn.style.color = '#000'; }
                }}
                onMouseLeave={(e) => {
                  const btn = document.getElementById('play-btn-overlay');
                  if (btn) { btn.style.transform = 'scale(1)'; btn.style.background = 'rgba(255,255,255,0.1)'; btn.style.color = '#fff'; }
                }}
              >
                {/* Abstract graphic */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.5, backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                <div id="play-btn-overlay" style={{ width: '72px', height: '72px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(4px)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 2, color: '#fff' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                </div>
                <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
                  <span style={{ background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: '20px', color: '#ffffff', fontWeight: 600, fontSize: '0.85rem', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.1)', letterSpacing: '0.5px' }}>
                    {hasPurchased ? 'CONTINUE LEARNING' : 'PREVIEW COURSE'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>৳{subject.price}</div>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <IconCheck /> 30-Day Guarantee
                </p>
              </div>

              {hasPurchased ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 600, border: '1px solid rgba(16,185,129,0.2)' }}>
                    You own this course
                  </div>
                  <button onClick={() => router.push(`/learn/${subject.id}`)} style={{ background: '#38bdf8', color: '#020617', padding: '18px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.background = '#38bdf8'}>
                    Go to Course
                  </button>
                </div>
              ) : userRole === 'ADMIN' || userRole === 'TEACHER' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8', padding: '16px', borderRadius: '12px', textAlign: 'center', fontWeight: 600, border: '1px solid rgba(56,189,248,0.2)' }}>
                    {userRole === 'ADMIN' ? 'Admin Access' : 'Teacher Access'}
                  </div>
                  <button onClick={() => router.push(`/learn/${subject.id}`)} style={{ background: '#38bdf8', color: '#020617', padding: '18px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#0ea5e9'} onMouseLeave={e => e.currentTarget.style.background = '#38bdf8'}>
                    Go to Course
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '16px' }}>
                  <button onClick={addToCart} style={{ background: 'transparent', color: '#f8fafc', padding: '18px', fontSize: '1.1rem', fontWeight: 600, borderRadius: '12px', border: '1px solid #475569', flex: 1, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = '#1e293b'; e.currentTarget.style.borderColor = '#64748b'; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#475569'; }}>
                    Add to Cart
                  </button>
                  <button onClick={buyNow} style={{ background: '#f8fafc', color: '#0f172a', padding: '18px', fontSize: '1.1rem', fontWeight: 700, borderRadius: '12px', border: 'none', flex: 1.5, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                    Buy Now
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '64px', marginTop: '64px', paddingBottom: '100px' }}>
        
        {/* Left Column: Course Content */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '32px', color: '#0f172a', letterSpacing: '-0.5px' }}>Course Content</h2>
          
          {subject.sections?.length === 0 ? (
            <div style={{ padding: '48px 32px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)' }}>
              <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem' }}>This course is currently being prepared. Check back soon for the curriculum!</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', background: '#ffffff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
              {subject.sections?.map((section: any, sIdx: number) => (
                <div key={section.id} style={{ borderBottom: sIdx === subject.sections.length - 1 ? 'none' : '1px solid #e2e8f0' }}>
                  
                  <div 
                    onClick={() => toggleSection(section.id)}
                    style={{ background: expandedSections[section.id] ? '#f8fafc' : '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = expandedSections[section.id] ? '#f8fafc' : '#ffffff'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ color: '#64748b', transform: expandedSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                        <IconChevron />
                      </span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{section.title}</h3>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>{section.materials?.length} lectures</span>
                  </div>

                  {expandedSections[section.id] && (
                    <div style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                      {section.materials?.map((mat: any, mIdx: number) => {
                        const isPreview = mat.isPublic;
                        const hasFullAccess = hasPurchased || userRole === 'ADMIN' || userRole === 'TEACHER';
                        const canView = isPreview || hasFullAccess;
                        return (
                          <div key={mat.id} style={{ 
                            padding: '16px 24px 16px 60px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: mIdx === section.materials.length - 1 ? 'none' : '1px solid #f1f5f9',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ color: canView ? '#38bdf8' : '#cbd5e1', display: 'flex' }}>
                                {mat.type === 'VIDEO' ? <IconPlay /> : <IconDoc />}
                              </span>
                              <span style={{ 
                                color: canView ? '#0f172a' : '#64748b', 
                                cursor: canView ? 'pointer' : 'default',
                                fontWeight: canView ? 500 : 400,
                                transition: 'color 0.2s'
                              }}
                              onClick={() => {
                                if (hasFullAccess) {
                                  router.push(`/learn/${subject.id}`);
                                } else if (isPreview) {
                                  if (mat.type === 'NOTE') {
                                    window.open(mat.url, '_blank');
                                  } else {
                                    setPreviewMaterial(mat);
                                  }
                                }
                              }}
                              onMouseEnter={e => { if(canView) e.currentTarget.style.color = '#38bdf8'; }}
                              onMouseLeave={e => { if(canView) e.currentTarget.style.color = '#0f172a'; }}
                              >
                                {mat.title}
                              </span>
                            </div>
                            <div>
                              {canView ? (
                                <span 
                                  style={{ color: '#38bdf8', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.5px' }} 
                                  onClick={() => {
                                    if (hasFullAccess) {
                                      router.push(`/learn/${subject.id}`);
                                    } else {
                                      if (mat.type === 'NOTE') {
                                        window.open(mat.url, '_blank');
                                      } else {
                                        setPreviewMaterial(mat);
                                      }
                                    }
                                  }}
                                >
                                  {hasFullAccess ? 'View' : 'Preview'}
                                </span>
                              ) : (
                                <span style={{ color: '#cbd5e1', display: 'flex' }}><IconLock /></span>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Course Features */}
        <div>
          <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0 0 24px 0', color: '#0f172a', letterSpacing: '-0.5px' }}>Course Includes</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '1rem', color: '#475569' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><span style={{ color: '#38bdf8', display: 'flex' }}><IconPlay /></span> <span style={{ fontWeight: 500 }}>{videoCount}</span> on-demand video lectures</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><span style={{ color: '#38bdf8', display: 'flex' }}><IconDoc /></span> <span style={{ fontWeight: 500 }}>{noteCount}</span> downloadable resources</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><span style={{ color: '#38bdf8', display: 'flex' }}><IconMonitor /></span> Access on mobile and TV</li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '16px' }}><span style={{ color: '#38bdf8', display: 'flex' }}><IconInfinity /></span> Full lifetime access</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Video Modal for Preview */}
      {previewMaterial && previewMaterial.type === 'VIDEO' && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.95)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
          <div style={{ width: '100%', maxWidth: '900px', background: '#000', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            
            <div style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.25rem' }}>Course Preview - {previewMaterial.title || 'Introduction'}</h3>
              <button 
                onClick={() => setPreviewMaterial(null)}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
              {previewMaterial.url.includes('youtube.com') || previewMaterial.url.includes('youtu.be') ? (
                <iframe 
                  src={previewMaterial.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} 
                  allowFullScreen
                ></iframe>
              ) : (
                <video 
                  controls 
                  autoPlay 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', outline: 'none' }}
                  src={previewMaterial.url}
                >
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Toast Notification (Portal) */}
      {toastMessage && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '24px',
          background: '#0f172a',
          color: '#38bdf8',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
          border: '1px solid rgba(56,189,248,0.2)',
          zIndex: 9999,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          animation: 'slideUpFade 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards'
        }}>
          <IconCheck /> {toastMessage}
        </div>,
        document.body
      )}
    </div>
  );
}
