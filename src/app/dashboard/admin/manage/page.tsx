"use client";
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function AdminManage() {
  const [activeTab, setActiveTab] = useState('COURSES');
  const [courses, setCourses] = useState<any[]>([]);
  const [coreSubjects, setCoreSubjects] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Form states
  const [courseName, setCourseName] = useState('');
  const [csName, setCsName] = useState('');
  const [csCourseId, setCsCourseId] = useState('');
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subCsId, setSubCsId] = useState('');
  const [tName, setTName] = useState('');
  const [tEmail, setTEmail] = useState('');
  const [tPass, setTPass] = useState('');
  const [tComm, setTComm] = useState('');

  // Course Builder States
  const [cbMainCourseId, setCbMainCourseId] = useState('');
  const [cbCoreSubjectId, setCbCoreSubjectId] = useState('');
  const [cbSubjectId, setCbSubjectId] = useState('');
  const [curriculumSections, setCurriculumSections] = useState<any[]>([]);

  // Add Section States
  const [sectionTitle, setSectionTitle] = useState('');

  // Add Material States
  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState('VIDEO');
  const [mUrl, setMUrl] = useState('');
  const [mTeacherId, setMTeacherId] = useState('');
  const [mSectionId, setMSectionId] = useState('');

  const fetchData = async () => {
    try {
      const cRes = await fetch('/api/admin/main-courses');
      const cData = await cRes.json();
      if(Array.isArray(cData)) {
        setCourses(cData);
        const allCs = cData.flatMap(c => c.coreSubjects || []);
        setCoreSubjects(allCs);
        const allSubs = allCs.flatMap(cs => cs.subjects || []);
        setSubjects(allSubs);
      }

      const tRes = await fetch('/api/admin/teachers');
      const tData = await tRes.json();
      if(Array.isArray(tData)) setTeachers(tData);
    } catch(err) {
      console.error(err);
      toast.error('Failed to load data');
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Fetch sections and materials whenever a specific subject is selected
  const fetchSections = async () => {
    if (!cbSubjectId) {
      setCurriculumSections([]);
      return;
    }
    try {
      const res = await fetch(`/api/admin/sections?subjectId=${cbSubjectId}`);
      if (!res.ok) {
        console.error("Failed to fetch sections:", await res.text());
        return;
      }
      const data = await res.json();
      setCurriculumSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSections();
  }, [cbSubjectId]);

  const handleAddCourse = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/main-courses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: courseName }) });
    setCourseName(''); fetchData(); toast.success('Main Course Added Successfully!');
  };

  const handleAddCoreSubject = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/core-subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: csName, mainCourseId: csCourseId }) });
    setCsName(''); fetchData(); toast.success('Core Subject Folder Added!');
  };

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: subName, code: subCode, price: subPrice, coreSubjectId: subCsId }) });
    setSubName(''); setSubCode(''); setSubPrice(''); fetchData(); toast.success('Class (Subject) Added!');
  };

  const handleAddTeacher = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/teachers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: tName, email: tEmail, password: tPass, commissionRate: tComm }) });
    setTName(''); setTEmail(''); setTPass(''); setTComm(''); fetchData(); toast.success('Teacher Account Created!');
  };

  const handleAddSection = async (e: any) => {
    e.preventDefault();
    if (!cbSubjectId) {
      toast.error('Select a class first!');
      return;
    }
    await fetch('/api/admin/sections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: sectionTitle, subjectId: cbSubjectId }) });
    setSectionTitle('');
    fetchSections();
    toast.success('Curriculum Section Created!');
  };

  const handleAddMaterial = async (e: any) => {
    e.preventDefault();
    if (!mSectionId) return toast.error('Please select a Section to upload to!');
    
    await fetch('/api/admin/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mTitle, type: mType, url: mUrl, sectionId: mSectionId, teacherId: mTeacherId })
    });
    
    setMTitle(''); setMUrl(''); setMType('VIDEO');
    fetchSections(); // Refresh UI
    toast.success('Material Successfully Uploaded to Course!');
  };

  const handleDeleteMaterial = async (id: string) => {
    if(!confirm('Are you sure you want to delete this material?')) return;
    await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
    fetchSections();
    toast.success('Material Deleted from Course');
  };

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        width: '100%', textAlign: 'left', padding: '16px',
        background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
        border: 'none', borderLeft: activeTab === id ? '4px solid var(--accent-primary)' : '4px solid transparent',
        color: activeTab === id ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px'
      }}
    >
      <span style={{ fontSize: '1.2rem' }}>{icon}</span>{label}
    </button>
  );

  return (
    <div className="flex-col gap-6">
      <Toaster position="top-right" />
      <div className="flex justify-between items-center">
        <h1 className="nav-brand" style={{ fontSize: '2.5rem' }}>Management Hub</h1>
        <a href="/dashboard/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>&larr; Back to Dashboard</a>
      </div>

      <div style={{ display: 'flex', gap: '32px', minHeight: '60vh' }}>
        
        <div className="glass-panel" style={{ flex: '0 0 250px', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Admin Controls</h3>
          </div>
          <div className="flex-col" style={{ padding: '8px 0' }}>
            <TabButton id="COURSES" label="Main Courses" icon="📚" />
            <TabButton id="CORE_SUBJECTS" label="Core Subjects" icon="📁" />
            <TabButton id="SUBJECTS" label="Subjects" icon="📝" />
            <TabButton id="TEACHERS" label="Teachers" icon="🧑‍🏫" />
            <TabButton id="MATERIALS" label="Course Builder" icon="🎬" />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {/* Main Courses */}
          {activeTab === 'COURSES' && (
            <div className="glass-panel slide-up">
              <h2>Add Main Course</h2>
              <form onSubmit={handleAddCourse} className="flex-col">
                <label>Course Name</label>
                <input type="text" value={courseName} onChange={e=>setCourseName(e.target.value)} required placeholder="e.g. Bachelor of Business Administration" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Course</button>
              </form>
            </div>
          )}

          {/* Core Subjects */}
          {activeTab === 'CORE_SUBJECTS' && (
            <div className="glass-panel slide-up">
              <h2>Add Core Subject</h2>
              <form onSubmit={handleAddCoreSubject} className="flex-col">
                <label>Parent Main Course</label>
                <select value={csCourseId} onChange={e=>setCsCourseId(e.target.value)} required>
                  <option value="">Select Main Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label>Core Subject Name</label>
                <input type="text" value={csName} onChange={e=>setCsName(e.target.value)} required placeholder="e.g. Accounting, Web Development" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Core Subject</button>
              </form>
            </div>
          )}

          {/* Subjects */}
          {activeTab === 'SUBJECTS' && (
            <div className="glass-panel slide-up">
              <h2>Add Subject (Class)</h2>
              <form onSubmit={handleAddSubject} className="flex-col">
                <label>Parent Core Subject</label>
                <select value={subCsId} onChange={e=>setSubCsId(e.target.value)} required>
                  <option value="">Select Core Subject Folder</option>
                  {coreSubjects.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                </select>
                <label>Subject Name</label>
                <input type="text" value={subName} onChange={e=>setSubName(e.target.value)} required placeholder="e.g. Advanced Financial Accounting" />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}><label>Subject Code</label><input type="text" value={subCode} onChange={e=>setSubCode(e.target.value)} required placeholder="e.g. FIN301" /></div>
                  <div style={{ flex: 1 }}><label>Price (৳)</label><input type="number" value={subPrice} onChange={e=>setSubPrice(e.target.value)} required placeholder="e.g. 1500" /></div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Subject</button>
              </form>
            </div>
          )}

          {/* Teachers */}
          {activeTab === 'TEACHERS' && (
            <div className="glass-panel slide-up">
              <h2>Add Teacher Account</h2>
              <form onSubmit={handleAddTeacher} className="flex-col">
                <label>Full Name</label><input type="text" value={tName} onChange={e=>setTName(e.target.value)} required placeholder="e.g. Amanullah Khandaker" />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}><label>Email Address</label><input type="email" value={tEmail} onChange={e=>setTEmail(e.target.value)} required placeholder="teacher@educore.com" /></div>
                  <div style={{ flex: 1 }}><label>Initial Password</label><input type="password" value={tPass} onChange={e=>setTPass(e.target.value)} required placeholder="Minimum 6 characters" /></div>
                </div>
                <label>Commission Rate (%)</label><input type="number" value={tComm} onChange={e=>setTComm(e.target.value)} required placeholder="e.g. 30" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Create Teacher Account</button>
              </form>
            </div>
          )}

          {/* COURSE BUILDER */}
          {activeTab === 'MATERIALS' && (
            <div className="slide-up flex-col gap-6">
              
              {/* Step 1: Course Selector */}
              <div className="glass-panel">
                <h2>Advanced Course Builder</h2>
                <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label>1. Main Course</label>
                    <select value={cbMainCourseId} onChange={e => { setCbMainCourseId(e.target.value); setCbCoreSubjectId(''); setCbSubjectId(''); }}>
                      <option value="">-- Choose Main Course --</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>2. Core Subject</label>
                    <select value={cbCoreSubjectId} onChange={e => { setCbCoreSubjectId(e.target.value); setCbSubjectId(''); }} disabled={!cbMainCourseId}>
                      <option value="">-- Choose Folder --</option>
                      {coreSubjects.filter(cs => cs.mainCourseId === cbMainCourseId).map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>3. Class (Subject)</label>
                    <select value={cbSubjectId} onChange={e => setCbSubjectId(e.target.value)} disabled={!cbCoreSubjectId}>
                      <option value="">-- Choose Class --</option>
                      {subjects.filter(s => s.coreSubjectId === cbCoreSubjectId).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Sections & Materials */}
              {cbSubjectId && (
                <>
                  <div className="glass-panel slide-up">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ margin: 0 }}>Course Curriculum</h3>
                      
                      <form onSubmit={handleAddSection} style={{ display: 'flex', gap: '8px' }}>
                        <input 
                          type="text" value={sectionTitle} onChange={e => setSectionTitle(e.target.value)} 
                          placeholder="New Section (e.g. Module 1: Basics)" required style={{ padding: '8px', minWidth: '250px' }} 
                        />
                        <button className="btn btn-primary" type="submit" style={{ padding: '8px 16px' }}>+ Add Section</button>
                      </form>
                    </div>

                    {curriculumSections.length === 0 ? (
                      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>Start by creating your first Section above.</p>
                    ) : (
                      <div className="flex-col gap-4">
                        {curriculumSections.map((section, sIdx) => (
                          <div key={section.id} style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '16px' }}>
                            <h4 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--accent-primary)' }}>
                              Section {sIdx + 1}: {section.title}
                            </h4>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {section.materials && section.materials.length > 0 ? (
                                section.materials.map((m: any, mIdx: number) => (
                                  <li key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(0,0,0,0.3)', marginBottom: '8px', borderRadius: '4px', borderLeft: `4px solid ${m.type === 'VIDEO' ? 'var(--accent-primary)' : 'var(--success)'}` }}>
                                    <div>
                                      <strong>{mIdx + 1}. {m.title}</strong>
                                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                                        ({m.type}) &bull; Teacher: {teachers.find(t => t.id === m.teacherId)?.name || 'Unknown'}
                                      </span>
                                    </div>
                                    <button onClick={() => handleDeleteMaterial(m.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                      Delete
                                    </button>
                                  </li>
                                ))
                              ) : (
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>No materials in this section yet.</p>
                              )}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add Material Form */}
                  {curriculumSections.length > 0 && (
                    <div className="glass-panel slide-up">
                      <h3 style={{ marginBottom: '24px' }}>Add Material to Curriculum</h3>
                      <form onSubmit={handleAddMaterial} className="flex-col">
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <label>Target Section</label>
                            <select value={mSectionId} onChange={e=>setMSectionId(e.target.value)} required>
                              <option value="">-- Choose Section --</option>
                              {curriculumSections.map((s, idx) => <option key={s.id} value={s.id}>Section {idx+1}: {s.title}</option>)}
                            </select>
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Assigned Teacher</label>
                            <select value={mTeacherId} onChange={e=>setMTeacherId(e.target.value)} required>
                              <option value="">Select Teacher for Commission</option>
                              {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.commissionRate}% comm)</option>)}
                            </select>
                          </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                          <div style={{ flex: 2 }}>
                            <label>Material Title</label>
                            <input type="text" value={mTitle} onChange={e=>setMTitle(e.target.value)} required placeholder="e.g. Lecture 1: Introduction to topic" />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label>Type</label>
                            <select value={mType} onChange={e=>setMType(e.target.value)}>
                              <option value="VIDEO">Video</option>
                              <option value="NOTE">Note/PDF</option>
                            </select>
                          </div>
                        </div>
                        
                        <label style={{ marginTop: '16px' }}>Resource URL</label>
                        <input type="url" value={mUrl} onChange={e=>setMUrl(e.target.value)} required placeholder="e.g. https://youtube.com/... or Google Drive Link" />
                        
                        <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Upload & Attach to Section</button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .slide-up { animation: slideUp 0.3s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
