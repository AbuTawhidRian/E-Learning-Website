"use client";
import { useEffect, useState, use } from 'react';

export default function LearnPortal({ params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [activeMaterial, setActiveMaterial] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('OVERVIEW');

  useEffect(() => {
    fetch(`/api/student/learn/${resolvedParams.subjectId}`)
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or not enrolled');
        return res.json();
      })
      .then(data => {
        setData(data);
        if (data.materials && data.materials.length > 0) {
          setActiveMaterial(data.materials[0]);
        }
      })
      .catch(err => setError(err.message));
  }, [resolvedParams.subjectId]);

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)', textAlign:'center', fontSize:'1.2rem'}}>{error}</p></div>;
  if (!data) return <div className="container mt-8" style={{textAlign:'center', fontSize:'1.2rem'}}>Loading classroom...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0f172a', margin: '-32px' }}>
      
      {/* Top Navbar Ribbon (Optional, to make it look detached from main app nav if we wanted, but we rely on RootLayout) */}
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
              <div style={{ position: 'relative', paddingBottom: '56.25%', width: '100%' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  src={activeMaterial.url.replace("watch?v=", "embed/")} 
                  allowFullScreen 
                />
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

        {/* Right Sidebar Playlist (25%) */}
        <div style={{ flex: '1 1 300px', background: '#0f172a', borderLeft: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 100px)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: '#1e293b' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Course Content</h3>
          </div>
          
          <div style={{ overflowY: 'auto', flex: 1, padding: '12px' }}>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {data.materials?.map((m: any, idx: number) => {
                const isActive = activeMaterial?.id === m.id;
                return (
                  <li key={m.id}>
                    <button 
                      onClick={() => setActiveMaterial(m)}
                      style={{ 
                        width: '100%', padding: '16px', textAlign: 'left',
                        background: isActive ? 'rgba(79, 70, 229, 0.15)' : 'transparent',
                        border: 'none',
                        borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
                        color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s',
                        display: 'flex', gap: '16px', alignItems: 'flex-start'
                      }}
                    >
                      <div style={{ marginTop: '2px', opacity: isActive ? 1 : 0.4 }}>
                        {m.type === 'VIDEO' ? '▶️' : '📄'}
                      </div>
                      <div>
                        <div style={{ fontWeight: isActive ? 'bold' : 'normal', lineHeight: '1.4' }}>
                          <span style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)', marginRight: '8px' }}>{idx + 1}.</span>
                          {m.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '16px', height: '16px', border: '1px solid var(--text-secondary)', borderRadius: '50%', fontSize: '0.6rem' }}>✓</span>
                          {m.type === 'VIDEO' ? 'Video Lesson' : 'Document'}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
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
                  <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{data.materials?.length || 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'RESOURCES' && (
            <div style={{ maxWidth: '800px' }}>
              <h2 style={{ fontSize: '2rem', marginBottom: '24px' }}>Downloadable Resources</h2>
              {data.materials?.filter((m:any) => m.type === 'NOTE').length > 0 ? (
                <div style={{ display: 'grid', gap: '16px' }}>
                  {data.materials?.filter((m:any) => m.type === 'NOTE').map((m:any) => (
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
