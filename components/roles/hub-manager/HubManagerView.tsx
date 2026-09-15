'use client';

import React from 'react';
import { Camera, Package, ShieldCheck } from 'lucide-react';
import { mockPooledLots, mockGrades } from '@/lib/mock-data';

export const HubManagerView: React.FC = () => {
  const lot = mockPooledLots[0];
  const grade = mockGrades[0];

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>FPO Hub Manager Dashboard (View B)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Vani</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Crate inwarding, AI produce inspection, and truckload dispatch gate pass.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AI Camera Viewfinder Panel */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-navy font-bold text-base">
            <Camera className="w-5 h-5 text-saffron" />
            <span>AI Produce Quality Inspection</span>
          </div>
          <div className="h-40 bg-gray-900 rounded-lg flex flex-col items-center justify-center text-gray-400 relative overflow-hidden">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Viewfinder Camera Active</span>
            <span className="text-2xl font-bold text-white mt-1">Grade {grade?.grade || 'A'}</span>
            <div className="absolute bottom-2 left-2 text-[10px] text-gray-300 font-mono">
              Uniformity: {grade?.uniformityPct}% | Defect: {grade?.damagePct}%
            </div>
          </div>
        </div>

        {/* Truckload Consolidation Meter */}
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm space-y-4">
          <div className="flex items-center space-x-2 text-navy font-bold text-base">
            <Package className="w-5 h-5 text-green" />
            <span>Truckload Consolidation Meter</span>
          </div>
          <div>
            <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
              <span>{lot?.hubName}</span>
              <span>{lot?.totalKg} / {lot?.capacityKg} kg</span>
            </div>
            <div className="w-full bg-gray-200 h-4 rounded-full overflow-hidden">
              <div
                className="bg-green h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (lot?.totalKg / lot?.capacityKg) * 100)}%` }}
              />
            </div>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-xs text-gray-500">Status: <strong className="text-navy">{lot?.status}</strong></span>
              <button className="px-3 py-1.5 bg-navy text-white text-xs font-semibold rounded hover:bg-navyLight flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-saffron" />
                Generate Gate Pass
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
