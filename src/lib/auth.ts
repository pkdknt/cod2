import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'nhontam_marketing_secret_key_2026_super_secure_hash_key';

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; username: string; role: string; fullName: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; username: string; role: string; fullName: string };
  } catch (error) {
    return null;
  }
}

export function getSession(req: NextRequest) {
  const tokenCookie = req.cookies.get('token');
  if (!tokenCookie) return null;
  return verifyToken(tokenCookie.value);
}
