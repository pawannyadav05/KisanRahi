'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  CheckCircle2,
  Circle,
  Sprout,
  Wheat,
  Package,
  IndianRupee,
  MapPin,
  Clock,
  ShieldCheck,
  X,
  Loader2,
  User,
  Leaf,
  Plus,
  Weight,
} from 'lucide-react';
import type { CropListing, ListingStatus, PayoutRecord } from '@/types/kisanrahi';
import { mockPayouts } from '@/lib/mock-data';
import { subscribeGradingStore } from '@/lib/grading-store';

// ─── Status Stepper Config ──────────────────────────────────────────────────
const STATUS_STEPS: { key: ListingStatus; label: string; icon: React.FC<{ className?: string }> }[] = [
  { key: 'Listed',  label: 'Listed',  icon: Sprout },
  { key: 'Graded',  label: 'Graded',  icon: Wheat },
  { key: 'Pooled',  label: 'Pooled',  icon: Package },
  { key: 'Paid',    label: 'Paid',    icon: IndianRupee },
];

function stepIndex(status: ListingStatus): number {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

// ─── Voice Parser ───────────────────────────────────────────────────────────
// Extracts crop, qty (kg), village, and expected price/amount from natural voice speech.
// Handles patterns like "200 kg tomato from sasaram at 35 rupees" or "150 kg potato dehri rate 25"
function parseVoiceTranscript(raw: string): {
  crop: string;
  qtyKg: number;
  villageName: string;
  pricePerKg?: number;
} | null {
  const text = raw.toLowerCase().trim();

  // Common crop names (English & Hindi)
  const cropMapping: Record<string, string> = {
    tomato: 'Tomato',
    tamatar: 'Tomato',
    potato: 'Potato',
    aloo: 'Potato',
    alu: 'Potato',
    onion: 'Onion',
    pyaz: 'Onion',
    pyaaz: 'Onion',
    wheat: 'Wheat',
    gehu: 'Wheat',
    gehun: 'Wheat',
    rice: 'Rice',
    chawal: 'Rice',
    paddy: 'Rice',
    mango: 'Mango',
    aam: 'Mango',
    banana: 'Banana',
    kela: 'Banana',
    brinjal: 'Brinjal',
    baingan: 'Brinjal',
    cabbage: 'Cabbage',
    patta: 'Cabbage',
    cauliflower: 'Cauliflower',
    gobhi: 'Cauliflower',
    spinach: 'Spinach',
    palak: 'Spinach',
    chili: 'Chili',
    mirchi: 'Chili',
    capsicum: 'Capsicum',
    shimla: 'Capsicum',
    carrot: 'Carrot',
    gajar: 'Carrot',
    peas: 'Peas',
    matar: 'Peas',
    okra: 'Okra',
    bhindi: 'Okra',
    mustard: 'Mustard',
    sarson: 'Mustard',
    maize: 'Maize',
    makka: 'Maize',
  };

  const detectedKey = Object.keys(cropMapping).find((c) => text.includes(c));
  if (!detectedKey) return null;
  const crop = cropMapping[detectedKey];

  // 1. Extract Price / Rate / Amount from voice
  let pricePerKg: number | undefined;

  // Patterns: "rate 35", "price 35", "bhav 35", "daam 35"
  const rateMatch = text.match(/(?:rate|price|bhav|daam|cost)\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)/);
  // Patterns: "35 rupees", "35 rs", "35 rupaye", "35 inr", "₹ 35"
  const currencyMatch = text.match(/(?:₹\s*(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*(?:rupees|rupee|rs\.?|rupaye|rupya|inr))/);
  // Patterns: "at 35", "@ 35", "for 35"
  const atMatch = text.match(/(?:at|@|for)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/);
  // Patterns: "35 per kg", "35/kg", "35 prati kg"
  const perKgMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:per|\/|prati)\s*(?:kg|kilo)/);

  if (rateMatch) {
    pricePerKg = parseFloat(rateMatch[1]);
  } else if (currencyMatch) {
    pricePerKg = parseFloat(currencyMatch[1] || currencyMatch[2]);
  } else if (atMatch) {
    pricePerKg = parseFloat(atMatch[1]);
  } else if (perKgMatch) {
    pricePerKg = parseFloat(perKgMatch[1]);
  }

  // 2. Extract Quantity (kg / quintal)
  let qtyKg = NaN;
  const explicitQtyMatch = text.match(/(\d+)\s*(?:kg|kilo|kilogram)/);
  const quintalMatch = text.match(/(\d+)\s*(?:quintal|kintal)/);

  if (explicitQtyMatch) {
    qtyKg = parseInt(explicitQtyMatch[1], 10);
  } else if (quintalMatch) {
    qtyKg = parseInt(quintalMatch[1], 10) * 100;
  } else {
    // If not followed by kg, find all numbers in the voice text
    const allNums = Array.from(text.matchAll(/\b\d+\b/g)).map((m) => parseInt(m[0], 10));
    // Pick the number that isn't the price
    const candidate = allNums.find((n) => n !== pricePerKg);
    if (candidate) qtyKg = candidate;
  }

  if (isNaN(qtyKg) || qtyKg <= 0) return null;

  // 3. Extract Village
  const cleanForVillage = text
    .replace(/(?:rate|price|bhav|daam|cost)\s*(?:of|is|at|:)?\s*(\d+(?:\.\d+)?)/g, '')
    .replace(/(?:₹\s*\d+|\d+\s*(?:rupees|rupee|rs\.?|rupaye|rupya|inr))/g, '')
    .replace(/(?:at|@|for)\s*(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)/g, '')
    .replace(/(\d+)\s*(?:kg|kilo|kilogram|quintal|kintal)?/g, '');

  const villageMatch = cleanForVillage.match(/(?:from|village|gaon|gaaon)\s+([a-z]+)/);
  const villageName = villageMatch
    ? villageMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Sasaram';

  return {
    crop,
    qtyKg,
    villageName,
    pricePerKg,
  };
}

