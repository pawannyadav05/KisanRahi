'use client';

import React from 'react';
import { Mic, CheckCircle2, DollarSign } from 'lucide-react';
import { mockListings, mockPayouts } from '@/lib/mock-data';

export const FarmerView: React.FC = () => {
  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h2 className="text-xl font-bold text-navy flex items-center justify-between">
          <span>Farmer Voice Listing Dashboard (View A)</span>
          <span className="text-xs font-normal text-gray-500">Assigned Teammate: Pawan</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Record crop details by voice note via WhatsApp / Web Speech API to auto-assign to nearest hub.
        </p>

        {/* Voice Note Button */}
        <div className="mt-6 flex flex-col items-center justify-center p-8 bg-canvas border-2 border-dashed border-navy/20 rounded-xl">
          <button className="w-16 h-16 rounded-full bg-saffron text-white flex items-center justify-center shadow-lg hover:bg-saffronDark transition-all active:scale-95">
            <Mic className="w-8 h-8" />
          </button>
          <span className="mt-3 text-sm font-semibold text-navy">Tap to speak crop & quantity</span>
          <span className="text-xs text-gray-500">Example: &quot;200kg tomatoes from Sasaram village&quot;</span>
        </div>
      </div>

      {/* Crop Batches */}
      <div className="bg-white rounded-xl p-5 border border-border shadow-sm">
        <h3 className="text-lg font-bold text-navy mb-3">My Crop Batches</h3>
        <div className="space-y-3">
          {mockListings.map((listing) => (
            <div key={listing.id} className="p-3.5 border border-border rounded-lg flex items-center justify-between bg-canvas/50">
              <div>
                <span className="font-bold text-navy">{listing.crop} — {listing.qtyKg} kg</span>
                <p className="text-xs text-gray-500">{listing.location.villageName} • ID: {listing.id}</p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green/10 text-greenDark border border-green/30">
                {listing.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Assurance Card */}
      <div className="bg-green/10 border border-green/30 rounded-xl p-5 flex items-start space-x-4">
        <div className="p-3 bg-green text-white rounded-full">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-greenDark text-base">Payment Assurance Card</h4>
            <CheckCircle2 className="w-4 h-4 text-green" />
          </div>
          <p className="text-xs text-gray-700 mt-0.5">Direct UPI payout confirmed via Razorpay test sandbox.</p>
          <div className="mt-2 text-sm font-bold text-navy">
            Amount: ₹{mockPayouts[0]?.amountInr} • Ref: <code className="bg-white px-1.5 py-0.5 rounded border text-xs">{mockPayouts[0]?.gatewayRef}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
