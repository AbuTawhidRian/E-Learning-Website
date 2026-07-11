"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    
    if (res.ok) {
      router.push('/login');
    } else {
      const data = await res.json();
      setError(data.error || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '60px auto' }}>
      <div className="glass-panel">
        <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Create an Account</h2>
        {error && <div style={{ background: 'var(--danger)', color: '#fff', padding: '10px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        <form onSubmit={handleRegister} className="flex-col">
          <label>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Doe" />

          <label>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Enter your email" />
          
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Choose a secure password" />
          
          <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>Sign Up</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '16px', color: 'var(--text-secondary)' }}>
          Already have an account? <a href="/login">Log In</a>
        </p>
      </div>
    </div>
  );
}
