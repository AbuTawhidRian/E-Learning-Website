'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import CourseRecommendations from '@/components/CourseRecommendations';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('DASHBOARD');
  const [profileTab, setProfileTab] = useState('PERSONAL'); // 'PERSONAL', 'EDUCATION', 'ORDERS'
  
  const [user, setUser] = useState<any>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [educations, setEducations] = useState<any[]>([]);
  const [mainCourses, setMainCourses] = useState<any[]>([]);
  const router = useRouter();

  // Profile edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const [showDeletePicModal, setShowDeletePicModal] = useState(false);
  const [isDeletingPic, setIsDeletingPic] = useState(false);
  
  // Education form state
  const [showEducationForm, setShowEducationForm] = useState(false);
  const [degree, setDegree] = useState('');
  const [major, setMajor] = useState('');
  const [institution, setInstitution] = useState('');
  const [passingYear, setPassingYear] = useState('');
  const [isCurrentlyStudying, setIsCurrentlyStudying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [educationToDelete, setEducationToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authRes = await fetch('/api/auth/me');
        if (!authRes.ok) throw new Error('Not authenticated');
        const data = await authRes.json();
        if (data.user.role !== 'STUDENT') {
          router.push('/dashboard/admin');
          return;
        }
        setUser(data.user);
        setEditName(data.user.name);
        setEditPhone(data.user.phone || '');
        setEditAddress(data.user.address || '');
        
        // Fetch purchases
        fetch('/api/student/purchases')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setPurchases(data);
          })
          .catch(err => console.error('Error fetching purchases:', err));

        // Fetch educations
        fetch('/api/student/education')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setEducations(data);
          })
          .catch(err => console.error('Error fetching education:', err));

        // Fetch main courses for dropdown
        fetch('/api/admin/main-courses')
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) setMainCourses(data);
          })
          .catch(err => console.error('Error fetching main courses:', err));
          
      } catch (err) {
        console.error('Auth error:', err);
        router.push('/login');
      }
    };
    fetchData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    try {
      const res = await fetch('/api/student/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, phone: editPhone, address: editAddress })
      });
      if (res.ok) {
        setUser({ ...user, name: editName, phone: editPhone, address: editAddress });
        setIsEditingProfile(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/student/profile-picture', {
        method: 'POST',
        body: formData
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser({ ...user, profilePicture: data.profilePicture });
      } else {
        alert(data.error || "Failed to upload picture");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred during upload");
    } finally {
      setIsUploadingPic(false);
    }
  };

  const handleDeleteProfilePicture = () => {
    setShowDeletePicModal(true);
  };

  const confirmDeleteProfilePicture = async () => {
    setIsDeletingPic(true);
    try {
      const res = await fetch('/api/student/profile-picture', { method: 'DELETE' });
      if (res.ok) {
        setUser({ ...user, profilePicture: null });
        setShowDeletePicModal(false);
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setIsDeletingPic(false);
    }
  };

  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        degree, major, institution,
        passingYear: isCurrentlyStudying ? 'Currently Studying' : passingYear
      };
      
      const res = await fetch('/api/student/education', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        const newEdu = await res.json();
        setEducations([newEdu, ...educations]);
        setShowEducationForm(false);
        setDegree(''); setMajor(''); setInstitution(''); setPassingYear(''); setIsCurrentlyStudying(false);
      }
    } catch (error) {
      console.error('Error adding education:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!educationToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/student/education?id=${educationToDelete}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setEducations(educations.filter(e => e.id !== educationToDelete));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.error('Error deleting education:', error);
    } finally {
      setIsDeleting(false);
      setEducationToDelete(null);
    }
  };

  const handleDownloadInvoice = (purchaseId: string) => {
    window.open(`/dashboard/student/invoice/${purchaseId}`, '_blank');
  };

  if (!user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div style={{ width: '40px', height: '40px', border: '4px solid #f3f4f6', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loading your dashboard...</p>
      </div>
    );
  }

  const SubTabButton = ({ id, label, icon }: { id: string, label: string, icon: string }) => {
    const isActive = profileTab === id;
    return (
      <button 
        onClick={() => setProfileTab(id)}
        style={{
          width: '100%', padding: '16px 24px', textAlign: 'left', background: isActive ? '#f8fafc' : 'transparent',
          border: 'none', borderLeft: isActive ? '4px solid var(--accent-primary)' : '4px solid transparent',
          color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontSize: '1rem', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '16px',
          fontWeight: isActive ? 700 : 500
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '1.2rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{icon}</span>
          {label}
        </div>
        <span style={{ color: 'var(--success)', opacity: isActive ? 1 : 0 }}>✓</span>
      </button>
    );
  };

  const calculateProfileCompletion = () => {
    if (!user) return 0;
    let completedFields = 0;
    if (user.name) completedFields++;
    if (user.email) completedFields++;
    if (user.phone) completedFields++;
    if (user.address) completedFields++;
    if (user.profilePicture) completedFields++;
    if (educations && educations.length > 0) completedFields++;
    return Math.round((completedFields / 6) * 100);
  };

  const profileCompletion = calculateProfileCompletion();

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px', maxWidth: '1200px', margin: '40px auto 0' }}>
      
      {/* Sleek Segmented Control Navigation */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '24px', gap: '8px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
          <button 
            onClick={() => setActiveTab('DASHBOARD')}
            style={{
              padding: '12px 32px', 
              background: activeTab === 'DASHBOARD' ? '#ffffff' : 'transparent',
              border: 'none', 
              color: activeTab === 'DASHBOARD' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderRadius: '20px',
              fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: activeTab === 'DASHBOARD' ? 700 : 600,
              boxShadow: activeTab === 'DASHBOARD' ? '0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}>
            <span style={{ fontSize: '1.2rem' }}>🏠</span> Overview
          </button>
          <button 
            onClick={() => setActiveTab('PROFILE')}
            style={{
              padding: '12px 32px', 
              background: activeTab === 'PROFILE' ? '#ffffff' : 'transparent',
              border: 'none', 
              color: activeTab === 'PROFILE' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              borderRadius: '20px',
              fontSize: '1rem', cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
              display: 'flex', alignItems: 'center', gap: '8px',
              fontWeight: activeTab === 'PROFILE' ? 700 : 600,
              boxShadow: activeTab === 'PROFILE' ? '0 4px 12px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.05)' : 'none'
            }}>
            <span style={{ fontSize: '1.2rem' }}>👤</span> Profile
          </button>
        </div>
      </div>

      {activeTab === 'DASHBOARD' && (
        <div className="glass-panel slide-up" style={{ background: '#ffffff', padding: '40px', borderRadius: '24px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>My Enrolled Courses</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px', marginBottom: '48px' }}>
            {purchases.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📚</div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>You haven't enrolled in any courses yet.</p>
              </div>
            ) : (
              purchases.map(p => (
                <div key={p.id} 
                  style={{ 
                    padding: '32px 24px', 
                    borderRadius: '24px', 
                    background: '#ffffff', 
                    border: '1px solid rgba(226, 232, 240, 0.8)', 
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.02), 0 4px 10px -5px rgba(0,0,0,0.02)', 
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    display: 'flex', flexDirection: 'column', height: '100%',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.boxShadow = '0 25px 50px -12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.02), 0 4px 10px -5px rgba(0,0,0,0.02)';
                    e.currentTarget.style.borderColor = 'rgba(226, 232, 240, 0.8)';
                  }}
                >
                  <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '24px', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <span style={{ filter: 'drop-shadow(0 2px 4px rgba(245,158,11,0.2))' }}>📘</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '8px', color: '#0f172a', lineHeight: 1.3 }}>{p.subject?.name || 'Unknown Course'}</h3>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px', fontWeight: 500, flex: 1 }}>Enrolled: {new Date(p.createdAt).toLocaleDateString()}</p>
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push(`/course/${p.subjectId}`); }} 
                    style={{ 
                      width: '100%', padding: '12px', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                      background: 'linear-gradient(135deg, var(--accent-primary) 0%, #d97706 100%)',
                      color: 'white', border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.25)',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 158, 11, 0.4)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.25)'; }}
                  >
                    Continue Learning
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <span style={{ fontSize: '1.8rem' }}>✨</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Upcoming & Recommended</h2>
          </div>
          
          {educations.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎓</div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '16px' }}>We need to know your educational background to recommend the best upcoming courses for you!</p>
              <button onClick={() => setActiveTab('PROFILE')} className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px' }}>Update Profile</button>
            </div>
          ) : (
            <CourseRecommendations key={educations.length} />
          )}
        </div>
      )}

      {activeTab === 'PROFILE' && (
        <div className="slide-up" style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '32px' }}>
          
          {/* PROFILE LEFT SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Profile Card */}
            <div className="glass-panel" style={{ padding: '32px', background: '#ffffff', textAlign: 'center', position: 'relative', borderRadius: '24px' }}>
              <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 24px auto' }}>
                <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(45deg, var(--accent-primary), #3b82f6)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
                    {isUploadingPic && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                        <div style={{ width: '20px', height: '20px', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                      </div>
                    )}
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '3rem' }}>👤</span>
                    )}
                  </div>
                </div>
                <label style={{ position: 'absolute', bottom: '0', right: '0', background: 'white', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', cursor: isUploadingPic ? 'not-allowed' : 'pointer', fontSize: '1.2rem' }}>
                  📷
                  <input type="file" accept="image/*" disabled={isUploadingPic} style={{ display: 'none' }} onChange={handleProfilePictureUpload} />
                </label>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 8px 0', color: '#0f172a' }}>{user.name}</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '0 0 16px 0', fontSize: '0.9rem', fontWeight: 500 }}>{user.email}</p>
              
              <div style={{ width: '100%', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 700 }}>
                  <span style={{ color: '#475569' }}>Profile Completion</span>
                  <span style={{ color: 'var(--accent-primary)' }}>{profileCompletion}%</span>
                </div>
                <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${profileCompletion}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, var(--accent-primary))', transition: 'width 0.5s ease-out' }}></div>
                </div>
              </div>

              {user.profilePicture && !isUploadingPic && (
                <button onClick={handleDeleteProfilePicture} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700, width: '100%', marginTop: '24px' }}>Remove Picture</button>
              )}
            </div>

            {/* Profile Sub-Navigation */}
            <div className="glass-panel" style={{ padding: '16px 0', background: '#ffffff', overflow: 'hidden', position: 'sticky', top: '24px', borderRadius: '24px' }}>
              <SubTabButton id="PERSONAL" label="Personal Details" icon="👤" />
              <SubTabButton id="EDUCATION" label="Education Profile" icon="🎓" />
              <SubTabButton id="ORDERS" label="Order History" icon="🛒" />
            </div>
          </div>

          {/* PROFILE RIGHT PANE */}
          <div className="glass-panel" style={{ background: '#ffffff', padding: '40px', borderRadius: '24px' }}>
            
            {profileTab === 'PERSONAL' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Personal Details</h3>
                  {!isEditingProfile && (
                    <button onClick={() => setIsEditingProfile(true)} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>✏️</span> Edit Details
                    </button>
                  )}
                </div>
                
                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px', marginBottom: '48px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Full Name</label>
                        <input required type="text" value={editName} onChange={e => setEditName(e.target.value)} className="form-input" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Email Address <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>(Locked)</span></label>
                        <input type="email" value={user.email} disabled className="form-input" style={{ background: '#f8fafc', color: 'var(--text-secondary)', cursor: 'not-allowed' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Mobile Number</label>
                        <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="e.g. +88018..." className="form-input" />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Address</label>
                        <input type="text" value={editAddress} onChange={e => setEditAddress(e.target.value)} placeholder="e.g. House 1, Street 2, City" className="form-input" />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setIsEditingProfile(false)} className="btn btn-secondary" disabled={isUpdatingProfile}>Cancel</button>
                      <button type="submit" className="btn btn-primary" disabled={isUpdatingProfile}>
                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', borderBottom: '1px solid #e2e8f0', paddingBottom: '32px', marginBottom: '48px' }}>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Full Name</p>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.name}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Email</p>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.email}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Mobile Number</p>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.phone || 'Not Provided'}</p>
                    </div>
                    <div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Address</p>
                      <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{user.address || 'Not Provided'}</p>
                    </div>
                  </div>
                )}

                {/* Device Activity */}
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>Device Activity</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Session</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Platform</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(user.loginHistory && Array.isArray(user.loginHistory) && user.loginHistory.length > 0) ? (
                      user.loginHistory.slice(0, 3).map((historyItem: any, idx: number) => (
                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>{idx + 1}</td>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: idx === 0 ? '#22c55e' : '#cbd5e1' }}></span>
                              {historyItem.device || 'Unknown Device'} {idx === 0 && '(Current)'}
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                            {historyItem.date ? new Date(historyItem.date).toLocaleString() : 'Unknown date'}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ padding: '32px', textAlign: 'center' }}>No history</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {profileTab === 'EDUCATION' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>Education Profile</h3>
                  {!showEducationForm && (
                    <button onClick={() => setShowEducationForm(true)} className="btn btn-secondary" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>➕</span> Add Education
                    </button>
                  )}
                </div>
                
                {showEducationForm && (
                  <div className="glass-panel" style={{ background: '#f8fafc', padding: '32px', borderRadius: '16px', marginBottom: '32px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>New Education Record</h4>
                      <button onClick={() => setShowEducationForm(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>✕</button>
                    </div>
                    <form onSubmit={handleAddEducation} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'end' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Degree / Level</label>
                        <select required value={degree} onChange={e => {
                          setDegree(e.target.value);
                          setMajor('');
                        }} className="form-input" style={{ appearance: 'auto', background: '#ffffff' }}>
                          <option value="" disabled>Select Degree</option>
                          <option value="SSC / O-Level">SSC / O-Level</option>
                          <option value="HSC / A-Level">HSC / A-Level</option>
                          <option value="B.Sc / B.A / B.Com">B.Sc / B.A / B.Com</option>
                          <option value="M.Sc / M.A / M.Com">M.Sc / M.A / M.Com</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>
                          {!degree ? 'Subject / Major' : degree.includes('SSC') || degree.includes('HSC') ? 'Group' : 'Subject / Major'}
                        </label>
                        {!degree ? (
                          <select disabled className="form-input" style={{ appearance: 'auto', background: '#e2e8f0', cursor: 'not-allowed' }}>
                            <option value="">Please select a degree first</option>
                          </select>
                        ) : degree.includes('SSC') || degree.includes('HSC') ? (
                          <select required value={major} onChange={e => setMajor(e.target.value)} className="form-input" style={{ appearance: 'auto', background: '#ffffff' }}>
                            <option value="" disabled>Select Group</option>
                            <option value="Science">Science</option>
                            <option value="Business Studies">Business Studies / Commerce</option>
                            <option value="Humanities">Humanities / Arts</option>
                            <option value="Other">Other</option>
                          </select>
                        ) : (
                          <select required value={major} onChange={e => setMajor(e.target.value)} className="form-input" style={{ appearance: 'auto', background: '#ffffff' }}>
                            <option value="" disabled>Select Subject/Major</option>
                            {mainCourses.map(mc => (
                              mc.coreSubjects && mc.coreSubjects.length > 0 ? (
                                <optgroup key={mc.id} label={mc.name}>
                                  {mc.coreSubjects.map((cs: any) => (
                                    <option key={cs.id} value={cs.name}>{cs.name}</option>
                                  ))}
                                </optgroup>
                              ) : null
                            ))}
                            <option value="Other">Other</option>
                          </select>
                        )}
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 600 }}>Institution</label>
                        <input required value={institution} onChange={e => setInstitution(e.target.value)} type="text" placeholder="e.g. University of Dhaka" className="form-input" style={{ background: '#ffffff' }} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <label style={{ fontSize: '0.9rem', fontWeight: 600 }}>Passing Year</label>
                          <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-secondary)', userSelect: 'none' }}>
                            <input type="checkbox" checked={isCurrentlyStudying} onChange={e => setIsCurrentlyStudying(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--accent-primary)', margin: 0, outline: 'none', boxSizing: 'border-box' }} />
                            Currently Studying
                          </label>
                        </div>
                        <input required={!isCurrentlyStudying} disabled={isCurrentlyStudying} value={isCurrentlyStudying ? '' : passingYear} onChange={e => setPassingYear(e.target.value)} type="text" placeholder="e.g. 2024" className="form-input" style={{ background: isCurrentlyStudying ? '#f1f5f9' : '#ffffff', border: '1px solid #e2e8f0', boxSizing: 'border-box', color: isCurrentlyStudying ? '#94a3b8' : 'inherit' }} />
                      </div>
                      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ padding: '12px 32px', borderRadius: '12px', fontSize: '1rem' }}>
                          {isSubmitting ? 'Saving...' : 'Save Record'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
                  {educations.length === 0 ? (
                    !showEducationForm && (
                      <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #cbd5e1' }}>
                        <p style={{ color: 'var(--text-secondary)' }}>No education added yet.</p>
                      </div>
                    )
                  ) : (
                    educations.map(edu => (
                      <div key={edu.id} className="glass-panel" style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                          <span style={{ display: 'inline-block', padding: '6px 12px', background: 'var(--accent-primary)', color: '#ffffff', fontSize: '0.75rem', fontWeight: 800, borderRadius: '8px' }}>{edu.degree.toUpperCase()}</span>
                          <button onClick={() => { setEducationToDelete(edu.id); setShowDeleteModal(true); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🗑️</button>
                        </div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>{edu.institution}</h4>
                        <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', color: '#334155' }}>📚 {edu.major || 'General'}</p>
                        <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>🗓️ {edu.passingYear}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {profileTab === 'ORDERS' && (
              <div className="animate-fade-in">
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', color: '#0f172a' }}>Order History</h2>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: '#f8fafc', borderRadius: '16px', overflow: 'hidden' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e2e8f0', background: '#f1f5f9' }}>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Course</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Price</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700 }}>Date</th>
                      <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'right' }}>Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchases.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No order history found.</td>
                      </tr>
                    ) : (
                      purchases.map(p => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>{p.subject?.name || 'Unknown Course'}</td>
                          <td style={{ padding: '16px 24px', fontWeight: 600 }}>৳{p.subject?.price || 0}</td>
                          <td style={{ padding: '16px 24px' }}>
                            <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 800, background: p.status === 'APPROVED' ? '#dcfce7' : '#fef9c3', color: p.status === 'APPROVED' ? '#166534' : '#854d0e' }}>
                              {p.status === 'APPROVED' ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                            <button 
                              onClick={() => handleDownloadInvoice(p.id)}
                              className="btn btn-secondary" 
                              style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                            >
                              <span>📥</span> Download
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ background: '#ffffff', padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transform: 'scale(1)', transition: 'transform 0.2s' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px auto', boxShadow: '0 0 0 8px rgba(254, 226, 226, 0.5)' }}>
              🗑️
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Delete Education?</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Are you sure you want to remove this record from your profile? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowDeleteModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn" style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} disabled={isDeleting}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Profile Picture Confirmation Modal */}
      {showDeletePicModal && typeof document !== 'undefined' && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel" style={{ background: '#ffffff', padding: '32px', borderRadius: '24px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', transform: 'scale(1)', transition: 'transform 0.2s' }}>
            <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 24px auto', boxShadow: '0 0 0 8px rgba(254, 226, 226, 0.5)' }}>
              🖼️
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 12px 0', color: '#0f172a' }}>Remove Picture?</h3>
            <p style={{ color: 'var(--text-secondary)', margin: '0 0 32px 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Are you sure you want to remove your profile picture? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button onClick={() => setShowDeletePicModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', color: '#475569', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}>
                Cancel
              </button>
              <button onClick={confirmDeleteProfilePicture} className="btn" style={{ flex: 1, background: '#ef4444', color: '#fff', border: 'none', padding: '12px', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }} disabled={isDeletingPic}>
                {isDeletingPic ? 'Removing...' : 'Yes, Remove'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}