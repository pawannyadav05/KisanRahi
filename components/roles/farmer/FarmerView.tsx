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
} from 'lucide-react';
import type { CropListing, ListingStatus, PayoutRecord } from '@/types/kisanrahi';
import { mockListings, mockPayouts } from '@/lib/mock-data';
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
// Extracts crop, qty (kg), and village from a natural speech transcript.
// Handles patterns like "200 kg tomato from sasaram" or "tomato 300 kilo sasaram village"
function parseVoiceTranscript(raw: string): { crop: string; qtyKg: number; villageName: string } | null {
  const text = raw.toLowerCase().trim();

  // Match a number optionally followed by kg/kilo/kilogram
  const qtyMatch = text.match(/(\d+)\s*(?:kg|kilo|kilogram)?/);
  const qtyKg = qtyMatch ? parseInt(qtyMatch[1], 10) : NaN;
  if (isNaN(qtyKg) || qtyKg <= 0) return null;

  // Common crop names we recognise (extendable)
  const knownCrops = [
    'tomato', 'potato', 'onion', 'wheat', 'rice', 'mango',
    'banana', 'brinjal', 'cabbage', 'cauliflower', 'spinach',
    'chili', 'capsicum', 'carrot', 'peas', 'okra', 'ladyfinger',
    'soybean', 'mustard', 'sugarcane', 'maize', 'corn',
    'tamatar', 'aloo', 'pyaz', 'gehu', 'chawal', 'aam',
  ];
  const crop = knownCrops.find((c) => text.includes(c));
  if (!crop) return null;

  // Extract village — look for "from <village>" or last word(s) not matched
  const villageMatch = text.match(/(?:from|village|gaon|gaaon)\s+([a-z\s]+)/);
  const villageName = villageMatch
    ? villageMatch[1].trim().replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Unknown Village';

  return {
    crop: crop.charAt(0).toUpperCase() + crop.slice(1),
    qtyKg,
    villageName,
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
            {/* Step dot + label */}
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

            {/* Connector line */}
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
            <Wheat className="w-5 h-5 text-green" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-base leading-tight">{listing.crop}</h4>
            <p className="text-sm text-gray-500 font-medium">{listing.qtyKg} kg</p>
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
      {/* Background decorative element */}
      <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-green/5 pointer-events-none" />
      <div className="absolute -right-2 -bottom-8 w-20 h-20 rounded-full bg-green/5 pointer-events-none" />

      {/* Header */}
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

      {/* Amount display */}
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

        {/* Gateway reference */}
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

// ─── Main FarmerView ────────────────────────────────────────────────────────
export const FarmerView: React.FC = () => {
  const [listings, setListings] = useState<CropListing[]>([...mockListings]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>('');

  // Subscribe to grading store — re-renders when Hub Manager grades/pools a listing
  useEffect(() => {
    const unsub = subscribeGradingStore(() => {
      // Snapshot the current mockListings (mutated by grading-store)
      setListings([...mockListings]);
    });
    return unsub;
  }, []);
  const [voiceError, setVoiceError] = useState<string>('');
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const recognitionRef = useRef<any>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Also keep track of confirmed payout to consume
  const confirmedPayout: PayoutRecord | undefined = mockPayouts.find((p) => p.status === 'Confirmed');

  // ── Toast helper ──
  const flash = useCallback((message: string, type: 'success' | 'error') => {
    setShowToast({ message, type });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setShowToast(null), 3500);
  }, []);

  // ── Build a CropListing from parsed voice data ──
  const addListingFromVoice = useCallback(
    (parsed: { crop: string; qtyKg: number; villageName: string }) => {
      const newId = `L${Date.now()}`;
      const newListing: CropListing = {
        id: newId,
        farmerId: 'F1',
        farmerName: 'Ramesh Yadav',
        crop: parsed.crop,
        qtyKg: parsed.qtyKg,
        location: { lat: 24.95, lng: 84.03, villageName: parsed.villageName },
        status: 'Listed',
        createdAt: new Date().toISOString(),
      };

      // Push to the imported mock array so other views see it too
      mockListings.push(newListing);
      setListings((prev) => [newListing, ...prev]);
      setNewIds((prev) => new Set(prev).add(newId));
      flash(`Added ${parsed.qtyKg} kg ${parsed.crop} from ${parsed.villageName}`, 'success');

      // Remove the "new" highlight after a few seconds
      setTimeout(() => {
        setNewIds((prev) => {
          const copy = new Set(prev);
          copy.delete(newId);
          return copy;
        });
      }, 4000);
    },
    [flash],
  );

  // ── Start / stop speech recognition ──
  const toggleListening = useCallback(() => {
    // If already listening, stop
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    setVoiceError('');
    setTranscript('');

    // Feature-detect Web Speech API
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: simulate a voice input for demo purposes
      setIsListening(true);
      setTranscript('Listening… (simulated)');
      setTimeout(() => {
        const simulated = '150 kg potato from Dehri village';
        setTranscript(simulated);
        const parsed = parseVoiceTranscript(simulated);
        if (parsed) {
          addListingFromVoice(parsed);
        } else {
          flash('Could not parse voice input. Try: "200 kg tomato from Sasaram"', 'error');
        }
        setIsListening(false);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      const text = last[0].transcript;
      setTranscript(text);

      if (last.isFinal) {
        const parsed = parseVoiceTranscript(text);
        if (parsed) {
          addListingFromVoice(parsed);
        } else {
          flash('Could not parse. Try: "200 kg tomato from Sasaram village"', 'error');
        }
        setIsListening(false);
      }
    };

    recognition.onerror = (event: any) => {
      setVoiceError(`Voice error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [isListening, addListingFromVoice, flash]);

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
        {/* ── Section Header ── */}
        <div>
          <h2 className="text-xl font-extrabold text-navy tracking-tight">
            🌾 My Farm Dashboard
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Record crop batches by voice — track from listing to payout.
          </p>
        </div>

        {/* ── Voice Input Card ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <Mic className="w-4 h-4 text-saffron" />
              Voice Listing
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Say something like <em className="text-navy font-medium">&quot;200 kg tomato from Sasaram village&quot;</em>
            </p>
          </div>

          {/* Transcript display area */}
          {(transcript || voiceError) && (
            <div className="px-4 pb-3">
              {transcript && (
                <div className="p-3 rounded-xl bg-canvas border border-navy/10 text-sm text-navy font-medium">
                  <span className="text-xs text-gray-400 block mb-1">Heard:</span>
                  &quot;{transcript}&quot;
                </div>
              )}
              {voiceError && (
                <p className="text-xs text-red-500 font-medium mt-1">{voiceError}</p>
              )}
            </div>
          )}

          {/* Listening indicator */}
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
            <span className="text-xs text-gray-400 font-medium">{listings.length} batches</span>
          </div>

          <div className="space-y-3">
            {listings.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-sm">
                <Circle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No crop batches yet. Tap the mic button to add one.
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

      {/* Inline keyframe styles for animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-12px) scale(0.97);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -16px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
      `}</style>
    </div>
  );
};
