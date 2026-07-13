"use client";
import { useEffect, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

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

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)'}}>{error}</p></div>;
  if (!data) return <div className="container mt-8" style={{textAlign:'center'}}>Loading professional dashboard...</div>;

  return (
    <div className="flex-col gap-6">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center" style={{ marginBottom: '16px' }}>
        <div>
          <h1 className="nav-brand" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Admin Overview</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Welcome back to your educational command center.</p>
        </div>
        <a href="/dashboard/admin/manage" className="btn btn-primary" style={{ textDecoration: 'none', padding: '12px 24px', fontSize: '1.1rem' }}>
          Go to Management Hub &rarr;
        </a>
      </div>
      
      {/* Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '16px' }}>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Revenue</h3>
          <p style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 'bold', margin: '8px 0 0 0' }}>৳{data.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--accent-primary)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Students</h3>
          <p style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 'bold', margin: '8px 0 0 0' }}>{data.totalStudents}</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--accent-secondary)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Teachers</h3>
          <p style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 'bold', margin: '8px 0 0 0' }}>{data.totalTeachers}</p>
        </div>
        <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--warning)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Live Courses</h3>
          <p style={{ fontSize: '2.5rem', color: '#fff', fontWeight: 'bold', margin: '8px 0 0 0' }}>{data.totalSubjects}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        {/* Pending Verifications */}
        <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>Action Required: Pending Verifications</h3>
            <span style={{ background: 'var(--warning)', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {data.pendingPurchases.length} Pending
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Student Details</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Requested Course</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 'normal' }}>Voucher / TrxID</th>
                  <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 'normal', textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.pendingPurchases.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ fontWeight: 'bold', margin: 0 }}>{p.student?.name}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{p.student?.email}</p>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <span style={{ background: 'rgba(79, 70, 229, 0.2)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.9rem' }}>
                        {p.subject?.name}
                      </span>
                    </td>
                    <td style={{ padding: '16px 24px' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Via {p.paymentMethod}</p>
                      <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--warning)' }}>{p.voucherCode}</p>
                    </td>
                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleApprove(p.id)} 
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.9rem', background: 'var(--success)' }}
                      >
                        Verify & Approve
                      </button>
                    </td>
                  </tr>
                ))}
                {data.pendingPurchases.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No pending requests. You're all caught up!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Approvals Feed */}
        <div className="glass-panel">
          <h3 style={{ marginBottom: '24px' }}>Recent Approvals</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {data.recentPurchases.map((p: any) => (
              <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                  ✓
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.95rem' }}>{p.student?.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Purchased {p.subject?.name}</p>
                </div>
                <div style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--success)' }}>
                  +৳{p.subject?.price}
                </div>
              </li>
            ))}
            {data.recentPurchases.length === 0 && (
              <p style={{ color: 'var(--text-secondary)' }}>No recent approvals.</p>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
}
