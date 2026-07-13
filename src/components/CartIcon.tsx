"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CartIcon() {
  const [cartCount, setCartCount] = useState(0);
  const router = useRouter();

  const updateCartCount = () => {
    const savedCart = localStorage.getItem('educore_cart');
    if (savedCart) {
      const parsed = JSON.parse(savedCart);
      setCartCount(parsed.length);
    } else {
      setCartCount(0);
    }
  };

  useEffect(() => {
    // Initial load
    updateCartCount();

    // Listen for custom event when items are added/removed
    window.addEventListener('cart_updated', updateCartCount);

    // Also listen for storage events in case it's updated in another tab
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cart_updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  return (
    <button 
      onClick={() => router.push('/cart')}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative',
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      <span style={{ fontSize: '1.5rem' }}>🛒</span> 
      
      {cartCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '0px',
          right: '0px',
          background: 'var(--accent-primary)',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 800,
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {cartCount}
        </span>
      )}
    </button>
  );
}
