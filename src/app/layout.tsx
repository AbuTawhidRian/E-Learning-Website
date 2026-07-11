import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'E-Learning Platform',
  description: 'A modern e-learning platform',
}

import { getAuthUser } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getAuthUser();

  return (
    <html lang="en">
      <body>
        <nav className="navbar">
          <div className="container flex justify-between items-center">
            <a href="/" className="nav-brand">EduCore</a>
            <div className="flex gap-4">
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
        <main className="container mt-8 animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  )
}
