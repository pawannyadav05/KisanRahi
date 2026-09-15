import { NextResponse } from 'next/server';
import { getListings, createListing } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json({ success: true, listings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch listings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { crop, qtyKg, villageName, lat = 24.95, lng = 84.03, farmerName } = body;

    if (!crop || !qtyKg || !villageName) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: crop, qtyKg, villageName' },
        { status: 400 }
      );
    }

    const session = await getCurrentUser();
    const farmerId = session?.userId || 'F1';
    const finalFarmerName = farmerName || session?.name || 'Ramesh Yadav';

    const newListing = await createListing({
      farmerId,
      farmerName: finalFarmerName,
      crop,
      qtyKg: Number(qtyKg),
      villageName,
      lat: Number(lat),
      lng: Number(lng),
    });

    return NextResponse.json({ success: true, listing: newListing }, { status: 201 });
  } catch (error: any) {
    console.error('Create listing error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create listing' },
      { status: 500 }
    );
  }
}
