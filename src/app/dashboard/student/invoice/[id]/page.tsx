'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Script from 'next/script';

export default function InvoicePage() {
  const { id } = useParams();
  const [purchase, setPurchase] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pdfReady, setPdfReady] = useState(false);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    setError('');
    setLoading(true);

    fetch(`/api/student/purchases/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Invoice not found or unauthorized');
        return res.json();
      })
      .then(data => {
        setPurchase(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    if (purchase && pdfReady && !downloadStarted) {
      setDownloadStarted(true);
      const element = document.getElementById('invoice-content');
      if (element && (window as any).html2pdf) {
        // Wait briefly for UI to fully render before taking snapshot
        setTimeout(() => {
          const opt = {
            margin:       0,
            filename:     `Invoice-${purchase.id.split('-')[0].toUpperCase()}.pdf`,
            image:        { type: 'jpeg', quality: 1 },
            html2canvas:  { scale: 2, useCORS: true },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          (window as any).html2pdf().set(opt).from(element).save().then(() => {
             // Close window automatically after download
             setTimeout(() => window.close(), 500);
          });
        }, 500);
      }
    }
  }, [purchase, pdfReady, downloadStarted]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Generating Invoice...</div>;
  }

  if (error || !purchase) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: 'red' }}>Error: {error}</div>;
  }

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js" 
        strategy="lazyOnload"
        onLoad={() => setPdfReady(true)}
      />
      
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif', color: '#64748b' }}>
        <h2 style={{ color: 'var(--accent-primary, #2563eb)' }}>Preparing your download...</h2>
        <p>Your PDF invoice will automatically download in a moment. You can close this tab afterwards.</p>
      </div>

      <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
        <div id="invoice-content" style={{ width: '800px', background: '#fff', fontFamily: '"Inter", "Segoe UI", sans-serif', color: '#1e293b', overflow: 'hidden' }}>
          
          {/* Header */}
          <div style={{ padding: '60px 60px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <rect width="32" height="32" rx="8" fill="#f59e0b"/>
                  <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 14.9452 23.7961 13.9381 23.4283 13.0189H11.2334C11.5649 18.0673 16.0354 21.0377 19.866 19.3496L21.4699 22.0963C16.8906 24.5828 10.7412 21.2842 10.7412 15.534C10.7412 11.1444 14.1804 7.69744 18.5714 7.69744C22.9625 7.69744 26.1362 11.5036 25.1328 16.002H11.5544C11.7583 14.3642 13.1952 13.0039 16 13.0039C18.8048 13.0039 20.2417 14.3642 20.4456 16.002H25.1328C26.1362 11.5036 22.9625 7.69744 18.5714 7.69744C17.7289 7.69744 16.9157 7.82862 16.1455 8.0682C16.0969 8.0456 16.0486 8.02279 16 8Z" fill="#ffffff"/>
                  <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif">e</text>
                </svg>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>easylearn<span style={{ color: 'var(--accent-primary, #2563eb)' }}>bd</span></span>
              </div>
              <p style={{ margin: '0 0 4px', color: '#64748b', fontSize: '0.95rem' }}>Dhaka, Bangladesh</p>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>support@easylearnbd.com</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 300, margin: '0 0 16px 0', letterSpacing: '4px', color: '#cbd5e1' }}>INVOICE</h1>
              <p style={{ margin: '0 0 4px', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Invoice No. <span style={{ color: '#64748b', fontWeight: 400 }}>#{purchase.id.split('-')[0].toUpperCase()}</span></p>
              <p style={{ margin: '0 0 16px', fontWeight: 600, color: '#0f172a', fontSize: '0.95rem' }}>Date: <span style={{ color: '#64748b', fontWeight: 400 }}>{new Date(purchase.createdAt).toLocaleDateString()}</span></p>
              <span style={{ display: 'inline-block', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, background: purchase.status === 'APPROVED' ? '#dcfce7' : '#fef9c3', color: purchase.status === 'APPROVED' ? '#166534' : '#854d0e', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {purchase.status === 'APPROVED' ? 'Paid / Verified' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Billed To */}
          <div style={{ padding: '0 60px 40px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 12px 0', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>Billed To</h4>
              <p style={{ margin: '0 0 4px 0', fontWeight: 700, fontSize: '1.1rem', color: '#0f172a' }}>{purchase.student?.name || 'Student'}</p>
              <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '0.95rem' }}>{purchase.student?.email}</p>
              {purchase.student?.phone && <p style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '0.95rem' }}>{purchase.student?.phone}</p>}
              {purchase.student?.address && <p style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}>{purchase.student?.address}</p>}
            </div>
          </div>

          {/* Items */}
          <div style={{ padding: '0 60px 40px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '12px 0', textAlign: 'left', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>Description</th>
                  <th style={{ padding: '12px 0', textAlign: 'right', color: '#94a3b8', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', fontWeight: 600 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '20px 0', color: '#0f172a', fontWeight: 500, fontSize: '1.05rem' }}>{purchase.subject?.name || 'Unknown Course'}</td>
                  <td style={{ padding: '20px 0', textAlign: 'right', color: '#0f172a', fontWeight: 500, fontSize: '1.05rem' }}>৳{purchase.subject?.price || 0}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div style={{ padding: '0 60px 60px', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: '300px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#64748b', fontSize: '0.95rem' }}>
                <span>Subtotal</span>
                <span style={{ color: '#0f172a' }}>৳{purchase.subject?.price || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#64748b', fontSize: '0.95rem', borderBottom: '1px solid #e2e8f0', marginBottom: '12px' }}>
                <span>Discount</span>
                <span style={{ color: '#0f172a' }}>৳0</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                <span>Total</span>
                <span>৳{purchase.subject?.price || 0}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: '40px 60px', background: '#f8fafc', color: '#64748b', fontSize: '0.85rem', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#475569' }}>Thank you for learning with us.</p>
            <p style={{ margin: 0 }}>This is a computer-generated invoice and requires no physical signature.</p>
          </div>

        </div>
      </div>
    </>
  );
}
