import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_e_learning_app_change_in_production';

export function signToken(payload: { userId: string; role: string; sessionId?: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: string; sessionId?: string; iat: number; exp: number };
  } catch (error) {
    return null;
  }
}

export async function getAuthUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  
  const decoded = verifyToken(token);
  if (!decoded) return null;

  if (!decoded.sessionId) return null; // Reject legacy tokens

  const dbUser = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { currentSessionId: true }
  });
  
  // If user deleted or session changed -> invalid
  if (!dbUser || dbUser.currentSessionId !== decoded.sessionId) {
    return null;
  }

  return decoded;
}
