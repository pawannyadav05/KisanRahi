import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, getSessionCookieOptions, FALLBACK_USERS } from '@/lib/auth';
import type { UserRole } from '@/types/kisanrahi';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: 'Phone and password are required' },
        { status: 400 }
      );
    }

    let user: any = null;

    // 1. Try fetching user from PostgreSQL database
    try {
      user = await prisma.user.findUnique({
        where: { phone },
      });
    } catch (dbError) {
      console.warn('[AUTH DB WARNING] Database unreachable, checking fallback demo accounts:', dbError);
    }

    // 2. If DB user was found, verify password
    if (user) {
      const isValid = await comparePassword(password, user.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid phone or password' },
          { status: 401 }
        );
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
          role: user.role,
        },
      });

      const cookieOpts = getSessionCookieOptions();
      response.cookies.set(cookieOpts.name, token, cookieOpts);
      return response;
    }

    // 3. Fallback to built-in Demo accounts (if DB is offline or account is a demo user)
    const fallback = FALLBACK_USERS[phone];
    if (fallback) {
      if (password === fallback.password || password === 'password123') {
        const token = signToken({
          userId: fallback.id,
          phone: fallback.phone,
          name: fallback.name,
          role: fallback.role,
        });

        const response = NextResponse.json({
          success: true,
          user: {
            id: fallback.id,
            name: fallback.name,
            phone: fallback.phone,
            role: fallback.role,
          },
        });

        const cookieOpts = getSessionCookieOptions();
        response.cookies.set(cookieOpts.name, token, cookieOpts);
        return response;
      }
    }

    return NextResponse.json(
      { error: 'Invalid phone or password' },
      { status: 401 }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during login' },
      { status: 500 }
    );
  }
}
