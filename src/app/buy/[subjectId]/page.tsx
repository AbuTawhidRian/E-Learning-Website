"use client";
import { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BuyCourse({ params }: { params: Promise<{ subjectId: string }> }) {
  const resolvedParams = use(params);
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BKASH');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  // Enforce Authentication
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (!data.user) {
          router.push('/login?message=Please log in or create an account to enroll.');
        } else if (data.user.role === 'ADMIN' || data.user.role === 'TEACHER') {
          router.push(`/dashboard/${data.user.role.toLowerCase()}`);
        } else {
          setLoadingAuth(false);
        }
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/student/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId: resolvedParams.subjectId, voucherCode, paymentMethod })
    });
    
    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/student'), 3000);
    } else {
      const data = await res.json();
      setError(data.error || 'Purchase submission failed');
    }
  };

  if (loadingAuth) {
    return (
      <div className="container mt-8" style={{ textAlign: 'center' }}>
        <h3 style={{ color: 'var(--text-secondary)' }}>Verifying account...</h3>
      </div>
    );
  }

  if (success) {
    return (
      <div className="container mt-8" style={{ textAlign: 'center' }}>
        <div className="glass-panel" style={{ display: 'inline-block' }}>
          <h2 style={{ color: 'var(--success)' }}>Voucher Submitted Successfully!</h2>
          <p style={{ marginTop: '16px' }}>The admin will verify your payment and approve your enrollment shortly.</p>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '500px', margin: '60px auto' }}>
      <div className="glass-panel flex-col">
        <h2 style={{ textAlign: 'center', marginBottom: '8px' }}>Complete Purchase</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          Please send the course fee to our official number and enter the transaction ID/voucher below.
        </p>

        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <p><strong>bKash / Nagad Number:</strong> 017XXXXXX</p>
          <p><strong>Bank Details:</strong> DBBL, AC: 123456789</p>
        </div>

        {error && <div style={{ background: 'var(--danger)', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handlePurchase} className="flex-col">
          <label>Payment Method</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="BANK">Bank Transfer</option>
          </select>

          <label>Transaction ID / Voucher Code</label>
          <input 
            type="text" 
            value={voucherCode} 
            onChange={e => setVoucherCode(e.target.value)} 
            required 
            placeholder="e.g. TrxID987654321" 
          />
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>Submit Verification</button>
        </form>
      </div>
    </div>
  );
}
