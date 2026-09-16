'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  User,
  Search,
  Upload,
  ScanLine,
  ZoomIn,
  ChevronRight,
  RotateCcw,
  ArrowRight,
  X,
  Loader2,
} from 'lucide-react';
import { mockPooledLots, mockGrades, mockPayouts } from '@/lib/mock-data';
import type { GradeResult, PooledLot } from '@/types/kisanrahi';
import {
  evaluateDispatchReadiness,
  generateGatePass,
  type GatePass,
} from '@/services/hub/dispatch';
import {
  lookupFarmer,
  runAIGrading,
  recordGradedEntry,
  type FarmerRecord,
  type AIGradeReport,
  type GradedEntry,
  DEMO_FARMERS,
} from '@/lib/grading-store';

// ── Crop-type options ─────────────────────────────────────────────
const CROP_TYPES = [
  'Tomato', 'Onion', 'Potato', 'Wheat', 'Rice', 'Maize',
  'Brinjal', 'Cauliflower', 'Cabbage', 'Green Chilli',
] as const;

type CropType = typeof CROP_TYPES[number];

// ── Grade badge colour mapping ────────────────────────────────────
const GRADE_STYLES: Record<'A' | 'B' | 'C', {
  bg: string; text: string; ring: string; glow: string; border: string; label: string;
}> = {
  A: { bg: 'bg-emerald-500', text: 'text-white', ring: 'ring-emerald-400/60', glow: 'shadow-emerald-500/40', border: 'border-emerald-400', label: 'Premium Quality' },
  B: { bg: 'bg-amber-500',   text: 'text-white', ring: 'ring-amber-400/60',   glow: 'shadow-amber-500/40',   border: 'border-amber-400',   label: 'Standard Quality' },
  C: { bg: 'bg-red-500',     text: 'text-white', ring: 'ring-red-400/60',     glow: 'shadow-red-500/40',     border: 'border-red-400',     label: 'Below Standard' },
};

// ── Workflow steps ────────────────────────────────────────────────
type Step = 'farmer' | 'crop' | 'camera' | 'result';

