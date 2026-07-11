"use client";
import { useEffect, useState, use } from 'react';
import YouTube from 'react-youtube';

export default function LearnPortal({ params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Auto-play states
  const [countdown, setCountdown] = useState<number | null>(null);
  const [nextMaterial, setNextMaterial] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/student/learn/${resolvedParams.subjectId}`)
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or not enrolled');
        return res.json();
      })
      .then(data => {
        setData(data);
        
        // Auto-expand the first section and set the first material as active
        if (data.sections && data.sections.length > 0) {
          const initialExpanded: Record<string, boolean> = {};
          initialExpanded[data.sections[0].id] = true;
          setExpandedSections(initialExpanded);

          for (const section of data.sections) {
            if (section.materials && section.materials.length > 0) {
              setActiveMaterial(section.materials[0]);
              break;
            }
          }
        }
      })
      .catch(err => setError(err.message));
  }, [resolvedParams.subjectId]);

  // Handle countdown timer for autoplay
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      handlePlayNext();
      return;
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePlayNext = () => {
    if (nextMaterial) {
      setActiveMaterial(nextMaterial);
      
      // Auto-expand the section containing the next material
      if (data?.sections) {
        const nextSection = data.sections.find((s: any) => s.materials.some((m: any) => m.id === nextMaterial.id));
        if (nextSection) {
          setExpandedSections(prev => ({ ...prev, [nextSection.id]: true }));
        }
      }
    }
    setCountdown(null);
    setNextMaterial(null);
  };

  const handleCancelAutoPlay = () => {
    setCountdown(null);
    setNextMaterial(null);
  };

  const handleVideoEnd = () => {
    const allMaterials = data.sections?.flatMap((s: any) => s.materials || []) || [];
    const currentIndex = allMaterials.findIndex((m: any) => m.id === activeMaterial.id);
    
    if (currentIndex !== -1 && currentIndex + 1 < allMaterials.length) {
      const next = allMaterials[currentIndex + 1];
      if (next.type === 'VIDEO') {
        setNextMaterial(next);
        setCountdown(5); // 5 seconds countdown
      }
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)', textAlign:'center', fontSize:'1.2rem'}}>{error}</p></div>;
  if (!data) return <div className="container mt-8" style={{textAlign:'center', fontSize:'1.2rem'}}>Loading classroom...</div>;

  const allMaterials = data.sections?.flatMap((s: any) => s.materials || []) || [];
  const resources = allMaterials.filter((m: any) => m.type === 'NOTE');

  // Helper to extract YouTube ID
  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const vMatch = url.match(/[?&]v=([^&]+)/);
    if (vMatch) return vMatch[1];
    const beMatch = url.match(/youtu\.be\/([^?]+)/);
    if (beMatch) return beMatch[1];
    const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
    if (embedMatch) return embedMatch[1];
    return null;
  };

  const currentVideoId = activeMaterial?.type === 'VIDEO' ? getYouTubeId(activeMaterial.url) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f172a', margin: '-32px' }}>
      
      {/* Top Navbar Ribbon */}
      <div style={{ padding: '16px 32px', background: '#020617', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <h1 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--text-secondary)' }}>
          {data.subject?.name} <span style={{ color: 'var(--accent-primary)', opacity: 0.7 }}>({data.subject?.code})</span>
        </h1>
      </div>

      {/* Cinematic Split Screen */}
      <div style={{ display: 'flex', flexWrap: 'wrap', background: '#000' }}>
        
        {/* Left Video Player Area (75%) */}
        <div style={{ flex: '3 1 700px', background: '#000', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
          {activeMaterial ? (
            activeMaterial.type === 'VIDEO' ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', width: '100%', height: '100%', minHeight: '500px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                
                {/* Auto Play Overlay */}
                {countdown !== null && nextMaterial ? (
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 50, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Up next</p>
                    <h2 style={{ fontSize: '2rem', marginBottom: '40px' }}>{nextMaterial.title}</h2>
                    
                    <div style={{ position: 'relative', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                      <svg viewBox="0 0 36 36" style={{ position: 'absolute', width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                        <path stroke="rgba(255,255,255,0.2)" fill="none" strokeWidth="2" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path stroke="var(--accent-primary)" fill="none" strokeWidth="2" strokeDasharray={`${(countdown / 5) * 100}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      </svg>
                      <button onClick={handlePlayNext} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>
                        ▶
                      </button>
                    </div>
                    
                    <button onClick={handleCancelAutoPlay} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1rem', textDecoration: 'underline' }}>
                      Cancel
                    </button>
                  </div>
                ) : null}

                {/* Video Player */}
                {currentVideoId ? (
                  <YouTube
                    videoId={currentVideoId}
                    opts={{
                      width: '100%',
                      height: '100%',
                      playerVars: { autoplay: 1 }
                    }}
                    onEnd={handleVideoEnd}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    iframeClassName="w-full h-full border-none"
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    Invalid YouTube URL
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: '64px', textAlign: 'center', background: '#111827', minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '4rem', marginBottom: '16px' }}>📄</span>
                <h2>{activeMaterial.title}</h2>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>This is a downloadable document or PDF.</p>
                <a href={activeMaterial.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '1.1rem' }}>
                  Open Document in New Tab
                </a>
              </div>
            )
          ) : (
            <div style={{ padding: '64px', textAlign: 'center', color: 'var(--text-secondary)' }}>No materials uploaded yet.</div>
          )}
        </div>

        {/* Right Sidebar Playlist (25%) - ACCORDION STYLE */}
        <div style={{ flex: '1 1 300px', background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1e293b' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Course Content</h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {data.sections?.length === 0 ? (
              <p style={{ padding: '24px', color: 'var(--text-secondary)', textAlign: 'center' }}>No content available yet.</p>
            ) : (
              data.sections?.map((section: any, sIdx: number) => {
                const isExpanded = expandedSections[section.id];
                const sectionLength = section.materials?.length || 0;

                return (
                  <div key={section.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <button 
                      onClick={() => toggleSection(section.id)}
                      style={{ 
                        width: '100%', padding: '16px 24px', textAlign: 'left',
                        background: '#1e293b', border: 'none', color: 'var(--text-primary)', 
                        cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        transition: 'background 0.2s'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#f8fafc' }}>
                          Section {sIdx + 1}: {section.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                          0 / {sectionLength} | 0min
                        </div>
                      </div>
                      <span style={{ fontSize: '1.2rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', opacity: 0.5 }}>
                        ▼
                      </span>
                    </button>

                    {isExpanded && (
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, background: '#0f172a' }}>
                        {section.materials?.map((m: any, mIdx: number) => {
                          const isActive = activeMaterial?.id === m.id;
                          return (
                            <li key={m.id}>
                              <button 
                                onClick={() => { setActiveMaterial(m); setCountdown(null); }}
                                style={{ 
                                  width: '100%', padding: '16px 24px', textAlign: 'left',
                                  background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                                  border: 'none',
                                  color: isActive ? '#fff' : 'var(--text-secondary)', 
                                  cursor: 'pointer', transition: 'all 0.2s',
                                  display: 'flex', gap: '16px', alignItems: 'flex-start'
                                }}
                              >
                                <div style={{ marginTop: '2px', opacity: isActive ? 1 : 0.4 }}>
                                  <div style={{ width: '16px', height: '16px', border: isActive ? 'none' : '2px solid var(--text-secondary)', background: isActive ? 'var(--accent-primary)' : 'transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isActive && <span style={{ fontSize: '10px', color: '#fff' }}>✓</span>}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontWeight: isActive ? 'bold' : 'normal', lineHeight: '1.4' }}>
                                    {mIdx + 1}. {m.title}
                                  </div>
                                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ opacity: 0.7 }}>{m.type === 'VIDEO' ? '▶️' : '📄'}</span>
                                    {m.type === 'VIDEO' ? 'Video Lesson' : 'Document'}
                                  </div>
                                </div>
                              </button>
                            </li>
                          );
                        })}
                        {section.materials?.length === 0 && (
                          <li style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Empty section.</li>
                        )}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Bottom Tabs Area */}
      <div className="container" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
        
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '32px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '32px' }}>
          {['OVERVIEW', 'RESOURCES', 'Q & A', 'REVIEWS'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                background: 'none', border: 'none', padding: '12px 0',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                borderBottom: activeTab === tab ? '2px solid var(--accent-primary)' : '2px solid transparent',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                cursor: 'pointer', fontSize: '1rem', transition: 'color 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'OVERVIEW' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>About this course</h2>
              <p style={{ lineHeight: '1.8', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                Welcome to <strong>{data.subject?.name}</strong>. This course is designed to take you from a beginner to an advanced level. 
                Follow along with the video lectures and make sure to read all the provided PDF notes. 
              </p>
              <div style={{ display: 'flex', gap: '48px', marginTop: '40px' }}>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Course Code</h4>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.subject?.code}</p>
                </div>
                <div>
                  <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px' }}>Total Lectures</h4>
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{allMaterials.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RESOURCES' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Downloadable Resources</h2>
              {resources.length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {resources.map((m:any) => (
                    <a key={m.id} href={m.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 24px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', textDecoration: 'none', color: '#fff' }}>
                      <span style={{ fontSize: '1.5rem' }}>📄</span>
                      <span style={{ flex: 1 }}>{m.title}</span>
                      <span style={{ color: 'var(--accent-primary)', fontSize: '0.9rem' }}>Download &darr;</span>
                    </a>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-secondary)' }}>No downloadable resources available yet.</p>
              )}
            </div>
          )}

          {activeTab === 'Q & A' && (
            <div style={{ maxWidth: '800px', textAlign: 'center', padding: '64px 0' }}>
              <span style={{ fontSize: '3rem', opacity: 0.5 }}>💬</span>
              <h3 style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Q&A Section Coming Soon</h3>
            </div>
          )}

          {activeTab === 'REVIEWS' && (
            <div style={{ maxWidth: '800px', textAlign: 'center', padding: '64px 0' }}>
              <span style={{ fontSize: '3rem', opacity: 0.5 }}>⭐</span>
              <h3 style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Review System Coming Soon</h3>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
