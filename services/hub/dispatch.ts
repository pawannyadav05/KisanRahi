// services/hub/dispatch.ts
// Dispatch-readiness logic for the FPO Hub Manager workflow.
// Watches a PooledLot and flips status once capacity is met,
// then generates a gate pass record for truck departure.

import type { PooledLot, PayoutRecord } from '@/types/kisanrahi';

// ── Gate Pass shape ──────────────────────────────────────────────
export interface GatePass {
  gatePassId: string;
  hubId: string;
  hubName: string;
  totalKg: number;
  capacityKg: number;
  listingIds: string[];
  dispatchedAt: string;          // ISO timestamp
  paymentStatus: 'AllConfirmed' | 'PartiallyConfirmed' | 'NoneConfirmed';
  confirmedPayoutIds: string[];
  generatedBy: string;           // user / system identifier
}

// ── Dispatch Readiness ───────────────────────────────────────────
/**
 * Evaluates a PooledLot and returns a **new** lot object with
 * status flipped to `"Ready"` when `totalKg >= capacityKg`.
 *
 * The original lot is never mutated.
 */
export function evaluateDispatchReadiness(lot: PooledLot): PooledLot {
  if (lot.status === 'Filling' && lot.totalKg >= lot.capacityKg) {
    return { ...lot, status: 'Ready' };
  }
  return lot;
}

// ── Gate Pass Generation ─────────────────────────────────────────
/**
 * Generates a gate-pass record once the lot is `"Ready"`.
 * Cross-references the given `PayoutRecord[]` to embed payment
 * confirmation data from Abhay's payout pipeline.
 *
 * Throws if the lot is not yet ready for dispatch.
 */
export function generateGatePass(
  lot: PooledLot,
  payouts: PayoutRecord[],
  generatedBy = 'hub_manager',
): GatePass {
  if (lot.status !== 'Ready') {
    throw new Error(
      `Cannot generate gate pass — lot "${lot.hubName}" status is "${lot.status}", expected "Ready".`,
    );
  }

  const listingIds = lot.listings.map((l) => l.id);

  // Cross-reference payout confirmations for farmers in this lot
  const relevantPayouts = payouts.filter((p) =>
    lot.listings.some((l) => l.farmerId === p.farmerId),
  );

  const confirmedPayoutIds = relevantPayouts
    .filter((p) => p.status === 'Confirmed')
    .map((p) => p.id);

  let paymentStatus: GatePass['paymentStatus'] = 'NoneConfirmed';
  if (confirmedPayoutIds.length > 0 && confirmedPayoutIds.length === relevantPayouts.length) {
    paymentStatus = 'AllConfirmed';
  } else if (confirmedPayoutIds.length > 0) {
    paymentStatus = 'PartiallyConfirmed';
  }

  return {
    gatePassId: `GP-${lot.hubId}-${Date.now()}`,
    hubId: lot.hubId,
    hubName: lot.hubName,
    totalKg: lot.totalKg,
    capacityKg: lot.capacityKg,
    listingIds,
    dispatchedAt: new Date().toISOString(),
    paymentStatus,
    confirmedPayoutIds,
    generatedBy,
  };
}
