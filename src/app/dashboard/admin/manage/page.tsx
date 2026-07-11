"use client";
import { useState, useEffect } from 'react';

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

  const [mTitle, setMTitle] = useState('');
  const [mType, setMType] = useState('VIDEO');
  const [mUrl, setMUrl] = useState('');
  const [mSubId, setMSubId] = useState('');
  const [mTeacherId, setMTeacherId] = useState('');

  const fetchData = async () => {
    try {
      const cRes = await fetch('/api/admin/main-courses');
      const cData = await cRes.json();
      if(Array.isArray(cData)) {
        setCourses(cData);
        // Extract core subjects
        const allCs = cData.flatMap(c => c.coreSubjects || []);
        setCoreSubjects(allCs);
        // Extract subjects
        const allSubs = allCs.flatMap(cs => cs.subjects || []);
        setSubjects(allSubs);
      }

      const tRes = await fetch('/api/admin/teachers');
      const tData = await tRes.json();
      if(Array.isArray(tData)) setTeachers(tData);
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddCourse = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/main-courses', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: courseName })
    });
    setCourseName(''); fetchData(); alert('Main Course Added!');
  };

  const handleAddCoreSubject = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/core-subjects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: csName, mainCourseId: csCourseId })
    });
    setCsName(''); fetchData(); alert('Core Subject Added!');
  };

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/subjects', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: subName, code: subCode, price: subPrice, coreSubjectId: subCsId })
    });
    setSubName(''); setSubCode(''); setSubPrice(''); fetchData(); alert('Subject Added!');
  };

  const handleAddTeacher = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/teachers', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: tName, email: tEmail, password: tPass, commissionRate: tComm })
    });
    setTName(''); setTEmail(''); setTPass(''); setTComm(''); fetchData(); alert('Teacher Added!');
  };

  const handleAddMaterial = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mTitle, type: mType, url: mUrl, subjectId: mSubId, teacherId: mTeacherId })
    });
    setMTitle(''); setMUrl(''); alert('Material Uploaded!');
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
            <TabButton id="MATERIALS" label="Materials" icon="🎬" />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {activeTab === 'COURSES' && (
            <div className="glass-panel slide-up">
              <h2>Add Main Course</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create top-level categories like "Bachelor of Business Administration".</p>
              <form onSubmit={handleAddCourse} className="flex-col">
                <label>Course Name</label>
                <input type="text" value={courseName} onChange={e=>setCourseName(e.target.value)} required placeholder="e.g. BBA" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Course</button>
              </form>
            </div>
          )}

          {activeTab === 'CORE_SUBJECTS' && (
            <div className="glass-panel slide-up">
              <h2>Add Core Subject</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create a folder/category (e.g., "Accounting") under a Main Course.</p>
              <form onSubmit={handleAddCoreSubject} className="flex-col">
                <label>Parent Main Course</label>
                <select value={csCourseId} onChange={e=>setCsCourseId(e.target.value)} required>
                  <option value="">Select Main Course</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <label>Core Subject Name</label>
                <input type="text" value={csName} onChange={e=>setCsName(e.target.value)} required placeholder="e.g. Accounting" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Core Subject</button>
              </form>
            </div>
          )}

          {activeTab === 'SUBJECTS' && (
            <div className="glass-panel slide-up">
              <h2>Add Subject</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create an actual enrollable class (e.g., "Principles of Accounting") under a Core Subject.</p>
              <form onSubmit={handleAddSubject} className="flex-col">
                <label>Parent Core Subject</label>
                <select value={subCsId} onChange={e=>setSubCsId(e.target.value)} required>
                  <option value="">Select Core Subject</option>
                  {coreSubjects.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                </select>
                <label>Subject Name</label>
                <input type="text" value={subName} onChange={e=>setSubName(e.target.value)} required placeholder="e.g. Principles of Accounting" />
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label>Subject Code</label>
                    <input type="text" value={subCode} onChange={e=>setSubCode(e.target.value)} required placeholder="ACC101" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Price (৳)</label>
                    <input type="number" value={subPrice} onChange={e=>setSubPrice(e.target.value)} required placeholder="1000" />
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Subject</button>
              </form>
            </div>
          )}

          {activeTab === 'TEACHERS' && (
            <div className="glass-panel slide-up">
              <h2>Add Teacher Account</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Register a new teacher and set their global commission rate.</p>
              <form onSubmit={handleAddTeacher} className="flex-col">
                <label>Full Name</label>
                <input type="text" value={tName} onChange={e=>setTName(e.target.value)} required placeholder="John Doe" />
                <label>Email & Password</label>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <input style={{ flex: 1 }} type="email" value={tEmail} onChange={e=>setTEmail(e.target.value)} required placeholder="teacher@example.com" />
                  <input style={{ flex: 1 }} type="password" value={tPass} onChange={e=>setTPass(e.target.value)} required placeholder="Pass123" />
                </div>
                <label>Commission Rate (%)</label>
                <input type="number" value={tComm} onChange={e=>setTComm(e.target.value)} required placeholder="e.g. 30" />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Create Teacher</button>
              </form>
            </div>
          )}

          {activeTab === 'MATERIALS' && (
            <div className="glass-panel slide-up">
              <h2>Upload Material</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Upload videos or notes, assigning them to a specific subject and teacher.</p>
              <form onSubmit={handleAddMaterial} className="flex-col">
                <label>Subject</label>
                <select value={mSubId} onChange={e=>setMSubId(e.target.value)} required>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
                <label>Assigned Teacher</label>
                <select value={mTeacherId} onChange={e=>setMTeacherId(e.target.value)} required>
                  <option value="">Select Teacher</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.commissionRate}% comm)</option>)}
                </select>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 2 }}>
                    <label>Material Title</label>
                    <input type="text" value={mTitle} onChange={e=>setMTitle(e.target.value)} required placeholder="Lecture 1: Intro" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Type</label>
                    <select value={mType} onChange={e=>setMType(e.target.value)}>
                      <option value="VIDEO">Video</option>
                      <option value="NOTE">Note/PDF</option>
                    </select>
                  </div>
                </div>
                <label>Resource URL</label>
                <input type="url" value={mUrl} onChange={e=>setMUrl(e.target.value)} required placeholder="https://youtube.com/... or https://drive.google.com/..." />
                <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Upload Material</button>
              </form>
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
