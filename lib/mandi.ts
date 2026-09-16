// lib/mandi.ts

// Demo Fallback Data for when the API is down or key is missing.
const FALLBACK_DATA: Record<string, number> = {
  Tomato: 32.50,
  Onion: 28.00,
  Potato: 15.00,
  Wheat: 22.00,
  Rice: 35.00,
};

export interface MandiPriceResult {
  crop: string;
  pricePerKg: number;
  arrivalDate: string;
  isFallback: boolean;
}

// Simple in-memory cache to avoid spamming the API (3-hour TTL)
const cache: Record<string, { result: MandiPriceResult; timestamp: number }> = {};
const CACHE_TTL_MS = 3 * 60 * 60 * 1000;

export async function getLatestMandiPrice(crop: string): Promise<MandiPriceResult> {
  const normalizedCrop = crop.trim();
  const searchCrop = normalizedCrop.toLowerCase();

  // 1. Check Cache
  const cached = cache[searchCrop];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.result;
  }

  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  // 2. Fetch from Data.gov.in (if key exists)
  if (apiKey) {
    try {
      // Endpoint for Daily Wholesale Price of Agri Commodities
      const url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${apiKey}&format=json&filters[commodity]=${encodeURIComponent(normalizedCrop)}&limit=25`;
      
      const res = await fetch(url, { next: { revalidate: 10800 } }); // 3 hr revalidate
      if (res.ok) {
        const data = await res.json();
        
        if (data.records && Array.isArray(data.records) && data.records.length > 0) {
          // Helper to parse DD/MM/YYYY to timestamp and ISO string
          const parseDate = (dStr: string) => {
            if (!dStr) return { ts: 0, iso: '' };
            const parts = dStr.trim().split('/');
            if (parts.length === 3) {
              const day = parseInt(parts[0], 10);
              const month = parseInt(parts[1], 10) - 1;
              const year = parseInt(parts[2], 10);
              const dateObj = new Date(year, month, day);
              return {
                ts: dateObj.getTime(),
                iso: `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`,
              };
            }
            return { ts: Date.parse(dStr) || 0, iso: dStr };
          };

          // Sort records to find the latest record
          const sortedRecords = [...data.records].sort((a, b) => {
            const dateA = parseDate(a.arrival_date).ts;
            const dateB = parseDate(b.arrival_date).ts;
            return dateB - dateA;
          });

          const latest = sortedRecords[0];
          const parsed = parseDate(latest.arrival_date);

          // Modal price is in Rs/Quintal (100 kg)
          const modalPriceQuintal = parseFloat(latest.modal_price) || 0;
          const pricePerKg = Math.round((modalPriceQuintal / 100) * 100) / 100;

          if (pricePerKg > 0) {
            const result: MandiPriceResult = {
              crop: normalizedCrop,
              pricePerKg,
              arrivalDate: parsed.iso || new Date().toISOString().split('T')[0],
              isFallback: false,
            };

            // Save to cache
            cache[searchCrop] = { result, timestamp: Date.now() };
            return result;
          }
        }
      }
    } catch (e) {
      console.error("Mandi API Error:", e);
      // Fall through to fallback
    }
  }

  // 3. Fallback Logic
  // Check if we have a specific fallback for this crop, otherwise use a generic 20
  const fallbackPrice = Object.entries(FALLBACK_DATA).find(
    ([k]) => k.toLowerCase() === searchCrop
  )?.[1] || 20.00;

  const result: MandiPriceResult = {
    crop: normalizedCrop,
    pricePerKg: fallbackPrice,
    arrivalDate: new Date().toISOString().split('T')[0],
    isFallback: true,
  };

  cache[searchCrop] = { result, timestamp: Date.now() };
  return result;
}
