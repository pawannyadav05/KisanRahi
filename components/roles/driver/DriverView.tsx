'use client';

import React from 'react';
import { Truck, MapPin, CheckCircle, QrCode } from 'lucide-react';
import { mockRoute } from '@/lib/mock-data';

export const DriverView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>3PL Logistics Driver Trip-Sheet (View E)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Minhaj</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Nearest-hub pooled route stops, truckload capacity monitoring, and crate handoff QR validation.
        </p>
      </div>

      {/* Truck Info */}
      <div className="bg-navy text-white rounded-xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <Truck className="w-8 h-8 text-saffron" />
          <div>
            <h3 className="font-bold text-base">Vehicle: BR-01-GA-9021 (Eicher 14ft)</h3>
            <p className="text-xs text-gray-300">Route: Sasaram PACS → Dehri FPO → Patna Urban Mandi</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase text-gray-400 font-semibold block">Total Payload</span>
          <span className="text-xl font-black text-green">1,900 / 2,500 kg</span>
        </div>
      </div>

      {/* Route Stops */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm space-y-4">
        <h3 className="font-bold text-navy text-lg">Stop-by-Stop Route Sheet</h3>
        <div className="space-y-3">
          {mockRoute.map((stop, idx) => (
            <div key={stop.hubId} className="p-4 border border-border rounded-xl flex items-center justify-between bg-canvas/40">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-navy/10 text-navy font-bold flex items-center justify-center text-sm">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-bold text-navy text-sm">{stop.hubName}</h4>
                  <p className="text-xs text-gray-500">Pickup Cargo: {stop.pickupKg} kg • ETA: {stop.eta}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                  stop.status === 'Completed' ? 'bg-green/20 text-greenDark' : 'bg-saffron/20 text-saffronDark'
                }`}>
                  {stop.status}
                </span>
                <button className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded hover:bg-navyLight flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-saffron" />
                  Scan Crate QR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