// ─── StatusStepper Sub-Component ────────────────────────────────────────────
const StatusStepper: React.FC<{ currentStatus: ListingStatus }> = ({ currentStatus }) => {
  const activeIdx = stepIndex(currentStatus);

  return (
    <div className="flex items-center w-full mt-3" role="progressbar" aria-valuenow={activeIdx + 1} aria-valuemin={1} aria-valuemax={4}>
      {STATUS_STEPS.map((step, i) => {
        const Icon = step.icon;
        const reached = i <= activeIdx;
        const isCurrent = i === activeIdx;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isCurrent
                    ? 'bg-green text-white ring-4 ring-green/20 shadow-lg shadow-green/25 scale-110'
                    : reached
                      ? 'bg-green/80 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {reached ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[10px] mt-1 font-semibold tracking-wide ${
                  reached ? 'text-green' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STATUS_STEPS.length - 1 && (
              <div className="flex-1 mx-1">
                <div
                  className={`h-[3px] rounded-full transition-colors duration-300 ${
                    i < activeIdx ? 'bg-green' : 'bg-gray-200'
                  }`}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── CropBatchCard Sub-Component ────────────────────────────────────────────
const CropBatchCard: React.FC<{ listing: CropListing; isNew?: boolean }> = ({ listing, isNew }) => {
  return (
    <div
      className={`
        p-4 border rounded-2xl transition-all duration-500
        ${isNew
          ? 'border-saffron/60 bg-saffron/5 ring-2 ring-saffron/20 animate-[slideIn_0.4s_ease-out]'
          : 'border-border bg-white hover:shadow-md hover:border-navy/20'
        }
      `}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-h-[52px]">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-green/15 to-green/5 flex items-center justify-center flex-shrink-0">
            <Leaf className="w-5 h-5 text-green" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-base leading-tight">{listing.crop}</h4>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-sm text-gray-500 font-medium">{listing.qtyKg} kg</p>
              {listing.expectedPricePerKg && (
                <>
                  <span className="text-gray-300 text-xs">•</span>
                  <p className="text-sm font-bold text-saffronDark flex items-center">
                    ₹{listing.expectedPricePerKg}/kg
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
        <span
          className={`
            px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap min-h-[28px] flex items-center
            ${listing.status === 'Paid'
              ? 'bg-green text-white'
              : listing.status === 'Pooled'
                ? 'bg-navy/10 text-navy'
                : listing.status === 'Graded'
                  ? 'bg-saffron/15 text-saffronDark'
                  : 'bg-canvas text-gray-600 border border-border'
            }
          `}
        >
          {listing.status}
        </span>
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {listing.location.villageName}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(listing.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </span>
        <span className="text-gray-300">ID: {listing.id}</span>
      </div>

      {/* Stepper */}
      <StatusStepper currentStatus={listing.status} />
    </div>
  );
};

// ─── PaymentAssuranceCard Sub-Component ─────────────────────────────────────
const PaymentAssuranceCard: React.FC<{ payout: PayoutRecord }> = ({ payout }) => {
  const isConfirmed = payout.status === 'Confirmed';

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl p-5 border-2 transition-all
        ${isConfirmed
          ? 'bg-gradient-to-br from-green/10 via-green/5 to-emerald-50 border-green/40'
          : 'bg-amber-50 border-amber-300'
        }
      `}
      role="status"
      aria-label={`Payment ${payout.status}: ₹${payout.amountInr.toLocaleString('en-IN')}`}
    >
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-green/5 pointer-events-none" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-green/5 pointer-events-none" />

      <div className="flex items-center gap-3 relative">
        <div
          className={`
            w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0
            ${isConfirmed
              ? 'bg-gradient-to-br from-green to-emerald-600 shadow-green/30'
              : 'bg-amber-400 shadow-amber-400/30'
            }
          `}
        >
          {isConfirmed ? (
            <ShieldCheck className="w-7 h-7 text-white" />
          ) : (
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-lg text-navy tracking-tight">Payment Assurance</h3>
            {isConfirmed && (
              <CheckCircle2 className="w-5 h-5 text-green flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            {isConfirmed
              ? 'Direct UPI payout confirmed via RazorpayX test sandbox'
              : `Payment ${payout.status.toLowerCase()} — awaiting confirmation`
            }
          </p>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-white/80 backdrop-blur-sm border border-green/10 relative">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Payout Amount</span>
            <div className="text-3xl font-black text-navy tracking-tight mt-0.5">
              ₹{payout.amountInr.toLocaleString('en-IN')}
            </div>
          </div>
          {isConfirmed && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-green uppercase tracking-wider">Confirmed</span>
              <span className="text-xs text-gray-400 mt-0.5">
                {payout.confirmedAt
                  ? new Date(payout.confirmedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-gray-400 font-medium">Gateway Ref</span>
          <code className="bg-navy/5 text-navy font-bold px-2 py-1 rounded-md border border-navy/10 text-[11px] tracking-wide">
            {payout.gatewayRef}
          </code>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400 font-medium">Provider</span>
          <span className="font-semibold text-navy text-[11px]">
            {payout.gatewayProvider === 'razorpayx' ? 'RazorpayX' : 'Razorpay Test'}
          </span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-400 font-medium">Order</span>
          <span className="font-semibold text-navy text-[11px]">{payout.orderId}</span>
        </div>
      </div>
    </div>
  );
};

// ─── localStorage helpers ────────────────────────────────────────────────────
function loadCachedBatches(farmerId: string): CropListing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(`kisanrahi_batches_${farmerId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCachedBatches(farmerId: string, batches: CropListing[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`kisanrahi_batches_${farmerId}`, JSON.stringify(batches));
  } catch {}
}

// ─── Main FarmerView ────────────────────────────────────────────────────────
export const FarmerView: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  // ── Mandi Feature State ──
  const [pendingListing, setPendingListing] = useState<{ crop: string; qtyKg: number; villageName: string } | null>(null);
  const [mandiData, setMandiData] = useState<{ pricePerKg: number; arrivalDate: string; isFallback: boolean } | null>(null);
  const [isMandiLoading, setIsMandiLoading] = useState(false);
  const [farmerPrice, setFarmerPrice] = useState<string>('');

  const [voiceError, setVoiceError] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [farmerId, setFarmerId] = useState<string>('F1');
  const [farmerName, setFarmerName] = useState<string>('');
  const [farmerVillage, setFarmerVillage] = useState<string>('');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);
  
  // Crop quantity dialog state
  const [selectedCropForModal, setSelectedCropForModal] = useState<string | null>(null);
  const [cropModalQty, setCropModalQty] = useState<string>('100');
  const [cropModalVillage, setCropModalVillage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // confirmed payout
  const confirmedPayout: PayoutRecord | undefined = mockPayouts.find((p) => p.status === 'Confirmed');

  // ── Load farmer profile ──
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (data?.profile) {
        const p = data.profile;
        setFarmerId(p.id || 'F1');
        setFarmerName(p.name || '');
        setFarmerVillage(p.village || '');
        if (p.primaryCrops) {
          const crops = p.primaryCrops.split(',').map((c: string) => c.trim()).filter(Boolean);
          setPrimaryCrops(crops);
        }
      }
    } catch {
      // fallback to localStorage user
      if (typeof window !== 'undefined') {
        try {
          const cached = localStorage.getItem('kisanrahi_user');
          if (cached) {
            const u = JSON.parse(cached);
            setFarmerId(u.id || 'F1');
            setFarmerName(u.name || '');
          }
        } catch {}
      }
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  // ── Load farmer-specific batches ──
  const loadListings = useCallback(async (fId: string) => {
    setLoadingListings(true);
    try {
      // Load from local cache immediately
      const cached = loadCachedBatches(fId);
      if (cached.length > 0) {
        setListings(cached);
      }
      // Then fetch from API
      const res = await fetch(`/api/listings?farmerId=${fId}`);
      const data = await res.json();
      if (data?.listings && Array.isArray(data.listings)) {
        const apiListings: CropListing[] = data.listings;
        // Merge API + local-only (user-added via voice this session that may not be in DB yet)
        const localIds = new Set(apiListings.map((l) => l.id));
        const localOnly = cached.filter((l) => !localIds.has(l.id));
        const merged = [...localOnly, ...apiListings];
        setListings(merged);
        saveCachedBatches(fId, merged);
      }
    } catch {
      // Already loaded from cache above
    } finally {
      setLoadingListings(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Once we have farmer id, load their listings
  useEffect(() => {
    if (!loadingProfile) {
      loadListings(farmerId);
    }
  }, [farmerId, loadingProfile, loadListings]);

  // Subscribe to grading store — re-renders when Hub Manager grades/pools a listing
  useEffect(() => {
    if (loadingProfile) return;
    const unsub = subscribeGradingStore(() => {
      // Reload per-farmer listings when Hub Manager grades/pools a batch
      loadListings(farmerId);
    });
    return unsub;
  }, [loadingProfile, farmerId, loadListings]);

  // Listen for profile updates from ProfileModal
  useEffect(() => {
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        const p = e.detail;
        if (p.name) setFarmerName(p.name);
        if (p.village) setFarmerVillage(p.village);
        if (p.primaryCrops) {
          const crops = p.primaryCrops.split(',').map((c: string) => c.trim()).filter(Boolean);
          setPrimaryCrops(crops);
        }
        flash('✅ Dashboard updated with new profile!', 'success');
      }
    };
    window.addEventListener('kisanrahi_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('kisanrahi_profile_updated', handleProfileUpdate);
  }, []);

  // ── Toast helper ──
  const flash = useCallback((message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(null), 3500);
  }, []);

  // ── Add listing via crop chip quick-add modal ──
  const addListing = useCallback(
    async (parsed: { crop: string; qtyKg: number; villageName: string }) => {
      const newId = `L${Date.now()}`;
      const newListing: CropListing = {
        id: newId,
        farmerId,
        farmerName,
        crop: parsed.crop,
        qtyKg: parsed.qtyKg,
        location: { lat: 24.95, lng: 84.03, villageName: parsed.villageName },
        status: 'Listed',
        createdAt: new Date().toISOString(),
      };

      // Update UI immediately
      setListings((prev) => {
        const updated = [newListing, ...prev];
        saveCachedBatches(farmerId, updated);
        return updated;
      });
      setNewIds((prev) => new Set(prev).add(newId));
      flash(`Added ${parsed.qtyKg} kg ${parsed.crop} from ${parsed.villageName}`, 'success');

      // Persist to API in background
      try {
        await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            crop: parsed.crop,
            qtyKg: parsed.qtyKg,
            villageName: parsed.villageName,
            farmerName,
          }),
        });
      } catch {
        // still saved locally
      }

      // Remove new highlight after a few seconds
      setTimeout(() => {
        setNewIds((prev) => {
          const copy = new Set(prev);
          copy.delete(newId);
          return copy;
        });
      }, 4000);
    },
    [farmerId, farmerName, flash],
  );

  // ── Add listing via voice (opens mandi price confirmation modal) ──
  const addListingFromVoice = useCallback(
    async (parsed: { crop: string; qtyKg: number; villageName: string; pricePerKg?: number }) => {
      // 1. Set pending listing state to open the modal
      setPendingListing(parsed);
      
      // If amount was spoken in voice, prioritize it immediately
      if (parsed.pricePerKg && parsed.pricePerKg > 0) {
        setFarmerPrice(parsed.pricePerKg.toString());
      } else {
        setFarmerPrice('');
      }

      setMandiData(null);
      setIsMandiLoading(true);

      // 2. Fetch Mandi Price
      try {
        const res = await fetch(`/api/mandi-price?crop=${encodeURIComponent(parsed.crop)}`);
        if (res.ok) {
          const data = await res.json();
          setMandiData(data);
          // Only if farmer did NOT specify price in voice, default to mandi price suggestion
          if (!parsed.pricePerKg) {
            setFarmerPrice(data.pricePerKg.toString());
          }
        }
      } catch (err) {
        console.error("Failed to fetch mandi price", err);
      } finally {
        setIsMandiLoading(false);
      }
    },
    [],
  );

  const confirmListing = useCallback(() => {
    if (!pendingListing) return;

    const newId = `L${Date.now()}`;
    const newListing: CropListing = {
      id: newId,
      farmerId,
      farmerName,
      crop: pendingListing.crop,
      qtyKg: pendingListing.qtyKg,
      expectedPricePerKg: parseFloat(farmerPrice) || 0,
      location: { lat: 24.95, lng: 84.03, villageName: pendingListing.villageName },
      status: 'Listed',
      createdAt: new Date().toISOString(),
    };

    setListings((prev) => {
      const updated = [newListing, ...prev];
      saveCachedBatches(farmerId, updated);
      return updated;
    });
    setNewIds((prev) => new Set(prev).add(newId));
    flash(`Added ${pendingListing.qtyKg} kg ${pendingListing.crop} at ₹${farmerPrice}/kg`, 'success');
    setPendingListing(null);

    // Persist to API in background
    fetch('/api/listings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        crop: pendingListing.crop,
        qtyKg: pendingListing.qtyKg,
        villageName: pendingListing.villageName,
        farmerName,
        expectedPricePerKg: parseFloat(farmerPrice) || 0,
      }),
    }).catch(() => { /* already saved locally */ });

    setTimeout(() => {
      setNewIds((prev) => {
        const copy = new Set(prev);
        copy.delete(newId);
        return copy;
      });
    }, 4000);
  }, [pendingListing, farmerPrice, flash, farmerId, farmerName]);

  const cancelListing = () => {
    setPendingListing(null);
  };

  // ── Start / stop speech recognition ──
  const toggleListening = useCallback(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setVoiceError('');
    setTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError('Web Speech API is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);

      if (last.isFinal) {
        const parsed = parseVoiceTranscript(text);
        if (parsed) {
          addListingFromVoice(parsed);
        } else {
          flash('Could not parse speech. Example: "200 kg tomato from Sasaram at 35 rupees"', 'error');
        }
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'network') {
        setVoiceError('Speech network error: unable to connect to speech recognition server. Try speaking again or type your note below.');
      } else if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setVoiceError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (event.error === 'no-speech') {
        setVoiceError('No speech detected. Please tap the mic and speak clearly.');
      } else {
        setVoiceError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  }, [isListening, addListing, flash, primaryCrops, farmerVillage]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.abort();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <div className="relative min-h-screen pb-28">
      {/* ── Toast notification ── */}
      {showToast && (
        <div
          className={`
            fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-2xl
            flex items-center gap-2 text-sm font-semibold
            animate-[slideDown_0.3s_ease-out]
            ${showToast.type === 'success'
              ? 'bg-green text-white'
              : 'bg-red-500 text-white'
            }
          `}
        >
          {showToast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 flex-shrink-0" />
          )}
          {showToast.message}
        </div>
      )}

      <div className="px-4 sm:px-6 py-5 max-w-lg mx-auto space-y-5">

        {/* ── Farmer Identity Card ── */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-navy text-base leading-tight truncate">
              {loadingProfile ? 'Loading...' : farmerName || 'Farmer Dashboard'}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                ID: {farmerId}
              </span>
              {farmerVillage && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {farmerVillage}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-300/50 text-emerald-700 px-2 py-1 rounded-full text-[11px] font-bold">
            <ShieldCheck className="w-3 h-3" /> KYC ✓
          </div>
        </div>

        {/* ── My Primary Crops ── */}
        {primaryCrops.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-navy mb-2 flex items-center justify-between">
              <span>My Crops</span>
              <span className="text-[11px] font-normal text-gray-500">Click to select quantity & add batch</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {primaryCrops.map((crop) => (
                <button
                  key={crop}
                  onClick={() => {
                    setSelectedCropForModal(crop);
                    setCropModalQty('100');
                    setCropModalVillage(farmerVillage || 'Sasaram');
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-full border-2 border-green/30 bg-green/5 text-green hover:bg-green hover:text-white transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                  title={`Select quantity for ${crop}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {crop}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Voice Input Card ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Mic className="w-4 h-4 text-saffron" />
              Voice Listing
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Tap mic and speak: <em className="text-navy font-semibold">&quot;200 kg tomato from Sasaram at 35 rupees&quot;</em>
            </p>

            {/* Quick manual typing fallback for accessibility & network-restricted environments */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!manualText.trim()) return;
                const parsed = parseVoiceTranscript(manualText);
                if (parsed) {
                  addListingFromVoice(parsed);
                  setManualText('');
                  setVoiceError('');
                } else {
                  flash('Could not parse. Example: "200 kg tomato from Sasaram at 35 rupees"', 'error');
                }
              }}
              className="mt-3 flex items-center gap-2"
            >
              <input
                type="text"
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder='Or type e.g. 200 kg tomato sasaram at 35'
                className="flex-1 text-xs border border-border rounded-xl px-3 py-2 outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20 bg-canvas text-navy"
              />
              <button
                type="submit"
                disabled={!manualText.trim()}
                className="bg-navy hover:bg-navyLight text-white text-xs font-semibold px-3 py-2 rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
              >
                Send
              </button>
            </form>
          </div>

          {(transcript || voiceError) && (
            <div className="px-4 pb-3">
              {transcript && (
                <div className="p-3 rounded-xl bg-canvas border border-navy/10 text-sm text-navy font-medium">
                  <span className="text-xs text-gray-400 block mb-1">Heard:</span>
                  &quot;{transcript}&quot;
                </div>
              )}
              {voiceError && (
                <div className="mt-2 flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                  <span>{voiceError}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setVoiceError('');
                      toggleListening();
                    }}
                    className="font-bold underline text-red-800 flex-shrink-0 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}

          {isListening && (
            <div className="px-4 pb-4 flex items-center gap-2">
              <div className="flex gap-1 items-end">
                <span className="w-1 h-3 bg-saffron rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                <span className="w-1 h-5 bg-saffron rounded-full animate-[pulse_0.8s_ease-in-out_0.15s_infinite]" />
                <span className="w-1 h-4 bg-saffron rounded-full animate-[pulse_0.8s_ease-in-out_0.3s_infinite]" />
                <span className="w-1 h-6 bg-saffron rounded-full animate-[pulse_0.8s_ease-in-out_0.45s_infinite]" />
                <span className="w-1 h-3 bg-saffron rounded-full animate-[pulse_0.8s_ease-in-out_0.6s_infinite]" />
              </div>
              <span className="text-xs font-semibold text-saffron animate-pulse">Listening…</span>
            </div>
          )}
        </div>

        {/* ── My Crop Batches ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-navy">My Crop Batches</h3>
            <span className="text-xs text-gray-400 font-medium">
              {loadingListings ? 'Loading…' : `${listings.length} batches`}
            </span>
          </div>

          <div className="space-y-3">
            {loadingListings ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin opacity-40" />
                Loading your crop batches…
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No crop batches yet. Use the mic button or tap a crop chip above to add one.
              </div>
            ) : (
              listings.map((listing) => (
                <CropBatchCard key={listing.id} listing={listing} isNew={newIds.has(listing.id)} />
              ))
            )}
          </div>
        </div>

        {/* ── Payment Assurance Card ── */}
        {confirmedPayout && (
          <div>
            <h3 className="text-base font-bold text-navy mb-3">Payment Assurance</h3>
            <PaymentAssuranceCard payout={confirmedPayout} />
          </div>
        )}
      </div>

      {/* ── Crop Quantity Prompt Modal ── */}
      {selectedCropForModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-white border border-border rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-[slideIn_0.3s_ease-out]">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
                  🌾
                </div>
                <div>
                  <h3 className="font-extrabold text-lg leading-tight">
                    Add {selectedCropForModal}
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    New Aggregation Batch Listing
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCropForModal(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const qty = parseFloat(cropModalQty);
                if (isNaN(qty) || qty <= 0) {
                  flash('Please enter a valid quantity in kg', 'error');
                  return;
                }
                addListing({
                  crop: selectedCropForModal,
                  qtyKg: qty,
                  villageName: cropModalVillage || farmerVillage || 'My Village',
                });
                setSelectedCropForModal(null);
              }}
              className="p-6 space-y-5"
            >
              {/* Quantity Input */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Harvest Quantity (kg) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    autoFocus
                    required
                    value={cropModalQty}
                    onChange={(e) => setCropModalQty(e.target.value)}
                    placeholder="e.g. 100"
                    className="w-full pl-4 pr-16 py-3 rounded-2xl border-2 border-emerald-500/30 focus:border-emerald-500 bg-emerald-50/20 text-navy font-black text-xl tracking-tight focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    KG
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {[50, 100, 200, 500, 1000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCropModalQty(String(preset))}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all ${
                        cropModalQty === String(preset)
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      +{preset} kg
                    </button>
                  ))}
                </div>
              </div>

              {/* Village Location */}
              <div>
                <label className="block text-xs font-bold text-navy uppercase tracking-wider mb-1.5">
                  Aggregation Village / PACS Center
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cropModalVillage}
                    onChange={(e) => setCropModalVillage(e.target.value)}
                    placeholder="e.g. Sasaram"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-canvas text-sm font-medium text-navy focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Quality & Pricing note */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 text-xs text-amber-900 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  Protected by <strong>DoCA Price Stabilization Floor</strong>. AI Quality Grading conducted upon Hub arrival.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCropForModal(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all active:scale-98 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add to Batch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Floating Action Button ── */}
      <button
        id="farmer-voice-fab"
        onClick={toggleListening}
        aria-label={isListening ? 'Stop recording voice note' : 'Record a voice note to list crop'}
        className={`
          fixed bottom-6 right-6 z-40
          w-16 h-16 rounded-full
          flex items-center justify-center
          shadow-2xl
          transition-all duration-300 ease-out
          active:scale-90
          focus:outline-none focus:ring-4
          ${isListening
            ? 'bg-red-500 hover:bg-red-600 focus:ring-red-300 shadow-red-500/40 animate-pulse'
            : 'bg-gradient-to-br from-saffron to-saffronDark hover:from-saffronDark hover:to-saffron focus:ring-saffron/40 shadow-saffron/40'
          }
        `}
        style={{ minWidth: 52, minHeight: 52 }}
      >
        {isListening ? (
          <MicOff className="w-7 h-7 text-white" />
        ) : (
          <Mic className="w-7 h-7 text-white" />
        )}
      </button>

      {/* ── Listing Confirmation Modal (Mandi Price) ── */}
      {pendingListing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-navy/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300 pb-safe">
            <div className="bg-navy p-4 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Sprout className="w-5 h-5 text-saffron" />
                Confirm Listing
              </h3>
              <button onClick={cancelListing} className="text-gray-300 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Voice Extracted Details */}
              <div className="bg-canvas rounded-xl p-4 border border-border flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Crop Details</div>
                  <div className="font-bold text-navy text-lg">{pendingListing.crop}</div>
                  <div className="text-sm text-gray-600 flex items-center gap-2 mt-0.5">
                    <span className="flex items-center gap-1"><Weight className="w-3.5 h-3.5" /> {pendingListing.qtyKg} kg</span>
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {pendingListing.villageName}</span>
                  </div>
                </div>
              </div>

              {/* Mandi Price Comparison */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-navy">Set Your Price (per kg)</label>
                  {isMandiLoading ? (
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Fetching Mandi price...
                    </span>
                  ) : mandiData ? (
                    <span className="text-xs font-semibold text-green flex items-center gap-1 bg-green/10 px-2 py-0.5 rounded-full">
                      Mandi: ₹{mandiData.pricePerKg.toFixed(2)}/kg
                    </span>
                  ) : null}
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-gray-400">₹</span>
                  <input
                    type="number"
                    step="0.1"
                    value={farmerPrice}
                    onChange={(e) => setFarmerPrice(e.target.value)}
                    placeholder="e.g. 35.00"
                    className="w-full text-2xl font-bold text-navy border-2 border-border rounded-xl px-10 py-3 focus:border-saffron focus:ring-4 focus:ring-saffron/20 outline-none transition-all"
                    autoFocus
                  />
                </div>
                
                {/* Information text about Mandi reference */}
                {mandiData && (
                  <div className="mt-2 text-[11px] text-gray-500 flex items-start gap-1.5 leading-snug bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <IndianRupee className="w-3.5 h-3.5 flex-shrink-0 text-gray-400 mt-0.5" />
                    <div>
                      {mandiData.isFallback ? (
                        <><strong>Demo price •</strong> Government mandi data temporarily unavailable. You are in full control of your listing price.</>
                      ) : (
                        <><strong>Government mandi data •</strong> Prices as of {mandiData.arrivalDate}. You are in full control of your listing price.</>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={cancelListing}
                  className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmListing}
                  disabled={!farmerPrice || parseFloat(farmerPrice) <= 0}
                  className="flex-1 py-3.5 rounded-xl font-bold text-white bg-green hover:bg-greenDark disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green/20 transition-all active:scale-95"
                >
                  Confirm Listing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inline keyframe styles for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -16px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
};
