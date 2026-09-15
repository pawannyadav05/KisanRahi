import { NextResponse } from 'next/server';
import { getNearestHub } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '24.95');
    const lng = parseFloat(searchParams.get('lng') || '84.03');

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { success: false, error: 'Valid lat and lng query parameters are required' },
        { status: 400 }
      );
    }

    const nearestHub = await getNearestHub(lat, lng);
    return NextResponse.json({ success: true, hub: nearestHub });
  } catch (error: any) {
    console.error('Nearest hub error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to find nearest hub' },
      { status: 500 }
    );
  }
}
