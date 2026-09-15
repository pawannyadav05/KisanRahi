'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Truck,
  Warehouse,
  Users,
  Gavel,
  RefreshCw,
  Loader2,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Ban,
} from 'lucide-react';

import { mockAdminMetrics, mockOrders, mockPayouts } from '@/lib/mock-data';
import type { AdminMetrics, Order } from '@/types/kisanrahi';
import { fetchMandiPrice, type FloorPriceResult } from '@/services/agmarknet/price-check';

// ─── Parity Alert Data ─────────────────────────────────────────────────
interface PriceParityRow {
  crop: string;
  farmGateCostPerKg: number;
  retailPricePerKg: number;
  agmarknetFloorPerKg: number | null;
  source: 'live' | 'fallback' | 'loading';
}

const INITIAL_PARITY_DATA: PriceParityRow[] = [
  { crop: 'Tomato',  farmGateCostPerKg: 14.0,  retailPricePerKg: 16.5,  agmarknetFloorPerKg: null, source: 'loading' },
  { crop: 'Onion',   farmGateCostPerKg: 12.0,  retailPricePerKg: 32.0,  agmarknetFloorPerKg: null, source: 'loading' },
  { crop: 'Potato',  farmGateCostPerKg: 8.0,   retailPricePerKg: 22.0,  agmarknetFloorPerKg: null, source: 'loading' },
  { crop: 'Wheat',   farmGateCostPerKg: 20.0,  retailPricePerKg: 38.0,  agmarknetFloorPerKg: null, source: 'loading' },
  { crop: 'Rice',    farmGateCostPerKg: 22.0,  retailPricePerKg: 48.0,  agmarknetFloorPerKg: null, source: 'loading' },
  { crop: 'Brinjal', farmGateCostPerKg: 10.0,  retailPricePerKg: 28.0,  agmarknetFloorPerKg: null, source: 'loading' },
];

// ─── Escrow Dispute Item ────────────────────────────────────────────────
interface DisputeItem {
  id: string;
  orderId: string;
  buyerName: string;
  crop: string;
  amountInr: number;
  reason: string;
  filedAt: string;
  status: 'Open' | 'Resolved';
}

const INITIAL_DISPUTES: DisputeItem[] = [
  {
    id: 'D1',
    orderId: 'O1',
    buyerName: 'Patna Caterers Co-op',
    crop: 'Tomato',
    amountInr: 12150,
    reason: 'Quality mismatch — Grade B received instead of A',
    filedAt: '2026-09-14T08:30:00Z',
    status: 'Open',
  },
  {
    id: 'D2',
    orderId: 'O2',
    buyerName: 'FreshMart Retail',
    crop: 'Onion',
    amountInr: 8400,
    reason: 'Delivery delayed by 36 hours; partial spoilage',
    filedAt: '2026-09-13T11:15:00Z',
    status: 'Open',
  },
  {
    id: 'D3',
    orderId: 'O3',
    buyerName: 'Gaya Wholesale Co.',
    crop: 'Potato',
    amountInr: 5800,
    reason: 'Short weight — 18 kg less than invoiced',
    filedAt: '2026-09-12T14:00:00Z',
    status: 'Resolved',
  },
];

