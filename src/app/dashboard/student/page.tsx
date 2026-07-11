"use client";
import { useEffect, useState } from 'react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('COURSES');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/student/purchases')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setPurchases)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)'}}>{error}</p></div>;

  const approvedPurchases = purchases.filter((p: any) => p.status === 'APPROVED');
  const pendingPurchases = purchases.filter((p: any) => p.status === 'PENDING');

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
      <h1 className="nav-brand" style={{ fontSize: '2.5rem' }}>Student Dashboard</h1>

      <div style={{ display: 'flex', gap: '32px', minHeight: '60vh' }}>
        
        {/* Sidebar */}
        <div className="glass-panel" style={{ flex: '0 0 250px', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</h3>
          </div>
          <div className="flex-col" style={{ padding: '8px 0' }}>
            <TabButton id="COURSES" label="My Courses" icon="🎓" />
            <TabButton id="PENDING" label="Pending Orders" icon="⏳" />
          </div>
        </div>

        {/* Content Pane */}
        <div style={{ flex: 1 }}>
          {activeTab === 'COURSES' && (
            <div className="glass-panel slide-up">
              <h2 style={{ marginBottom: '24px' }}>My Enrolled Courses</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Access materials for all your approved courses.</p>
              
              {approvedPurchases.length === 0 && (
                <div style={{ padding: '32px', textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <span style={{ fontSize: '3rem' }}>📭</span>
                  <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>You don't have any approved courses yet.</p>
                  <a href="/" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '16px', textDecoration: 'none' }}>Browse Courses</a>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
                {approvedPurchases.map((p: any) => (
                  <div key={p.id} style={{ padding: '24px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ padding: '4px 8px', background: 'rgba(0, 255, 136, 0.1)', color: 'var(--success)', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>ACTIVE</span>
                      <h3 style={{ color: 'var(--text-primary)', marginTop: '12px', marginBottom: '8px' }}>{p.subject?.name}</h3>
                    </div>
                    <a href={`/learn/${p.subjectId}`} className="btn btn-primary" style={{ display: 'block', width: '100%', marginTop: '24px', padding: '12px', textAlign: 'center', textDecoration: 'none' }}>
                      Enter Classroom &rarr;
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'PENDING' && (
            <div className="glass-panel slide-up" style={{ borderTop: '4px solid var(--warning)' }}>
              <h2 style={{ color: 'var(--warning)', marginBottom: '8px' }}>Pending Verifications</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Your vouchers are currently being reviewed by an admin.</p>
              
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {pendingPurchases.map((p: any) => (
                  <li key={p.id} style={{ padding: '20px', background: 'rgba(0,0,0,0.2)', marginBottom: '12px', borderRadius: '12px' }} className="flex justify-between items-center">
                    <div>
                      <strong style={{ fontSize: '1.1rem' }}>{p.subject?.name}</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
                        Paid via {p.paymentMethod} &bull; Voucher: <span style={{ fontFamily: 'monospace', color: 'var(--accent-primary)' }}>{p.voucherCode}</span>
                      </p>
                    </div>
                    <span style={{ padding: '8px 16px', background: 'rgba(255, 170, 0, 0.1)', color: 'var(--warning)', borderRadius: '8px', fontWeight: 'bold' }}>
                      Awaiting Approval
                    </span>
                  </li>
                ))}
                {pendingPurchases.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>You have no pending orders.</p>}
              </ul>
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
