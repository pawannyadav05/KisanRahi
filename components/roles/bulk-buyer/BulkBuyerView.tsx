'use client';

import React from 'react';
import { ShoppingCart, ShieldCheck } from 'lucide-react';
import { mockPooledLots, mockOrders } from '@/lib/mock-data';

export const BulkBuyerView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>Bulk Institutional Buyer Catalog (View C)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Piyush</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Direct wholesale crop lot catalog with APMC benchmark price parity comparison & escrow protection.
        </p>
      </div>

      {/* Lot Catalog & Price Parity Table */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-navy text-lg">Wholesale Pooled Lots</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-canvas border-b border-border text-navy uppercase font-semibold">
                <th className="p-2.5">Hub / Origin</th>
                <th className="p-2.5">Crop & Available Qty</th>
                <th className="p-2.5">APMC Mandi Price</th>
                <th className="p-2.5">KisanRahi Direct</th>
                <th className="p-2.5">Savings</th>
                <th className="p-2.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-gray-700">
              {mockPooledLots.map((lot) => (
                <tr key={lot.hubId} className="hover:bg-canvas/40">
                  <td className="p-2.5 font-medium text-navy">{lot.hubName}</td>
                  <td className="p-2.5">Tomato — {lot.totalKg} kg</td>
                  <td className="p-2.5 text-gray-500 line-through">₹24.0 / kg</td>
                  <td className="p-2.5 font-bold text-greenDark">₹16.2 / kg</td>
                  <td className="p-2.5 font-semibold text-saffron">32.5% OFF</td>
                  <td className="p-2.5">
                    <button className="px-3 py-1 bg-green text-white font-semibold rounded hover:bg-greenDark flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      Book Consignment
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escrow Status Banner */}
      <div className="bg-navy/5 border border-navy/20 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="w-6 h-6 text-saffron" />
          <div>
            <h4 className="font-bold text-navy text-sm">Escrow Contract Safeguard</h4>
            <p className="text-xs text-gray-600">Active Order: #{mockOrders[0]?.id} • Status: <span className="font-bold text-greenDark">{mockOrders[0]?.escrowStatus}</span></p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold bg-navy text-white px-2.5 py-1 rounded">
          B2B Trade Secured
        </span>
      </div>
    </div>
  );
};
