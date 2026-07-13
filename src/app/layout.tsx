import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Learning Platform',
  description: 'A modern e-learning platform',
}

import { getAuthUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';
import CartIcon from '@/components/CartIcon';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser();

  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <nav className="navbar no-print">
          <div className="container flex justify-between items-center">
            <a href="/" className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <rect width="32" height="32" rx="8" fill="#f59e0b"/>
                <path d="M16 8C11.5817 8 8 11.5817 8 16C8 20.4183 11.5817 24 16 24C20.4183 24 24 20.4183 24 16C24 14.9452 23.7961 13.9381 23.4283 13.0189H11.2334C11.5649 18.0673 16.0354 21.0377 19.866 19.3496L21.4699 22.0963C16.8906 24.5828 10.7412 21.2842 10.7412 15.534C10.7412 11.1444 14.1804 7.69744 18.5714 7.69744C22.9625 7.69744 26.1362 11.5036 25.1328 16.002H11.5544C11.7583 14.3642 13.1952 13.0039 16 13.0039C18.8048 13.0039 20.2417 14.3642 20.4456 16.002H25.1328C26.1362 11.5036 22.9625 7.69744 18.5714 7.69744C17.7289 7.69744 16.9157 7.82862 16.1455 8.0682C16.0969 8.0456 16.0486 8.02279 16 8Z" fill="#ffffff"/>
                <text x="50%" y="54%" textAnchor="middle" dominantBaseline="middle" fill="#ffffff" fontSize="22" fontWeight="bold" fontFamily="sans-serif">e</text>
              </svg>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>easylearn<span style={{ color: 'var(--accent-primary)' }}>bd</span></span>
            </a>
            <div className="flex gap-4 items-center">
              <a href="/courses" style={{ fontWeight: 600, color: 'var(--text-primary)', marginRight: '8px' }}>All Courses</a>
              {(!user || user.role === 'STUDENT') && <CartIcon />}
              {user ? (
                <>
                  <a href={`/dashboard/${user.role.toLowerCase()}`} className="btn btn-primary">Dashboard</a>
                  <LogoutButton />
                </>
              ) : (
                <>
                  <a href="/login" className="btn btn-secondary">Login</a>
                  <a href="/register" className="btn btn-primary">Sign Up</a>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="animate-fade-in" style={{ minHeight: 'calc(100vh - 70px)' }}>
          {children}
        </main>
      </body>
    </html>
  )
}
