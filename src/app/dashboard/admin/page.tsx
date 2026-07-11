"use client";
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/purchases')
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then(setPurchases)
      .catch(err => setError(err.message));
  }, []);

  const handleApprove = async (id: string) => {
    const res = await fetch('/api/admin/purchases', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ purchaseId: id, status: 'APPROVED' })
    });
    if (res.ok) {
      setPurchases(purchases.map((p: any) => p.id === id ? { ...p, status: 'APPROVED' } : p));
    }
  };

  if (error) return <div className="container mt-8"><p style={{color:'var(--danger)'}}>{error}</p></div>;

  return (
    <div className="flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="nav-brand" style={{ fontSize: '2.5rem' }}>Admin Dashboard</h1>
        <a href="/dashboard/admin/manage" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Go to Management Hub &rarr;
        </a>
      </div>
      
      <div className="glass-panel">
        <h3>Pending Voucher Verifications</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Verify the transaction IDs/vouchers sent by students via bKash/Nagad/Bank before approving.</p>
        
        <div className="flex-col gap-4">
          {purchases.map((p: any) => (
            <div key={p.id} style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }} className="flex justify-between items-center">
              <div>
                <p><strong>Student:</strong> {p.student?.name} ({p.student?.email})</p>
                <p><strong>Course:</strong> {p.subject?.name}</p>
                <p><strong>Payment Method:</strong> {p.paymentMethod}</p>
                <p style={{ color: 'var(--warning)', marginTop: '4px' }}><strong>Voucher/TrxID:</strong> {p.voucherCode}</p>
                <p style={{ marginTop: '4px' }}><strong>Status:</strong> {p.status}</p>
              </div>
              {p.status === 'PENDING' && (
                <button onClick={() => handleApprove(p.id)} className="btn btn-primary">
                  Approve Payment
                </button>
              )}
            </div>
          ))}
          {purchases.length === 0 && <p>No purchases found.</p>}
        </div>
      </div>
    </div>
  );
}
