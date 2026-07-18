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

  const [progresses, setProgresses] = useState<any[]>([]);
  
  // Q&A and Reviews states
  const [questions, setQuestions] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [newQuestionTitle, setNewQuestionTitle] = useState('');
  const [newQuestionBody, setNewQuestionBody] = useState('');
  const [replyBody, setReplyBody] = useState<Record<string, string>>({});
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

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

    // Fetch progress
    fetch(`/api/student/progress?subjectId=${resolvedParams.subjectId}`)
      .then(res => res.json())
      .then(data => setProgresses(data))
      .catch(console.error);

    // Fetch QA
    fetch(`/api/student/qa?subjectId=${resolvedParams.subjectId}`)
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(console.error);

    // Fetch Reviews
    fetch(`/api/student/reviews?subjectId=${resolvedParams.subjectId}`)
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(console.error);
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

  const handleMarkAsComplete = async () => {
    if (!activeMaterial) return;
    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ materialId: activeMaterial.id, completed: true })
      });
      if (res.ok) {
        const data = await res.json();
        setProgresses(prev => {
          const idx = prev.findIndex(p => p.materialId === activeMaterial.id);
          if (idx !== -1) {
            const newP = [...prev];
            newP[idx] = data.progress;
            return newP;
          }
          return [...prev, data.progress];
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionBody) return;
    try {
      const res = await fetch('/api/student/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: data.subject.id, title: newQuestionTitle, questionBody: newQuestionBody })
      });
      if (res.ok) {
        const { question } = await res.json();
        setQuestions([question, ...questions]);
        setNewQuestionTitle('');
        setNewQuestionBody('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReply = async (questionId: string) => {
    if (!replyBody[questionId]) return;
    try {
      const res = await fetch('/api/student/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ANSWER', questionId, answerBody: replyBody[questionId] })
      });
      if (res.ok) {
        const { answer } = await res.json();
        setQuestions(questions.map(q => q.id === questionId ? { ...q, answers: [...(q.answers || []), answer] } : q));
        setReplyBody({ ...replyBody, [questionId]: '' });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment) return;
    try {
      const res = await fetch('/api/student/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId: data.subject.id, rating: newReviewRating, comment: newReviewComment })
      });
      if (res.ok) {
        const { review } = await res.json();
        setReviews([review, ...reviews]);
        setNewReviewComment('');
      } else {
        const err = await res.json();
        alert(err.error || "Failed to post review.");
      }
    } catch (err) {
      console.error(err);
    }
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
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                <div style={{ position: 'relative', paddingBottom: '56.25%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  
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
                <div style={{ padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', background: '#020617' }}>
                  <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{activeMaterial.title}</h2>
                  <button 
                    onClick={handleMarkAsComplete}
                    className="btn btn-primary" 
                    disabled={progresses.some(p => p.materialId === activeMaterial.id && p.completed)}
                    style={{ 
                      padding: '8px 16px', fontSize: '0.9rem', 
                      background: progresses.some(p => p.materialId === activeMaterial.id && p.completed) ? 'rgba(16, 185, 129, 0.2)' : 'var(--accent-primary)',
                      color: progresses.some(p => p.materialId === activeMaterial.id && p.completed) ? '#10b981' : '#fff'
                    }}>
                    {progresses.some(p => p.materialId === activeMaterial.id && p.completed) ? '✓ Completed' : 'Mark as Complete'}
                  </button>
                </div>
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
            <h3 style={{ margin: 0, fontSize: '1.1rem', marginBottom: '12px' }}>Course Content</h3>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${allMaterials.length > 0 ? Math.round((progresses.filter(p => p.completed).length / allMaterials.length) * 100) : 0}%`, height: '100%', background: '#10b981', transition: 'width 0.3s ease' }}></div>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '8px 0 0 0', textAlign: 'right' }}>
              {progresses.filter(p => p.completed).length} / {allMaterials.length} completed
            </p>
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
                          const isCompleted = progresses.some(p => p.materialId === m.id && p.completed);
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
                                <div style={{ marginTop: '2px', opacity: isActive || isCompleted ? 1 : 0.4 }}>
                                  <div style={{ width: '16px', height: '16px', border: isCompleted ? 'none' : '2px solid var(--text-secondary)', background: isCompleted ? '#10b981' : 'transparent', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {isCompleted && <span style={{ fontSize: '10px', color: '#fff', fontWeight: 'bold' }}>✓</span>}
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
            <div style={{ maxWidth: '800px' }}>
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Ask a Question</h3>
                <form onSubmit={handlePostQuestion} className="flex-col">
                  <input type="text" placeholder="Title (optional)" value={newQuestionTitle} onChange={e=>setNewQuestionTitle(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                  <textarea placeholder="Describe your question in detail..." value={newQuestionBody} onChange={e=>setNewQuestionBody(e.target.value)} rows={4} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', resize: 'vertical' }} />
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 24px' }}>Post Question</button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {questions.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No questions asked yet. Be the first!</p>
                ) : (
                  questions.map(q => (
                    <div key={q.id} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {q.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{q.student?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{new Date(q.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      {q.title && <h4 style={{ margin: '0 0 8px 0' }}>{q.title}</h4>}
                      <p style={{ color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{q.body}</p>
                      
                      {/* Answers */}
                      {q.answers && q.answers.length > 0 && (
                        <div style={{ marginTop: '24px', paddingLeft: '24px', borderLeft: '2px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {q.answers.map((a: any) => (
                            <div key={a.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: a.author?.role !== 'STUDENT' ? '#10b981' : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {a.author?.name?.charAt(0)}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{a.author?.name}</span>
                                  {a.author?.role !== 'STUDENT' && <span style={{ fontSize: '0.7rem', background: 'rgba(16,185,129,0.2)', color: '#10b981', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>INSTRUCTOR</span>}
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginTop: '4px', whiteSpace: 'pre-wrap' }}>{a.body}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ marginTop: '24px', display: 'flex', gap: '8px' }}>
                        <input type="text" placeholder="Write a reply..." value={replyBody[q.id] || ''} onChange={e=>setReplyBody({...replyBody, [q.id]: e.target.value})} style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff' }} />
                        <button onClick={() => handlePostReply(q.id)} className="btn btn-primary" style={{ padding: '8px 16px' }}>Reply</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'REVIEWS' && (
            <div style={{ maxWidth: '800px' }}>
              <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '16px' }}>Leave a Review</h3>
                <form onSubmit={handlePostReview} className="flex-col">
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <button type="button" key={star} onClick={() => setNewReviewRating(star)} style={{ background: 'none', border: 'none', fontSize: '2rem', cursor: 'pointer', color: star <= newReviewRating ? '#eab308' : 'rgba(255,255,255,0.2)' }}>★</button>
                    ))}
                  </div>
                  <textarea placeholder="Write your review here..." value={newReviewComment} onChange={e=>setNewReviewComment(e.target.value)} rows={4} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', resize: 'vertical' }} />
                  <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-end', padding: '8px 24px' }}>Submit Review</button>
                </form>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No reviews yet.</p>
                ) : (
                  reviews.map(r => (
                    <div key={r.id} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {r.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{r.student?.name}</div>
                          <div style={{ fontSize: '0.8rem', color: '#eab308' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                        </div>
                        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <p style={{ color: '#e2e8f0', lineHeight: 1.6 }}>{r.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
