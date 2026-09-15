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
      googleToken,
      phone,
    } = body;

    if (!email && !name) {
      return NextResponse.json(
        { error: 'Google email or name is required' },
        { status: 400 }
      );
    }

    const userEmail = email || `user_${Date.now()}@gmail.com`;
    const userName = name || 'Google User';

    // 1. Find user by email or fallback phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });

    // 2. If not found, create new user
    if (!user) {
      const generatedPhone = phone || `91${Math.floor(10000000 + Math.random() * 90000000)}`;
      const randomPassword = await hashPassword(`google_${Date.now()}_secret`);

      user = await prisma.user.create({
        data: {
          name: userName,
          phone: generatedPhone,
          email: userEmail,
          avatarUrl: avatarUrl || null,
          passwordHash: randomPassword,
          role: role as UserRole,
          kycVerified: true, // OAuth accounts get auto-basic verified
        },
      });
    } else {
      // Update avatar if provided
      if (avatarUrl && !user.avatarUrl) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl },
        });
      }
    }

    // 3. Issue session token
    const token = signToken({
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role as UserRole,
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
