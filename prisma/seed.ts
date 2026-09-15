import { PrismaClient, UserRole, Grade, ListingStatus, EscrowStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting KisanRahi database seed...');

  // 1. Clean existing records in reverse dependency order
  await prisma.payoutRecord.deleteMany().catch(() => {});
  await prisma.order.deleteMany().catch(() => {});
  await prisma.gradeResult.deleteMany().catch(() => {});
  await prisma.cropListing.deleteMany().catch(() => {});
  await prisma.hubStock.deleteMany().catch(() => {});
  await prisma.pooledLot.deleteMany().catch(() => {});
  await prisma.hub.deleteMany().catch(() => {});
  await prisma.user.deleteMany().catch(() => {});

  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // 2. Create Users
  console.log('Creating users...');
  const farmer1 = await prisma.user.create({
    data: {
      id: 'F1',
      name: 'Ramesh Yadav',
      phone: '9876543210',
      passwordHash: defaultPasswordHash,
      role: UserRole.farmer,
    },
  });

  const farmer2 = await prisma.user.create({
    data: {
      id: 'F2',
      name: 'Sunita Devi',
      phone: '9876543211',
      passwordHash: defaultPasswordHash,
      role: UserRole.farmer,
    },
  });

  const hubManager = await prisma.user.create({
    data: {
      id: 'HM1',
      name: 'Vikas Sharma',
      phone: '9876543212',
      passwordHash: defaultPasswordHash,
      role: UserRole.hub_manager,
    },
  });

  const bulkBuyer = await prisma.user.create({
    data: {
      id: 'B1',
      name: 'Patna Caterers Co-op',
      phone: '9876543213',
      passwordHash: defaultPasswordHash,
      role: UserRole.bulk_buyer,
    },
  });

  const retailConsumer = await prisma.user.create({
    data: {
      id: 'RC1',
      name: 'Priya Verma',
      phone: '9876543214',
      passwordHash: defaultPasswordHash,
      role: UserRole.retail_consumer,
    },
  });

  const driver = await prisma.user.create({
    data: {
      id: 'D1',
      name: 'Minhaj Ansari',
      phone: '9876543215',
      passwordHash: defaultPasswordHash,
      role: UserRole.driver,
    },
  });

  const docaAdmin = await prisma.user.create({
    data: {
      id: 'A1',
      name: 'DOCA Officer R.K. Mehta',
      phone: '9876543216',
      passwordHash: defaultPasswordHash,
      role: UserRole.doca_admin,
    },
  });

  // 3. Create Hubs
  console.log('Creating hubs with PostGIS coordinates...');
  const hub1 = await prisma.hub.create({
    data: {
      id: 'H1',
      name: 'Sasaram Hub #3',
      capacityKg: 2500,
      currentKg: 1850,
      lat: 24.95,
      lng: 84.03,
    },
  });

  const hub2 = await prisma.hub.create({
    data: {
      id: 'H2',
      name: 'Dehri FPO Aggregation Centre',
      capacityKg: 3500,
      currentKg: 2100,
      lat: 24.90,
      lng: 84.18,
    },
  });

  const hub3 = await prisma.hub.create({
    data: {
      id: 'H3',
      name: 'Patna Central Mandi Hub',
      capacityKg: 10000,
      currentKg: 6400,
      lat: 25.59,
      lng: 85.13,
    },
  });

  // Update PostGIS points on hubs
  try {
    await prisma.$executeRaw`
      UPDATE hubs SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326);
    `;
  } catch (e) {
    console.warn('PostGIS update on hubs skipped:', e);
  }

  // 4. Create Hub Stocks
  console.log('Creating hub inventory / stocks...');
  await prisma.hubStock.createMany({
    data: [
      { hubId: hub1.id, crop: 'Tomato', grade: Grade.A, availableKg: 1200, reservedKg: 300 },
      { hubId: hub1.id, crop: 'Tomato', grade: Grade.B, availableKg: 650, reservedKg: 100 },
      { hubId: hub1.id, crop: 'Onion', grade: Grade.A, availableKg: 800, reservedKg: 200 },
      { hubId: hub2.id, crop: 'Onion', grade: Grade.A, availableKg: 2400, reservedKg: 500 },
      { hubId: hub2.id, crop: 'Potato', grade: Grade.A, availableKg: 1500, reservedKg: 300 },
      { hubId: hub3.id, crop: 'Tomato', grade: Grade.A, availableKg: 3200, reservedKg: 800 },
      { hubId: hub3.id, crop: 'Potato', grade: Grade.A, availableKg: 5000, reservedKg: 1200 },
    ],
  });

  // 5. Create Pooled Lots
  console.log('Creating pooled lots...');
  const lot1 = await prisma.pooledLot.create({
    data: {
      id: 'LOT_SASARAM_TOMATO_01',
      hubId: hub1.id,
      hubName: hub1.name,
      totalKg: 1850,
      capacityKg: 2500,
      status: 'Filling',
    },
  });

  // 6. Create Crop Listings
  console.log('Creating crop listings...');
  const listing1 = await prisma.cropListing.create({
    data: {
      id: 'L1',
      farmerId: farmer1.id,
      farmerName: farmer1.name,
      crop: 'Tomato',
      qtyKg: 200,
      villageName: 'Sasaram',
      lat: 24.95,
      lng: 84.03,
      status: ListingStatus.Pooled,
      hubId: hub1.id,
    },
  });

  const listing2 = await prisma.cropListing.create({
    data: {
      id: 'L2',
      farmerId: farmer2.id,
      farmerName: farmer2.name,
      crop: 'Tomato',
      qtyKg: 300,
      villageName: 'Sasaram',
      lat: 24.96,
      lng: 84.02,
      status: ListingStatus.Pooled,
      hubId: hub1.id,
    },
  });

  const listing3 = await prisma.cropListing.create({
    data: {
      id: 'L3',
      farmerId: farmer1.id,
      farmerName: farmer1.name,
      crop: 'Tomato',
      qtyKg: 250,
      villageName: 'Sasaram',
      lat: 24.94,
      lng: 84.04,
      status: ListingStatus.Graded,
      hubId: hub1.id,
    },
  });

  // Update PostGIS points on listings
  try {
    await prisma.$executeRaw`
      UPDATE crop_listings SET location = ST_SetSRID(ST_MakePoint(lng, lat), 4326);
    `;
  } catch (e) {
    console.warn('PostGIS update on crop_listings skipped:', e);
  }

  // 7. Create Grade Results
  await prisma.gradeResult.create({
    data: {
      listingId: listing1.id,
      grade: Grade.A,
      uniformityPct: 92,
      damagePct: 3,
    },
  });

  // 8. Create Orders
  console.log('Creating sample orders...');
  const order1 = await prisma.order.create({
    data: {
      id: 'O1',
      buyerId: bulkBuyer.id,
      buyerName: bulkBuyer.name,
      buyerType: 'B2B',
      lotId: lot1.id,
      qtyKg: 750,
      pricePerKg: 16.2,
      totalAmount: 750 * 16.2,
      escrowStatus: EscrowStatus.Locked,
      status: 'Processing',
    },
  });

  // 9. Create Payout Record
  await prisma.payoutRecord.create({
    data: {
      id: 'P1',
      farmerId: farmer1.id,
      orderId: order1.id,
      amountInr: 18000,
      status: 'Confirmed',
      gatewayRef: 'pout_test_88213',
      gatewayProvider: 'razorpayx',
      confirmedAt: new Date(),
    },
  });

  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
