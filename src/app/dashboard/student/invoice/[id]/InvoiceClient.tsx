'use client';

import React, { useRef } from 'react';
import Link from 'next/link';

export default function InvoiceClient({ purchase }: { purchase: any }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '60px', maxWidth: '800px', margin: '40px auto 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', alignItems: 'center' }}>
        <Link href="/dashboard/student" style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}>
          &larr; Back to Dashboard
        </Link>
        <button 
          onClick={handlePrint} 
          className="btn btn-primary"
          style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <span>🖨️</span> Print / Download PDF
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '48px', background: '#ffffff', color: '#1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--accent-primary)', margin: 0 }}>INVOICE</h1>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>#{purchase.id.substring(0, 8).toUpperCase()}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <svg width="28" height="28" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#f59e0b"/>
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 14.9452 23.7961 13.9381 23.4283 13.0189H11.2334C11.5649 18.0673 16.0354 21.0377 19.866 19.3496L21.4699 22.0963C16.8906 24.5828 10.7412 21.2842 10.7412 15.534C10.7412 11.1444 14.1804 7.69744 18.5714 7.69744C22.9625 7.69744 26.1362 11.5036 25.1328 16.002H11.5544C11.7583 14.3642 13.1952 13.0039 16 13.0039C18.8048 13.0039 20.2417 14.3642 20.4456 16.002H25.1328C26.1362 11.5036 22.9625 7.69744 18.5714 7.69744C17.7289 7.69744 16.9157 7.82862 16.1455 8.0682C16.0969 8.0456 16.0486 8.02279 16 8Z" fill="#ffffff"/>
                <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif">e</text>
              </svg>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#1e293b' }}>easylearn<span style={{ color: 'var(--accent-primary)' }}>bd</span></span>
            </div>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>support@easylearnbd.com</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Billed To:</h3>
            <p style={{ fontWeight: 700, margin: '0 0 4px 0', fontSize: '1.1rem' }}>{purchase.student.name}</p>
            <p style={{ margin: '0 0 4px 0', color: '#475569' }}>{purchase.student.email}</p>
            {purchase.student.phone && <p style={{ margin: '0', color: '#475569' }}>{purchase.student.phone}</p>}
          </div>
          <div style={{ textAlign: 'right' }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Payment Details:</h3>
            <p style={{ margin: '0 0 4px 0' }}><strong>Date:</strong> {new Date(purchase.createdAt).toLocaleDateString()}</p>
            <p style={{ margin: '0 0 4px 0' }}><strong>Method:</strong> {purchase.paymentMethod}</p>
            <p style={{ margin: '0' }}><strong>Status:</strong> <span style={{ color: purchase.status === 'APPROVED' ? 'var(--success)' : 'var(--warning)', fontWeight: 700 }}>{purchase.status}</span></p>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#334155' }}>Description</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 700, color: '#334155' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '16px', fontWeight: 600 }}>{purchase.subject.name}</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>৳{purchase.subject.price.toFixed(2)}</td>
            </tr>
            {purchase.voucherCode && (
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>Voucher Applied: {purchase.voucherCode}</td>
                <td style={{ padding: '16px', textAlign: 'right', color: 'var(--text-secondary)' }}>-</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <td style={{ padding: '24px 16px 16px 16px', textAlign: 'right', fontWeight: 700, fontSize: '1.2rem' }}>Total:</td>
              <td style={{ padding: '24px 16px 16px 16px', textAlign: 'right', fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                ৳{purchase.subject.price.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <p>Thank you for your purchase!</p>
          <p>If you have any questions about this invoice, please contact support.</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page {
            margin: 20mm;
          }
          body {
            background: white;
          }
          /* Hide navigation and other UI elements */
          nav, .btn-primary, button, a {
            display: none !important;
          }
          
          /* Only show the container */
          body > * {
            display: none;
          }
          body > main {
            display: block !important;
          }
          .container {
            margin: 0 !important;
            padding: 0 !important;
            max-width: 100% !important;
          }
          
          /* Reset glass panel for printing */
          .glass-panel {
            box-shadow: none !important;
            background: white !important;
            border: none !important;
          }
        }
      `}</style>
    </div>
  );
}
