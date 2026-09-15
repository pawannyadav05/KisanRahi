'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Camera,
  Package,
  ShieldCheck,
  Scale,
  Wheat,
  CheckCircle2,
  AlertTriangle,
  BadgeCheck,
  Truck,
  ClipboardList,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { mockPooledLots, mockGrades, mockPayouts, mockListings } from '@/lib/mock-data';
import type { GradeResult, PooledLot } from '@/types/kisanrahi';
import {
  evaluateDispatchReadiness,
  generateGatePass,
  type GatePass,
} from '@/services/hub/dispatch';

// ── Crop-type options for the inward form ────────────────────────
const CROP_TYPES = [
  'Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize',
  'Brinjal', 'Cauliflower', 'Cabbage', 'Green Chilli',
] as const;

// ── Grade badge colour mapping ───────────────────────────────────
const GRADE_STYLES: Record<GradeResult['grade'], { bg: string; text: string; ring: string; glow: string }> = {
  A: { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-400/60', glow: 'shadow-emerald-500/30' },
  B: { bg: 'bg-amber-500',   text: 'text-white', ring: 'ring-amber-400/60',   glow: 'shadow-amber-500/30' },
  C: { bg: 'bg-red-500',     text: 'text-white', ring: 'ring-red-400/60',     glow: 'shadow-red-500/30' },
};

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════
export const HubManagerView: React.FC = () => {
  // ── Local state ──────────────────────────────────────────────────
  const [weightKg, setWeightKg] = useState<string>('');
  const [cropType, setCropType] = useState<string>(CROP_TYPES[0]);
  const [inwardLog, setInwardLog] = useState<{ crop: string; kg: number; ts: string }[]>([]);

  // Keep a mutable-friendly copy of the pooled lot so the meter updates
  const [lot, setLot] = useState<PooledLot>(() => ({
    ...mockPooledLots[0],
  }));
  const grade = mockGrades[0];

  const [gatePass, setGatePass] = useState<GatePass | null>(null);
  const [gatePassError, setGatePassError] = useState<string>('');

  // Dispatch-readiness is computed reactively
  const evaluatedLot = useMemo(() => evaluateDispatchReadiness(lot), [lot]);
  const fillPct = Math.min(100, (evaluatedLot.totalKg / evaluatedLot.capacityKg) * 100);
  const isReady = evaluatedLot.status === 'Ready';
  const isDispatched = evaluatedLot.status === 'Dispatched';

  // Payout confirmation summary (from Abhay's pipeline)
  const payoutSummary = useMemo(() => {
    const farmerIds = lot.listings.map((l) => l.farmerId);
    const relevant = mockPayouts.filter((p) => farmerIds.includes(p.farmerId));
    const confirmed = relevant.filter((p) => p.status === 'Confirmed');
    return { total: relevant.length, confirmed: confirmed.length, payouts: relevant };
  }, [lot.listings]);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleInward = useCallback(() => {
    const kg = parseFloat(weightKg);
    if (isNaN(kg) || kg <= 0) return;

    setInwardLog((prev) => [
      { crop: cropType, kg, ts: new Date().toLocaleTimeString() },
      ...prev,
    ]);
    setLot((prev) => ({
      ...prev,
      totalKg: prev.totalKg + kg,
    }));
    setWeightKg('');
    setGatePassError('');
  }, [weightKg, cropType]);

  const handleGenerateGatePass = useCallback(() => {
    try {
      setGatePassError('');
      const pass = generateGatePass(evaluatedLot, mockPayouts, 'hub_manager');
      setGatePass(pass);
      setLot((prev) => ({ ...prev, status: 'Dispatched' }));
    } catch (err: unknown) {
      setGatePassError(err instanceof Error ? err.message : 'Gate pass generation failed.');
    }
  }, [evaluatedLot]);

  // ════════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header Card ──────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-saffron" />
            FPO Hub Manager Dashboard
          </span>
          <span className="text-xs font-normal text-gray-500">View B • Assigned: Vani</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Crate inwarding, AI produce inspection, truckload consolidation, and dispatch gate pass.
        </p>
      </div>

      {/* ── Top Row: Crate Inward + AI Camera ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* ─── Crate Inward Form ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
            <div className="flex items-center space-x-2 text-navy font-bold text-base">
              <Scale className="w-5 h-5 text-saffron" />
              <span>Crate Inward</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Digital weighment &amp; crop categorisation</p>
          </div>

          <div className="p-5 space-y-4">
            {/* Crop Type Dropdown */}
            <div>
              <label htmlFor="hub-crop-type" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Crop Type
              </label>
              <div className="relative">
                <Wheat className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green" />
                <select
                  id="hub-crop-type"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-green transition-shadow appearance-none"
                >
                  {CROP_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Weight Input */}
            <div>
              <label htmlFor="hub-weight-kg" className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Weight (kg)
              </label>
              <div className="relative">
                <Scale className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron" />
                <input
                  id="hub-weight-kg"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="Enter weight in kg"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleInward()}
                  className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm font-medium text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron transition-shadow"
                />
              </div>
            </div>

            <button
              id="hub-inward-btn"
              onClick={handleInward}
              disabled={!weightKg || parseFloat(weightKg) <= 0}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green to-greenDark text-white font-semibold text-sm shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:brightness-100 flex items-center justify-center gap-2"
            >
              <ClipboardList className="w-4 h-4" />
              Record Inward Entry
            </button>

            {/* Recent Inward Log */}
            {inwardLog.length > 0 && (
              <div className="mt-1 space-y-1.5 max-h-32 overflow-y-auto">
                <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">Recent Entries</span>
                {inwardLog.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-xs px-3 py-2 bg-canvas rounded-lg border border-border/60 animate-[slideIn_0.2s_ease-out]"
                  >
                    <span className="font-semibold text-navy">{entry.crop} — {entry.kg} kg</span>
                    <span className="text-gray-400 font-mono text-[10px]">{entry.ts}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── AI Camera Inspection Viewfinder ─────────────────── */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
            <div className="flex items-center space-x-2 text-navy font-bold text-base">
              <Camera className="w-5 h-5 text-saffron" />
              <span>AI Camera Inspection Viewfinder</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Computer-vision produce quality grading</p>
          </div>

          {/* Viewfinder Display */}
          <div className="m-5 rounded-xl overflow-hidden border-2 border-gray-800 shadow-lg">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative p-6 min-h-[220px] flex flex-col items-center justify-center">
              {/* Scan-line animation overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-10"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,100,0.08) 2px, rgba(0,255,100,0.08) 4px)',
                }}
              />

              {/* Camera crosshair corners */}
              <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
              <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
              <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
              <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />

              {/* Active indicator */}
              <div className="flex items-center gap-1.5 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-mono font-semibold">
                  Viewfinder Active
                </span>
              </div>

              {/* Grade Badge (large) */}
              {grade && (
                <div className={`
                  w-20 h-20 rounded-2xl ${GRADE_STYLES[grade.grade].bg} ${GRADE_STYLES[grade.grade].glow}
                  ring-4 ${GRADE_STYLES[grade.grade].ring}
                  flex flex-col items-center justify-center shadow-2xl
                  transition-all duration-500
                `}>
                  <span className="text-xs font-mono text-white/80 uppercase">Grade</span>
                  <span className="text-3xl font-black text-white leading-none">{grade.grade}</span>
                </div>
              )}

              {/* Metrics row */}
              <div className="mt-5 flex gap-6">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Uniformity</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{grade?.uniformityPct ?? '—'}%</div>
                </div>
                <div className="w-px bg-gray-700" />
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">Surface Damage</div>
                  <div className="text-lg font-bold text-amber-400 font-mono">{grade?.damagePct ?? '—'}%</div>
                </div>
              </div>

              {/* Listing ID watermark */}
              <div className="absolute bottom-2 right-3 text-[9px] text-gray-600 font-mono">
                ID: {grade?.listingId} • {grade ? new Date(grade.gradedAt).toLocaleTimeString() : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Truckload Consolidation Meter ────────────────────────── */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
          <div className="flex items-center space-x-2 text-navy font-bold text-base">
            <Package className="w-5 h-5 text-green" />
            <span>Truckload Consolidation Meter</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {evaluatedLot.hubName} — pooled produce capacity tracker
          </p>
        </div>

        <div className="p-5 space-y-4">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-navy/50" />
                {evaluatedLot.hubName}
              </span>
              <span className="font-mono">
                {evaluatedLot.totalKg.toLocaleString()} / {evaluatedLot.capacityKg.toLocaleString()} kg
              </span>
            </div>

            <div className="w-full bg-gray-100 h-6 rounded-full overflow-hidden border border-border relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  fillPct >= 100
                    ? 'bg-gradient-to-r from-green to-emerald-400'
                    : fillPct >= 75
                      ? 'bg-gradient-to-r from-green to-lime-500'
                      : 'bg-gradient-to-r from-green/80 to-green'
                }`}
                style={{ width: `${fillPct}%` }}
              />
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-navy/80 mix-blend-multiply">
                {fillPct.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Status + Gate Pass row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              {/* Lot status badge */}
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full
                ${isDispatched
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isReady
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }
              `}>
                {isDispatched ? (
                  <><BadgeCheck className="w-3.5 h-3.5" /> Dispatched</>
                ) : isReady ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Ready for Dispatch</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Filling ({(evaluatedLot.capacityKg - evaluatedLot.totalKg).toLocaleString()} kg remaining)</>
                )}
              </span>

              {/* Payment confirmation badge */}
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full
                ${payoutSummary.confirmed === payoutSummary.total && payoutSummary.total > 0
                  ? 'bg-green/10 text-greenDark border border-green/30'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
                }
              `}>
                <CreditCard className="w-3.5 h-3.5" />
                Payouts: {payoutSummary.confirmed}/{payoutSummary.total} Confirmed
              </span>
            </div>

            {/* Generate Gate Pass button */}
            <button
              id="hub-gate-pass-btn"
              onClick={handleGenerateGatePass}
              disabled={!isReady}
              className={`
                px-5 py-2.5 text-sm font-bold rounded-lg flex items-center gap-2 transition-all
                ${isReady
                  ? 'bg-gradient-to-r from-navy to-navyLight text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.97]'
                  : 'bg-gray-100 text-gray-400 border border-border cursor-not-allowed'
                }
              `}
            >
              <ShieldCheck className={`w-4 h-4 ${isReady ? 'text-saffron' : 'text-gray-300'}`} />
              Generate Dispatch Gate Pass
            </button>
          </div>

          {/* Gate pass error */}
          {gatePassError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{gatePassError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Gate Pass Record (rendered after generation) ──────────── */}
      {gatePass && (
        <div className="bg-gradient-to-br from-white to-green/5 rounded-xl border-2 border-green/30 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-green/20 bg-gradient-to-r from-green/10 to-transparent">
            <div className="flex items-center space-x-2 text-greenDark font-bold text-base">
              <BadgeCheck className="w-5 h-5 text-green" />
              <span>Dispatch Gate Pass — Generated</span>
            </div>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Gate Pass ID</span>
                <p className="font-bold text-navy font-mono mt-0.5">{gatePass.gatePassId}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Hub</span>
                <p className="font-bold text-navy mt-0.5">{gatePass.hubName}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Total Weight</span>
                <p className="font-bold text-navy mt-0.5">{gatePass.totalKg.toLocaleString()} kg / {gatePass.capacityKg.toLocaleString()} kg</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Dispatched At</span>
                <p className="font-bold text-navy font-mono mt-0.5">{new Date(gatePass.dispatchedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Listing IDs</span>
                <p className="font-mono text-navy mt-0.5">{gatePass.listingIds.join(', ')}</p>
              </div>
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Payment Status</span>
                <p className={`font-bold mt-0.5 ${
                  gatePass.paymentStatus === 'AllConfirmed' ? 'text-greenDark'
                    : gatePass.paymentStatus === 'PartiallyConfirmed' ? 'text-amber-600'
                      : 'text-red-600'
                }`}>
                  {gatePass.paymentStatus === 'AllConfirmed' && '✓ '}
                  {gatePass.paymentStatus.replace(/([A-Z])/g, ' $1').trim()}
                </p>
              </div>
              {gatePass.confirmedPayoutIds.length > 0 && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Confirmed Payout IDs</span>
                  <p className="font-mono text-navy mt-0.5 text-xs">{gatePass.confirmedPayoutIds.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Payout Confirmation Panel (from Abhay's PayoutRecord) ── */}
      {payoutSummary.payouts.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
            <div className="flex items-center space-x-2 text-navy font-bold text-base">
              <CreditCard className="w-5 h-5 text-green" />
              <span>Payment Confirmations</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Farmer payout records from escrow release pipeline
            </p>
          </div>

          <div className="p-5 space-y-2">
            {payoutSummary.payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-border/60"
              >
                <div>
                  <span className="font-semibold text-sm text-navy">{p.id}</span>
                  <span className="text-xs text-gray-500 ml-2">Farmer: {p.farmerId} • Order: {p.orderId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-navy">₹{p.amountInr.toLocaleString()}</span>
                  <span className={`
                    inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full
                    ${p.status === 'Confirmed'
                      ? 'bg-green/10 text-greenDark border border-green/30'
                      : p.status === 'Failed'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                    }
                  `}>
                    {p.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3" />}
                    {p.status}
                  </span>
                  <code className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border font-mono">
                    {p.gatewayRef}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