// ─── Stat Card Component ────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accentColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subtitle, icon, trend, accentColor }) => (
  <div className="group relative bg-white rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
    {/* Accent top-bar */}
    <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />

    <div className="flex items-start justify-between mb-3">
      <div className="p-2 rounded-xl bg-canvas">{icon}</div>
      {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-green" />}
      {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-saffron" />}
    </div>

    <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide block">{label}</span>
    <span className="text-3xl font-black text-navy block mt-1 tracking-tight">{value}</span>
    <span className="text-[10px] text-gray-400 block mt-1.5">{subtitle}</span>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────
export const DoCAAdminView: React.FC = () => {
  const metrics: AdminMetrics = mockAdminMetrics;

  // ── Price Parity State ──
  const [parityRows, setParityRows] = useState<PriceParityRow[]>(INITIAL_PARITY_DATA);
  const [parityLoading, setParityLoading] = useState(false);

  // ── Escrow / Disputes State ──
  const [disputes, setDisputes] = useState<DisputeItem[]>(INITIAL_DISPUTES);

  // ── Fetch Agmarknet Prices ──
  const fetchAllPrices = useCallback(async () => {
    setParityLoading(true);
    const updated = await Promise.all(
      parityRows.map(async (row) => {
        try {
          const result: FloorPriceResult = await fetchMandiPrice(row.crop, 'Bihar');
          return {
            ...row,
            agmarknetFloorPerKg: result.floorPricePerKg,
            source: result.source,
          } as PriceParityRow;
        } catch {
          return { ...row, source: 'fallback' as const };
        }
      }),
    );
    setParityRows(updated);
    setParityLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchAllPrices();
  }, [fetchAllPrices]);

  // ── Resolve Dispute ──
  const resolveDispute = (id: string) => {
    setDisputes((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Resolved' as const } : d)),
    );
  };

  // ── Computed ──
  const escrowSummary = {
    totalLocked: mockOrders.filter((o) => o.escrowStatus === 'Locked').length,
    totalReleased: mockOrders.filter((o) => o.escrowStatus === 'Released').length,
    totalPending: mockOrders.filter((o) => o.escrowStatus === 'Pending').length,
    openDisputes: disputes.filter((d) => d.status === 'Open').length,
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
      {/* ── Header ── */}
      <div className="relative bg-gradient-to-br from-navy to-navyLight rounded-2xl p-6 sm:p-8 text-white shadow-lg overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/5" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-saffron" />
              <span className="text-xs font-semibold tracking-wider uppercase text-saffron/90">
                View F — DoCA National Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Department of Consumer Affairs
            </h1>
            <p className="text-sm text-white/70 mt-1 max-w-lg">
              Agmarknet mandi price parity alerts, transit-loss monitoring, and escrow settlement oversight.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
            <Activity className="w-3.5 h-3.5" />
            <span>Live — {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* ── Section 1: Admin Metric Stat Cards ── */}
      <section>
        <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wider mb-4">
          Platform Health Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Farmer Realization"
            value={`${metrics.farmerRealizationPct}%`}
            subtitle="vs 45% traditional mandi"
            icon={<TrendingUp className="w-5 h-5 text-green" />}
            trend="up"
            accentColor="bg-green"
          />
          <StatCard
            label="Consumer Price Cut"
            value={`${metrics.consumerPriceReductionPct}%`}
            subtitle="Direct farm-sourcing saving"
            icon={<TrendingDown className="w-5 h-5 text-saffron" />}
            trend="down"
            accentColor="bg-saffron"
          />
          <StatCard
            label="Transit Loss"
            value={`${metrics.transitLossPct}%`}
            subtitle="vs 25% national avg"
            icon={<Truck className="w-5 h-5 text-navy" />}
            trend="down"
            accentColor="bg-navy"
          />
          <StatCard
            label="Active Hubs"
            value={String(metrics.activeHubs)}
            subtitle="Village collection points"
            icon={<Warehouse className="w-5 h-5 text-navyLight" />}
            trend="up"
            accentColor="bg-navyLight"
          />
          <StatCard
            label="Active Runs"
            value={String(metrics.activeRuns)}
            subtitle="Live truck dispatches"
            icon={<Activity className="w-5 h-5 text-green" />}
            trend="neutral"
            accentColor="bg-green"
          />
        </div>
      </section>

      {/* ── Section 2: Agmarknet Mandi Price Parity Alert Table ── */}
      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-saffron" />
            <h3 className="font-bold text-navy text-base">Agmarknet Mandi Price Parity Alerts</h3>
          </div>
          <button
            onClick={fetchAllPrices}
            disabled={parityLoading}
            className="flex items-center gap-1.5 text-xs font-semibold text-navyLight hover:text-navy bg-canvas hover:bg-gray-100 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
          >
            {parityLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh Prices
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-navy uppercase font-semibold text-[11px]">
                <th className="p-3">Crop</th>
                <th className="p-3">Farm Gate Cost</th>
                <th className="p-3">
                  <span className="flex items-center gap-1">
                    Agmarknet Floor
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </span>
                </th>
                <th className="p-3">Retail Price</th>
                <th className="p-3">Retail / Farm-Gate</th>
                <th className="p-3">Alert Level</th>
                <th className="p-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-gray-700">
              {parityRows.map((row) => {
                const ratio = (row.retailPricePerKg / row.farmGateCostPerKg) * 100;
                const isAlert = ratio > 200;

                return (
                  <tr
                    key={row.crop}
                    className={`hover:bg-canvas/60 transition-colors ${isAlert ? 'bg-saffron/5' : ''}`}
                  >
                    <td className="p-3 font-bold text-navy">{row.crop}</td>
                    <td className="p-3">₹{row.farmGateCostPerKg.toFixed(1)} / kg</td>
                    <td className="p-3">
                      {row.source === 'loading' ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <Loader2 className="w-3 h-3 animate-spin" /> Fetching…
                        </span>
                      ) : row.agmarknetFloorPerKg !== null ? (
                        `₹${row.agmarknetFloorPerKg.toFixed(1)} / kg`
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3">₹{row.retailPricePerKg.toFixed(1)} / kg</td>
                    <td className={`p-3 font-semibold ${isAlert ? 'text-saffron font-bold' : 'text-green'}`}>
                      {ratio.toFixed(0)}%{' '}
                      <span className="text-[10px] font-normal text-gray-400">
                        ({isAlert ? 'High Spread' : 'Healthy'})
                      </span>
                    </td>
                    <td className="p-3">
                      {isAlert ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-saffron/15 text-saffronDark font-bold text-[11px]">
                          <AlertTriangle className="w-3 h-3" />
                          Parity Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green/15 text-greenDark font-semibold text-[11px]">
                          <CheckCircle className="w-3 h-3" />
                          Normal
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          row.source === 'live'
                            ? 'bg-green/10 text-green'
                            : row.source === 'fallback'
                              ? 'bg-gray-100 text-gray-500'
                              : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {row.source === 'live' ? '● Live' : row.source === 'fallback' ? '○ Fallback' : '…'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 bg-canvas border-t border-border text-[10px] text-gray-400 flex items-center gap-1">
          <ExternalLink className="w-3 h-3" />
          Source: data.gov.in — Current Daily Price of Various Commodities (Agmarknet)
        </div>
      </section>

      {/* ── Section 3: Escrow Settlement Monitor ── */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-navy/60 uppercase tracking-wider">
          Escrow Settlement Monitor
        </h2>

        {/* Escrow Summary Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase block">Locked</span>
            <span className="text-2xl font-black text-saffron">{escrowSummary.totalLocked}</span>
            <span className="text-[10px] text-gray-400 block">Funds held in escrow</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase block">Released</span>
            <span className="text-2xl font-black text-green">{escrowSummary.totalReleased}</span>
            <span className="text-[10px] text-gray-400 block">Successfully settled</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase block">Pending</span>
            <span className="text-2xl font-black text-navyLight">{escrowSummary.totalPending}</span>
            <span className="text-[10px] text-gray-400 block">Awaiting confirmation</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
            <span className="text-[11px] font-semibold text-gray-400 uppercase block">Open Disputes</span>
            <span className={`text-2xl font-black ${escrowSummary.openDisputes > 0 ? 'text-saffron' : 'text-green'}`}>
              {escrowSummary.openDisputes}
            </span>
            <span className="text-[10px] text-gray-400 block">Requires admin action</span>
          </div>
        </div>

        {/* ── Order Escrow Table ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-border">
            <Gavel className="w-5 h-5 text-navy" />
            <h3 className="font-bold text-navy text-base">Escrow Order Status</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-canvas border-b border-border text-navy uppercase font-semibold text-[11px]">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Buyer</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Qty (kg)</th>
                  <th className="p-3">Price / kg</th>
                  <th className="p-3">Total (₹)</th>
                  <th className="p-3">Escrow Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-gray-700">
                {mockOrders.map((order: Order) => (
                  <tr key={order.id} className="hover:bg-canvas/60 transition-colors">
                    <td className="p-3 font-mono font-bold text-navy">{order.id}</td>
                    <td className="p-3">{order.buyerName}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          order.buyerType === 'B2B'
                            ? 'bg-navyLight/10 text-navyLight'
                            : 'bg-green/10 text-green'
                        }`}
                      >
                        {order.buyerType}
                      </span>
                    </td>
                    <td className="p-3">{order.qtyKg}</td>
                    <td className="p-3">₹{order.pricePerKg.toFixed(1)}</td>
                    <td className="p-3 font-semibold">₹{(order.qtyKg * order.pricePerKg).toLocaleString('en-IN')}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          order.escrowStatus === 'Released'
                            ? 'bg-green/15 text-greenDark'
                            : order.escrowStatus === 'Locked'
                              ? 'bg-saffron/15 text-saffronDark'
                              : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {order.escrowStatus === 'Released' && <CheckCircle className="w-3 h-3" />}
                        {order.escrowStatus === 'Locked' && <ShieldAlert className="w-3 h-3" />}
                        {order.escrowStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Dispute Queue ── */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2">
              <Ban className="w-5 h-5 text-saffron" />
              <h3 className="font-bold text-navy text-base">Dispute Queue</h3>
              {escrowSummary.openDisputes > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-saffron/15 text-saffronDark text-[10px] font-bold">
                  {escrowSummary.openDisputes} open
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-border">
            {disputes.map((dispute) => (
              <div
                key={dispute.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 gap-3 transition-colors ${
                  dispute.status === 'Resolved' ? 'bg-green/5 opacity-70' : 'hover:bg-canvas/60'
                }`}
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-navy">{dispute.id}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs text-gray-500">Order {dispute.orderId}</span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-semibold text-navyLight">{dispute.crop}</span>
                  </div>
                  <p className="text-xs text-gray-600 truncate">{dispute.reason}</p>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400">
                    <span>Buyer: {dispute.buyerName}</span>
                    <span>•</span>
                    <span>₹{dispute.amountInr.toLocaleString('en-IN')}</span>
                    <span>•</span>
                    <span>
                      Filed {new Date(dispute.filedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                      dispute.status === 'Resolved'
                        ? 'bg-green/15 text-greenDark'
                        : 'bg-saffron/15 text-saffronDark'
                    }`}
                  >
                    {dispute.status === 'Resolved' ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <AlertTriangle className="w-3 h-3" />
                    )}
                    {dispute.status}
                  </span>

                  {dispute.status === 'Open' && (
                    <button
                      onClick={() => resolveDispute(dispute.id)}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-green hover:bg-greenDark rounded-lg px-3 py-1.5 transition-colors shadow-sm active:scale-95"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {disputes.every((d) => d.status === 'Resolved') && (
            <div className="p-6 text-center text-sm text-gray-400">
              <CheckCircle className="w-8 h-8 text-green/40 mx-auto mb-2" />
              All disputes resolved — queue is clear.
            </div>
          )}
        </div>
      </section>

      {/* ── Payout Status (from mock) ── */}
      <section className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <Users className="w-5 h-5 text-green" />
          <h3 className="font-bold text-navy text-base">Recent Payout Settlements</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-navy uppercase font-semibold text-[11px]">
                <th className="p-3">ID</th>
                <th className="p-3">Farmer</th>
                <th className="p-3">Order</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Gateway</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-gray-700">
              {mockPayouts.map((p) => (
                <tr key={p.id} className="hover:bg-canvas/60 transition-colors">
                  <td className="p-3 font-mono font-bold text-navy">{p.id}</td>
                  <td className="p-3">{p.farmerId}</td>
                  <td className="p-3">{p.orderId}</td>
                  <td className="p-3 font-semibold">₹{p.amountInr.toLocaleString('en-IN')}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-canvas text-[10px] font-mono">{p.gatewayRef}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        p.status === 'Confirmed'
                          ? 'bg-green/15 text-greenDark'
                          : p.status === 'Failed'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {p.status === 'Confirmed' && <CheckCircle className="w-3 h-3" />}
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Footer ── */}
      <div className="text-center text-[10px] text-gray-400 pb-4">
        KisanRahi — DoCA Admin Dashboard &bull; Powered by Agmarknet / data.gov.in APIs &bull; View F
      </div>
    </div>
  );
};
