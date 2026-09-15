/**
 * Grading Store — shared cross-role state
 *
 * A tiny pub-sub layer so that when the Hub Manager grades + pools a
 * farmer's batch, the Farmer view reactively reflects the updated status.
 *
 * No external deps — works client-side in Next.js App Router.
 */

import type { CropListing, GradeResult, ListingStatus } from '@/types/kisanrahi';
import { mockListings, mockGrades, mockPooledLots } from './mock-data';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GradedEntry {
  listingId: string;
  farmerId: string;
  farmerName: string;
  crop: string;
  qtyKg: number;
  grade: GradeResult;
  recordedAt: string;
}

type Listener = () => void;

// ─── Module-level state (persists for page lifetime) ──────────────────────────

const listeners: Set<Listener> = new Set();

/** Subscribe to any change in the grading store */
export function subscribeGradingStore(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notifyAll() {
  listeners.forEach((fn) => fn());
}

// ─── Mock farmer registry ─────────────────────────────────────────────────────
// Hub manager types a farmer ID and we look them up here.

export interface FarmerRecord {
  id: string;
  name: string;
  phone: string;
  village: string;
}

export const DEMO_FARMERS: FarmerRecord[] = [
  { id: 'F001', name: 'Ramesh Yadav',    phone: '9876543210', village: 'Sasaram' },
  { id: 'F002', name: 'Sunita Devi',     phone: '9876543211', village: 'Dehri' },
  { id: 'F003', name: 'Bimal Singh',     phone: '9876543212', village: 'Rohtas' },
  { id: 'F004', name: 'Meena Kumari',    phone: '9876543213', village: 'Bikramganj' },
  { id: 'F005', name: 'Arvind Paswan',   phone: '9876543214', village: 'Sherghati' },
  { id: 'F006', name: 'Durga Prasad',    phone: '9876543215', village: 'Karakat' },
];

export function lookupFarmer(id: string): FarmerRecord | null {
  return DEMO_FARMERS.find(
    (f) => f.id.toLowerCase() === id.trim().toLowerCase()
  ) ?? null;
}

// ─── Core Actions ─────────────────────────────────────────────────────────────

/**
 * Records a graded inward entry:
 *  1. Creates a new CropListing (status = 'Graded') in mockListings
 *  2. Stores the GradeResult in mockGrades
 *  3. Increments the first PooledLot's totalKg (hub consolidation)
 *  4. After a short tick, updates the listing status to 'Pooled'
 *  5. Notifies all subscribers (Farmer view re-renders)
 */
export function recordGradedEntry(
  farmer: FarmerRecord,
  crop: string,
  qtyKg: number,
  gradeResult: Omit<GradeResult, 'listingId' | 'gradedAt'>
): GradedEntry {
  const listingId = `L${Date.now()}`;
  const gradedAt = new Date().toISOString();

  const newListing: CropListing = {
    id: listingId,
    farmerId: farmer.id,
    farmerName: farmer.name,
    crop,
    qtyKg,
    location: { lat: 24.95, lng: 84.03, villageName: farmer.village },
    status: 'Graded',
    createdAt: gradedAt,
  };

  const fullGrade: GradeResult = {
    ...gradeResult,
    listingId,
    gradedAt,
  };

  // ── Mutate shared mock arrays so all views see the change ──
  mockListings.unshift(newListing);
  mockGrades.unshift(fullGrade);

  // Increment the hub lot's pooled weight
  if (mockPooledLots.length > 0) {
    mockPooledLots[0].totalKg += qtyKg;
  }

  notifyAll();

  // After 2s, advance status to Pooled (simulates hub pooling pipeline)
  setTimeout(() => {
    const idx = mockListings.findIndex((l) => l.id === listingId);
    if (idx !== -1) {
      mockListings[idx] = { ...mockListings[idx], status: 'Pooled' };
      notifyAll();
    }
  }, 2000);

  return {
    listingId,
    farmerId: farmer.id,
    farmerName: farmer.name,
    crop,
    qtyKg,
    grade: fullGrade,
    recordedAt: gradedAt,
  };
}

// ─── AI Mock CV Engine ────────────────────────────────────────────────────────

export interface AIGradeReport {
  grade: 'A' | 'B' | 'C';
  uniformityPct: number;
  damagePct: number;
  sizePct: number;
  colorScore: number;
  detectedObjects: number;
  confidence: number;
  processingMs: number;
  imageDataUrl?: string;
}

/**
 * Simulates YOLOv8 inference on produce images.
 * Uses file size + crop type to generate deterministic but realistic scores.
 * Architecture is identical to what a real YOLOv8 API call would look like —
 * swap the body of this function with a `fetch('/python-api/grade', ...)` call.
 */
export async function runAIGrading(
  imageFile: File,
  cropType: string
): Promise<AIGradeReport> {
  // Simulate inference latency (1.2 – 2.0s)
  const delay = 1200 + Math.random() * 800;
  await new Promise((r) => setTimeout(r, delay));

  // Seed deterministic RNG from file size (so same photo → same grade)
  const seed = (imageFile.size % 997) / 997; // 0.0 – 1.0

  // Crop-specific quality profile (some crops grade better)
  const cropProfile: Record<string, { baseUniformity: number; baseDamage: number }> = {
    Tomato:      { baseUniformity: 82, baseDamage: 6 },
    Onion:       { baseUniformity: 88, baseDamage: 4 },
    Potato:      { baseUniformity: 85, baseDamage: 5 },
    Wheat:       { baseUniformity: 91, baseDamage: 2 },
    Rice:        { baseUniformity: 90, baseDamage: 3 },
    Maize:       { baseUniformity: 87, baseDamage: 4 },
    Brinjal:     { baseUniformity: 78, baseDamage: 9 },
    Cauliflower: { baseUniformity: 80, baseDamage: 8 },
    Cabbage:     { baseUniformity: 83, baseDamage: 7 },
    'Green Chilli': { baseUniformity: 76, baseDamage: 11 },
  };

  const profile = cropProfile[cropType] ?? { baseUniformity: 80, baseDamage: 8 };

  // Vary ±12% around the crop baseline using seed
  const uniformityPct = Math.min(99, Math.max(40,
    profile.baseUniformity + (seed - 0.5) * 24
  ));
  const damagePct = Math.min(50, Math.max(1,
    profile.baseDamage + (0.5 - seed) * 16
  ));
  const sizePct = Math.min(98, Math.max(50, 72 + (seed - 0.3) * 30));
  const colorScore = Math.min(98, Math.max(50, 76 + (seed - 0.4) * 28));
  const detectedObjects = Math.round(4 + seed * 10); // 4–14 objects
  const confidence = Math.min(99, Math.max(72, 85 + (seed - 0.5) * 20));

  // Grade logic mirrors real YOLOv8 FPO grading standards:
  let grade: 'A' | 'B' | 'C';
  if (uniformityPct >= 85 && damagePct < 8) {
    grade = 'A';
  } else if (uniformityPct >= 70 && damagePct < 20) {
    grade = 'B';
  } else {
    grade = 'C';
  }

  // Read image as data URL for the preview
  const imageDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  return {
    grade,
    uniformityPct: parseFloat(uniformityPct.toFixed(1)),
    damagePct: parseFloat(damagePct.toFixed(1)),
    sizePct: parseFloat(sizePct.toFixed(1)),
    colorScore: parseFloat(colorScore.toFixed(1)),
    detectedObjects,
    confidence: parseFloat(confidence.toFixed(1)),
    processingMs: Math.round(delay),
    imageDataUrl,
  };
}
