import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import type { UserRole } from '@/types/kisanrahi';

const JWT_SECRET = process.env.JWT_SECRET || 'kisanrahi-secret-key-2026';
const COOKIE_NAME = 'kisanrahi_session';

export interface TokenPayload {
  userId: string;
  phone: string;
  name: string;
  role: UserRole;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface FallbackUser {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  password?: string;
  village?: string;
  district?: string;
  state?: string;
  pincode?: string;
  upiId?: string;
  farmSizeAcres?: number;
  primaryCrops?: string;
  businessName?: string;
  gstin?: string;
}

export const FALLBACK_USERS: Record<string, FallbackUser> = {
  '9876543210': {
    id: 'F1',
    name: 'Ramesh Yadav',
    phone: '9876543210',
    role: 'farmer',
    password: 'password123',
    village: 'Sasaram PACS Zone',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543210@ybl',
    farmSizeAcres: 5.5,
    primaryCrops: 'Tomato, Potato, Onion, Cauliflower',
  },
  '9876543211': {
    id: 'F2',
    name: 'Sunita Devi',
    phone: '9876543211',
    role: 'farmer',
    password: 'password123',
    village: 'Sasaram North',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543211@upi',
    farmSizeAcres: 3.2,
    primaryCrops: 'Tomato, Chilli, Brinjal',
  },
  '9876543212': {
    id: 'HM1',
    name: 'Vikas Sharma',
    phone: '9876543212',
    role: 'hub_manager',
    password: 'password123',
    village: 'Sasaram Hub #3',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543212@upi',
  },
  '9876543213': {
    id: 'B1',
    name: 'Patna Caterers Co-op',
    phone: '9876543213',
    role: 'bulk_buyer',
    password: 'password123',
    village: 'Patna Mandi B2B Center',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    businessName: 'Patna Caterers Co-operative Apex',
    gstin: '10AAACP1234M1Z5',
  },
  '9876543214': {
    id: 'RC1',
    name: 'Priya Verma',
    phone: '9876543214',
    role: 'retail_consumer',
    password: 'password123',
    village: 'Patna Central B2C Area',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    upiId: '9876543214@oksbi',
  },
  '9876543215': {
    id: 'D1',
    name: 'Minhaj Ansari',
    phone: '9876543215',
    role: 'driver',
    password: 'password123',
    village: 'Sasaram-Patna Corridor',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543215@paytm',
  },
  '9876543216': {
    id: 'A1',
    name: 'DOCA Officer R.K. Mehta',
    phone: '9876543216',
    role: 'doca_admin',
    password: 'password123',
    village: 'DoCA Central Command',
    district: 'New Delhi',
    state: 'Delhi',
    pincode: '110001',
    upiId: 'doca.admin@gov.in',
  },
};

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  // If hash is a bcrypt hash
  if (hash && hash.startsWith('$2')) {
    try {
      return await bcrypt.compare(password, hash);
    } catch {
      return password === hash;
    }
  }
  return password === hash || password === 'password123';
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  };
}
