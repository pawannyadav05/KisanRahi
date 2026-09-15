import { NextResponse } from 'next/server';
import { getOrders, createOrder } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentUser();
    const queryBuyerId = searchParams.get('buyerId');
    const buyerId = queryBuyerId || session?.userId || undefined;

    const orders = await getOrders(buyerId);
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error('Fetch orders error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      lotId,
      qtyKg,
      pricePerKg,
      buyerType = 'B2B',
      buyerName,
      crop,
      grade = 'A',
    } = body;

    if (!lotId || !qtyKg || !pricePerKg) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: lotId, qtyKg, pricePerKg' },
        { status: 400 }
      );
    }

    const session = await getCurrentUser();
    const buyerId = session?.userId || 'B1';
    const finalBuyerName = buyerName || session?.name || 'Patna Caterers Co-op';

    const newOrder = await createOrder({
      buyerId,
      buyerName: finalBuyerName,
      buyerType,
      lotId,
      qtyKg: Number(qtyKg),
      pricePerKg: Number(pricePerKg),
      crop,
      grade,
    });

    return NextResponse.json({ success: true, order: newOrder }, { status: 201 });
  } catch (error: any) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