const STEP_LABELS: Record<Step, string> = {
  farmer: '1. Farmer ID',
  crop:   '2. Crop & Qty',
  camera: '3. AI Grading',
  result: '4. Record Entry',
};

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════
export const HubManagerView: React.FC = () => {
  // ── Workflow state ────────────────────────────────────────────
  const [step, setStep]                   = useState<Step>('farmer');
  const [farmerIdInput, setFarmerIdInput] = useState('');
  const [farmer, setFarmer]               = useState<FarmerRecord | null>(null);
  const [farmerError, setFarmerError]     = useState('');
  const [cropType, setCropType]           = useState<CropType>('Tomato');
  const [weightKg, setWeightKg]           = useState('');

  // AI Grading state
  const [imageFile, setImageFile]         = useState<File | null>(null);
  const [imagePreview, setImagePreview]   = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing]     = useState(false);
  const [aiReport, setAiReport]           = useState<AIGradeReport | null>(null);
  const [gradeError, setGradeError]       = useState('');
  const [scanProgress, setScanProgress]   = useState(0);

  // Entry log
  const [entryLog, setEntryLog]           = useState<GradedEntry[]>([]);

  // Lot / dispatch state
  const [lot, setLot] = useState<PooledLot>(() => ({ ...mockPooledLots[0] }));
  const [gatePass, setGatePass]           = useState<GatePass | null>(null);
  const [gatePassError, setGatePassError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep lot in sync with mockPooledLots[0] whenever recordGradedEntry mutates it
  useEffect(() => {
    const interval = setInterval(() => {
      if (mockPooledLots[0]) {
        setLot((prev) => {
          if (prev.totalKg !== mockPooledLots[0].totalKg || prev.status !== mockPooledLots[0].status) {
            return { ...mockPooledLots[0] };
          }
          return prev;
        });
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const evaluatedLot = useMemo(() => evaluateDispatchReadiness(lot), [lot]);
  const fillPct      = Math.min(100, (evaluatedLot.totalKg / evaluatedLot.capacityKg) * 100);
  const isReady      = evaluatedLot.status === 'Ready';
  const isDispatched = evaluatedLot.status === 'Dispatched';

  const payoutSummary = useMemo(() => {
    const farmerIds = lot.listings.map((l) => l.farmerId);
    const relevant  = mockPayouts.filter((p) => farmerIds.includes(p.farmerId));
    const confirmed = relevant.filter((p) => p.status === 'Confirmed');
    return { total: relevant.length, confirmed: confirmed.length, payouts: relevant };
  }, [lot.listings]);

  // ── Handlers ─────────────────────────────────────────────────

  const handleFarmerLookup = useCallback(() => {
    setFarmerError('');
    const found = lookupFarmer(farmerIdInput);
    if (found) {
      setFarmer(found);
      setStep('crop');
    } else {
      setFarmerError(`No farmer found with ID "${farmerIdInput.toUpperCase()}". Try: F001–F006`);
    }
  }, [farmerIdInput]);

  const handleImageSelect = useCallback((file: File) => {
    setImageFile(file);
    setAiReport(null);
    setGradeError('');
    setScanProgress(0);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setStep('camera');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleImageSelect(file);
  }, [handleImageSelect]);

  const handleRunAI = useCallback(async () => {
    if (!imageFile || !cropType) return;
    setIsAnalyzing(true);
    setGradeError('');
    setScanProgress(0);

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + Math.random() * 12;
      });
    }, 150);

    try {
      const report = await runAIGrading(imageFile, cropType);
      clearInterval(progressInterval);
      setScanProgress(100);
      setTimeout(() => setAiReport(report), 300);
    } catch {
      clearInterval(progressInterval);
      setGradeError('Analysis failed. Please try with a different image.');
    } finally {
      setIsAnalyzing(false);
    }
  }, [imageFile, cropType]);

  const handleRecordEntry = useCallback(() => {
    if (!farmer || !aiReport) return;
    const kg = parseFloat(weightKg);
    if (isNaN(kg) || kg <= 0) return;

    const entry = recordGradedEntry(farmer, cropType, kg, {
      grade: aiReport.grade,
      uniformityPct: aiReport.uniformityPct,
      damagePct: aiReport.damagePct,
    });
    setEntryLog((prev) => [entry, ...prev.slice(0, 9)]);
    setStep('result');
  }, [farmer, aiReport, cropType, weightKg]);

  const handleReset = useCallback(() => {
    setStep('farmer');
    setFarmerIdInput('');
    setFarmer(null);
    setFarmerError('');
    setCropType('Tomato');
    setWeightKg('');
    setImageFile(null);
    setImagePreview(null);
    setAiReport(null);
    setGradeError('');
    setScanProgress(0);
  }, []);

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

  // ── Step Progress Bar ────────────────────────────────────────
  const steps: Step[] = ['farmer', 'crop', 'camera', 'result'];
  const stepIdx = steps.indexOf(step);

  // ════════════════════════════════════════════════════════════
  // Render
  // ════════════════════════════════════════════════════════════
  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-saffron" />
            FPO Hub Manager — Inward &amp; Grading
          </span>
          <span className="text-xs font-normal text-gray-500">Vani PACS Hub · Sasaram</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Verify farmer → select produce → AI grade image → record &amp; pool. Farmer's dashboard updates in real-time.
        </p>

        {/* Step progress indicator */}
        <div className="flex items-center gap-0 mt-4">
          {steps.map((s, i) => (
            <React.Fragment key={s}>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                i === stepIdx
                  ? 'bg-saffron text-white shadow-md'
                  : i < stepIdx
                    ? 'bg-green/15 text-greenDark'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {i < stepIdx && <CheckCircle2 className="w-3 h-3" />}
                {STEP_LABELS[s]}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight className={`w-4 h-4 mx-0.5 flex-shrink-0 ${i < stepIdx ? 'text-green' : 'text-gray-300'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main Workflow Card ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: Workflow Steps */}
        <div className="space-y-4">

          {/* STEP 1: Farmer ID Lookup */}
          <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
            step === 'farmer' ? 'border-saffron/50 ring-2 ring-saffron/20' : 'border-border'
          }`}>
            <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-navy/5 to-transparent flex items-center gap-2">
              <User className="w-4 h-4 text-saffron" />
              <span className="font-bold text-sm text-navy">Step 1 — Farmer Verification</span>
              {farmer && <CheckCircle2 className="w-4 h-4 text-green ml-auto" />}
            </div>
            <div className="p-4 space-y-3">
              {farmer ? (
                /* Farmer confirmed */
                <div className="flex items-center justify-between p-3 rounded-lg bg-green/5 border border-green/20">
                  <div>
                    <p className="font-bold text-navy text-sm">{farmer.name}</p>
                    <p className="text-xs text-gray-500">{farmer.id} · 📍 {farmer.village} · 📞 {farmer.phone}</p>
                  </div>
                  <button
                    onClick={() => { setFarmer(null); setFarmerIdInput(''); setStep('farmer'); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Enter Farmer ID (e.g. F001)"
                      value={farmerIdInput}
                      onChange={(e) => setFarmerIdInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && handleFarmerLookup()}
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm font-mono font-semibold text-navy focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron"
                    />
                  </div>
                  {farmerError && (
                    <p className="text-xs text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{farmerError}
                    </p>
                  )}
                  <button
                    onClick={handleFarmerLookup}
                    disabled={!farmerIdInput.trim()}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-navy to-navyLight text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                  >
                    <Search className="w-4 h-4" />Lookup Farmer
                  </button>

                  {/* Quick demo IDs */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {DEMO_FARMERS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => { setFarmerIdInput(f.id); setFarmer(f); setStep('crop'); }}
                        className="px-2 py-1 text-[11px] font-bold rounded-md bg-navy/5 hover:bg-saffron/10 text-navy hover:text-saffronDark border border-border hover:border-saffron/30 transition-all"
                      >
                        {f.id}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* STEP 2: Crop Type + Quantity */}
          <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
            step === 'crop' ? 'border-saffron/50 ring-2 ring-saffron/20' : 'border-border'
          } ${!farmer ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-navy/5 to-transparent flex items-center gap-2">
              <Wheat className="w-4 h-4 text-green" />
              <span className="font-bold text-sm text-navy">Step 2 — Crop &amp; Quantity</span>
              {step !== 'farmer' && step !== 'crop' && weightKg && (
                <span className="ml-auto text-xs font-bold text-greenDark bg-green/10 px-2 py-0.5 rounded-full">
                  {weightKg} kg · {cropType}
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Crop Type</label>
                <div className="relative">
                  <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green pointer-events-none" />
                  <select
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value as CropType)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm font-medium text-navy focus:outline-none focus:ring-2 focus:ring-green/40 focus:border-green appearance-none"
                  >
                    {CROP_TYPES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Quantity (kg)</label>
                <div className="relative">
                  <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-saffron pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    placeholder="e.g. 150"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-canvas text-sm font-medium text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-saffron/40 focus:border-saffron"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep('camera')}
                disabled={!farmer || !weightKg || parseFloat(weightKg) <= 0}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-green to-greenDark text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Camera className="w-4 h-4" />
                Open AI Camera Grading
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: AI Camera Viewfinder */}
        <div className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all ${
          step === 'camera' || step === 'result' ? 'border-emerald-400/40 ring-2 ring-emerald-400/15' : 'border-border'
        } ${step === 'farmer' || step === 'crop' ? 'opacity-60' : ''}`}>
          <div className="px-5 py-3.5 border-b border-border bg-gradient-to-r from-gray-900 to-gray-800">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <Camera className="w-4 h-4 text-emerald-400" />
              Step 3 — AI Camera Inspection
            </div>
            <p className="text-xs text-gray-400 mt-0.5">YOLOv8 Computer Vision · Grade A / B / C</p>
          </div>

          {/* Viewfinder */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative min-h-[280px] flex flex-col items-center justify-center">
            {/* Corner crosshairs */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-sm" />

            {/* Scan line animation */}
            <div className="absolute inset-0 pointer-events-none opacity-10"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,100,0.08) 2px, rgba(0,255,100,0.08) 4px)' }}
            />

            {/* Content inside viewfinder */}
            {!imagePreview ? (
              /* Upload zone */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="m-4 flex-1 w-[calc(100%-2rem)] border-2 border-dashed border-emerald-400/30 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-emerald-400/60 transition-colors p-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-8 h-8 text-emerald-400/60" />
                <div className="text-center">
                  <p className="text-emerald-300 font-semibold text-sm">Upload produce photo</p>
                  <p className="text-gray-500 text-xs mt-0.5">Drag &amp; drop or click to select</p>
                  <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP supported</p>
                </div>
                <button className="mt-1 px-4 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-colors">
                  Choose Image
                </button>
              </div>
            ) : !aiReport ? (
              /* Image preview + analyze button */
              <div className="relative w-full h-full min-h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Produce for grading"
                  className="w-full h-full object-cover"
                  style={{ minHeight: 220, maxHeight: 280 }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gray-900/60 flex flex-col items-center justify-center gap-4">
                  {isAnalyzing ? (
                    /* Scanning animation */
                    <div className="flex flex-col items-center gap-3 w-full px-8">
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span className="text-emerald-300 font-mono text-xs font-bold tracking-widest uppercase">
                          Analyzing with YOLOv8…
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-200"
                          style={{ width: `${scanProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-400 font-mono">{Math.round(scanProgress)}% — Detecting objects…</div>
                      {/* Scanning beam */}
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-emerald-400/60 blur-sm"
                        style={{
                          top: `${scanProgress}%`,
                          transition: 'top 0.2s linear',
                          boxShadow: '0 0 8px #34d399',
                        }}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="text-center">
                        <ZoomIn className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                        <p className="text-white font-bold text-sm">{cropType} — {weightKg} kg</p>
                        <p className="text-gray-400 text-xs mt-0.5">Ready for AI analysis</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setImagePreview(null); setImageFile(null); }}
                          className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/20 transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Retake
                        </button>
                        <button
                          onClick={handleRunAI}
                          disabled={!farmer || !weightKg}
                          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-bold shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all disabled:opacity-40"
                        >
                          <ScanLine className="w-3.5 h-3.5" /> Run AI Grading
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Grade Result Overlay */
              <div className="relative w-full min-h-[280px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Graded produce"
                  className="w-full object-cover"
                  style={{ minHeight: 220, maxHeight: 280 }}
                />
                {/* Grade border */}
                <div className={`absolute inset-0 border-4 ${GRADE_STYLES[aiReport.grade].border} rounded-sm pointer-events-none`} />
                {/* Grade badge top-right */}
                <div className={`absolute top-3 right-3 ${GRADE_STYLES[aiReport.grade].bg} rounded-xl px-3 py-2 shadow-xl ${GRADE_STYLES[aiReport.grade].glow}`}>
                  <div className="text-[10px] text-white/80 font-mono uppercase">Grade</div>
                  <div className="text-3xl font-black text-white leading-none">{aiReport.grade}</div>
                </div>
                {/* Metrics bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 px-4 py-2.5 flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 font-mono">Uniformity</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono">{aiReport.uniformityPct}%</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 font-mono">Damage</div>
                    <div className="text-sm font-bold text-amber-400 font-mono">{aiReport.damagePct}%</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 font-mono">Objects</div>
                    <div className="text-sm font-bold text-blue-400 font-mono">{aiReport.detectedObjects}</div>
                  </div>
                  <div className="w-px h-8 bg-gray-700" />
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 font-mono">Confidence</div>
                    <div className="text-sm font-bold text-white font-mono">{aiReport.confidence}%</div>
                  </div>
                  <button
                    onClick={() => { setAiReport(null); setImageFile(null); setImagePreview(null); }}
                    className="ml-auto p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {gradeError && (
              <div className="absolute bottom-12 left-4 right-4 flex items-center gap-2 bg-red-900/80 text-red-200 text-xs px-3 py-2 rounded-lg">
                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                {gradeError}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleImageSelect(f);
              }}
            />
          </div>

          {/* Record Entry Button */}
          {aiReport && step !== 'result' && (
            <div className="p-4 border-t border-border bg-white space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium">
                <Sparkles className="w-3.5 h-3.5 text-saffron" />
                <span>
                  Grade <strong className="text-navy">{aiReport.grade}</strong> — {GRADE_STYLES[aiReport.grade].label} · {weightKg} kg {cropType} · Farmer: {farmer?.name}
                </span>
              </div>
              <button
                id="hub-record-entry-btn"
                onClick={handleRecordEntry}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron to-saffronDark text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-saffron/30 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <ClipboardList className="w-4 h-4" />
                Record Entry &amp; Add to Pooled Lot
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Success: Entry Recorded ────────────────────────────── */}
      {step === 'result' && entryLog.length > 0 && (
        <div className="bg-gradient-to-br from-white to-green/5 rounded-xl border-2 border-green/30 shadow-sm overflow-hidden animate-[fadeIn_0.4s_ease-out]">
          <div className="px-5 py-4 border-b border-green/20 bg-green/5 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5 text-green" />
            <span className="font-bold text-greenDark">Entry Recorded &amp; Added to Pool ✓</span>
            <span className="ml-auto text-xs text-gray-500">Farmer dashboard will update to "Graded → Pooled"</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Farmer', value: entryLog[0].farmerName },
                { label: 'Crop & Qty', value: `${entryLog[0].crop} · ${entryLog[0].qtyKg} kg` },
                { label: 'Grade', value: `${entryLog[0].grade.grade} (${GRADE_STYLES[entryLog[0].grade.grade].label})` },
                { label: 'Listing ID', value: entryLog[0].listingId },
              ].map((item) => (
                <div key={item.label}>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{item.label}</div>
                  <div className="font-bold text-navy mt-0.5 text-sm">{item.value}</div>
                </div>
              ))}
            </div>
            <button
              onClick={handleReset}
              className="mt-4 px-4 py-2 rounded-lg bg-navy text-white font-semibold text-sm flex items-center gap-2 hover:brightness-110 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              Grade Next Farmer
            </button>
          </div>
        </div>
      )}

      {/* ── Recent Graded Entries Log ─────────────────────────── */}
      {entryLog.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
            <div className="flex items-center gap-2 text-navy font-bold text-base">
              <ClipboardList className="w-5 h-5 text-saffron" />
              <span>Today's Graded Inward Log</span>
              <span className="ml-auto text-xs font-normal text-gray-400">{entryLog.length} entries</span>
            </div>
          </div>
          <div className="divide-y divide-border">
            {entryLog.map((entry) => {
              const gs = GRADE_STYLES[entry.grade.grade];
              return (
                <div key={entry.listingId} className="flex items-center gap-4 px-5 py-3">
                  <div className={`w-8 h-8 rounded-lg ${gs.bg} flex items-center justify-center font-black text-white text-sm shadow-sm ${gs.glow}`}>
                    {entry.grade.grade}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-navy">{entry.farmerName} — {entry.crop}</div>
                    <div className="text-xs text-gray-500">{entry.qtyKg} kg · Uniformity {entry.grade.uniformityPct}% · Damage {entry.grade.damagePct}%</div>
                  </div>
                  <div className="text-[10px] font-mono text-gray-400">{entry.listingId}</div>
                  <div className="text-[10px] font-mono text-gray-400">{new Date(entry.recordedAt).toLocaleTimeString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Truckload Consolidation Meter ─────────────────────── */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
          <div className="flex items-center gap-2 text-navy font-bold text-base">
            <Package className="w-5 h-5 text-green" />
            <span>Truckload Consolidation Meter</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{evaluatedLot.hubName} — pooled produce tracker</p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-navy/50" />{evaluatedLot.hubName}
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

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${
                isDispatched
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : isReady
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {isDispatched ? (
                  <><BadgeCheck className="w-3.5 h-3.5" /> Dispatched</>
                ) : isReady ? (
                  <><CheckCircle2 className="w-3.5 h-3.5" /> Ready for Dispatch</>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Filling ({(evaluatedLot.capacityKg - evaluatedLot.totalKg).toLocaleString()} kg remaining)</>
                )}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full ${
                payoutSummary.confirmed === payoutSummary.total && payoutSummary.total > 0
                  ? 'bg-green/10 text-greenDark border border-green/30'
                  : 'bg-gray-50 text-gray-500 border border-gray-200'
              }`}>
                <CreditCard className="w-3.5 h-3.5" />
                Payouts: {payoutSummary.confirmed}/{payoutSummary.total} Confirmed
              </span>
            </div>

            <button
              id="hub-gate-pass-btn"
              onClick={handleGenerateGatePass}
              disabled={!isReady}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg flex items-center gap-2 transition-all ${
                isReady
                  ? 'bg-gradient-to-r from-navy to-navyLight text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.97]'
                  : 'bg-gray-100 text-gray-400 border border-border cursor-not-allowed'
              }`}
            >
              <ShieldCheck className={`w-4 h-4 ${isReady ? 'text-saffron' : 'text-gray-300'}`} />
              Generate Dispatch Gate Pass
            </button>
          </div>

          {gatePassError && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{gatePassError}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Gate Pass ─────────────────────────────────────────── */}
      {gatePass && (
        <div className="bg-gradient-to-br from-white to-green/5 rounded-xl border-2 border-green/30 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-green/20 bg-gradient-to-r from-green/10 to-transparent">
            <div className="flex items-center gap-2 text-greenDark font-bold text-base">
              <BadgeCheck className="w-5 h-5 text-green" />
              Dispatch Gate Pass — Generated
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
            {[
              { label: 'Gate Pass ID', value: gatePass.gatePassId, mono: true },
              { label: 'Hub', value: gatePass.hubName },
              { label: 'Total Weight', value: `${gatePass.totalKg.toLocaleString()} / ${gatePass.capacityKg.toLocaleString()} kg` },
              { label: 'Dispatched At', value: new Date(gatePass.dispatchedAt).toLocaleString(), mono: true },
            ].map((row) => (
              <div key={row.label}>
                <span className="text-xs text-gray-500 uppercase tracking-wide">{row.label}</span>
                <p className={`font-bold text-navy mt-0.5 ${row.mono ? 'font-mono' : ''}`}>{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Payout Confirmation Panel ──────────────────────────── */}
      {payoutSummary.payouts.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-navy/5 to-transparent">
            <div className="flex items-center gap-2 text-navy font-bold text-base">
              <CreditCard className="w-5 h-5 text-green" />
              <span>Payment Confirmations</span>
            </div>
          </div>
          <div className="p-5 space-y-2">
            {payoutSummary.payouts.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-canvas border border-border/60">
                <div>
                  <span className="font-semibold text-sm text-navy">{p.id}</span>
                  <span className="text-xs text-gray-500 ml-2">Farmer: {p.farmerId} · Order: {p.orderId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-navy">₹{p.amountInr.toLocaleString()}</span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold rounded-full ${
                    p.status === 'Confirmed'
                      ? 'bg-green/10 text-greenDark border border-green/30'
                      : p.status === 'Failed'
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-amber-50 text-amber-600 border border-amber-200'
                  }`}>
                    {p.status === 'Confirmed' && <CheckCircle2 className="w-3 h-3" />}
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
