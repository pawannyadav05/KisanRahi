import { NextResponse } from 'next/server';
import { getLatestMandiPrice } from '@/lib/mandi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get('crop');

  if (!crop) {
    return NextResponse.json(
      { error: 'Crop query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const result = await getLatestMandiPrice(crop);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in /api/mandi-price:', error);
    return NextResponse.json(
      { error: 'Failed to fetch mandi price' },
      { status: 500 }
    );
  }
}
