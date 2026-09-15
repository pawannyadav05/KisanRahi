import type { CropListing, GradeResult, PooledLot, Order, PayoutRecord, RouteStop, AdminMetrics } from '../types/kisanrahi';

export const mockListings: CropListing[] = [
  { id: 'L1', farmerId: 'F1', farmerName: 'Ramesh Yadav', crop: 'Tomato', qtyKg: 200, location: { lat: 24.95, lng: 84.03, villageName: 'Sasaram' }, status: 'Pooled', createdAt: new Date().toISOString() },
  { id: 'L2', farmerId: 'F2', farmerName: 'Sunita Devi', crop: 'Tomato', qtyKg: 300, location: { lat: 24.96, lng: 84.02, villageName: 'Sasaram' }, status: 'Pooled', createdAt: new Date().toISOString() },
  { id: 'L3', farmerId: 'F3', farmerName: 'Bimal Singh', crop: 'Tomato', qtyKg: 250, location: { lat: 24.94, lng: 84.04, villageName: 'Sasaram' }, status: 'Graded', createdAt: new Date().toISOString() },
];

export const mockGrades: GradeResult[] = [
  { listingId: 'L1', grade: 'A', uniformityPct: 92, damagePct: 3, gradedAt: new Date().toISOString() },
];

export const mockPooledLots: PooledLot[] = [
  { hubId: 'H1', hubName: 'Sasaram Hub #3', totalKg: 1850, capacityKg: 2500, listings: mockListings, status: 'Filling' },
];

export const mockOrders: Order[] = [
  { id: 'O1', buyerId: 'B1', buyerName: 'Patna Caterers Co-op', buyerType: 'B2B', lotId: 'H1', qtyKg: 750, pricePerKg: 16.2, escrowStatus: 'Locked' },
];

export const mockPayouts: PayoutRecord[] = [
  { id: 'P1', farmerId: 'F1', orderId: 'O1', amountInr: 18000, status: 'Confirmed', gatewayRef: 'pout_test_88213', gatewayProvider: 'razorpayx', confirmedAt: new Date().toISOString() },
];

export const mockRoute: RouteStop[] = [
  { hubId: 'H1', hubName: 'Sasaram PACS', pickupKg: 800, status: 'Completed', eta: '02:10 AM' },
  { hubId: 'H2', hubName: 'Dehri FPO', pickupKg: 1100, status: 'Pending', eta: '02:50 AM' },
];

export const mockAdminMetrics: AdminMetrics = {
  farmerRealizationPct: 76.4,
  consumerPriceReductionPct: 28.2,
  transitLossPct: 2.8,
  activeHubs: 412,
  activeRuns: 86,
};
