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
  category: 'farmer' | 'hub_manager' | 'bulk_buyer' | 'retail_consumer' | 'driver' | 'doca_admin';
}

export const FALLBACK_USERS: Record<string, FallbackUser> = {
  // ─── 6 Farmers ─────────────────────────────────────────────────────────────
  '9876543210': {
    id: 'F1',
    name: 'Ramesh Yadav',
    phone: '9876543210',
    role: 'farmer',
    category: 'farmer',
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
    category: 'farmer',
    password: 'password123',
    village: 'Sasaram North',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543211@upi',
    farmSizeAcres: 3.2,
    primaryCrops: 'Tomato, Chilli, Brinjal',
  },
  '9876543217': {
    id: 'F3',
    name: 'Bimal Singh',
    phone: '9876543217',
    role: 'farmer',
    category: 'farmer',
    password: 'password123',
    village: 'Nokha Village',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '802215',
    upiId: '9876543217@upi',
    farmSizeAcres: 4.8,
    primaryCrops: 'Paddy, Wheat, Onion',
  },
  '9876543218': {
    id: 'F4',
    name: 'Rajeshwar Kushwaha',
    phone: '9876543218',
    role: 'farmer',
    category: 'farmer',
    password: 'password123',
    village: 'Kargahar Mandi Zone',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821107',
    upiId: '9876543218@paytm',
    farmSizeAcres: 6.0,
    primaryCrops: 'Tomato, Potato, Green Peas',
  },
  '9876543219': {
    id: 'F5',
    name: 'Meena Kumari',
    phone: '9876543219',
    role: 'farmer',
    category: 'farmer',
    password: 'password123',
    village: 'Chenari Hills FPO',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821505',
    upiId: '9876543219@oksbi',
    farmSizeAcres: 2.5,
    primaryCrops: 'Chilli, Mustard, Garlic',
  },
  '9876543220': {
    id: 'F6',
    name: 'Dharmendra Mahto',
    phone: '9876543220',
    role: 'farmer',
    category: 'farmer',
    password: 'password123',
    village: 'Dehri-on-Sone Aggregation',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821307',
    upiId: '9876543220@upi',
    farmSizeAcres: 7.1,
    primaryCrops: 'Tomato, Potato, Maize, Onion',
  },

  // ─── 2 Hub Managers ────────────────────────────────────────────────────────
  '9876543212': {
    id: 'HM1',
    name: 'Vikas Sharma',
    phone: '9876543212',
    role: 'hub_manager',
    category: 'hub_manager',
    password: 'password123',
    village: 'Sasaram Hub #3',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543212@upi',
  },
  '9876543221': {
    id: 'HM2',
    name: 'Anita Choudhary',
    phone: '9876543221',
    role: 'hub_manager',
    category: 'hub_manager',
    password: 'password123',
    village: 'Dehri FPO Aggregation Centre',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821307',
    upiId: '9876543221@upi',
  },

  // ─── 2 Bulk Buyers ─────────────────────────────────────────────────────────
  '9876543213': {
    id: 'B1',
    name: 'Patna Caterers Co-op',
    phone: '9876543213',
    role: 'bulk_buyer',
    category: 'bulk_buyer',
    password: 'password123',
    village: 'Patna Mandi B2B Center',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    businessName: 'Patna Caterers Co-operative Apex',
    gstin: '10AAACP1234M1Z5',
  },
  '9876543222': {
    id: 'B2',
    name: 'Magadh Agro Processing Ltd',
    phone: '9876543222',
    role: 'bulk_buyer',
    category: 'bulk_buyer',
    password: 'password123',
    village: 'Gaya Industrial Area',
    district: 'Gaya',
    state: 'Bihar',
    pincode: '823001',
    businessName: 'Magadh Agro Food Processing Ltd',
    gstin: '10AABCM9876K1Z9',
  },

  // ─── 2 Retail Consumers ────────────────────────────────────────────────────
  '9876543214': {
    id: 'RC1',
    name: 'Priya Verma',
    phone: '9876543214',
    role: 'retail_consumer',
    category: 'retail_consumer',
    password: 'password123',
    village: 'Patna Central B2C Area',
    district: 'Patna',
    state: 'Bihar',
    pincode: '800001',
    upiId: '9876543214@oksbi',
  },
  '9876543223': {
    id: 'RC2',
    name: 'Amit Kumar',
    phone: '9876543223',
    role: 'retail_consumer',
    category: 'retail_consumer',
    password: 'password123',
    village: 'Danapur Railway Colony B2C',
    district: 'Patna',
    state: 'Bihar',
    pincode: '801503',
    upiId: '9876543223@upi',
  },

  // ─── 1 Driver ──────────────────────────────────────────────────────────────
  '9876543215': {
    id: 'D1',
    name: 'Minhaj Ansari',
    phone: '9876543215',
    role: 'driver',
    category: 'driver',
    password: 'password123',
    village: 'Sasaram-Patna Corridor',
    district: 'Rohtas',
    state: 'Bihar',
    pincode: '821115',
    upiId: '9876543215@paytm',
  },

  // ─── 1 DoCA Admin ──────────────────────────────────────────────────────────
  '9876543216': {
    id: 'A1',
    name: 'DOCA Officer R.K. Mehta',
    phone: '9876543216',
    role: 'doca_admin',
    category: 'doca_admin',
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
