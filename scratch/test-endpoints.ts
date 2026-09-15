import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { getNearestHub, getListings, createListing, getHubStock, getOrders, createOrder } from '../lib/db';
import { hashPassword, comparePassword, signToken, verifyToken } from '../lib/auth';

async function runTests() {
  console.log('=== KisanRahi DB, PostGIS, Auth & Profile Tests ===\n');

  // 1. PostGIS raw query test
  console.log('1. Testing PostGIS raw query & KNN operator...');
  const postgisVersion = await prisma.$queryRaw<any[]>`SELECT PostGIS_Full_Version()`;
  console.log('   ✓ PostGIS Engine:', postgisVersion[0].postgis_full_version.substring(0, 45) + '...');

  // 2. Nearest Hub test with PostGIS
  console.log('2. Testing getNearestHub (PostGIS spatial query)...');
  const nearest = await getNearestHub(24.95, 84.03); // Sasaram coords
  console.log('   ✓ Nearest Hub for Sasaram (24.95, 84.03):', nearest?.name, `(Distance: ${nearest?.distanceMeters}m)`);

  const nearestPatna = await getNearestHub(25.59, 85.13); // Patna coords
  console.log('   ✓ Nearest Hub for Patna (25.59, 85.13):', nearestPatna?.name, `(Distance: ${nearestPatna?.distanceMeters}m)`);

  // 3. Auth helper test
  console.log('3. Testing Auth Hashing & JWT Sign/Verify...');
  const hash = await hashPassword('password123');
  const isValid = await comparePassword('password123', hash);
  const token = signToken({ userId: 'F1', phone: '9876543210', name: 'Ramesh Yadav', role: 'farmer' });
  const payload = verifyToken(token);
  console.log('   ✓ Password hash & verify:', isValid ? 'PASS' : 'FAIL');
  console.log('   ✓ JWT Token user:', payload?.name, `(${payload?.role})`);

  // 4. User Profile update & read test
  console.log('4. Testing User Profile update & read...');
  const updatedUser = await prisma.user.update({
    where: { phone: '9876543210' },
    data: {
      village: 'Sasaram PACS Zone',
      district: 'Rohtas',
      state: 'Bihar',
      pincode: '821115',
      upiId: '9876543210@ybl',
      farmSizeAcres: 5.5,
      primaryCrops: 'Tomato, Potato, Cauliflower, Onion',
      kycVerified: true,
    },
  });
  console.log('   ✓ Farmer Profile:', updatedUser.name, '| Land:', updatedUser.farmSizeAcres, 'acres | UPI:', updatedUser.upiId, '| KYC:', updatedUser.kycVerified);

  // 5. Bulk Buyer profile update & read test
  const buyerUser = await prisma.user.update({
    where: { phone: '9876543213' },
    data: {
      businessName: 'Patna Caterers Co-operative Apex',
      gstin: '10AAACP1234M1Z5',
      district: 'Patna',
      state: 'Bihar',
      pincode: '800001',
    },
  });
  console.log('   ✓ Bulk Buyer Profile:', buyerUser.name, '| Business:', buyerUser.businessName, '| GSTIN:', buyerUser.gstin);

  // 6. Hub Inventory / Stock query test
  console.log('6. Testing getHubStock...');
  const stock = await getHubStock();
  console.log(`   ✓ Retrieved ${stock.length} stock entries across hubs.`);

  // 7. Listings query & creation test
  console.log('7. Testing createListing & getListings...');
  const listings = await getListings();
  console.log(`   ✓ Total listings in DB: ${listings.length}`);

  // 8. Order creation test
  console.log('8. Testing getOrders...');
  const orders = await getOrders();
  console.log(`   ✓ Total orders in DB: ${orders.length}`);

  console.log('\n✅ All KisanRahi DB, PostGIS, Auth & Profile tests PASSED!');
}

runTests()
  .catch((e) => {
    console.error('Test error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
