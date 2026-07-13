import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const sessionId = crypto.randomUUID();

    const userAgent = request.headers.get('user-agent') || '';
    let platform = 'Unknown Device';
    if (/windows/i.test(userAgent)) platform = 'Windows';
    else if (/macintosh|mac os x/i.test(userAgent)) platform = 'Mac OS';
    else if (/android/i.test(userAgent)) platform = 'Android Mobile';
    else if (/iphone|ipad|ipod/i.test(userAgent)) platform = 'iOS Mobile';
    else if (/linux/i.test(userAgent)) platform = 'Linux';

    let history: Array<{ device: string; date: string }> = [];
    if (user.loginHistory && Array.isArray(user.loginHistory)) {
      history = user.loginHistory as any;
    }
    history.unshift({ device: platform, date: new Date().toISOString() });
    if (history.length > 5) history = history.slice(0, 5);

    await prisma.user.update({
      where: { id: user.id },
      data: { 
        currentSessionId: sessionId,
        lastLoginDevice: platform,
        lastLoginDate: new Date(),
        loginHistory: history
      }
    });

    const token = signToken({ userId: user.id, role: user.role, sessionId });

    const response = NextResponse.json({ 
      message: 'Login successful', 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
