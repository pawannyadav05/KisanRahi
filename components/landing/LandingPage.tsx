'use client';

import React from 'react';
import {
  Tractor,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Building2,
  Mic,
  ShieldCheck,
  Zap,
  TrendingUp,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Award,
  ChevronRight,
  Lock,
  Globe2,
  Cpu,
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';

interface LandingPageProps {
  onEnterApp: (role?: UserRole) => void;
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenAuth,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* ─── Hero Section ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-28 border-b border-slate-800">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Government / Platform Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-6 shadow-inner">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Department of Consumer Affairs (DoCA) • Agri-Logistics Grid</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
              Direct Farm-to-Buyer{' '}
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Produce Pooling & Voice Logistics
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto">
              Eliminating 5 layers of mandi middlemen. Farmers list in Bhojpuri/Hindi via voice, local PACS hubs aggregate with PostGIS spatial routing, and buyers procure fresh pooled lots with escrow-locked guarantees.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => onEnterApp('farmer')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-xl hover:shadow-emerald-500/25 transition-all flex items-center gap-2 transform hover:-translate-y-0.5"
              >
                <span>Launch App Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAuth}
                className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm border border-slate-700 hover:border-slate-600 shadow-lg transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>1-Click Hackathon Demo Login</span>
              </button>
            </div>

            {/* Key Assurance Badges */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Guaranteed MSP Floor</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Instant UPI DBT Payout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>PostGIS Geospatial Pooling</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Live Metrics & Impact Stats ─────────────────────────────────── */}
      <section className="py-12 bg-slate-900/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-3xl sm:text-4xl font-black text-emerald-400">76.4%</div>
              <div className="text-xs font-semibold text-slate-300 mt-1">Farmer Realization</div>
              <div className="text-[11px] text-slate-500 mt-0.5">vs 31% in traditional APMC</div>
            </div>

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

      {/* ─── 6 Stakeholder Role Portals ───────────────────────────────────── */}
      <section className="py-16 bg-slate-900/60 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              Unified Multi-Role Platform
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-white mt-1">
              Explore Dashboards for Every Stakeholder
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Click any card to enter that live dashboard directly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Farmer */}
            <div
              onClick={() => onEnterApp('farmer')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-green-600/20 border border-green-500/40 text-green-400">
                  <Tractor className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => onEnterApp('hub_manager')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-teal-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-teal-600/20 border border-teal-500/40 text-teal-400">
                  <Warehouse className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-teal-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => onEnterApp('bulk_buyer')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => onEnterApp('retail_consumer')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400">
                  <ShoppingCart className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => onEnterApp('driver')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-600/20 border border-amber-500/40 text-amber-400">
                  <Truck className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
              onClick={() => onEnterApp('doca_admin')}
              className="group p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-red-500/60 hover:bg-slate-850 cursor-pointer transition-all shadow-md hover:shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-bold text-red-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter View <ChevronRight className="w-3.5 h-3.5" />
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
            <button onClick={() => onEnterApp('farmer')} className="hover:text-slate-300 transition-colors">
              Farmer Portal
            </button>
            <button onClick={() => onEnterApp('doca_admin')} className="hover:text-slate-300 transition-colors">
              DoCA Command
            </button>
            <button onClick={onOpenAuth} className="text-emerald-400 hover:text-emerald-300 font-bold transition-colors">
              Sign In / Auth
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
