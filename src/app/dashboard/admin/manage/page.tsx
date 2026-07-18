"use client";
import { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminManage() {
  const [activeTab, setActiveTab] = useState('STUDENTS');
  const [courses, setCourses] = useState<any[]>([]);
  const [coreSubjects, setCoreSubjects] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Analytics & Students States
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [enrollStudentId, setEnrollStudentId] = useState('');
  const [enrollSubjectId, setEnrollSubjectId] = useState('');
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  // Inner View Tabs
  const [courseViewTab, setCourseViewTab] = useState<'ADD' | 'MANAGE'>('ADD');
  const [coreSubjectViewTab, setCoreSubjectViewTab] = useState<'ADD' | 'MANAGE'>('ADD');
  const [subjectViewTab, setSubjectViewTab] = useState<'ADD' | 'MANAGE'>('ADD');
  const [teacherViewTab, setTeacherViewTab] = useState<'ADD' | 'MANAGE'>('ADD');
  const [couponViewTab, setCouponViewTab] = useState<'ADD' | 'MANAGE'>('ADD');

  // Search & Pagination States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);
  const [csSearch, setCsSearch] = useState('');
  const [csPage, setCsPage] = useState(1);
  const [subSearch, setSubSearch] = useState('');
  const [subPage, setSubPage] = useState(1);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherPage, setTeacherPage] = useState(1);
  const [couponSearch, setCouponSearch] = useState('');
  const [couponPage, setCouponPage] = useState(1);

  // Coupon form state
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState('');
  const [newCouponValidUntil, setNewCouponValidUntil] = useState('');

  // Edit states for Main Course
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingCourseName, setEditingCourseName] = useState<string>('');

  // Edit states for Core Subject
  const [editingCsId, setEditingCsId] = useState<string | null>(null);
  const [editingCsName, setEditingCsName] = useState('');
  const [editingCsCourseId, setEditingCsCourseId] = useState('');

  // Edit states for Subject
  const [editingSubId, setEditingSubId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState('');
  const [editingSubCode, setEditingSubCode] = useState('');
  const [editingSubPrice, setEditingSubPrice] = useState('');
  const [editingSubCsId, setEditingSubCsId] = useState('');
  const [editingSubDesc, setEditingSubDesc] = useState('');

  // Edit states for Teacher
  const [editingTId, setEditingTId] = useState<string | null>(null);
  const [editingTName, setEditingTName] = useState('');
  const [editingTEmail, setEditingTEmail] = useState('');
  const [editingTComm, setEditingTComm] = useState('');

  // Edit states for Material
  const [editingMId, setEditingMId] = useState<string | null>(null);
  const [editingMTitle, setEditingMTitle] = useState('');
  const [editingMType, setEditingMType] = useState('VIDEO');
  const [editingMUrl, setEditingMUrl] = useState('');
  const [editingMIsPublic, setEditingMIsPublic] = useState(false);
  const [editingMTeacherId, setEditingMTeacherId] = useState('');

  // Edit states for Section
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  // Form states
  const [courseName, setCourseName] = useState('');
  const [csName, setCsName] = useState('');
  const [csCourseId, setCsCourseId] = useState('');
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');
  const [subPrice, setSubPrice] = useState('');
  const [subDesc, setSubDesc] = useState('');
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
  const [mIsPublic, setMIsPublic] = useState(false);
  const [mTeacherId, setMTeacherId] = useState('');
  const [mSectionId, setMSectionId] = useState('');

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, title: string, message: string, onConfirm: () => void } | null>(null);

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

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

      const aRes = await fetch('/api/admin/analytics');
      const aData = await aRes.json();
      setAnalyticsData(aData);

      const sRes = await fetch('/api/admin/students');
      const sData = await sRes.json();
      if(Array.isArray(sData)) setStudents(sData);

      const coupRes = await fetch('/api/admin/coupons');
      const coupData = await coupRes.json();
      if(Array.isArray(coupData)) setCoupons(coupData);

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

  const handleUpdateCourse = async (id: string) => {
    if (!editingCourseName) return;
    const res = await fetch(`/api/admin/main-courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingCourseName })
    });
    if (!res.ok) {
      toast.error('Failed to update course');
      return;
    }
    setEditingCourseId(null);
    fetchData();
    toast.success('Main Course Updated');
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCouponCode, discountPercentage: newCouponDiscount, validUntil: newCouponValidUntil })
      });
      if (res.ok) {
        toast.success("Coupon created!");
        setNewCouponCode('');
        setNewCouponDiscount('');
        setNewCouponValidUntil('');
        fetchData();
        setCouponViewTab('MANAGE');
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create coupon");
      }
    } catch (err) {
      toast.error("Error creating coupon");
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Coupon',
      message: 'Are you sure you want to delete this coupon code?',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/coupons?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            toast.success("Coupon deleted");
            fetchData();
          } else {
            toast.error("Failed to delete coupon");
          }
        } catch (err) {
          toast.error("Error deleting coupon");
        }
      }
    });
  };

  const handleDeleteCourse = async (id: string) => {
    confirmAction('Delete Main Course', 'Are you sure you want to delete this Main Course? This cannot be undone.', async () => {
      const res = await fetch(`/api/admin/main-courses/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to delete. Ensure it has no subjects.');
        return;
      }
      fetchData();
      toast.success('Main Course Deleted');
    });
  };

  const handleUpdateCoreSubject = async (id: string) => {
    if (!editingCsName || !editingCsCourseId) return;
    const res = await fetch(`/api/admin/core-subjects/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingCsName, mainCourseId: editingCsCourseId })
    });
    if (!res.ok) return toast.error('Failed to update Core Subject');
    setEditingCsId(null); fetchData(); toast.success('Core Subject Updated');
  };

  const handleDeleteCoreSubject = async (id: string) => {
    confirmAction('Delete Core Subject', 'Are you sure you want to delete this Core Subject? This cannot be undone.', async () => {
      const res = await fetch(`/api/admin/core-subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return toast.error(data.error || 'Failed to delete. Ensure it has no subjects.');
      }
      fetchData(); toast.success('Core Subject Deleted');
    });
  };

  const handleUpdateSubject = async (id: string) => {
    if (!editingSubName || !editingSubCode || !editingSubPrice || !editingSubCsId) return;
    const res = await fetch(`/api/admin/subjects/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingSubName, code: editingSubCode, price: editingSubPrice, coreSubjectId: editingSubCsId, description: editingSubDesc })
    });
    if (!res.ok) return toast.error('Failed to update Subject');
    setEditingSubId(null); fetchData(); toast.success('Subject Updated');
  };

  const handleDeleteSubject = async (id: string) => {
    confirmAction('Delete Subject', 'Are you sure you want to delete this Subject? This cannot be undone.', async () => {
      const res = await fetch(`/api/admin/subjects/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return toast.error(data.error || 'Failed to delete. Ensure it has no sections.');
      }
      fetchData(); toast.success('Subject Deleted');
    });
  };

  const handleUpdateTeacher = async (id: string) => {
    if (!editingTName || !editingTEmail || !editingTComm) return;
    const res = await fetch(`/api/admin/teachers/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingTName, email: editingTEmail, commissionRate: editingTComm })
    });
    if (!res.ok) return toast.error('Failed to update Teacher');
    setEditingTId(null); fetchData(); toast.success('Teacher Updated');
  };

  const handleDeleteTeacher = async (id: string) => {
    confirmAction('Delete Teacher', 'Are you sure you want to delete this Teacher account? This cannot be undone.', async () => {
      const res = await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return toast.error(data.error || 'Failed to delete. Teacher might have active courses.');
      }
      fetchData(); toast.success('Teacher Deleted');
    });
  };

  const handleAddCoreSubject = async (e: any) => {
    e.preventDefault();
    await fetch('/api/admin/core-subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: csName, mainCourseId: csCourseId }) });
    setCsName(''); fetchData(); toast.success('Core Subject Folder Added!');
  };

  const handleAddSubject = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/admin/subjects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: subName, code: subCode, price: subPrice, coreSubjectId: subCsId, description: subDesc }) });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      toast.error(data.error || 'Failed to add subject. Is the code unique?');
      return;
    }
    setSubName(''); setSubCode(''); setSubPrice(''); setSubDesc(''); fetchData(); toast.success('Class (Subject) Added!');
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

  const handleUpdateSection = async (id: string) => {
    if (!editingSectionTitle) return;
    const res = await fetch(`/api/admin/sections/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingSectionTitle })
    });
    if (!res.ok) return toast.error('Failed to update Section');
    setEditingSectionId(null); fetchSections(); toast.success('Section Updated');
  };

  const handleDeleteSection = async (id: string) => {
    confirmAction('Delete Section', 'Are you sure you want to delete this Section? This action cannot be undone.', async () => {
      const res = await fetch(`/api/admin/sections/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return toast.error(data.error || 'Failed to delete. Ensure it has no materials.');
      }
      fetchSections(); toast.success('Section Deleted');
    });
  };

  const handleAddMaterial = async (e: any) => {
    e.preventDefault();
    if (!mSectionId) return toast.error('Please select a Section to upload to!');
    
    await fetch('/api/admin/materials', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: mTitle, type: mType, url: mUrl, sectionId: mSectionId, teacherId: mTeacherId, isPublic: mIsPublic })
    });
    
    setMTitle(''); setMUrl(''); setMType('VIDEO'); setMIsPublic(false);
    fetchSections(); // Refresh UI
    toast.success('Material Successfully Uploaded to Course!');
  };

  const handleUpdateMaterial = async (id: string) => {
    if (!editingMTitle) return;
    const res = await fetch(`/api/admin/materials/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editingMTitle, type: editingMType, url: editingMUrl, teacherId: editingMTeacherId, isPublic: editingMIsPublic })
    });
    if (!res.ok) return toast.error('Failed to update Material');
    setEditingMId(null); fetchSections(); toast.success('Material Updated');
  };

  const handleDeleteMaterial = async (id: string) => {
    confirmAction('Delete Material', 'Are you sure you want to delete this material? This action cannot be undone.', async () => {
      await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
      fetchSections();
      toast.success('Material Deleted from Course');
    });
  };

  const handleManualEnroll = async (e: any) => {
    e.preventDefault();
    if (!enrollStudentId || !enrollSubjectId) return toast.error('Please select both a student and a course!');
    
    const res = await fetch('/api/admin/students/enroll', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: enrollStudentId, subjectId: enrollSubjectId })
    });
    
    const data = await res.json();
    if (!res.ok) return toast.error(data.error || 'Failed to enroll student');
    
    setEnrollStudentId(''); setEnrollSubjectId(''); setEnrollModalOpen(false);
    fetchData(); // Refresh to update student enrollments
    toast.success('Student successfully enrolled!');
  };

  const TabButton = ({ id, label, icon }: { id: string, label: string, icon: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        width: '100%', textAlign: 'left', padding: '14px 20px',
        background: activeTab === id ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : 'transparent',
        border: 'none', borderRadius: '12px',
        color: activeTab === id ? '#ffffff' : 'var(--text-secondary)',
        fontSize: '1.05rem', fontWeight: activeTab === id ? 700 : 600, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '12px',
        boxShadow: activeTab === id ? '0 10px 20px -5px rgba(59, 130, 246, 0.4)' : 'none',
        marginBottom: '4px'
      }}
      onMouseEnter={e => { if (activeTab !== id) e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = activeTab === id ? '#ffffff' : '#0f172a'; }}
      onMouseLeave={e => { if (activeTab !== id) e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = activeTab === id ? '#ffffff' : 'var(--text-secondary)'; }}
    >
      <span style={{ fontSize: '1.2rem', filter: activeTab === id ? 'brightness(1.2)' : 'none' }}>{icon}</span>{label}
    </button>
  );

  const ViewTabs = ({ activeView, setActiveView }: { activeView: string, setActiveView: (v: 'ADD' | 'MANAGE') => void }) => (
    <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
      <button onClick={() => setActiveView('ADD')} style={{ flex: 1, background: 'transparent', color: activeView === 'ADD' ? 'var(--accent-primary)' : 'var(--text-secondary)', border: 'none', borderBottom: activeView === 'ADD' ? '2px solid var(--accent-primary)' : '2px solid transparent', padding: '16px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '1rem', marginBottom: '-1px' }}>Add New</button>
      <div style={{ width: '1px', background: '#e2e8f0', margin: '12px 0' }}></div>
      <button onClick={() => setActiveView('MANAGE')} style={{ flex: 1, background: 'transparent', color: activeView === 'MANAGE' ? 'var(--accent-primary)' : 'var(--text-secondary)', border: 'none', borderBottom: activeView === 'MANAGE' ? '2px solid var(--accent-primary)' : '2px solid transparent', padding: '16px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '1rem', marginBottom: '-1px' }}>Manage Existing</button>
    </div>
  );

  const SearchBar = ({ value, onChange, placeholder }: { value: string, onChange: (v: string) => void, placeholder: string }) => (
    <div style={{ marginBottom: '24px', position: 'relative' }}>
      <input 
        type="text" 
        value={value} 
        onChange={e => { onChange(e.target.value); }} 
        placeholder={placeholder}
        style={{ width: '100%', padding: '14px 20px 14px 48px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#ffffff', fontSize: '1rem', outline: 'none', transition: 'border-color 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
        onFocus={e => e.currentTarget.style.borderColor = '#3b82f6'}
        onBlur={e => e.currentTarget.style.borderColor = '#e2e8f0'}
      />
      <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '1.2rem' }}>🔍</span>
    </div>
  );

  const Pagination = ({ currentPage, totalItems, itemsPerPage, onPageChange }: { currentPage: number, totalItems: number, itemsPerPage: number, onPageChange: (p: number) => void }) => {
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    if (totalPages <= 1) return null;
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <span style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>Showing Page {currentPage} of {totalPages}</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onPageChange(Math.max(1, currentPage - 1))} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: currentPage === 1 ? '#e2e8f0' : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: currentPage === 1 ? '#94a3b8' : '#fff', fontWeight: 700, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>Prev</button>
          <button onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: currentPage === totalPages ? '#e2e8f0' : 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', color: currentPage === totalPages ? '#94a3b8' : '#fff', fontWeight: 700, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>Next</button>
        </div>
      </div>
    );
  };

  // Derived state for filtering and pagination
  const ITEMS_PER_PAGE = 10;
  
  const filteredStudents = students.filter(s => s.name?.toLowerCase().includes(studentSearch.toLowerCase()) || s.email?.toLowerCase().includes(studentSearch.toLowerCase()));
  const paginatedStudents = filteredStudents.slice((studentPage - 1) * ITEMS_PER_PAGE, studentPage * ITEMS_PER_PAGE);

  const filteredCourses = courses.filter(c => c.name?.toLowerCase().includes(courseSearch.toLowerCase()));
  const paginatedCourses = filteredCourses.slice((coursePage - 1) * ITEMS_PER_PAGE, coursePage * ITEMS_PER_PAGE);

  const filteredCs = coreSubjects.filter(cs => cs.name?.toLowerCase().includes(csSearch.toLowerCase()));
  const paginatedCs = filteredCs.slice((csPage - 1) * ITEMS_PER_PAGE, csPage * ITEMS_PER_PAGE);

  const filteredSubs = subjects.filter(sub => sub.name?.toLowerCase().includes(subSearch.toLowerCase()) || sub.code?.toLowerCase().includes(subSearch.toLowerCase()));
  const paginatedSubs = filteredSubs.slice((subPage - 1) * ITEMS_PER_PAGE, subPage * ITEMS_PER_PAGE);

  const filteredTeachers = teachers.filter(t => t.name?.toLowerCase().includes(teacherSearch.toLowerCase()) || t.email?.toLowerCase().includes(teacherSearch.toLowerCase()));
  const paginatedTeachers = filteredTeachers.slice((teacherPage - 1) * ITEMS_PER_PAGE, teacherPage * ITEMS_PER_PAGE);

  const filteredCoupons = coupons.filter(c => c.code?.toLowerCase().includes(couponSearch.toLowerCase()));
  const paginatedCoupons = filteredCoupons.slice((couponPage - 1) * ITEMS_PER_PAGE, couponPage * ITEMS_PER_PAGE);

  // Reset page when search changes
  useEffect(() => setStudentPage(1), [studentSearch]);
  useEffect(() => setCoursePage(1), [courseSearch]);
  useEffect(() => setCsPage(1), [csSearch]);
  useEffect(() => setSubPage(1), [subSearch]);
  useEffect(() => setTeacherPage(1), [teacherSearch]);
  useEffect(() => setCouponPage(1), [couponSearch]);

  return (
    <div className="flex-col gap-6" style={{ padding: '40px 48px 60px 48px' }}>
      <Toaster position="top-right" />
      
      {/* Custom Confirm Modal Overlay */}
      {confirmModal?.isOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(2, 6, 23, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
          <div className="glass-panel" style={{ width: '400px', textAlign: 'center', animation: 'slideUp 0.3s ease-out' }}>
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{confirmModal.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button 
                className="btn btn-outline" 
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                style={{ background: '#ef4444', color: '#fff' }}
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center" style={{ marginBottom: '32px' }}>
        <div className="animate-fade-in">
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800, 
            letterSpacing: '-1px', 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #0f172a 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: 'inline-block'
          }}>
            Management Hub
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
            Configure courses, handle students, and manage your instructors.
          </p>
        </div>
        <a href="/dashboard/admin" className="btn animate-fade-in" style={{ 
          textDecoration: 'none', 
          padding: '12px 24px', 
          fontSize: '1.05rem', 
          background: '#ffffff', 
          color: '#0f172a',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #e2e8f0',
          transition: 'all 0.3s ease',
          fontWeight: 700
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
        >
          &larr; Back to Dashboard
        </a>
      </div>

      {/* Analytics Summary Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        <div className="glass-panel animate-stagger-1" style={{ position: 'relative', overflow: 'hidden', padding: '24px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📚</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>{courses.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Main Courses</div>
            </div>
          </div>
        </div>
        
        <div className="glass-panel animate-stagger-2" style={{ position: 'relative', overflow: 'hidden', padding: '24px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📁</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>{coreSubjects.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Core Subjects</div>
            </div>
          </div>
        </div>
        
        <div className="glass-panel animate-stagger-3" style={{ position: 'relative', overflow: 'hidden', padding: '24px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>📝</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>{subjects.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Subjects</div>
            </div>
          </div>
        </div>
        
        <div className="glass-panel animate-stagger-1" style={{ position: 'relative', overflow: 'hidden', padding: '24px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', boxShadow: '0 20px 40px -15px rgba(168, 85, 247, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🧑‍🏫</div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: '#0f172a' }}>{teachers.length}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Teachers</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '32px', minHeight: '60vh' }}>
        
        {/* Sidebar */}
        <div className="glass-panel animate-stagger-2" style={{ flex: '0 0 260px', padding: '24px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)', height: 'fit-content' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '24px', paddingLeft: '8px' }}>Admin Controls</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TabButton id="STUDENTS" label="Students" icon="👨‍🎓" />
            <TabButton id="COURSES" label="Main Courses" icon="📚" />
            <TabButton id="CORE_SUBJECTS" label="Core Subjects" icon="📁" />
            <TabButton id="SUBJECTS" label="Subjects" icon="📝" />
            <TabButton id="TEACHERS" label="Teachers" icon="🧑‍🏫" />
            <TabButton id="MATERIALS" label="Course Builder" icon="🎬" />
            <TabButton id="COUPONS" label="Coupons & Promos" icon="🏷️" />
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1 }}>
          {/* Students View */}
          {activeTab === 'STUDENTS' && (
            <div className="flex-col gap-6 slide-up">
              <div className="glass-panel" style={{ padding: '32px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Student Management</h2>
                  <button onClick={() => setEnrollModalOpen(true)} className="btn btn-primary" style={{ 
                    padding: '12px 24px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', 
                    color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', boxShadow: '0 10px 25px -5px rgba(56, 189, 248, 0.4)',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(56, 189, 248, 0.5)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(56, 189, 248, 0.4)'; }}
                  >
                    + Manual Enroll
                  </button>
                </div>
                <SearchBar value={studentSearch} onChange={setStudentSearch} placeholder="Search students by name or email..." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {paginatedStudents.map(s => (
                    <div key={s.id} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      padding: '24px', 
                      background: '#f8fafc', 
                      borderRadius: '16px', 
                      border: '1px solid #e2e8f0',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                    >
                      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4f46e5', fontSize: '1.4rem' }}>
                          {s.name ? s.name[0].toUpperCase() : '?'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
                            {s.email}
                            <span style={{ margin: '0 8px', color: '#cbd5e1' }}>|</span>
                            Joined {new Date(s.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: '300px', justifyContent: 'flex-end' }}>
                        {s.purchases && s.purchases.length > 0 ? (
                          s.purchases.map((p: any) => (
                            <span key={p.id} style={{ 
                              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)', 
                              color: '#fff', 
                              padding: '4px 12px', 
                              borderRadius: '20px', 
                              fontSize: '0.8rem', 
                              fontWeight: 700,
                              boxShadow: '0 2px 10px rgba(2, 132, 199, 0.2)'
                            }}>
                              {p.subject?.code || 'SUBJ'}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>No Enrollments</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {filteredStudents.length === 0 && (
                    <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                      <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🎓</span>
                      <p style={{ color: '#475569', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>No students found.</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Adjust your search or wait for new signups.</p>
                    </div>
                  )}
                </div>
                <Pagination currentPage={studentPage} totalItems={filteredStudents.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setStudentPage} />
              </div>
            </div>
          )}

          {/* Main Courses */}
          {activeTab === 'COURSES' && (
            <div className="flex-col gap-6 slide-up">
              
              {/* Dynamic Inner Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' }}>
                <button 
                  onClick={() => setCourseViewTab('ADD')}
                  style={{ flex: 1, background: 'transparent', color: courseViewTab === 'ADD' ? 'var(--accent-primary)' : 'var(--text-secondary)', border: 'none', borderBottom: courseViewTab === 'ADD' ? '2px solid var(--accent-primary)' : '2px solid transparent', padding: '16px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '1rem', marginBottom: '-1px' }}
                >
                  Add New
                </button>
                <div style={{ width: '1px', background: '#e2e8f0', margin: '12px 0' }}></div>
                <button 
                  onClick={() => setCourseViewTab('MANAGE')}
                  style={{ flex: 1, background: 'transparent', color: courseViewTab === 'MANAGE' ? 'var(--accent-primary)' : 'var(--text-secondary)', border: 'none', borderBottom: courseViewTab === 'MANAGE' ? '2px solid var(--accent-primary)' : '2px solid transparent', padding: '16px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', fontSize: '1rem', marginBottom: '-1px' }}
                >
                  Manage Existing
                </button>
              </div>

              {courseViewTab === 'ADD' && (
                <div className="glass-panel slide-up">
                  <h2>Add Main Course</h2>
                  <form onSubmit={handleAddCourse} className="flex-col">
                    <label>Course Name</label>
                    <input type="text" value={courseName} onChange={e=>setCourseName(e.target.value)} required placeholder="e.g. Bachelor of Business Administration" />
                    <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Course</button>
                  </form>
                </div>
              )}

              {courseViewTab === 'MANAGE' && (
                <div className="glass-panel slide-up">
                <h2>Manage Main Courses</h2>
                <SearchBar value={courseSearch} onChange={setCourseSearch} placeholder="Search main courses by name..." />
                {filteredCourses.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No main courses found matching your search.</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                      {paginatedCourses.map(course => (
                        <div key={course.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          {editingCourseId === course.id ? (
                            <div style={{ display: 'flex', gap: '12px', flex: 1, marginRight: '16px' }}>
                              <input type="text" value={editingCourseName} onChange={e => setEditingCourseName(e.target.value)} style={{ flex: 1, margin: 0 }} />
                              <button className="btn btn-primary" onClick={() => handleUpdateCourse(course.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
                              <button className="btn btn-outline" onClick={() => setEditingCourseId(null)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Cancel</button>
                            </div>
                          ) : (
                            <>
                              <span style={{ fontWeight: 500, fontSize: '1.1rem' }}>{course.name}</span>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button 
                                  onClick={() => { setEditingCourseId(course.id); setEditingCourseName(course.name); }}
                                  style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => handleDeleteCourse(course.id)}
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }}
                                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                >
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                    <Pagination currentPage={coursePage} totalItems={filteredCourses.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCoursePage} />
                  </>
                )}
              </div>
              )}
            </div>
          )}

          {/* Core Subjects */}
          {activeTab === 'CORE_SUBJECTS' && (
            <div className="flex-col gap-6 slide-up">
              <ViewTabs activeView={coreSubjectViewTab} setActiveView={setCoreSubjectViewTab as any} />
              
              {coreSubjectViewTab === 'ADD' && (
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

              {coreSubjectViewTab === 'MANAGE' && (
                <div className="glass-panel slide-up">
                  <h2>Manage Core Subjects</h2>
                  <SearchBar value={csSearch} onChange={setCsSearch} placeholder="Search core subjects by name..." />
                  {filteredCs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No core subjects found matching your search.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {paginatedCs.map(cs => (
                          <div key={cs.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {editingCsId === cs.id ? (
                              <div style={{ display: 'flex', gap: '12px', flex: 1, marginRight: '16px' }}>
                                <input type="text" value={editingCsName} onChange={e => setEditingCsName(e.target.value)} style={{ flex: 1, margin: 0 }} />
                                <select value={editingCsCourseId} onChange={e => setEditingCsCourseId(e.target.value)} style={{ flex: 1, margin: 0 }}>
                                  <option value="">Select Main Course</option>
                                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button className="btn btn-primary" onClick={() => handleUpdateCoreSubject(cs.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
                                <button className="btn btn-outline" onClick={() => setEditingCsId(null)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Cancel</button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{cs.name}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Main Course: {courses.find(c => c.id === cs.mainCourseId)?.name || 'Unknown'} | <span style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600 }}>{cs.subjects?.length || 0} Subjects</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => { setEditingCsId(cs.id); setEditingCsName(cs.name); setEditingCsCourseId(cs.mainCourseId || ''); }} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}>Edit</button>
                                  <button onClick={() => handleDeleteCoreSubject(cs.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <Pagination currentPage={csPage} totalItems={filteredCs.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCsPage} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Subjects */}
          {activeTab === 'SUBJECTS' && (
            <div className="flex-col gap-6 slide-up">
              <ViewTabs activeView={subjectViewTab} setActiveView={setSubjectViewTab as any} />
              
              {subjectViewTab === 'ADD' && (
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
                    <label>Description</label>
                    <textarea value={subDesc} onChange={e=>setSubDesc(e.target.value)} placeholder="Enter the course description here..." rows={4} />
                    <div style={{ display: 'flex', gap: '16px' }}>
                      <div style={{ flex: 1 }}><label>Subject Code</label><input type="text" value={subCode} onChange={e=>setSubCode(e.target.value)} required placeholder="e.g. FIN301" /></div>
                      <div style={{ flex: 1 }}><label>Price (৳)</label><input type="number" value={subPrice} onChange={e=>setSubPrice(e.target.value)} required placeholder="e.g. 1500" /></div>
                    </div>
                    <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Save Subject</button>
                  </form>
                </div>
              )}

              {subjectViewTab === 'MANAGE' && (
                <div className="glass-panel slide-up">
                  <h2>Manage Subjects</h2>
                  <SearchBar value={subSearch} onChange={setSubSearch} placeholder="Search subjects by name or code..." />
                  {filteredSubs.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No subjects found matching your search.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {paginatedSubs.map(sub => (
                          <div key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {editingSubId === sub.id ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, marginRight: '16px' }}>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <input type="text" value={editingSubName} onChange={e => setEditingSubName(e.target.value)} style={{ flex: 2, margin: 0 }} placeholder="Name" />
                                  <input type="text" value={editingSubCode} onChange={e => setEditingSubCode(e.target.value)} style={{ flex: 1, margin: 0 }} placeholder="Code" />
                                  <input type="number" value={editingSubPrice} onChange={e => setEditingSubPrice(e.target.value)} style={{ flex: 1, margin: 0 }} placeholder="Price" />
                                </div>
                                <div style={{ display: 'flex', gap: '12px' }}>
                                  <select value={editingSubCsId} onChange={e => setEditingSubCsId(e.target.value)} style={{ flex: 1, margin: 0 }}>
                                    <option value="">Select Core Subject</option>
                                    {coreSubjects.map(cs => <option key={cs.id} value={cs.id}>{cs.name}</option>)}
                                  </select>
                                  <button className="btn btn-primary" onClick={() => handleUpdateSubject(sub.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
                                  <button className="btn btn-outline" onClick={() => setEditingSubId(null)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{sub.name} <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 400 }}>({sub.code})</span></div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Price: <span style={{ color: '#10b981', fontWeight: 600 }}>${sub.price || 0}</span> | 
                                    Core Subject: {coreSubjects.find(cs => cs.id === sub.coreSubjectId)?.name || 'Unknown'}
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => { setEditingSubId(sub.id); setEditingSubName(sub.name); setEditingSubCode(sub.code); setEditingSubPrice(sub.price?.toString() || ''); setEditingSubCsId(sub.coreSubjectId || ''); }} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}>Edit</button>
                                  <button onClick={() => handleDeleteSubject(sub.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <Pagination currentPage={subPage} totalItems={filteredSubs.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setSubPage} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Teachers */}
          {activeTab === 'TEACHERS' && (
            <div className="flex-col gap-6 slide-up">
              <ViewTabs activeView={teacherViewTab} setActiveView={setTeacherViewTab as any} />
              
              {teacherViewTab === 'ADD' && (
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

              {teacherViewTab === 'MANAGE' && (
                <div className="glass-panel slide-up">
                  <h2>Manage Teachers</h2>
                  <SearchBar value={teacherSearch} onChange={setTeacherSearch} placeholder="Search teachers by name or email..." />
                  {filteredTeachers.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No teachers found matching your search.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {paginatedTeachers.map(t => (
                          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                            {editingTId === t.id ? (
                              <div style={{ display: 'flex', gap: '12px', flex: 1, marginRight: '16px' }}>
                                <input type="text" value={editingTName} onChange={e => setEditingTName(e.target.value)} style={{ flex: 1, margin: 0 }} placeholder="Name" />
                                <input type="email" value={editingTEmail} onChange={e => setEditingTEmail(e.target.value)} style={{ flex: 1, margin: 0 }} placeholder="Email" />
                                <input type="number" value={editingTComm} onChange={e => setEditingTComm(e.target.value)} style={{ flex: 1, margin: 0 }} placeholder="Commission %" />
                                <button className="btn btn-primary" onClick={() => handleUpdateTeacher(t.id)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Save</button>
                                <button className="btn btn-outline" onClick={() => setEditingTId(null)} style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Cancel</button>
                              </div>
                            ) : (
                              <>
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{t.name}</div>
                                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    {t.email} | Commission: <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{t.commissionRate || 0}%</span>
                                  </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={() => { setEditingTId(t.id); setEditingTName(t.name); setEditingTEmail(t.email); setEditingTComm(t.commissionRate?.toString() || ''); }} style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(245, 158, 11, 0.1)'}>Edit</button>
                                  <button onClick={() => handleDeleteTeacher(t.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                      <Pagination currentPage={teacherPage} totalItems={filteredTeachers.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setTeacherPage} />
                    </>
                  )}
                </div>
              )}
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              {editingSectionId === section.id ? (
                                <div style={{ display: 'flex', gap: '8px', flex: 1, marginRight: '16px' }}>
                                  <input type="text" value={editingSectionTitle} onChange={e => setEditingSectionTitle(e.target.value)} style={{ flex: 1, margin: 0, padding: '4px 8px' }} />
                                  <button className="btn btn-primary" onClick={() => handleUpdateSection(section.id)} style={{ padding: '4px 12px', fontSize: '0.9rem' }}>Save</button>
                                  <button className="btn btn-outline" onClick={() => setEditingSectionId(null)} style={{ padding: '4px 12px', fontSize: '0.9rem' }}>Cancel</button>
                                </div>
                              ) : (
                                <>
                                  <h4 style={{ fontSize: '1.2rem', margin: 0, color: 'var(--accent-primary)' }}>
                                    Section {sIdx + 1}: {section.title}
                                  </h4>
                                  <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={() => { setEditingSectionId(section.id); setEditingSectionTitle(section.title); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontSize: '0.9rem' }}>Edit</button>
                                    <button onClick={() => handleDeleteSection(section.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.9rem' }}>Delete</button>
                                  </div>
                                </>
                              )}
                            </div>
                            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                              {section.materials && section.materials.length > 0 ? (
                                section.materials.map((m: any, mIdx: number) => (
                                  <li key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', background: 'rgba(0,0,0,0.3)', marginBottom: '8px', borderRadius: '4px', borderLeft: `4px solid ${m.type === 'VIDEO' ? 'var(--accent-primary)' : 'var(--success)'}` }}>
                                    {editingMId === m.id ? (
                                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <input type="text" value={editingMTitle} onChange={e => setEditingMTitle(e.target.value)} style={{ flex: 2, padding: '4px 8px', margin: 0 }} placeholder="Title" />
                                          <select value={editingMType} onChange={e => setEditingMType(e.target.value)} style={{ flex: 1, padding: '4px 8px', margin: 0 }}>
                                            <option value="VIDEO">VIDEO</option>
                                            <option value="NOTE">NOTE</option>
                                          </select>
                                          <select value={editingMTeacherId} onChange={e => setEditingMTeacherId(e.target.value)} style={{ flex: 1, padding: '4px 8px', margin: 0 }}>
                                            <option value="">Teacher</option>
                                            {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                          </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                          <input type="url" value={editingMUrl} onChange={e => setEditingMUrl(e.target.value)} style={{ flex: 1, padding: '4px 8px', margin: 0 }} placeholder="URL" />
                                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            <input type="checkbox" checked={editingMIsPublic} onChange={e => setEditingMIsPublic(e.target.checked)} style={{ margin: 0 }} /> Public
                                          </label>
                                          <button className="btn btn-primary" onClick={() => handleUpdateMaterial(m.id)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Save</button>
                                          <button className="btn btn-outline" onClick={() => setEditingMId(null)} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Cancel</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                          <strong>{mIdx + 1}. {m.title}</strong>
                                          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: '8px' }}>
                                            ({m.type}) &bull; Teacher: {teachers.find(t => t.id === m.teacherId)?.name || 'Unknown'} 
                                            &nbsp;&bull;&nbsp; 
                                            <span style={{ 
                                              background: m.isPublic ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                              color: m.isPublic ? '#10b981' : '#ef4444', 
                                              padding: '2px 6px', borderRadius: '8px', fontWeight: 600 
                                            }}>
                                              {m.isPublic ? 'PUBLIC (FREE)' : 'PRIVATE'}
                                            </span>
                                          </span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <button onClick={() => { setEditingMId(m.id); setEditingMTitle(m.title); setEditingMType(m.type); setEditingMUrl(m.url); setEditingMTeacherId(m.teacherId || ''); setEditingMIsPublic(m.isPublic); }} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer' }}>
                                            Edit
                                          </button>
                                          <button onClick={() => handleDeleteMaterial(m.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                            Delete
                                          </button>
                                        </div>
                                      </div>
                                    )}
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
                        
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <input type="checkbox" id="mIsPublic" checked={mIsPublic} onChange={e=>setMIsPublic(e.target.checked)} style={{ width: 'auto', marginBottom: 0 }} />
                          <label htmlFor="mIsPublic" style={{ margin: 0, cursor: 'pointer' }}>Make this material public (free preview for unpaid users)</label>
                        </div>
                        
                        <button className="btn btn-primary" type="submit" style={{ alignSelf: 'flex-start', marginTop: '16px' }}>Upload & Attach to Section</button>
                      </form>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Coupons View */}
          {activeTab === 'COUPONS' && (
            <div className="flex-col gap-6 slide-up">
              <ViewTabs activeView={couponViewTab} setActiveView={setCouponViewTab as any} />

              {couponViewTab === 'ADD' && (
                <div className="glass-panel slide-up">
                  <h2>Create Coupon</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Create discount codes for your students.</p>
                  <form onSubmit={handleCreateCoupon} className="flex-col" style={{ maxWidth: '600px' }}>
                    <label>Coupon Code (e.g. SUMMER20)</label>
                    <input type="text" value={newCouponCode} onChange={e=>setNewCouponCode(e.target.value.toUpperCase())} required />

                    <label style={{ marginTop: '16px' }}>Discount Percentage (%)</label>
                    <input type="number" min="1" max="100" value={newCouponDiscount} onChange={e=>setNewCouponDiscount(e.target.value)} required />

                    <label style={{ marginTop: '16px' }}>Valid Until (Optional)</label>
                    <input type="date" value={newCouponValidUntil} onChange={e=>setNewCouponValidUntil(e.target.value)} />

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '24px', alignSelf: 'flex-start' }}>Create Coupon</button>
                  </form>
                </div>
              )}

              {couponViewTab === 'MANAGE' && (
                <div className="glass-panel slide-up">
                  <h2>Manage Coupons</h2>
                  <SearchBar value={couponSearch} onChange={setCouponSearch} placeholder="Search coupons by code..." />
                  {filteredCoupons.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', marginTop: '16px' }}>No coupons found matching your search.</p>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                        {paginatedCoupons.map((c: any) => (
                        <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '1.2rem', color: 'var(--accent-primary)', letterSpacing: '1px' }}>{c.code}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span>Discount: <strong style={{ color: '#fff' }}>{c.discountPercentage}%</strong></span>
                              <span style={{ padding: '2px 8px', borderRadius: '4px', background: c.isActive ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: c.isActive ? '#10b981' : '#ef4444', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                              <span>Expires: {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'Never'}</span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleDeleteCoupon(c.id)} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}>Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Pagination currentPage={couponPage} totalItems={filteredCoupons.length} itemsPerPage={ITEMS_PER_PAGE} onPageChange={setCouponPage} />
                  </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Enroll Modal */}
      {enrollModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel slide-up" style={{ width: '400px', padding: '32px' }}>
            <h3 style={{ marginBottom: '24px' }}>Manual Enrollment</h3>
            <form onSubmit={handleManualEnroll} className="flex-col">
              <label>Select Student</label>
              <select value={enrollStudentId} onChange={e=>setEnrollStudentId(e.target.value)} required>
                <option value="">-- Choose Student --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.email})</option>)}
              </select>

              <label style={{ marginTop: '16px' }}>Select Course (Subject)</label>
              <select value={enrollSubjectId} onChange={e=>setEnrollSubjectId(e.target.value)} required>
                <option value="">-- Choose Course --</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
              </select>

              <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                <button type="button" onClick={() => setEnrollModalOpen(false)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '12px', borderRadius: '12px' }}>Enroll Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal?.isOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel slide-up" style={{ width: '400px', padding: '32px' }}>
            <h3 style={{ marginBottom: '16px' }}>{confirmModal.title}</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.5 }}>{confirmModal.message}</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setConfirmModal(null)} style={{ flex: 1, padding: '12px', background: 'transparent', border: '1px solid #475569', color: '#cbd5e1', borderRadius: '12px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }} style={{ flex: 1, padding: '12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Yes, Confirm</button>
            </div>
          </div>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .slide-up { animation: slideUp 0.3s ease-out forwards; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  );
}
