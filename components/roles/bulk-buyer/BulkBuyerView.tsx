'use client';

import React, { useState, useCallback } from 'react';
import {
  ShoppingCart,
  ShieldCheck,
  Package,
  TrendingDown,
  Users,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  BarChart3,
  Leaf,
  AlertTriangle,
} from 'lucide-react';
import { mockPooledLots, mockOrders } from '@/lib/mock-data';
import type { Order, PooledLot, CropListing } from '@/types/kisanrahi';

/* ─────────────────────────────────────────────
   Simulated Benchmark Data
   (APMC Mandi reference prices for comparison)
   ───────────────────────────────────────────── */
const CROP_BENCHMARKS: Record<
  string,
  { apmcPricePerKg: number; kisanRahiPricePerKg: number; farmerSharePct: number; emoji: string }
> = {
  Onion:  { apmcPricePerKg: 22.0, kisanRahiPricePerKg: 15.4, farmerSharePct: 74, emoji: '🧅' },
  Tomato: { apmcPricePerKg: 24.0, kisanRahiPricePerKg: 16.2, farmerSharePct: 76, emoji: '🍅' },
  Potato: { apmcPricePerKg: 18.0, kisanRahiPricePerKg: 12.6, farmerSharePct: 72, emoji: '🥔' },
  Pulses: { apmcPricePerKg: 60.0, kisanRahiPricePerKg: 44.4, farmerSharePct: 78, emoji: '🫘' },
};

/* ─────────────────────────────────────────────
   Expand the single mock PooledLot into four
   crop-specific virtual lots for the catalog
   ───────────────────────────────────────────── */
interface CatalogLot {
  id: string;
  crop: string;
  emoji: string;
  hubName: string;
  hubId: string;
  totalKg: number;
  status: PooledLot['status'];
  listings: CropListing[];
  apmcPrice: number;
  directPrice: number;
  savingsPct: number;
  farmerSharePct: number;
}

