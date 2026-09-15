'use client';

import React from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { mockAdminMetrics } from '@/lib/mock-data';

export const DoCAAdminView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>Department of Consumer Affairs — DoCA National Dashboard (View F)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Avinish</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          National Agmarknet Mandi price parity alerts, transit loss monitoring, and escrow settlement oversight.
        </p>
      </div>

      {/* Admin KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 block">Farmer Price Realization</span>
          <span className="text-2xl font-black text-green">{mockAdminMetrics.farmerRealizationPct}%</span>
          <span className="text-[10px] text-gray-400 block mt-1">vs 45% traditional mandi</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 block">Consumer Price Reduction</span>
          <span className="text-2xl font-black text-saffron">{mockAdminMetrics.consumerPriceReductionPct}%</span>
          <span className="text-[10px] text-gray-400 block mt-1">Direct farm-sourcing cut</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 block">Post-Harvest Transit Loss</span>
          <span className="text-2xl font-black text-navy">{mockAdminMetrics.transitLossPct}%</span>
          <span className="text-[10px] text-gray-400 block mt-1">vs 25% national avg</span>
        </div>

        <div className="bg-white rounded-xl p-4 border border-border shadow-sm">
          <span className="text-xs font-semibold text-gray-500 block">Active Village Hubs</span>
          <span className="text-2xl font-black text-navyLight">{mockAdminMetrics.activeHubs}</span>
          <span className="text-[10px] text-gray-400 block mt-1">{mockAdminMetrics.activeRuns} live truck runs</span>
        </div>
      </div>

      {/* Price Parity Table */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm space-y-3">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-saffron" />
          <h3 className="font-bold text-navy text-base">Agmarknet Price Parity Monitoring Table</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-navy uppercase font-semibold">
                <th className="p-2.5">Crop</th>
                <th className="p-2.5">Farm Gate Cost</th>
                <th className="p-2.5">Govt Agmarknet Price</th>
                <th className="p-2.5">Retail Price Ratio</th>
                <th className="p-2.5">Alert Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-gray-700">
              <tr className="hover:bg-canvas/40">
                <td className="p-2.5 font-bold text-navy">Tomato (Desi)</td>
                <td className="p-2.5">₹14.0 / kg</td>
                <td className="p-2.5">₹16.5 / kg</td>
                <td className="p-2.5 font-semibold text-green">118% (Healthy)</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-green/20 text-greenDark font-semibold">Normal</span>
                </td>
              </tr>
              <tr className="hover:bg-canvas/40">
                <td className="p-2.5 font-bold text-navy">Onion (Red)</td>
                <td className="p-2.5">₹12.0 / kg</td>
                <td className="p-2.5">₹32.0 / kg</td>
                <td className="p-2.5 font-bold text-saffron">266% (High Spread)</td>
                <td className="p-2.5">
                  <span className="px-2 py-0.5 rounded bg-saffron/20 text-saffronDark font-bold">Parity Alert</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
