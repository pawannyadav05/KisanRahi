/**
 * Route Optimizer Service
 * ───────────────────────
 * Given a depot (starting point) and a list of stops, compute:
 *   1. An optimized route using a nearest-neighbor greedy heuristic
 *   2. A naive route using the original input order
 *
 * Returns both routes with total distances and the savings delta.
 *
 * This module is intentionally side-effect-free:
 *   optimizeRouteOrder(depot, stops) → OptimizedRouteResult
 */

import { haversineDistanceKm, type HubCoordinate } from './hub-assignment';

/* ── Result type ─────────────────────────────────────────────────────── */

export interface OptimizedRouteResult {
  /** Stops reordered by nearest-neighbor heuristic */
  optimizedOrder: HubCoordinate[];
  /** Total depot → s1 → s2 → … → sN distance in km */
  optimizedDistanceKm: number;
  /** Stops in original input order */
  naiveOrder: HubCoordinate[];
  /** Total depot → s1 → s2 → … → sN distance in km (original order) */
  naiveDistanceKm: number;
  /** Kilometres saved (naive − optimized). May be 0 or negative. */
  distanceSavedKm: number;
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

/**
 * Compute the total distance traversed for a sequence of stops,
 * starting from the depot.
 */
function totalRouteDistanceKm(
  depot: HubCoordinate,
  orderedStops: HubCoordinate[],
): number {
  if (orderedStops.length === 0) return 0;

  let total = haversineDistanceKm(
    depot.lat,
    depot.lng,
    orderedStops[0].lat,
    orderedStops[0].lng,
  );

  for (let i = 0; i < orderedStops.length - 1; i++) {
    total += haversineDistanceKm(
      orderedStops[i].lat,
      orderedStops[i].lng,
      orderedStops[i + 1].lat,
      orderedStops[i + 1].lng,
    );
  }

  return total;
}

/* ── Main function ───────────────────────────────────────────────────── */

/**
 * Compute an optimized route order using a nearest-neighbor greedy
 * heuristic, and compare it against the naive (input) order.
 *
 * Algorithm:
 *   Start at `depot`. At each step pick the closest unvisited stop
 *   (by haversine great-circle distance). Repeat until all stops are
 *   visited.
 *
 * @param depot  - The starting point (driver's origin / warehouse)
 * @param stops  - The stops that need to be visited (order is "naive")
 * @returns both the optimized and naive orderings with total distances
 *
 * @example
 * ```ts
 * import { optimizeRouteOrder } from '@/services/routing/route-optimizer';
 * import { DEFAULT_HUBS } from '@/services/routing/hub-assignment';
 *
 * const depot = DEFAULT_HUBS[0]; // start at Sasaram PACS
 * const stops = DEFAULT_HUBS.slice(1);
 * const result = optimizeRouteOrder(depot, stops);
 * console.log(result.distanceSavedKm);
 * ```
 */
export function optimizeRouteOrder(
  depot: HubCoordinate,
  stops: HubCoordinate[],
): OptimizedRouteResult {
  // ── Naive route: original input order ──────────────────────────────
  const naiveOrder = [...stops];
  const naiveDistanceKm = totalRouteDistanceKm(depot, naiveOrder);

  // ── Nearest-neighbor greedy heuristic ──────────────────────────────
  const unvisited = new Set<number>(stops.map((_, i) => i));
  const optimized: HubCoordinate[] = [];
  let currentLat = depot.lat;
  let currentLng = depot.lng;

  while (unvisited.size > 0) {
    let bestIdx = -1;
    let bestDist = Infinity;

    for (const idx of Array.from(unvisited)) {
      const dist = haversineDistanceKm(
        currentLat,
        currentLng,
        stops[idx].lat,
        stops[idx].lng,
      );
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    }

    // Move to the nearest stop
    optimized.push(stops[bestIdx]);
    currentLat = stops[bestIdx].lat;
    currentLng = stops[bestIdx].lng;
    unvisited.delete(bestIdx);
  }

  const optimizedDistanceKm = totalRouteDistanceKm(depot, optimized);

  return {
    optimizedOrder: optimized,
    optimizedDistanceKm: Math.round(optimizedDistanceKm * 100) / 100,
    naiveOrder,
    naiveDistanceKm: Math.round(naiveDistanceKm * 100) / 100,
    distanceSavedKm:
      Math.round((naiveDistanceKm - optimizedDistanceKm) * 100) / 100,
  };
}