function buildCatalog(): CatalogLot[] {
  const base = mockPooledLots[0];
  if (!base) return [];

  return ['Onion', 'Tomato', 'Potato', 'Pulses'].map((crop, idx) => {
    const bench = CROP_BENCHMARKS[crop]!;
    const savingsPct = ((bench.apmcPricePerKg - bench.kisanRahiPricePerKg) / bench.apmcPricePerKg) * 100;

    // For Tomato use real listings, for others synthesize quantities from base
    const qty =
      crop === 'Tomato'
        ? base.totalKg
        : Math.round(base.totalKg * (0.6 + idx * 0.15));

    return {
      id: `LOT-${base.hubId}-${crop.toUpperCase().slice(0, 3)}`,
      crop,
      emoji: bench.emoji,
      hubName: base.hubName,
      hubId: base.hubId,
      totalKg: qty,
      status: base.status,
      listings: crop === 'Tomato' ? base.listings : base.listings.map((l) => ({ ...l, crop })),
      apmcPrice: bench.apmcPricePerKg,
      directPrice: bench.kisanRahiPricePerKg,
      savingsPct: Math.round(savingsPct * 10) / 10,
      farmerSharePct: bench.farmerSharePct,
    };
  });
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export const BulkBuyerView: React.FC = () => {
  const catalog = buildCatalog();
  const [expandedLot, setExpandedLot] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([...mockOrders]);
  const [bookingQty, setBookingQty] = useState<Record<string, number>>({});
  const [justBooked, setJustBooked] = useState<string | null>(null);

  const toggleExpand = (lotId: string) =>
    setExpandedLot((prev) => (prev === lotId ? null : lotId));

  const handleQtyChange = useCallback((lotId: string, value: string) => {
    const num = parseInt(value, 10);
    setBookingQty((prev) => ({ ...prev, [lotId]: isNaN(num) ? 0 : num }));
  }, []);

  const handleBook = useCallback(
    (lot: CatalogLot) => {
      const qty = bookingQty[lot.id] || 100;
      if (qty < 100) return;

      const newOrder: Order = {
        id: `O${Date.now().toString(36).toUpperCase()}`,
        buyerId: 'B-INST-01',
        buyerName: 'Institutional Buyer',
        buyerType: 'B2B',
        lotId: lot.hubId,
        qtyKg: qty,
        pricePerKg: lot.directPrice,
        escrowStatus: 'Locked',
      };

      setOrders((prev) => [...prev, newOrder]);
      setJustBooked(lot.id);
      setTimeout(() => setJustBooked(null), 3000);
    },
    [bookingQty],
  );

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-xl font-bold text-navy flex items-center gap-2">
              <Package className="w-5 h-5 text-saffron" />
              Wholesale Lot Catalog
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Browse pooled farm produce across categories. Compare APMC mandi prices vs KisanRahi
              direct-sourced prices and book consolidated consignments with escrow protection.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-navy/10 text-navy border border-navy/20">
              B2B Institutional
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-green/10 text-greenDark border border-green/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Escrow Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: 'Available Lots',
            value: catalog.length,
            icon: <Package className="w-4 h-4" />,
            color: 'text-navy',
            bg: 'bg-navy/5',
          },
          {
            label: 'Avg. Savings vs APMC',
            value: `${Math.round(catalog.reduce((s, l) => s + l.savingsPct, 0) / catalog.length)}%`,
            icon: <TrendingDown className="w-4 h-4" />,
            color: 'text-saffron',
            bg: 'bg-saffron/5',
          },
          {
            label: 'Active B2B Orders',
            value: orders.filter((o) => o.buyerType === 'B2B').length,
            icon: <ShoppingCart className="w-4 h-4" />,
            color: 'text-greenDark',
            bg: 'bg-green/5',
          },
          {
            label: 'Direct Farmer Partners',
            value: new Set(catalog.flatMap((l) => l.listings.map((li) => li.farmerId))).size,
            icon: <Users className="w-4 h-4" />,
            color: 'text-navy',
            bg: 'bg-navy/5',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-xl p-3.5 border border-border/60 flex flex-col gap-1`}
          >
            <div className={`flex items-center gap-1.5 text-xs font-medium ${stat.color} opacity-80`}>
              {stat.icon}
              {stat.label}
            </div>
            <span className={`text-xl font-extrabold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      {/* ── Lot Catalog Cards ── */}
      <div className="space-y-4">
        {catalog.map((lot) => {
          const isExpanded = expandedLot === lot.id;
          const qty = bookingQty[lot.id] ?? 100;
          const isBooked = justBooked === lot.id;
          const qtyValid = qty >= 100;

          return (
            <div
              key={lot.id}
              className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
                isBooked ? 'border-green ring-2 ring-green/20' : 'border-border'
              }`}
            >
              {/* Lot Header Row */}
              <div
                className="flex items-center justify-between gap-3 p-4 sm:p-5 cursor-pointer hover:bg-canvas/50 transition-colors"
                onClick={() => toggleExpand(lot.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-3xl flex-shrink-0">{lot.emoji}</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy text-base">{lot.crop}</span>
                      <span
                        className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full ${
                          lot.status === 'Ready'
                            ? 'bg-green/10 text-greenDark border border-green/30'
                            : lot.status === 'Filling'
                            ? 'bg-saffron/10 text-saffronDark border border-saffron/30'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {lot.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {lot.hubName} • {lot.totalKg} kg available • Lot {lot.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-xs text-gray-400 line-through">
                      ₹{lot.apmcPrice.toFixed(1)}/kg
                    </span>
                    <span className="text-sm font-bold text-greenDark">
                      ₹{lot.directPrice.toFixed(1)}/kg
                    </span>
                  </div>
                  <span className="text-xs font-bold text-white bg-saffron px-2 py-1 rounded-md">
                    {lot.savingsPct}% OFF
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Detail: Price Comparison + Booking */}
              {isExpanded && (
                <div className="border-t border-border animate-in fade-in">
                  {/* Price-Transparency Comparison Table */}
                  <div className="p-4 sm:p-5 bg-canvas/30">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-navy mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-saffron" />
                      Price-Transparency Comparison — {lot.crop}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="text-left text-xs uppercase tracking-wider text-gray-500 border-b-2 border-border">
                            <th className="pb-2.5 pr-4 font-semibold">Pricing Metric</th>
                            <th className="pb-2.5 pr-4 font-semibold text-right">₹ / kg</th>
                            <th className="pb-2.5 font-semibold text-right">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/60">
                          {/* APMC Mandi Wholesale Benchmark */}
                          <tr className="group">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-400 flex-shrink-0" />
                                <span className="font-medium text-gray-700">
                                  APMC Mandi Wholesale Benchmark
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right font-mono font-bold text-gray-500 line-through">
                              ₹{lot.apmcPrice.toFixed(2)}
                            </td>
                            <td className="py-3 text-right text-xs text-gray-400">
                              Includes commission agents, multiple margins
                            </td>
                          </tr>

                          {/* KisanRahi Direct Sourced Price */}
                          <tr className="group bg-green/5">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-green flex-shrink-0" />
                                <span className="font-semibold text-greenDark">
                                  KisanRahi Direct Sourced Price
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right font-mono font-extrabold text-greenDark text-base">
                              ₹{lot.directPrice.toFixed(2)}
                            </td>
                            <td className="py-3 text-right">
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-white bg-gradient-to-r from-green to-greenDark px-2 py-0.5 rounded-full">
                                <TrendingDown className="w-3 h-3" />
                                {lot.savingsPct}% savings
                              </span>
                            </td>
                          </tr>

                          {/* Direct Farmer Share */}
                          <tr className="group">
                            <td className="py-3 pr-4">
                              <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-saffron flex-shrink-0" />
                                <span className="font-medium text-gray-700 flex items-center gap-1">
                                  <Leaf className="w-3.5 h-3.5 text-green" />
                                  Direct Farmer Share
                                </span>
                              </div>
                            </td>
                            <td className="py-3 pr-4 text-right font-mono font-bold text-saffronDark">
                              ₹{(lot.directPrice * lot.farmerSharePct / 100).toFixed(2)}
                            </td>
                            <td className="py-3 text-right text-xs text-gray-500">
                              <span className="font-semibold text-saffron">{lot.farmerSharePct}%</span>{' '}
                              of sale price goes directly to farmers
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Contributing Farmers */}
                  <div className="px-4 sm:px-5 py-3 border-t border-border/60">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Contributing Farmers
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lot.listings.map((listing) => (
                        <span
                          key={listing.id}
                          className="inline-flex items-center gap-1.5 text-xs bg-canvas border border-border rounded-full px-2.5 py-1"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green" />
                          <span className="font-medium text-navy">{listing.farmerName}</span>
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-500">{listing.qtyKg} kg</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking Action Bar */}
                  <div className="px-4 sm:px-5 py-4 border-t border-border bg-navy/[0.02] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-3 flex-wrap">
                      <label
                        htmlFor={`qty-${lot.id}`}
                        className="text-xs font-semibold text-gray-600 whitespace-nowrap"
                      >
                        Order Qty (kg):
                      </label>
                      <div className="relative">
                        <input
                          id={`qty-${lot.id}`}
                          type="number"
                          min={100}
                          step={50}
                          value={qty}
                          onChange={(e) => handleQtyChange(lot.id, e.target.value)}
                          className={`w-28 px-3 py-1.5 text-sm font-medium rounded-lg border ${
                            qtyValid
                              ? 'border-border focus:border-green focus:ring-1 focus:ring-green/30'
                              : 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-200'
                          } outline-none transition-colors`}
                        />
                        {!qtyValid && (
                          <p className="absolute -bottom-4 left-0 text-[10px] text-red-500 flex items-center gap-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            Min 100 kg
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        Total:{' '}
                        <span className="font-bold text-navy">
                          ₹{(qty * lot.directPrice).toLocaleString('en-IN')}
                        </span>
                      </span>
                    </div>

                    <button
                      disabled={!qtyValid || isBooked}
                      onClick={() => handleBook(lot)}
                      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                        isBooked
                          ? 'bg-green text-white cursor-default'
                          : qtyValid
                          ? 'bg-gradient-to-r from-green to-greenDark text-white hover:shadow-lg hover:shadow-green/20 active:scale-[0.98]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isBooked ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Booked — Escrow Locked
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Book Consolidated Consignment (Min 100 kg)
                        </>
                      )}
                    </button>
                  </div>

                  {/* Escrow Protected Stamp — visible after booking */}
                  {isBooked && (
                    <div className="mx-4 sm:mx-5 mb-4 flex items-center gap-3 bg-green/5 border border-green/20 rounded-lg px-4 py-3 animate-in slide-in-from-bottom-2">
                      <ShieldCheck className="w-6 h-6 text-green flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-greenDark flex items-center gap-1.5">
                          Escrow Protected
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-green text-white px-2 py-0.5 rounded">
                            B2B Verified
                          </span>
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Payment held in escrow until delivery confirmation. Farmer payouts auto-released on receipt.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Active Orders Summary ── */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-navy text-base flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-saffron" />
              Active B2B Orders
            </h3>
            <span className="text-xs font-mono font-semibold bg-navy/10 text-navy px-2.5 py-1 rounded">
              {orders.filter((o) => o.buyerType === 'B2B').length} orders
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-500 bg-canvas border-b border-border">
                  <th className="px-4 py-2.5 font-semibold">Order ID</th>
                  <th className="px-4 py-2.5 font-semibold">Lot</th>
                  <th className="px-4 py-2.5 font-semibold">Qty</th>
                  <th className="px-4 py-2.5 font-semibold">Price/kg</th>
                  <th className="px-4 py-2.5 font-semibold">Total</th>
                  <th className="px-4 py-2.5 font-semibold">Escrow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders
                  .filter((o) => o.buyerType === 'B2B')
                  .map((order) => (
                    <tr key={order.id} className="hover:bg-canvas/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-navy">#{order.id}</td>
                      <td className="px-4 py-3 text-gray-600">{order.lotId}</td>
                      <td className="px-4 py-3 font-medium">{order.qtyKg} kg</td>
                      <td className="px-4 py-3 font-medium text-greenDark">₹{order.pricePerKg}</td>
                      <td className="px-4 py-3 font-bold text-navy">
                        ₹{(order.qtyKg * order.pricePerKg).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            order.escrowStatus === 'Locked'
                              ? 'bg-green/10 text-greenDark border border-green/30'
                              : order.escrowStatus === 'Released'
                              ? 'bg-navy/10 text-navy border border-navy/20'
                              : 'bg-saffron/10 text-saffronDark border border-saffron/30'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {order.escrowStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Escrow Safeguard Footer ── */}
      <div className="bg-gradient-to-r from-navy/[0.04] to-green/[0.04] border border-navy/15 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-navy/10 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-navy" />
          </div>
          <div>
            <h4 className="font-bold text-navy text-sm">Escrow Contract Safeguard</h4>
            <p className="text-xs text-gray-600">
              All B2B consignments are payment-protected. Funds are held in escrow until delivery
              confirmation &amp; quality verification at destination.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-navy text-white px-3 py-1.5 rounded-lg tracking-wider">
          ESCROW PROTECTED
        </span>
      </div>
    </div>
  );
};
