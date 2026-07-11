"use client";
import { useEffect, useState } from 'react';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('OVERVIEW');
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/teacher/dashboard')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized or fetch failed');
        return res.json();
      })
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)'}}>{error}</p></div>;
  if (!data) return <div className="container mt-8">Loading dashboard...</div>;

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
      <h1 className="nav-brand" style={{ fontSize: '2.5rem' }}>Teacher Dashboard</h1>

      <div style={{ display: 'flex', gap: '32px', minHeight: '60vh' }}>
        
        {/* Sidebar */}
        <div className="glass-panel" style={{ flex: '0 0 250px', padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Menu</h3>
          </div>
          <div className="flex-col" style={{ padding: '8px 0' }}>
            <TabButton id="OVERVIEW" label="Overview" icon="📊" />
            <TabButton id="MATERIALS" label="My Materials" icon="🎬" />
            <TabButton id="COMMISSIONS" label="Commissions" icon="💰" />
          </div>
        </div>

        {/* Content Pane */}
        <div style={{ flex: 1 }}>
          {activeTab === 'OVERVIEW' && (
            <div className="glass-panel slide-up">
              <h2 style={{ marginBottom: '24px' }}>Overview</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--text-secondary)' }}>Total Commission Earned</h3>
                  <p style={{ fontSize: '2.5rem', color: 'var(--success)', fontWeight: 'bold' }}>৳{data.totalCommission}</p>
                </div>
                <div style={{ padding: '24px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                  <h3 style={{ color: 'var(--text-secondary)' }}>Materials Assigned</h3>
                  <p style={{ fontSize: '2.5rem', color: 'var(--accent-primary)', fontWeight: 'bold' }}>{data.totalCoursesAssigned}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MATERIALS' && (
            <div className="glass-panel slide-up">
              <h2>Your Materials</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Resources you have been assigned to teach.</p>
              
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Title</th>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '12px', color: 'var(--text-secondary)' }}>Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {data.materials.map((m: any) => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px' }}>{m.title}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ padding: '4px 8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {m.type}
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>{m.section?.subject?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.materials.length === 0 && <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>No materials assigned to you yet.</p>}
            </div>
          )}

          {activeTab === 'COMMISSIONS' && (
            <div className="glass-panel slide-up">
              <h2>Commissions</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Track your earnings from student enrollments.</p>
              
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {data.commissions.map((c: any) => (
                  <li key={c.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', marginBottom: '12px', borderRadius: '8px' }} className="flex justify-between items-center">
                    <div>
                      <p style={{ fontWeight: '500' }}>Purchase ID: {c.purchaseId}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.2rem',
                      color: c.status === 'PAID' ? 'var(--success)' : 'var(--warning)',
                      padding: '8px 16px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px'
                    }}>
                      ৳{c.amount} ({c.status})
                    </span>
                  </li>
                ))}
                {data.commissions.length === 0 && <p style={{ color: 'var(--text-secondary)' }}>No commissions recorded yet.</p>}
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
