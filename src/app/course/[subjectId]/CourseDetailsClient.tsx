"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';

export default function CourseDetailsClient({ subject }: { subject: any }) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    [subject.sections?.[0]?.id]: true // Expand the first section by default
  });

  const toggleSection = (id: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [id]: prev[id] === undefined ? true : !prev[id] // If not defined, it's collapsed by default, so set to true. Wait, if default is collapsed except first, this works perfectly.
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

  // Mock total students for social proof
  const studentCount = Math.floor(Math.random() * 5000) + 1200;

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      
      {/* Dark Hero Section */}
      <div style={{ background: '#1c1d1f', color: '#ffffff', padding: '60px 0 100px 0' }}>
        <div className="container" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Breadcrumbs */}
          <div style={{ fontSize: '0.9rem', color: '#c0c4fc', fontWeight: 600, display: 'flex', gap: '8px' }}>
            <span>{subject.coreSubject?.mainCourse?.name}</span>
            <span>&gt;</span>
            <span>{subject.coreSubject?.name}</span>
          </div>
          
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, maxWidth: '700px', lineHeight: 1.2, color: '#ffffff' }}>
            {subject.name}
          </h1>
          
          <p style={{ fontSize: '1.2rem', maxWidth: '700px', margin: 0, lineHeight: 1.5, color: '#e5e7eb' }}>
            Master {subject.name} with comprehensive materials, expert instructors, and lifetime access to this complete curriculum.
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <span style={{ background: '#eceb98', color: '#3d3c0a', padding: '4px 8px', fontSize: '0.8rem', fontWeight: 'bold', borderRadius: '4px' }}>Bestseller</span>
            <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>4.8 ★★★★★</span>
            <span style={{ fontSize: '0.9rem', color: '#c0c4fc' }}>({Math.floor(studentCount / 4)} ratings)</span>
            <span style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>{studentCount.toLocaleString()} students enrolled</span>
          </div>

        </div>
      </div>

      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', position: 'relative', marginTop: '24px' }}>
        
        {/* Left Column: Course Content */}
        <div style={{ paddingBottom: '80px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px' }}>Course Content</h2>
          
          {subject.sections?.length === 0 ? (
            <div style={{ padding: '32px', background: '#f7f9fa', borderRadius: '8px', border: '1px solid #d1d7dc', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', margin: 0 }}>This course is currently being prepared. Check back soon for the curriculum!</p>
            </div>
          ) : (
            <div style={{ border: '1px solid #d1d7dc', borderRadius: '8px', overflow: 'hidden' }}>
              {subject.sections?.map((section: any, sIdx: number) => (
                <div key={section.id} style={{ borderBottom: sIdx === subject.sections.length - 1 ? 'none' : '1px solid #d1d7dc' }}>
                  
                  <div 
                    onClick={() => toggleSection(section.id)}
                    style={{ background: '#f7f9fa', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ transform: expandedSections[section.id] ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{section.title}</h3>
                    </div>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{section.materials?.length} lectures</span>
                  </div>

                  {expandedSections[section.id] && (
                    <div style={{ background: '#ffffff', borderTop: '1px solid #d1d7dc' }}>
                      {section.materials?.map((mat: any, mIdx: number) => {
                        // First item of first section is a free preview
                        const isPreview = sIdx === 0 && mIdx === 0;
                        return (
                          <div key={mat.id} style={{ 
                            padding: '16px 24px', 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            borderBottom: mIdx === section.materials.length - 1 ? 'none' : '1px solid #e2e8f0',
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{ fontSize: '1.2rem', opacity: isPreview ? 1 : 0.4 }}>
                                {mat.type === 'VIDEO' ? '🎥' : '📄'}
                              </span>
                              <span style={{ 
                                color: isPreview ? 'var(--accent-primary)' : 'var(--text-primary)', 
                                textDecoration: isPreview ? 'underline' : 'none',
                                cursor: isPreview ? 'pointer' : 'default',
                                fontWeight: isPreview ? 600 : 400
                              }}
                              onClick={() => {
                                if (isPreview) setIsVideoModalOpen(true);
                              }}
                              >
                                {mat.title}
                              </span>
                            </div>
                            <div>
                              {isPreview ? (
                                <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }} onClick={() => setIsVideoModalOpen(true)}>Preview</span>
                              ) : (
                                <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>🔒</span>
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

        {/* Right Column: Sticky Checkout Panel */}
        <div style={{ position: 'relative' }}>
          <div className="glass-panel" style={{ 
            position: 'sticky', 
            top: '32px', 
            padding: 0, 
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
            border: '1px solid #d1d7dc',
            transform: 'translateY(-240px)', // Pull up into the dark header
            zIndex: 10,
            background: '#ffffff'
          }}>
            
            {/* Preview Video Thumbnail inside card */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
                height: '220px', 
                position: 'relative', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: '1px solid #d1d7dc'
              }}
              onClick={() => setIsVideoModalOpen(true)}
              onMouseEnter={(e) => {
                const btn = document.getElementById('play-btn-overlay');
                if (btn) btn.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                const btn = document.getElementById('play-btn-overlay');
                if (btn) btn.style.transform = 'scale(1)';
              }}
            >
              {/* Play Button Overlay */}
              <div 
                id="play-btn-overlay"
                style={{
                  width: '64px',
                  height: '64px',
                  background: '#ffffff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s',
                  zIndex: 2
                }}
              >
                <div style={{ width: 0, height: 0, borderTop: '10px solid transparent', borderBottom: '10px solid transparent', borderLeft: '16px solid var(--text-primary)', marginLeft: '4px' }}></div>
              </div>
              
              <div style={{ position: 'absolute', bottom: '16px', left: 0, right: 0, textAlign: 'center', zIndex: 2 }}>
                <span style={{ color: '#ffffff', fontWeight: 600, fontSize: '1rem', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Preview this course</span>
              </div>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)' }}>
                ৳{subject.price}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                <button onClick={addToCart} className="btn btn-secondary" style={{ padding: '16px', fontSize: '1.1rem', width: '100%' }}>
                  Add to Cart
                </button>
                <button onClick={buyNow} className="btn btn-primary" style={{ padding: '16px', fontSize: '1.1rem', width: '100%' }}>
                  Buy Now
                </button>
              </div>

              <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0 0 24px 0' }}>
                30-Day Money-Back Guarantee
              </p>

              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '0 0 12px 0' }}>This course includes:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>📺</span> {subject.sections?.reduce((sum: number, s: any) => sum + s.materials.length, 0) * 1.5} hours on-demand video</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>📄</span> {subject.sections?.reduce((sum: number, s: any) => sum + s.materials.length, 0)} downloadable resources</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>📱</span> Access on mobile and TV</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>♾️</span> Full lifetime access</li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><span>🏆</span> Certificate of completion</li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Video Modal (Portal) */}
      {isVideoModalOpen && typeof document !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{ background: '#000', width: '100%', maxWidth: '900px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ padding: '16px 24px', background: '#1c1d1f', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Course Preview: {subject.name}</h3>
              <button 
                onClick={() => setIsVideoModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '2rem', cursor: 'pointer', lineHeight: 1 }}
              >&times;</button>
            </div>
            
            <div style={{ position: 'relative', paddingTop: '56.25%' /* 16:9 Aspect Ratio */ }}>
              {/* Dummy Public Video */}
              <video 
                controls 
                autoPlay 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
              >
                Your browser does not support the video tag.
              </video>
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
