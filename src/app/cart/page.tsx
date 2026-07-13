"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [voucherCode, setVoucherCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('BKASH');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 1. Load cart
    const savedCart = localStorage.getItem('educore_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }

    // 2. Check Authentication quietly
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          if (data.user.role === 'ADMIN' || data.user.role === 'TEACHER') {
            router.push(`/dashboard/${data.user.role.toLowerCase()}`);
          } else {
            setIsLoggedIn(true);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAuth(false));
  }, []);

  const handleRemove = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id);
    setCartItems(updated);
    localStorage.setItem('educore_cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart_updated')); // Notify navbar
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return setError("Cart is empty");
    if (!isLoggedIn) {
      router.push('/login?message=Please log in to complete your purchase');
      return;
    }

    const subjectIds = cartItems.map(item => item.id);

    const res = await fetch('/api/student/purchases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectIds, voucherCode, paymentMethod })
    });
    
    if (res.ok) {
      setSuccess(true);
      localStorage.removeItem('educore_cart');
      window.dispatchEvent(new Event('cart_updated')); // Notify navbar
      setTimeout(() => router.push('/dashboard/student'), 3000);
    } else {
      const data = await res.json();
      setError(data.error || 'Checkout failed');
    }
  };

  if (loadingAuth) {
    return <div className="container mt-8 animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}><h3 style={{ color: 'var(--text-secondary)' }}>Loading cart...</h3></div>;
  }

  if (success) {
    return (
      <div className="container mt-8 animate-fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
        <div className="glass-panel" style={{ textAlign: 'center', maxWidth: '500px', width: '100%', padding: '48px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '24px' }}>🎉</div>
          <h2 style={{ color: 'var(--success)', marginBottom: '16px', fontSize: '2rem' }}>Order Submitted!</h2>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '24px' }}>Your voucher code has been securely transmitted to our admins for verification.</p>
          <div style={{ width: '40px', height: '40px', border: '3px solid var(--success)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '24px' }}>Redirecting to your dashboard...</p>
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes spin { 100% { transform: rotate(360deg); } }
          `}} />
        </div>
      </div>
    );
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);

  const paymentOptions = [
    { id: 'BKASH', name: 'bKash', icon: '📱' },
    { id: 'NAGAD', name: 'Nagad', icon: '🔥' },
    { id: 'BANK', name: 'Bank Transfer', icon: '🏦' }
  ];

  return (
    <div className="container mt-8 animate-fade-in" style={{ maxWidth: '1200px', paddingBottom: '80px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', borderBottom: '1px solid #d1d7dc', paddingBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: 800 }}>Shopping Cart</h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{cartItems.length} Course{cartItems.length !== 1 ? 's' : ''} in Cart</p>
      </div>

      {cartItems.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
          <div style={{ width: '120px', height: '120px', background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
            <span style={{ fontSize: '4rem' }}>🛒</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: '16px' }}>Your cart is empty.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '1.1rem' }}>Keep shopping to find a course!</p>
          <button onClick={() => router.push('/courses')} className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
            Explore Courses
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px', alignItems: 'start' }}>
          
          {/* Cart Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ 
                display: 'flex', 
                gap: '24px', 
                padding: '24px', 
                background: '#ffffff', 
                border: '1px solid #d1d7dc', 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {/* Thumbnail */}
                <div style={{ 
                  width: '160px', 
                  height: '100px', 
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <span style={{ fontSize: '3rem' }}>📘</span>
                </div>
                
                {/* Details */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '1.25rem', color: 'var(--text-primary)' }}>{item.name}</h3>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Course Code: {item.code}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#f59e0b' }}>★★★★★</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>(New)</span>
                  </div>
                </div>

                {/* Price & Actions */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>৳{item.price}</p>
                  <button 
                    onClick={() => handleRemove(item.id)} 
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--text-secondary)', 
                      cursor: 'pointer', 
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--danger)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Panel (Sticky) */}
          <div className="glass-panel" style={{ position: 'sticky', top: '100px', padding: '32px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', color: 'var(--text-primary)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span>৳{totalAmount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              <span>Discount</span>
              <span>৳0</span>
            </div>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: '24px',
              borderTop: '2px solid #e2e8f0',
              marginBottom: '32px' 
            }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Total</span>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>৳{totalAmount}</span>
            </div>

            {error && <div style={{ background: '#fef2f2', color: 'var(--danger)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #fecaca', fontWeight: 500 }}>{error}</div>}
            
            {isLoggedIn ? (
              <form onSubmit={handleCheckout} className="flex-col">
                
                {/* Payment Methods */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Select Payment Method</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {paymentOptions.map(opt => (
                      <div 
                        key={opt.id}
                        onClick={() => setPaymentMethod(opt.id)}
                        style={{
                          border: paymentMethod === opt.id ? '2px solid var(--accent-primary)' : '2px solid #e2e8f0',
                          background: paymentMethod === opt.id ? '#fffbeb' : '#ffffff',
                          borderRadius: '8px',
                          padding: '12px 8px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ fontSize: '1.5rem' }}>{opt.icon}</span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: paymentMethod === opt.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>{opt.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions based on payment method */}
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', border: '1px solid #e2e8f0' }}>
                  {paymentMethod === 'BKASH' && <p style={{ margin: 0 }}>Please send <strong>৳{totalAmount}</strong> to bKash Personal number: <strong>01712345678</strong>, then enter the TrxID below.</p>}
                  {paymentMethod === 'NAGAD' && <p style={{ margin: 0 }}>Please send <strong>৳{totalAmount}</strong> to Nagad Personal number: <strong>01712345678</strong>, then enter the TrxID below.</p>}
                  {paymentMethod === 'BANK' && <p style={{ margin: 0 }}>Please deposit <strong>৳{totalAmount}</strong> to DBBL A/C <strong>123456789</strong>, then enter the receipt number below.</p>}
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Transaction ID</label>
                  <input 
                    type="text" 
                    value={voucherCode} 
                    onChange={e => setVoucherCode(e.target.value)} 
                    required 
                    placeholder="e.g. TrxID987654321" 
                    style={{ 
                      padding: '14px 16px', 
                      fontSize: '1rem',
                      width: '100%',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      background: '#ffffff',
                      marginBottom: 0
                    }}
                  />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '1.2rem' }}>
                  Complete Checkout
                </button>
              </form>
            ) : (
              <div style={{ textAlign: 'center', marginTop: '24px', padding: '24px', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '1.1rem' }}>You need an account to complete this purchase securely.</p>
                <button 
                  onClick={() => router.push('/login?message=Please log in to complete your purchase')} 
                  className="btn btn-primary" 
                  style={{ width: '100%', padding: '14px', fontSize: '1.1rem' }}
                >
                  Log in to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
