import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, getSessionCookieOptions } from '@/lib/auth';
import type { UserRole } from '@/types/kisanrahi';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      name,
      avatarUrl,
      role = 'farmer',
      phone,
    } = body;

    const userEmail = email || `user_${Date.now()}@gmail.com`;
    const userName = name || 'Pawan Yadav (Google User)';
    const userPhone = phone || '9876543210';

    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: userEmail },
            { phone: userPhone },
          ],
        },
      });

      if (!user) {
        const randomPassword = await hashPassword(`google_${Date.now()}_secret`);
        user = await prisma.user.create({
          data: {
            name: userName,
            phone: userPhone,
            email: userEmail,
            avatarUrl: avatarUrl || null,
            passwordHash: randomPassword,
            role: role as UserRole,
            kycVerified: true,
          },
        });
      }
    } catch (e) {
      console.warn('[GOOGLE AUTH DB WARNING]:', e);
      // Fallback in-memory user
      user = {
        id: `G_${Date.now()}`,
        name: userName,
        phone: userPhone,
        email: userEmail,
        role: role as UserRole,
        avatarUrl: avatarUrl || null,
        kycVerified: true,
      };
    }

    const token = signToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as UserRole,
      email: user.email,
      avatarUrl: user.avatarUrl,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    const cookieOpts = getSessionCookieOptions();
    response.cookies.set(cookieOpts.name, token, cookieOpts);

    return response;
  } catch (error: any) {
    console.error('Google OAuth error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to authenticate with Google' },
      { status: 500 }
    );
  }
}
