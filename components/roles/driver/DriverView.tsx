'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Truck,
  MapPin,
  QrCode,
  CheckCircle2,
  Clock,
  Navigation,
  Package,
  Weight,
  Route,
  Shield,
  ChevronRight,
  AlertTriangle,
  Gauge,
} from 'lucide-react';
import { mockRoute, mockListings } from '@/lib/mock-data';
import { assignListingsToHubs } from '@/services/routing/hub-assignment';
import type { RouteStop } from '@/types/kisanrahi';

/* ── Driver / Vehicle mock identity ───────────────────────────────────── */
const TRUCK_REG = 'BR-01-GA-9021';
const TRUCK_TYPE = 'Eicher 14ft Reefer';
const DRIVER_NAME = 'Minhaj Ansari';
const ROUTE_LABEL = 'Sasaram PACS → Dehri FPO → Patna Urban Mandi';
const MAX_PAYLOAD_KG = 2500;

/* ── Status styling map ───────────────────────────────────────────────── */
const STATUS_CONFIG: Record<
  RouteStop['status'],
  {
    bgClass: string;
    textClass: string;
    borderClass: string;
    icon: React.FC<{ className?: string }>;
    pulseClass: string;
  }
> = {
  Completed: {
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: CheckCircle2,
    pulseClass: '',
  },
  Pending: {
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    icon: Clock,
    pulseClass: '',
  },
  EnRoute: {
    bgClass: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    icon: Navigation,
    pulseClass: 'animate-pulse',
  },
};

/* ── Helper: next status in the cycle ─────────────────────────────────── */
function nextStatus(current: RouteStop['status']): RouteStop['status'] {
  if (current === 'Pending') return 'EnRoute';
  if (current === 'EnRoute') return 'Completed';
  return 'Completed'; // Already completed — noop
}

/* ═════════════════════════════════════════════════════════════════════════
   DriverView — View E — 3PL Driver Trip-Sheet
   ═════════════════════════════════════════════════════════════════════════ */

