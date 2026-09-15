/**
 * Hub-Assignment Service
 * ──────────────────────
 * Assigns CropListings to the nearest collection hub using the haversine
 * great-circle distance formula, then groups same-hub listings into PooledLots.
 *
 * This module is intentionally side-effect-free:
 *   assignListingsToHubs(listings, hubs) → PooledLot[]
 */

import type { CropListing, PooledLot } from '@/types/kisanrahi';

/* ── Hub coordinate definition ────────────────────────────────────────── */

export interface HubCoordinate {
  hubId: string;
  hubName: string;
  lat: number;
  lng: number;
  capacityKg: number;
}

/**
 * Default hub list used when no explicit hubs are passed.
 * Based on the Bihar corridor referenced in mock-data.
 */
export const DEFAULT_HUBS: HubCoordinate[] = [
  { hubId: 'H1', hubName: 'Sasaram PACS',  lat: 24.9500, lng: 84.0300, capacityKg: 2500 },
  { hubId: 'H2', hubName: 'Dehri FPO',     lat: 24.9100, lng: 84.1800, capacityKg: 3000 },
  { hubId: 'H3', hubName: 'Bikramganj Hub', lat: 25.2100, lng: 84.2600, capacityKg: 2000 },
];

/* ── Haversine distance (km) ──────────────────────────────────────────── */

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Compute the great-circle distance between two geographic points
 * using the haversine formula.
 *
 * @returns distance in kilometres
 */
export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/* ── Nearest-hub lookup ───────────────────────────────────────────────── */

/**
 * Find the nearest hub for a single listing.
 *
 * @returns the hub coordinate object closest to the listing's location
 */
export function findNearestHub(
  listing: CropListing,
  hubs: HubCoordinate[],
): HubCoordinate {
  if (hubs.length === 0) {
    throw new Error('Hub list must not be empty');
  }

  let nearest = hubs[0];
  let bestDist = Infinity;

  for (const hub of hubs) {
    const dist = haversineDistanceKm(
      listing.location.lat,
      listing.location.lng,
      hub.lat,
      hub.lng,
    );
    if (dist < bestDist) {
      bestDist = dist;
      nearest = hub;
    }
  }

  return nearest;
}

/* ── Main assignment & pooling function ────────────────────────────────── */

/**
 * Assign an array of `CropListing`s to their nearest hub and group
 * same-hub listings into `PooledLot` objects.
 *
 * @param listings  - crop listings to assign
 * @param hubs      - available hub coordinates (defaults to DEFAULT_HUBS)
 * @returns an array of `PooledLot`s, one per hub that received listings
 *
 * @example
 * ```ts
 * import { assignListingsToHubs } from '@/services/routing/hub-assignment';
 * import { mockListings } from '@/lib/mock-data';
 *
 * const lots = assignListingsToHubs(mockListings);
 * // → [{ hubId: 'H1', hubName: 'Sasaram PACS', totalKg: 750, ... }]
 * ```
 */
export function assignListingsToHubs(
  listings: CropListing[],
  hubs: HubCoordinate[] = DEFAULT_HUBS,
): PooledLot[] {
  // Group listings by nearest hub
  const groups = new Map<string, { hub: HubCoordinate; items: CropListing[] }>();

  for (const listing of listings) {
    const hub = findNearestHub(listing, hubs);

    const existing = groups.get(hub.hubId);
    if (existing) {
      existing.items.push(listing);
    } else {
      groups.set(hub.hubId, { hub, items: [listing] });
    }
  }

  // Convert groups to PooledLot[]
  const pooledLots: PooledLot[] = [];

  groups.forEach(({ hub, items }) => {
    const totalKg = items.reduce(
      (sum: number, l: CropListing) => sum + l.qtyKg,
      0,
    );

    const status: PooledLot['status'] =
      totalKg >= hub.capacityKg ? 'Ready' : 'Filling';

    pooledLots.push({
      hubId: hub.hubId,
      hubName: hub.hubName,
      totalKg,
      capacityKg: hub.capacityKg,
      listings: items,
      status,
    });
  });

  return pooledLots;
}
