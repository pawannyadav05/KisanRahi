// KisanRahi — Shared Data Contract
// Every view and every backend module MUST use these exact shapes.
// Do not modify after hour 1.5 without flagging the team chat first.

export type Language = 'en' | 'hi';
export type UserRole = 'farmer' | 'hub_manager' | 'bulk_buyer' | 'retail_consumer' | 'driver' | 'doca_admin';
export type ListingStatus = 'Listed' | 'Graded' | 'Pooled' | 'Paid';

export interface CropListing {
  id: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  qtyKg: number;
  location: { lat: number; lng: number; villageName: string };
  status: ListingStatus;
  createdAt: string; // ISO timestamp
}

export interface GradeResult {
  listingId: string;
  grade: 'A' | 'B' | 'C';
  uniformityPct: number;
  damagePct: number;
  gradedAt: string;
}

export interface PooledLot {
  hubId: string;
  hubName: string;
  totalKg: number;
  capacityKg: number;
  listings: CropListing[];
  status: 'Filling' | 'Ready' | 'Dispatched';
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerType: 'B2B' | 'B2C';
  lotId: string;
  qtyKg: number;
  pricePerKg: number;
  escrowStatus: 'Pending' | 'Locked' | 'Released';
}

export interface PayoutRecord {
  id: string;
  farmerId: string;
  orderId: string;
  amountInr: number;
  status: 'Pending' | 'Confirmed' | 'Failed';
  gatewayRef: string;       // real payment gateway transaction/payout ID (test-mode)
  gatewayProvider: 'razorpayx' | 'razorpay_test';
  confirmedAt?: string;
}

export interface RouteStop {
  hubId: string;
  hubName: string;
  pickupKg: number;
  status: 'Completed' | 'Pending' | 'EnRoute';
  eta: string;
}

export interface AdminMetrics {
  farmerRealizationPct: number;
  consumerPriceReductionPct: number;
  transitLossPct: number;
  activeHubs: number;
  activeRuns: number;
}