export const DriverView: React.FC = () => {
  /* ── Local state for mutable stops ────────────────────────────────── */
  const [stops, setStops] = useState<RouteStop[]>(mockRoute);
  const [scanningIdx, setScanningIdx] = useState<number | null>(null);

  /* ── Derived metrics ──────────────────────────────────────────────── */
  const totalPickupKg = useMemo(
    () => stops.reduce((sum, s) => sum + s.pickupKg, 0),
    [stops],
  );
  const completedStops = useMemo(
    () => stops.filter((s) => s.status === 'Completed').length,
    [stops],
  );
  const loadPct = Math.round((totalPickupKg / MAX_PAYLOAD_KG) * 100);

  /* ── Pooled lots from hub-assignment service ──────────────────────── */
  const pooledLots = useMemo(() => assignListingsToHubs(mockListings), []);

  /* ── Scan & handoff handler ───────────────────────────────────────── */
  const handleScanConfirm = useCallback(
    (idx: number) => {
      setScanningIdx(idx);

      // Simulate a brief scan animation delay (800ms)
      setTimeout(() => {
        setStops((prev) =>
          prev.map((stop, i) =>
            i === idx ? { ...stop, status: nextStatus(stop.status) } : stop,
          ),
        );
        setScanningIdx(null);
      }, 800);
    },
    [],
  );

  /* ── Render ────────────────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">

      {/* ─── Section Header ────────────────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Route className="w-5 h-5 text-saffron" />
            3PL Logistics Driver Trip-Sheet (View E)
          </span>
          <span className="text-xs font-normal text-gray-500">
            Driver: {DRIVER_NAME}
          </span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Nearest-hub pooled route stops, truckload capacity monitoring, and
          crate handoff QR validation.
        </p>
      </div>

      {/* ─── Truck Registration & Payload Card ─────────────────────── */}
      <div className="bg-navy text-white rounded-xl overflow-hidden shadow-lg">
        {/* Top bar with saffron accent */}
        <div className="h-1 bg-gradient-to-r from-saffron via-saffron to-green" />

        <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          {/* Vehicle identity */}
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-saffron/30 to-saffron/10 border border-saffron/30 flex items-center justify-center">
              <Truck className="w-7 h-7 text-saffron" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">
                {TRUCK_REG}
              </h3>
              <p className="text-xs text-gray-300 flex items-center gap-1.5">
                <Shield className="w-3 h-3 text-green" />
                {TRUCK_TYPE} • FSSAI Cold-Chain Certified
              </p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {ROUTE_LABEL}
              </p>
            </div>
          </div>

          {/* Payload gauge */}
          <div className="flex flex-col items-end gap-1 min-w-[160px]">
            <span className="text-[11px] uppercase text-gray-400 font-semibold tracking-wide">
              Total Assigned Load
            </span>
            <div className="flex items-baseline gap-1.5">
              <Weight className="w-4 h-4 text-green" />
              <span className="text-2xl font-black text-green">
                {totalPickupKg.toLocaleString()}
              </span>
              <span className="text-sm text-gray-400 font-medium">
                / {MAX_PAYLOAD_KG.toLocaleString()} kg
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-navy/60 rounded-full mt-1 overflow-hidden border border-navyLight/40">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  loadPct > 90
                    ? 'bg-gradient-to-r from-amber-400 to-red-400'
                    : 'bg-gradient-to-r from-green to-emerald-400'
                }`}
                style={{ width: `${Math.min(loadPct, 100)}%` }}
              />
            </div>
            <div className="flex items-center justify-between w-full text-[10px] text-gray-500 font-medium">
              <span>{loadPct}% capacity</span>
              <span className="flex items-center gap-0.5">
                <Gauge className="w-3 h-3" />
                {completedStops}/{stops.length} stops done
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Stop-by-Stop Route Sheet ──────────────────────────────── */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h3 className="font-bold text-navy text-lg mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-saffron" />
          Stop-by-Stop Route Sheet
        </h3>

        <div className="space-y-3">
          {stops.map((stop, idx) => {
            const cfg = STATUS_CONFIG[stop.status];
            const StatusIcon = cfg.icon;
            const isScanning = scanningIdx === idx;
            const isCompleted = stop.status === 'Completed';

            return (
              <div
                key={`${stop.hubId}-${idx}`}
                className={`
                  relative p-4 rounded-xl border transition-all duration-300
                  ${cfg.borderClass} ${cfg.bgClass}
                  ${isScanning ? 'ring-2 ring-saffron/50 scale-[1.01]' : ''}
                  ${isCompleted ? 'opacity-75' : ''}
                `}
              >
                {/* Connector line between stops */}
                {idx < stops.length - 1 && (
                  <div className="absolute left-[1.95rem] top-[3.5rem] bottom-[-1rem] w-0.5 bg-border z-0" />
                )}

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
                  {/* Left: stop number + hub info */}
                  <div className="flex items-center space-x-3">
                    <div
                      className={`
                        w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm
                        shadow-sm border-2
                        ${isCompleted
                          ? 'bg-green text-white border-green'
                          : stop.status === 'EnRoute'
                            ? 'bg-blue-500 text-white border-blue-400 animate-pulse'
                            : 'bg-white text-navy border-navy/20'
                        }
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-navy text-sm flex items-center gap-1.5">
                        {stop.hubName}
                        {stop.status === 'EnRoute' && (
                          <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-semibold">
                            IN TRANSIT
                          </span>
                        )}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          Pickup: <strong className="text-navy">{stop.pickupKg} kg</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          ETA: <strong className="text-navy">{stop.eta}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: status badge + scan button */}
                  <div className="flex items-center space-x-2 sm:space-x-3 ml-[3.25rem] sm:ml-0">
                    {/* Status badge */}
                    <span
                      className={`
                        inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full
                        ${cfg.bgClass} ${cfg.textClass} border ${cfg.borderClass} ${cfg.pulseClass}
                      `}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      {stop.status}
                    </span>

                    {/* Scan Crate QR & Confirm Handoff */}
                    <button
                      onClick={() => handleScanConfirm(idx)}
                      disabled={isCompleted || isScanning}
                      className={`
                        px-3.5 py-2 text-xs font-semibold rounded-lg
                        flex items-center gap-1.5 transition-all duration-200
                        ${isCompleted
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                          : isScanning
                            ? 'bg-saffron text-white cursor-wait animate-pulse border border-saffron'
                            : 'bg-navy text-white hover:bg-navyLight hover:shadow-md active:scale-95 border border-navy'
                        }
                      `}
                    >
                      <QrCode
                        className={`w-4 h-4 ${
                          isCompleted ? 'text-gray-400' : 'text-saffron'
                        } ${isScanning ? 'text-white animate-spin' : ''}`}
                      />
                      {isScanning
                        ? 'Scanning…'
                        : isCompleted
                          ? 'Handoff Done'
                          : 'Scan Crate QR Code & Confirm Handoff'}
                      {!isCompleted && !isScanning && (
                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── Auto-Assigned Pooled Lots (from hub-assignment service) ── */}
      {pooledLots.length > 0 && (
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold text-navy text-lg mb-1 flex items-center gap-2">
            <Package className="w-5 h-5 text-green" />
            Hub-Assigned Pooled Lots
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Listings auto-assigned to nearest hub via haversine routing.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {pooledLots.map((lot) => {
              const fillPct = Math.round(
                (lot.totalKg / lot.capacityKg) * 100,
              );
              return (
                <div
                  key={lot.hubId}
                  className="p-4 rounded-xl border border-border bg-canvas/50 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-navy text-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-saffron" />
                      {lot.hubName}
                    </h4>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        lot.status === 'Ready'
                          ? 'bg-green/15 text-greenDark border border-green/30'
                          : lot.status === 'Dispatched'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {lot.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Weight className="w-3 h-3" />
                    <strong className="text-navy">{lot.totalKg} kg</strong>
                    <span className="text-gray-400">
                      / {lot.capacityKg} kg capacity
                    </span>
                  </div>

                  {/* Fill bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        fillPct >= 80
                          ? 'bg-gradient-to-r from-green to-emerald-400'
                          : 'bg-gradient-to-r from-saffron/70 to-saffron'
                      }`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-gray-500">
                    {lot.listings.length} listing
                    {lot.listings.length !== 1 ? 's' : ''} pooled •{' '}
                    {fillPct}% full
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Safety notice ─────────────────────────────────────────── */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start space-x-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-amber-800 text-sm">
            Cold-Chain Compliance Reminder
          </h4>
          <p className="text-xs text-amber-700 mt-0.5">
            Ensure reefer unit is below 4°C before loading perishables. Log
            temperature at every stop using the crate QR scanner. Non-compliance
            will auto-flag in DoCA Admin (View F).
          </p>
        </div>
      </div>
    </div>
  );
};
