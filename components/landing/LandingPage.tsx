'use client';

import React, { useEffect, useRef } from 'react';
import {
  Wheat,
  Store,
  Building2,
  Truck,
  ArrowRight,
  ArrowDown,
  Scan,
  Layers,
  Route,
  PackageCheck,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';

/* ═══════════════════════════════════════════════════════════════════
   Props — identical signature to existing component so page.tsx
   requires zero changes.
   ═══════════════════════════════════════════════════════════════════ */
interface LandingPageProps {
  onEnterApp: (role?: UserRole) => void;
  onOpenAuth: () => void;
}

/* ═══════════════════════════════════════════════════════════════════
   Scroll-reveal hook
   ═══════════════════════════════════════════════════════════════════ */
function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ═══════════════════════════════════════════════════════════════════
   HERO NETWORK VISUALIZATION (SVG)
   Animated farm-to-buyer infrastructure diagram
   ═══════════════════════════════════════════════════════════════════ */
const NetworkVisualization: React.FC = () => (
  <div className="relative w-full max-w-xl mx-auto mt-10 lg:mt-0">
    <svg
      viewBox="0 0 480 360"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      aria-label="KisanRahi farm-to-buyer network visualization"
    >
      {/* ── Connection Lines ────────────────────────────── */}
      {/* Farmer → KisanRahi */}
      <line x1="120" y1="80" x2="240" y2="160" stroke="#138808" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* KisanRahi → B2C */}
      <line x1="240" y1="200" x2="140" y2="280" stroke="#0b2545" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* KisanRahi → B2B */}
      <line x1="240" y1="200" x2="340" y2="280" stroke="#0b2545" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* B2C → Logistics */}
      <line x1="140" y1="300" x2="240" y2="340" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* B2B → Logistics */}
      <line x1="340" y1="300" x2="240" y2="340" stroke="#f97316" strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5" />
      {/* Extra farmer lines */}
      <line x1="60" y1="60" x2="240" y2="160" stroke="#138808" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />
      <line x1="360" y1="80" x2="240" y2="160" stroke="#138808" strokeWidth="1" strokeDasharray="4 6" opacity="0.25" />

      {/* ── Flow Dots (static) ───────────────────────────── */}
      <circle cx="180" cy="120" r="3" fill="#138808" opacity="0.7" />
      <circle cx="190" cy="240" r="3" fill="#0b2545" opacity="0.7" />
      <circle cx="290" cy="240" r="3" fill="#0b2545" opacity="0.7" />
      <circle cx="240" cy="320" r="3" fill="#f97316" opacity="0.7" />

      {/* ── Node: Farmer ──────────────────────────────────── */}
      <g>
        <rect x="86" y="44" width="68" height="68" rx="16" fill="white" stroke="#138808" strokeWidth="1.5" />
        <text x="120" y="82" textAnchor="middle" fill="#138808" fontSize="24">🌾</text>
      </g>
      <text x="120" y="128" textAnchor="middle" fill="#0b2545" fontSize="11" fontWeight="700">FARMER</text>

      {/* ── Node: Extra Farmers (ghost) ──────────────────── */}
      <g opacity="0.35">
        <rect x="26" y="28" width="48" height="48" rx="12" fill="white" stroke="#138808" strokeWidth="1" />
        <text x="50" y="58" textAnchor="middle" fill="#138808" fontSize="18">🌾</text>
      </g>
      <g opacity="0.35">
        <rect x="336" y="48" width="48" height="48" rx="12" fill="white" stroke="#138808" strokeWidth="1" />
        <text x="360" y="78" textAnchor="middle" fill="#138808" fontSize="18">🌾</text>
      </g>

      {/* ── Node: KisanRahi (center) ──────────────────────── */}
      <g>
        <rect x="192" y="144" width="96" height="56" rx="14" fill="#0b2545" stroke="#133b5c" strokeWidth="1.5" />
        <text x="240" y="168" textAnchor="middle" fill="white" fontSize="11" fontWeight="800">KisanRahi</text>
        <text x="240" y="184" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontWeight="500">Demand Pool</text>
      </g>

      {/* ── Node: B2C ─────────────────────────────────────── */}
      <g>
        <rect x="100" y="260" width="80" height="48" rx="12" fill="white" stroke="#0b2545" strokeWidth="1.5" />
        <text x="140" y="282" textAnchor="middle" fill="#0b2545" fontSize="10" fontWeight="700">🏠 B2C</text>
        <text x="140" y="296" textAnchor="middle" fill="#64748b" fontSize="8">Consumer</text>
      </g>

      {/* ── Node: B2B ─────────────────────────────────────── */}
      <g>
        <rect x="300" y="260" width="80" height="48" rx="12" fill="white" stroke="#0b2545" strokeWidth="1.5" />
        <text x="340" y="282" textAnchor="middle" fill="#0b2545" fontSize="10" fontWeight="700">🏢 B2B</text>
        <text x="340" y="296" textAnchor="middle" fill="#64748b" fontSize="8">Wholesale</text>
      </g>

      {/* ── Node: Logistics ───────────────────────────────── */}
      <g>
        <rect x="206" y="324" width="68" height="32" rx="10" fill="#fff7ed" stroke="#f97316" strokeWidth="1.5" />
        <text x="240" y="345" textAnchor="middle" fill="#ea580c" fontSize="10" fontWeight="700">🚚 Move</text>
      </g>

      {/* ── Down Arrows ───────────────────────────────────── */}
      <polygon points="240,136 235,130 245,130" fill="#138808" />
      <polygon points="192,210 188,204 196,204" fill="#0b2545" />
      <polygon points="288,210 284,204 292,204" fill="#0b2545" />
    </svg>

    {/* Label overlay */}
    <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 border border-slate-200 text-[10px] font-semibold text-navy tracking-wide">
      <span className="w-1.5 h-1.5 rounded-full bg-green" />
      LIVE FARM NETWORK
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN LANDING PAGE COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
}) => {
  useReveal();

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas text-navy flex flex-col selection:bg-green/20 selection:text-navy">


      {/* ────────────────────────────────────────────────────────────
          STICKY NAVBAR
         ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 bg-white/85 landing-nav border-b border-slate-200/80">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex items-center justify-center h-12">
          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-10 text-[14px] font-semibold text-slate-600">
            <button onClick={() => scrollTo('how-it-works')} className="hover:text-navy transition-colors py-2">How it works</button>
            <button onClick={() => scrollTo('roles')} className="hover:text-navy transition-colors py-2">For Farmers</button>
            <button onClick={() => scrollTo('roles')} className="hover:text-navy transition-colors py-2">For Buyers</button>
            <button onClick={() => scrollTo('journey')} className="hover:text-navy transition-colors py-2">Impact</button>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('how-it-works')} className="block w-full text-left text-[15px] font-semibold text-slate-600 hover:text-navy py-2">How it works</button>
            <button onClick={() => scrollTo('roles')} className="block w-full text-left text-[15px] font-semibold text-slate-600 hover:text-navy py-2">For Farmers</button>
            <button onClick={() => scrollTo('roles')} className="block w-full text-left text-[15px] font-semibold text-slate-600 hover:text-navy py-2">For Buyers</button>
            <button onClick={() => scrollTo('journey')} className="block w-full text-left text-[15px] font-semibold text-slate-600 hover:text-navy py-2">Impact</button>
          </div>
        )}
      </nav>

      {/* ────────────────────────────────────────────────────────────
          SECTION 02 — HERO
         ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left — Text */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-navy leading-[1.3] tracking-tight">
              <span className="text-green">सीधे खेत से,</span>
              <br />
              <span className="text-navy mt-2 block">सीधे आपके लिए.</span>
            </h2>

            <p className="mt-4 text-lg sm:text-xl font-semibold text-navy/80">
              One connected marketplace for farmers, consumers and bulk buyers.
            </p>

            <p className="mt-3 text-sm text-slate-500 leading-relaxed max-w-lg mx-auto lg:mx-0">
              KisanRahi brings farmers and FPOs closer to B2C and B2B buyers through pooled demand, transparent pricing and smart logistics.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={onOpenAuth}
                className="px-6 py-3 rounded-lg bg-green text-white font-bold text-sm hover:bg-greenDark transition-colors shadow-sm flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>


          </div>

          {/* Right — Network Visualization */}
          <div className="flex-1 w-full max-w-xl">
            <NetworkVisualization />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 03 — THE CORE IDEA
          "One Network. Fewer Intermediaries."
         ──────────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-16 md:py-20 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center reveal">
            <h3 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              One Network. Fewer Intermediaries.
            </h3>
          </div>

          {/* Comparison Diagram */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* TRADITIONAL */}
            <div className="reveal reveal-delay-1 bg-white rounded-2xl border border-slate-200 p-6 relative">
              <div className="absolute -top-3 left-5 px-3 py-0.5 bg-red-50 border border-red-200 rounded-full text-[11px] font-bold text-red-500 tracking-wide">
                TRADITIONAL
              </div>
              <div className="mt-2 flex flex-col items-center gap-3 text-sm font-semibold text-slate-600">
                <div className="px-4 py-2 rounded-lg bg-green/10 text-green font-bold text-xs">🌾 Farmer</div>
                <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-xs">Trader</div>
                <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-xs">Wholesaler</div>
                <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                <div className="px-4 py-2 rounded-lg bg-slate-100 text-slate-500 text-xs">Retailer</div>
                <ArrowDown className="w-3.5 h-3.5 text-slate-300" />
                <div className="px-4 py-2 rounded-lg bg-navy/10 text-navy font-bold text-xs">🏠 Consumer</div>
              </div>
              <div className="mt-4 text-center text-[11px] text-red-400 font-semibold">
                4+ intermediaries &bull; 30–50% margin loss
              </div>
            </div>

            {/* KISANRAHI */}
            <div className="reveal reveal-delay-2 bg-white rounded-2xl border-2 border-green/30 p-6 relative shadow-sm">
              <div className="absolute -top-3 left-5 px-3 py-0.5 bg-canvas border border-green/30 rounded-full text-[11px] font-bold text-green tracking-wide z-10">
                KISANRAHI
              </div>
              <div className="mt-2 flex flex-col items-center gap-3 text-sm font-semibold text-slate-600">
                <div className="px-4 py-2 rounded-lg bg-green/10 text-green font-bold text-xs">🌾 Farmer / FPO</div>
                <ArrowDown className="w-3.5 h-3.5 text-green" />
                <div className="px-5 py-2.5 rounded-xl bg-navy text-white font-bold text-xs shadow-sm">
                  KisanRahi
                </div>
                {/* Branching */}
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <ArrowDown className="w-3.5 h-3.5 text-navy/50" />
                    <div className="px-3 py-1.5 rounded-lg bg-navy/10 text-navy font-bold text-xs">🏠 B2C</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <ArrowDown className="w-3.5 h-3.5 text-navy/50" />
                    <div className="px-3 py-1.5 rounded-lg bg-navy/10 text-navy font-bold text-xs">🏢 B2B</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center text-[11px] text-green font-semibold">
                Direct connection &bull; Better realization
              </div>
            </div>
          </div>

          {/* Three Benefits */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 reveal reveal-delay-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[12px] font-semibold text-navy">
              <span className="w-2 h-2 rounded-full bg-green" />
              Better Price Visibility
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[12px] font-semibold text-navy">
              <span className="w-2 h-2 rounded-full bg-saffron" />
              Demand Pooling
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-[12px] font-semibold text-navy">
              <span className="w-2 h-2 rounded-full bg-navy" />
              Efficient Logistics
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 04 — ROLE ENTRY
          "Choose Your KisanRahi"
         ──────────────────────────────────────────────────────────── */}
      <section id="roles" className="py-16 md:py-20 bg-white border-y border-slate-200">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center reveal">
            <h3 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              Choose Your KisanRahi
            </h3>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {/* 01 — Farmer / FPO */}
            <div className="reveal reveal-delay-1 group bg-canvas rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-green/40 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🌾</div>
              <h4 className="font-bold text-navy text-[15px]">Farmer / FPO</h4>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed flex-1">
                List, grade and pool your produce.
              </p>
              <button
                onClick={() => onEnterApp('farmer')}
                className="mt-5 w-full py-2.5 rounded-lg bg-green text-white font-bold text-[12px] hover:bg-greenDark transition-colors flex items-center justify-center gap-1.5"
              >
                Enter Farmer Portal
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 02 — Consumer */}
            <div className="reveal reveal-delay-2 group bg-canvas rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-navy/30 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🏠</div>
              <h4 className="font-bold text-navy text-[15px]">Consumer</h4>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed flex-1">
                Buy fresh produce through community pooling.
              </p>
              <button
                onClick={() => onEnterApp('retail_consumer')}
                className="mt-5 w-full py-2.5 rounded-lg bg-navy text-white font-bold text-[12px] hover:bg-navyLight transition-colors flex items-center justify-center gap-1.5"
              >
                Shop Direct
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 03 — B2B Buyer */}
            <div className="reveal reveal-delay-3 group bg-canvas rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-navy/30 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🏢</div>
              <h4 className="font-bold text-navy text-[15px]">B2B Buyer</h4>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed flex-1">
                Source consolidated farm lots with transparent pricing.
              </p>
              <button
                onClick={() => onEnterApp('bulk_buyer')}
                className="mt-5 w-full py-2.5 rounded-lg bg-navy text-white font-bold text-[12px] hover:bg-navyLight transition-colors flex items-center justify-center gap-1.5"
              >
                Browse Wholesale
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 04 — Logistics */}
            <div className="reveal reveal-delay-4 group bg-canvas rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-saffron/30 hover:shadow-md transition-all">
              <div className="text-3xl mb-3">🚚</div>
              <h4 className="font-bold text-navy text-[15px]">Logistics</h4>
              <p className="text-[12px] text-slate-500 mt-1.5 leading-relaxed flex-1">
                Move pooled produce through optimized routes.
              </p>
              <button
                onClick={() => onEnterApp('driver')}
                className="mt-5 w-full py-2.5 rounded-lg bg-saffron text-white font-bold text-[12px] hover:bg-saffronDark transition-colors flex items-center justify-center gap-1.5"
              >
                Open Driver Portal
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 05 — HOW KISANRAHI CONNECTS EVERYTHING
          5-step journey + live ecosystem panel
         ──────────────────────────────────────────────────────────── */}
      <section id="journey" className="py-16 md:py-20 bg-canvas">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="text-center reveal">
            <h3 className="text-2xl sm:text-3xl font-black text-navy tracking-tight">
              How KisanRahi Connects Everything
            </h3>
          </div>

          <div className="mt-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
            {/* Journey Steps (left) */}
            <div className="flex-1 space-y-0">
              {[
                { step: '01', label: 'LIST', desc: 'Farmer lists crop via voice or app', icon: Wheat, color: 'green' },
                { step: '02', label: 'GRADE', desc: 'AI-assisted quality grading', icon: Scan, color: 'green' },
                { step: '03', label: 'POOL', desc: 'Demand is consolidated at hub', icon: Layers, color: 'navy' },
                { step: '04', label: 'MOVE', desc: 'Smart logistics routing', icon: Route, color: 'saffron' },
                { step: '05', label: 'RECEIVE', desc: 'Buyer gets the produce', icon: PackageCheck, color: 'navy' },
              ].map((item, i) => (
                <div key={item.step} className={`reveal reveal-delay-${i + 1} flex items-start gap-4 py-5 ${i < 4 ? 'border-b border-slate-200' : ''}`}>
                  {/* Step number + line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                      item.color === 'green' ? 'bg-green' : item.color === 'saffron' ? 'bg-saffron' : 'bg-navy'
                    }`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-bold tracking-wider ${
                        item.color === 'green' ? 'text-green' : item.color === 'saffron' ? 'text-saffron' : 'text-navy'
                      }`}>
                        STEP {item.step}
                      </span>
                      <span className="text-xs font-bold text-navy">
                        {item.label}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Live Ecosystem Panel (right) */}
            <div className="w-full lg:w-80 reveal reveal-delay-2">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-20">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
                  <span className="text-[11px] font-bold text-navy tracking-wider">LIVE ECOSYSTEM</span>
                </div>

                <div className="space-y-4">
                  {[
                    { emoji: '🌾', label: 'Farmer', sublabel: 'Producer', color: 'bg-green/10 border-green/20' },
                    { emoji: '🏬', label: 'Hub', sublabel: 'PACS Aggregator', color: 'bg-teal-50 border-teal-200' },
                    { emoji: '🏢', label: 'B2B', sublabel: 'Wholesale Buyer', color: 'bg-blue-50 border-blue-200' },
                    { emoji: '🏠', label: 'B2C', sublabel: 'Retail Consumer', color: 'bg-purple-50 border-purple-200' },
                    { emoji: '🚚', label: 'Driver', sublabel: 'Logistics', color: 'bg-orange-50 border-orange-200' },
                  ].map((node, i) => (
                    <div key={node.label} className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${node.color} border flex items-center justify-center text-lg`}>
                        {node.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-[13px] font-bold text-navy">{node.label}</div>
                        <div className="text-[11px] text-slate-400">{node.sublabel}</div>
                      </div>
                      {/* Connection line to next */}
                      {i < 4 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse-dot" style={{ animationDelay: `${i * 0.4}s` }} />
                      )}
                    </div>
                  ))}
                </div>

                {/* Connection visualization */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">Network Status</span>
                    <span className="text-[10px] text-green font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                      Connected
                    </span>
                  </div>
                  {/* Animated connection bar */}
                  <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-green via-navy to-saffron animate-connection-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────
          SECTION 06 — FINAL CTA + FOOTER
         ──────────────────────────────────────────────────────────── */}
      <section className="py-16 md:py-20 bg-navy text-white">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 text-center">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight reveal">
            From the Farm.
            <br />
            Directly to the Buyer.
          </h3>
          <p className="mt-4 text-sm text-slate-300 max-w-md mx-auto reveal reveal-delay-1">
            Transparent sourcing. Pooled demand. Smarter movement.
          </p>

<<<<<<< HEAD
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-blue-400">28.2%</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Consumer Price Drop</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Direct Farm Fresh Produce</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-amber-400">&lt; 2.8%</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Corridor Transit Loss</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Cold chain & optimal routing</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-purple-400">412+</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Active PACS Hubs</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Bihar Corridor Network</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How KisanRahi Works Pipeline ─────────────────────────────────── */}
      <section className="py-16 bg-slate-950 border-b border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              End-to-End Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              How KisanRahi Powers the Supply Chain
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 font-bold">
                  <Mic className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-emerald-400 uppercase">Step 01</div>
                <h3 className="text-lg font-bold text-white mt-1">Voice & WhatsApp Listing</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Farmers speak in Bhojpuri or Hindi: <em>&ldquo;Hamaar 200 kilo tamatar baa&rdquo;</em>. AI parses crop, qty, and village, generating a live listing automatically.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Bhashini AI Speech Engine
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 mb-4 font-bold">
                  <MapPin className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-teal-400 uppercase">Step 02</div>
                <h3 className="text-lg font-bold text-white mt-1">PostGIS Micro-Hub Pooling</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  PostGIS spatial queries automatically map the produce to the nearest PACS/FPO collection point. Grade A/B/C lots are dynamically pooled into dispatch-ready batches.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
                <Globe2 className="w-3.5 h-3.5 text-teal-400" /> PostgreSQL 17 + PostGIS 3.3
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 font-bold">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold text-amber-400 uppercase">Step 03</div>
                <h3 className="text-lg font-bold text-white mt-1">Escrow & Milk-Run Dispatch</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Buyers lock funds in smart escrow. Drivers receive dynamic routing for multi-point pickup. On weighbridge QR scan, instant UPI DBT settles to farmer accounts.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Smart Escrow + RazorpayX DBT
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 6 Stakeholder Role Portals (RBAC Protected) ─────────────────── */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Role-Based Access Control (RBAC) Architecture
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              Secure Role Portals for Every Stakeholder
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Access is strictly restricted by authenticated user role. Sign in to launch your assigned view.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Farmer */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-green-600/20 border border-green-500/40 text-green-400">
                  <Tractor className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                View A — Farmer Dashboard
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Voice listing, AI crop grading scores, guaranteed MSP realization rate, and live pooled lot tracking.
              </p>
            </div>

            {/* 2. Hub Manager */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-teal-600/20 border border-teal-500/40 text-teal-400">
                  <Warehouse className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                View B — Hub Manager (PACS)
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Incoming lot weighment scanner, batch consolidation, real-time inventory levels, and dispatch staging.
              </p>
            </div>

            {/* 3. Bulk Buyer */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                View C — Bulk Buyer (B2B)
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Order full 10-tonne aggregated lots, lock payment in escrow, and track temperature-controlled delivery.
              </p>
            </div>

            {/* 4. Retail Consumer */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                View D — Retail Consumer (B2C)
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Community group-buying with 28% direct savings, harvest provenance QR verification, and doorstep drops.
              </p>
            </div>

            {/* 5. Driver */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                View E — Logistics Driver
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Dynamic milk-run multi-hub waypoint route navigation with digital QR manifest pickup and weighment logs.
              </p>
            </div>

            {/* 6. DoCA Admin */}
            <div
              onClick={onOpenAuth}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Sign In <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-red-300 transition-colors">
                View F — DoCA Central Radar
              </h4>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                National price stabilization radar, artificial hoarding anomaly detection, dynamic MSP buffers, and state feeds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer className="py-10 bg-slate-950 border-t border-slate-800 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-green to-saffron flex items-center justify-center font-bold text-white text-[10px]">
              KR
            </div>
            <span className="text-slate-300 font-bold">KisanRahi Platform</span>
            <span>• Government of India / DoCA Initiative</span>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={onOpenAuth} className="hover:text-slate-300 transition-colors">
              Farmer Portal
            </button>
            <button onClick={onOpenAuth} className="hover:text-slate-300 transition-colors">
              DoCA Command
            </button>
            <button onClick={onOpenAuth} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Sign In / Auth
=======
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 reveal reveal-delay-2">
            <button
              onClick={onOpenAuth}
              className="px-6 py-3 rounded-lg bg-green text-white font-bold text-sm hover:bg-greenDark transition-colors shadow-sm flex items-center gap-2"
            >
              Join KisanRahi
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollTo('roles')}
              className="px-6 py-3 rounded-lg bg-white/10 text-white font-bold text-sm border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              Explore Platform
              <ChevronRight className="w-4 h-4" />
>>>>>>> origin/main
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────── */}
      <footer className="py-10 bg-navy border-t border-navyLight text-sm">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-green to-saffron flex items-center justify-center font-extrabold text-xs text-white">
                  KR
                </div>
                <span className="font-bold text-white text-[15px]">KisanRahi</span>
              </div>
              <p className="text-xs text-slate-400 max-w-xs">
                Direct Farm-to-Buyer Pooling &amp; Voice Logistics Platform
              </p>
            </div>

            {/* Nav Links */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-400 font-medium">
              <button onClick={() => scrollTo('top')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
              <button onClick={() => onEnterApp('farmer')} className="hover:text-white transition-colors">Farmer</button>
              <button onClick={() => onEnterApp('bulk_buyer')} className="hover:text-white transition-colors">B2B</button>
              <button onClick={() => onEnterApp('retail_consumer')} className="hover:text-white transition-colors">B2C</button>
              <button onClick={() => onEnterApp('driver')} className="hover:text-white transition-colors">Logistics</button>
              <button onClick={() => scrollTo('how-it-works')} className="hover:text-white transition-colors">About</button>
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-8 pt-5 border-t border-navyLight/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <span>&copy; 2026 KisanRahi &bull; All rights reserved.</span>
            <span>Not an official Government of India website.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
