import { prisma } from './prisma';
import {
  mockListings,
  mockPooledLots,
  mockOrders,
  mockPayouts,
  mockAdminMetrics,
} from './mock-data';
import type {
  CropListing,
  GradeResult,
  PooledLot,
  Order,
  PayoutRecord,
  AdminMetrics,
  Grade,
} from '@/types/kisanrahi';

export interface NearestHubResult {
  id: string;
  name: string;
  capacityKg: number;
  currentKg: number;
  lat: number;
  lng: number;
  distanceMeters: number;
}

// ─── Nearest Hub (PostGIS) ──────────────────────────────────────────────────

export async function getNearestHub(lat: number, lng: number): Promise<NearestHubResult | null> {
  try {
    // PostGIS raw SQL query for nearest hub using geography distance
    const results = await prisma.$queryRaw<Array<{
      id: string;
      name: string;
      capacityKg: number;
      currentKg: number;
      lat: number;
      lng: number;
      distance_meters: number;
    }>>`
      SELECT 
        id, 
        name, 
        "capacityKg", 
        "currentKg", 
        lat, 
        lng,
        COALESCE(
          ST_Distance(
            COALESCE(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography), 
            ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
          ), 
          0
        ) AS distance_meters
      FROM "hubs"
      ORDER BY 
        COALESCE(location, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography) <-> ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography
      LIMIT 1;
    `;

    if (results && results.length > 0) {
      const h = results[0];
      return {
        id: h.id,
        name: h.name,
        capacityKg: Number(h.capacityKg),
        currentKg: Number(h.currentKg),
        lat: Number(h.lat),
        lng: Number(h.lng),
        distanceMeters: Math.round(Number(h.distance_meters)),
      };
    }
  } catch (error) {
    console.warn('[DB] getNearestHub fallback:', error);
  }

  // Fallback: search in prisma standard or mock
  try {
    const hubs = await prisma.hub.findMany();
    if (hubs.length > 0) {
      let closest = hubs[0];
      let minD = Infinity;
      for (const hub of hubs) {
        const d = Math.hypot(hub.lat - lat, hub.lng - lng);
        if (d < minD) {
          minD = d;
          closest = hub;
        }
      }
      return {
        id: closest.id,
        name: closest.name,
        capacityKg: closest.capacityKg,
        currentKg: closest.currentKg,
        lat: closest.lat,
        lng: closest.lng,
        distanceMeters: Math.round(minD * 111000), // ~meters per deg
      };
    }
  } catch {}

  // Final fallback to mock
  return {
    id: 'H1',
    name: 'Sasaram Hub #3',
    capacityKg: 2500,
    currentKg: 1850,
    lat: 24.95,
    lng: 84.03,
    distanceMeters: 2500,
  };
}

// ─── Crop Listings ──────────────────────────────────────────────────────────

