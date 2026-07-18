"use client";
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) throw new Error('Unauthorized');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch('/api/admin/purchases', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: id, status: 'APPROVED' })
    });
    if (res.ok) {
      toast.success("Payment Verified & Student Enrolled!");
      fetchDashboardData();
    } else {
      toast.error("Failed to approve payment");
    }
  };

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)', fontSize: '1.2rem', textAlign: 'center'}}>{error}</p></div>;
  if (!data) return <div className="container mt-8" style={{textAlign:'center', fontSize: '1.2rem', color: 'var(--text-secondary)'}}>Loading command center...</div>;

  return (
    <div className="flex-col gap-6" style={{ padding: '40px 48px 60px 48px' }}>
      <Toaster position="top-right" />
      
      {/* Header Section */}
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
            Command Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', margin: 0 }}>
            Welcome back to your educational dashboard. Everything is running smoothly.
          </p>
        </div>
        <a href="/dashboard/admin/manage" className="btn animate-fade-in" style={{ 
          textDecoration: 'none', 
          padding: '14px 28px', 
          fontSize: '1.05rem', 
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
          color: '#fff',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
          border: 'none',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 15px 35px -5px rgba(59, 130, 246, 0.5)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(59, 130, 246, 0.4)'; }}
        >
          Management Hub &rarr;
        </a>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Revenue Card */}
        <div className="glass-panel animate-stagger-1" style={{ position: 'relative', overflow: 'hidden', padding: '32px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)', boxShadow: '0 20px 40px -15px rgba(16, 185, 129, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, fontWeight: 700 }}>Total Revenue</h3>
              <p style={{ fontSize: '2.8rem', color: '#0f172a', fontWeight: 800, margin: '12px 0 0 0', letterSpacing: '-1px' }}>৳{data.totalRevenue.toLocaleString()}</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>💰</div>
          </div>
        </div>

        {/* Students Card */}
        <div className="glass-panel animate-stagger-2" style={{ position: 'relative', overflow: 'hidden', padding: '32px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)', boxShadow: '0 20px 40px -15px rgba(59, 130, 246, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, fontWeight: 700 }}>Active Students</h3>
              <p style={{ fontSize: '2.8rem', color: '#0f172a', fontWeight: 800, margin: '12px 0 0 0', letterSpacing: '-1px' }}>{data.totalStudents}</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>👨‍🎓</div>
          </div>
        </div>

        {/* Teachers Card */}
        <div className="glass-panel animate-stagger-3" style={{ position: 'relative', overflow: 'hidden', padding: '32px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)', boxShadow: '0 20px 40px -15px rgba(168, 85, 247, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(168,85,247,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, fontWeight: 700 }}>Teachers</h3>
              <p style={{ fontSize: '2.8rem', color: '#0f172a', fontWeight: 800, margin: '12px 0 0 0', letterSpacing: '-1px' }}>{data.totalTeachers}</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🧑‍🏫</div>
          </div>
        </div>

        {/* Live Courses Card */}
        <div className="glass-panel animate-stagger-1" style={{ position: 'relative', overflow: 'hidden', padding: '32px', border: 'none', background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)', boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.15)' }}>
          <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }}></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: 0, fontWeight: 700 }}>Live Courses</h3>
              <p style={{ fontSize: '2.8rem', color: '#0f172a', fontWeight: 800, margin: '12px 0 0 0', letterSpacing: '-1px' }}>{data.totalSubjects}</p>
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎬</div>
          </div>
        </div>

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '32px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Pending Verifications */}
          <div className="glass-panel animate-stagger-2" style={{ padding: '32px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.4rem' }}>Pending Verifications</h3>
                <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', fontSize: '0.9rem' }}>Review and approve manual payments.</p>
              </div>
              {data.pendingPurchases.length > 0 && (
                <span style={{ background: '#fef3c7', color: '#d97706', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }}></span>
                  {data.pendingPurchases.length} Action{data.pendingPurchases.length !== 1 ? 's' : ''} Needed
                </span>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.pendingPurchases.map((p: any) => (
                <div key={p.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '20px', 
                  background: '#f8fafc', 
                  borderRadius: '16px', 
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#4f46e5', fontSize: '1.2rem' }}>
                      {p.student?.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f172a' }}>{p.student?.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{p.student?.email}</div>
                      <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {p.subject?.name}
                        </span>
                        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {p.paymentMethod} &bull; <span style={{ color: '#0f172a' }}>{p.voucherCode}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleApprove(p.id)} 
                    style={{ 
                      padding: '10px 20px', 
                      fontSize: '0.9rem', 
                      background: '#10b981', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: '10px', 
                      fontWeight: 700, 
                      cursor: 'pointer',
                      boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#059669'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#10b981'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Verify & Approve
                  </button>
                </div>
              ))}
              {data.pendingPurchases.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>🎉</span>
                  <p style={{ color: '#475569', fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>You're all caught up!</p>
                  <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>No pending verifications at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics Chart */}
          <div className="glass-panel animate-stagger-3" style={{ padding: '32px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', marginBottom: '24px' }}>Revenue Overview</h3>
            <div style={{ height: '320px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `৳${val}`} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)' }} 
                    itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Recent Approvals Feed */}
          <div className="glass-panel animate-stagger-2" style={{ padding: '32px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ margin: 0, fontSize: '1.4rem', marginBottom: '24px' }}>Recent Sales</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {data.recentPurchases.map((p: any) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981', fontSize: '1.2rem' }}>
                    ✓
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{p.student?.name}</p>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.subject?.name}</p>
                  </div>
                  <div style={{ fontWeight: 800, color: '#10b981', background: '#ecfdf5', padding: '6px 12px', borderRadius: '8px', fontSize: '0.9rem' }}>
                    +৳{p.subject?.price}
                  </div>
                </div>
              ))}
              {data.recentPurchases.length === 0 && (
                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', margin: '20px 0' }}>No recent sales data.</p>
              )}
            </div>
          </div>

          {/* Popular Courses */}
          {data.popularCourses?.length > 0 && (
            <div className="glass-panel animate-stagger-3" style={{ padding: '32px', border: 'none', boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', marginBottom: '24px' }}>Top Performing Courses</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.popularCourses.map((c: any, i: number) => (
                  <div key={c.id} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px', 
                    background: '#f8fafc', 
                    borderRadius: '12px',
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <div style={{ 
                        width: '32px', height: '32px', borderRadius: '8px', 
                        background: i === 0 ? '#fef3c7' : i === 1 ? '#f1f5f9' : i === 2 ? '#ffedd5' : '#f8fafc',
                        color: i === 0 ? '#d97706' : i === 1 ? '#64748b' : i === 2 ? '#c2410c' : '#94a3b8',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem'
                      }}>
                        #{i+1}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>{c.name}</span>
                    </div>
                    <div style={{ color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem' }}>{c.enrollments} Enrolled</div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
