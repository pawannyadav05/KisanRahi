'use client';

import React from 'react';
import { ShoppingBag, Clock, ShieldCheck, CreditCard } from 'lucide-react';

export const RetailConsumerView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>Retail Consumer & RWA Society Hub (View D)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Abhay</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Direct village-harvest group buying for urban housing societies with instant Razorpay payment integration.
        </p>
      </div>

      {/* Delivery Banner */}
      <div className="bg-saffron/10 border border-saffron/30 rounded-xl p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-saffron" />
          <span className="text-xs sm:text-sm font-semibold text-navy">
            अगला वितरण: शनिवार सुबह 7:00 बजे — Cutoff in 14 hours
          </span>
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider bg-saffron text-white px-2 py-0.5 rounded">
          Batch Dispatch
        </span>
      </div>

      {/* Harvest Bundles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-green uppercase tracking-wide">Society Combo Pack</span>
            <h3 className="text-lg font-bold text-navy mt-1">10 kg Fresh Vegetable Basket</h3>
            <p className="text-xs text-gray-500 mt-1">Includes Grade A Tomatoes, Potatoes, Onions direct from Sasaram PACS.</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-xl font-black text-navy">₹240</span>
              <span className="text-xs text-gray-400 line-through">₹380 retail</span>
            </div>
          </div>

          <button className="mt-4 w-full py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navyLight flex items-center justify-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-saffron" />
            Order & Pay via UPI (Razorpay Sandbox)
          </button>
        </div>

        <div className="bg-white rounded-xl p-5 border border-border shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-saffron uppercase tracking-wide">Farm Fresh Pick</span>
            <h3 className="text-lg font-bold text-navy mt-1">5 kg Grade-A Tomato Pack</h3>
            <p className="text-xs text-gray-500 mt-1">AI-graded 92% uniformity, zero transit damage.</p>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-xl font-black text-navy">₹95</span>
              <span className="text-xs text-gray-400 line-through">₹160 retail</span>
            </div>
          </div>

          <button className="mt-4 w-full py-2 bg-navy text-white text-xs font-bold rounded-lg hover:bg-navyLight flex items-center justify-center gap-1">
            <ShoppingBag className="w-3.5 h-3.5 text-green" />
            Add to Society Group Order
          </button>
        </div>
      </div>
    </div>
  );
};
