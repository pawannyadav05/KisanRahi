import { NextResponse } from 'next/server';
import { getHubStock } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId') || undefined;

    const stock = await getHubStock(hubId);
    return NextResponse.json({ success: true, stock });
  } catch (error: any) {
    console.error('Hub stock error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch hub stock' },
      { status: 500 }
    );
  }
}
