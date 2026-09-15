/**
 * Agmarknet / data.gov.in — Live Mandi Price Service
 *
 * Fetches commodity-wise daily price data from the public
 * data.gov.in Agmarknet resource (resource ID below).
 * Returns the floor (minimum) wholesale price for the queried crop.
 *
 * Public API docs → https://data.gov.in/resource/current-daily-price-various-commodities-various-centres
 *
 * NOTE: The data.gov.in API key is free & rate-limited.
 *       Replace the key below with your own from https://data.gov.in/user/register
 */

// ─── Config ────────────────────────────────────────────────────────────
const DATA_GOV_BASE = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// Free-tier API key (register at data.gov.in for your own)
const API_KEY = process.env.NEXT_PUBLIC_DATAGOV_API_KEY ?? '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';

// ─── Types ─────────────────────────────────────────────────────────────
export interface MandiPriceRecord {
  commodity: string;
  state: string;
  district: string;
  market: string;
  variety: string;
  minPrice: number;   // ₹ per quintal
  maxPrice: number;
  modalPrice: number;
  arrivalDate: string;
}

export interface FloorPriceResult {
  crop: string;
  floorPricePerKg: number;      // converted from ₹/quintal → ₹/kg
  modalPricePerKg: number;
  source: 'live' | 'fallback';
  records: MandiPriceRecord[];
  fetchedAt: string;
}

// ─── Fallback Mock (offline / demo mode) ───────────────────────────────
const FALLBACK_PRICES: Record<string, { min: number; modal: number }> = {
  tomato:  { min: 800,  modal: 1400 },
  onion:   { min: 600,  modal: 1200 },
  potato:  { min: 500,  modal: 900  },
  wheat:   { min: 2000, modal: 2300 },
  rice:    { min: 2200, modal: 2800 },
  brinjal: { min: 700,  modal: 1100 },
};

// ─── Core Fetch ────────────────────────────────────────────────────────

/**
 * Fetch current daily mandi prices for a given commodity (crop name)
 * from the public data.gov.in Agmarknet resource.
 *
 * @param crop     Commodity name, e.g. "Tomato", "Onion"
 * @param state    Optional state filter, e.g. "Bihar"
 * @param limit    Max records to fetch (default 10)
 */
export async function fetchMandiPrice(
  crop: string,
  state?: string,
  limit = 10,
): Promise<FloorPriceResult> {
  const params = new URLSearchParams({
    'api-key': API_KEY,
    format: 'json',
    limit: String(limit),
    'filters[commodity]': crop,
  });

  if (state) {
    params.set('filters[state]', state);
  }

  try {
    const url = `${DATA_GOV_BASE}?${params.toString()}`;
    const res = await fetch(url, { next: { revalidate: 3600 } }); // cache 1 hr

    if (!res.ok) {
      throw new Error(`data.gov.in returned ${res.status}`);
    }

    const json = await res.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const records: MandiPriceRecord[] = (json.records ?? []).map((r: any) => ({
      commodity: r.commodity ?? crop,
      state: r.state ?? '',
      district: r.district ?? '',
      market: r.market ?? '',
      variety: r.variety ?? '',
      minPrice: Number(r.min_price ?? 0),
      maxPrice: Number(r.max_price ?? 0),
      modalPrice: Number(r.modal_price ?? 0),
      arrivalDate: r.arrival_date ?? '',
    }));

    if (records.length === 0) {
      return buildFallback(crop);
    }

    const floorQuintal = Math.min(...records.map((r) => r.minPrice));
    const modalQuintal =
      records.reduce((sum, r) => sum + r.modalPrice, 0) / records.length;

    return {
      crop,
      floorPricePerKg: +(floorQuintal / 100).toFixed(2),
      modalPricePerKg: +(modalQuintal / 100).toFixed(2),
      source: 'live',
      records,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`[Agmarknet] Live fetch failed for "${crop}":`, err);
    return buildFallback(crop);
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────

function buildFallback(crop: string): FloorPriceResult {
  const key = crop.toLowerCase().trim();
  const fb = FALLBACK_PRICES[key] ?? { min: 1000, modal: 1500 };
  return {
    crop,
    floorPricePerKg: +(fb.min / 100).toFixed(2),
    modalPricePerKg: +(fb.modal / 100).toFixed(2),
    source: 'fallback',
    records: [],
    fetchedAt: new Date().toISOString(),
  };
}