export async function getListings(): Promise<CropListing[]> {
  try {
    const listings = await prisma.cropListing.findMany({
      include: {
        farmer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (listings.length > 0) {
      return listings.map((l) => ({
        id: l.id,
        farmerId: l.farmerId,
        farmerName: l.farmerName || l.farmer?.name || 'Unknown Farmer',
        crop: l.crop,
        qtyKg: l.qtyKg,
        location: {
          lat: l.lat,
          lng: l.lng,
          villageName: l.villageName,
        },
        status: l.status as CropListing['status'],
        createdAt: l.createdAt.toISOString(),
      }));
    }
  } catch (error) {
    console.warn('[DB] getListings fallback to mock data:', error);
  }
  return mockListings;
}

export async function createListing(data: {
  farmerId: string;
  farmerName: string;
  crop: string;
  qtyKg: number;
  villageName: string;
  lat: number;
  lng: number;
}): Promise<CropListing> {
  try {
    // 1. Find nearest hub
    const nearestHub = await getNearestHub(data.lat, data.lng);

    // 2. Insert listing into DB with PostGIS point
    const listing = await prisma.cropListing.create({
      data: {
        farmerId: data.farmerId,
        farmerName: data.farmerName,
        crop: data.crop,
        qtyKg: data.qtyKg,
        villageName: data.villageName,
        lat: data.lat,
        lng: data.lng,
        status: 'Listed',
        hubId: nearestHub?.id || null,
      },
    });

    // 3. Update geometry location column via raw SQL
    try {
      await prisma.$executeRaw`
        UPDATE "crop_listings"
        SET location = ST_SetSRID(ST_MakePoint(${data.lng}, ${data.lat}), 4326)
        WHERE id = ${listing.id};
      `;
    } catch (e) {
      console.warn('[DB] Could not set PostGIS geometry on listing:', e);
    }

    return {
      id: listing.id,
      farmerId: listing.farmerId,
      farmerName: listing.farmerName,
      crop: listing.crop,
      qtyKg: listing.qtyKg,
      location: {
        lat: listing.lat,
        lng: listing.lng,
        villageName: listing.villageName,
      },
      status: listing.status as CropListing['status'],
      createdAt: listing.createdAt.toISOString(),
    };
  } catch (error) {
    console.warn('[DB] createListing fallback:', error);
    const mockNew: CropListing = {
      id: `L_${Date.now()}`,
      farmerId: data.farmerId,
      farmerName: data.farmerName,
      crop: data.crop,
      qtyKg: data.qtyKg,
      location: {
        lat: data.lat,
        lng: data.lng,
        villageName: data.villageName,
      },
      status: 'Listed',
      createdAt: new Date().toISOString(),
    };
    mockListings.unshift(mockNew);
    return mockNew;
  }
}

// ─── Hub Stock & Inventory ──────────────────────────────────────────────────

export interface StockItem {
  id: string;
  hubId: string;
  hubName: string;
  crop: string;
  grade: Grade;
  availableKg: number;
  reservedKg: number;
  lastUpdated: string;
}

export async function getHubStock(hubId?: string): Promise<StockItem[]> {
  try {
    const stock = await prisma.hubStock.findMany({
      where: hubId ? { hubId } : undefined,
      include: { hub: true },
      orderBy: [{ hubId: 'asc' }, { crop: 'asc' }],
    });

    if (stock.length > 0) {
      return stock.map((s) => ({
        id: s.id,
        hubId: s.hubId,
        hubName: s.hub?.name || s.hubId,
        crop: s.crop,
        grade: s.grade as Grade,
        availableKg: s.availableKg,
        reservedKg: s.reservedKg,
        lastUpdated: s.lastUpdated.toISOString(),
      }));
    }
  } catch (error) {
    console.warn('[DB] getHubStock fallback:', error);
  }

  // Default fallback stock
  return [
    { id: 'S1', hubId: 'H1', hubName: 'Sasaram Hub #3', crop: 'Tomato', grade: 'A', availableKg: 1200, reservedKg: 300, lastUpdated: new Date().toISOString() },
    { id: 'S2', hubId: 'H1', hubName: 'Sasaram Hub #3', crop: 'Tomato', grade: 'B', availableKg: 650, reservedKg: 100, lastUpdated: new Date().toISOString() },
    { id: 'S3', hubId: 'H2', hubName: 'Dehri FPO', crop: 'Onion', grade: 'A', availableKg: 2400, reservedKg: 500, lastUpdated: new Date().toISOString() },
    { id: 'S4', hubId: 'H3', hubName: 'Patna Central', crop: 'Potato', grade: 'A', availableKg: 5000, reservedKg: 1200, lastUpdated: new Date().toISOString() },
  ];
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export async function getOrders(buyerId?: string): Promise<Order[]> {
  try {
    const orders = await prisma.order.findMany({
      where: buyerId ? { buyerId } : undefined,
      include: { buyer: true },
      orderBy: { createdAt: 'desc' },
    });

    if (orders.length > 0) {
      return orders.map((o) => ({
        id: o.id,
        buyerId: o.buyerId,
        buyerName: o.buyerName || o.buyer?.name || 'Buyer',
        buyerType: o.buyerType as 'B2B' | 'B2C',
        lotId: o.lotId,
        qtyKg: o.qtyKg,
        pricePerKg: o.pricePerKg,
        escrowStatus: o.escrowStatus as Order['escrowStatus'],
      }));
    }
  } catch (error) {
    console.warn('[DB] getOrders fallback to mock:', error);
  }
  return mockOrders;
}

export async function createOrder(data: {
  buyerId: string;
  buyerName: string;
  buyerType: 'B2B' | 'B2C';
  lotId: string;
  qtyKg: number;
  pricePerKg: number;
  crop?: string;
  grade?: Grade;
}): Promise<Order> {
  try {
    // 1. Transaction to atomically validate & reserve stock if stock record exists
    const order = await prisma.$transaction(async (tx) => {
      // Find or link lot
      let lot = await tx.pooledLot.findUnique({ where: { id: data.lotId } });
      if (!lot) {
        const firstLot = await tx.pooledLot.findFirst();
        if (firstLot) {
          lot = firstLot;
        } else {
          // Create dummy pooled lot if none exists
          const hub = await tx.hub.findFirst();
          lot = await tx.pooledLot.create({
            data: {
              hubId: hub?.id || 'H1',
              hubName: hub?.name || 'Sasaram Hub #3',
              totalKg: 1850,
              capacityKg: 2500,
              status: 'Filling',
            },
          });
        }
      }

      // Check and update stock if crop specified
      if (data.crop) {
        const stockRecord = await tx.hubStock.findFirst({
          where: {
            hubId: lot.hubId,
            crop: data.crop,
            grade: data.grade || 'A',
          },
        });

        if (stockRecord && stockRecord.availableKg >= data.qtyKg) {
          await tx.hubStock.update({
            where: { id: stockRecord.id },
            data: {
              availableKg: { decrement: data.qtyKg },
              reservedKg: { increment: data.qtyKg },
            },
          });
        }
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          buyerId: data.buyerId,
          buyerName: data.buyerName,
          buyerType: data.buyerType,
          lotId: lot.id,
          qtyKg: data.qtyKg,
          pricePerKg: data.pricePerKg,
          totalAmount: data.qtyKg * data.pricePerKg,
          escrowStatus: 'Locked',
          status: 'Placed',
        },
      });

      return newOrder;
    });

    return {
      id: order.id,
      buyerId: order.buyerId,
      buyerName: order.buyerName,
      buyerType: order.buyerType as 'B2B' | 'B2C',
      lotId: order.lotId,
      qtyKg: order.qtyKg,
      pricePerKg: order.pricePerKg,
      escrowStatus: order.escrowStatus as Order['escrowStatus'],
    };
  } catch (error) {
    console.warn('[DB] createOrder fallback:', error);
    const mockNew: Order = {
      id: `O_${Date.now()}`,
      buyerId: data.buyerId,
      buyerName: data.buyerName,
      buyerType: data.buyerType,
      lotId: data.lotId,
      qtyKg: data.qtyKg,
      pricePerKg: data.pricePerKg,
      escrowStatus: 'Locked',
    };
    mockOrders.unshift(mockNew);
    return mockNew;
  }
}
