import { NextResponse } from 'next/server';
import { getCurrentUser, FALLBACK_USERS } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    let user: any = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true, name: true, phone: true, role: true, avatarUrl: true, createdAt: true },
      });
    } catch (e) {
      console.warn('[AUTH ME DB WARNING]:', e);
    }

    if (!user) {
      const fb = FALLBACK_USERS[session.phone];
      user = {
        id: session.userId,
        name: session.name || fb?.name || 'User',
        phone: session.phone,
        role: session.role || fb?.role || 'farmer',
      };
    }

    return NextResponse.json({
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user session' },
      { status: 500 }
    );
  }
}
