import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { GradedEntry } from '@/lib/grading-store';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hubId = searchParams.get('hubId');

    const listings = await prisma.cropListing.findMany({
      where: {
        status: { in: ['Graded', 'Pooled'] },
        ...(hubId ? { hubId } : {}),
      },
      include: {
        grade: true,
        farmer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (listings.length > 0) {
      const entries: GradedEntry[] = listings
        .filter((l) => l.grade !== null)
        .map((l) => ({
          listingId: l.id,
          farmerId: l.farmerId,
          farmerName: l.farmerName || l.farmer?.name || 'Farmer',
          crop: l.crop,
          qtyKg: l.qtyKg,
          grade: {
            listingId: l.id,
            grade: l.grade!.grade as 'A' | 'B' | 'C',
            uniformityPct: l.grade!.uniformityPct,
            damagePct: l.grade!.damagePct,
            gradedAt: l.grade!.gradedAt.toISOString(),
          },
          recordedAt: l.createdAt.toISOString(),
        }));

      return NextResponse.json({ success: true, entries });
    }
  } catch (error) {
    console.warn('[DB] /api/hub/entries GET fallback:', error);
  }

  return NextResponse.json({ success: true, entries: [] });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      farmerId = 'F1',
      farmerName = 'Ramesh Yadav',
      crop,
      qtyKg,
      grade,
      village = 'Sasaram',
      listingId: customListingId,
    } = body;

    if (!crop || !qtyKg || !grade) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: crop, qtyKg, grade' },
        { status: 400 }
      );
    }

    const listingId = customListingId || `L${Date.now()}`;
    const gradedAt = new Date();

    // Check if farmer user exists in DB, or find first farmer
    let validFarmerId = farmerId;
    try {
      const existingUser = await prisma.user.findUnique({ where: { id: farmerId } });
      if (!existingUser) {
        const firstFarmer = await prisma.user.findFirst({ where: { role: 'farmer' } });
        if (firstFarmer) {
          validFarmerId = firstFarmer.id;
        }
      }
    } catch {}

    // Find nearest or first hub
    let hubId: string | null = null;
    try {
      const hub = await prisma.hub.findFirst();
      if (hub) {
        hubId = hub.id;
        // Increment hub current weight
        await prisma.hub.update({
          where: { id: hub.id },
          data: { currentKg: { increment: Number(qtyKg) } },
        });
      }
    } catch {}

    // Insert into DB
    let createdListing = null;
    try {
      createdListing = await prisma.cropListing.create({
        data: {
          id: listingId,
          farmerId: validFarmerId,
          farmerName,
          crop,
          qtyKg: Number(qtyKg),
          villageName: village,
          lat: 24.95,
          lng: 84.03,
          status: 'Graded',
          hubId,
          grade: {
            create: {
              grade: grade.grade || 'A',
              uniformityPct: Number(grade.uniformityPct) || 90,
              damagePct: Number(grade.damagePct) || 2,
              gradedAt,
            },
          },
        },
        include: {
          grade: true,
        },
      });
    } catch (e) {
      console.warn('[DB] Prisma create cropListing with grade fallback:', e);
    }

    const responseEntry: GradedEntry = {
      listingId,
      farmerId,
      farmerName,
      crop,
      qtyKg: Number(qtyKg),
      grade: {
        listingId,
        grade: grade.grade || 'A',
        uniformityPct: Number(grade.uniformityPct) || 90,
        damagePct: Number(grade.damagePct) || 2,
        gradedAt: gradedAt.toISOString(),
      },
      recordedAt: gradedAt.toISOString(),
    };

    return NextResponse.json({ success: true, entry: responseEntry }, { status: 201 });
  } catch (error: any) {
    console.error('[API] /api/hub/entries POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to record entry' },
      { status: 500 }
    );
  }
}
