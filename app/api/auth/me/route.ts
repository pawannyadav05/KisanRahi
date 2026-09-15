import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    // Optional: fetch fresh user details from DB
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, phone: true, role: true, createdAt: true },
    }).catch(() => null);

    return NextResponse.json({
      authenticated: true,
      user: user || session,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch user session' },
      { status: 500 }
    );
  }
}
