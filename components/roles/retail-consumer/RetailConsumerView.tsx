'use client';

import React, { useState, useEffect, useRef } from 'react';

export const RetailConsumerView = () => {
  // ── Tab State ──
  const [activeTab, setActiveTab] = useState<'Order' | 'Grade' | 'Payment' | 'History'>('Order');

  // ── Countdown Timer to next Saturday 7:00 AM ──
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getNextSaturday7AM() {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay(); // 0: Sun, 6: Sat
      let diff = (6 - day + 7) % 7;
      
      if (diff === 0) {
        const sat7AM = new Date(now);
        sat7AM.setHours(7, 0, 0, 0);
        if (now.getTime() >= sat7AM.getTime()) {
          diff = 7;
        }
      }
      
      target.setDate(now.getDate() + diff);
      target.setHours(7, 0, 0, 0);
      return target;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const target = getNextSaturday7AM();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ── Harvest Packs State ──
  const harvestPacks = [
    {
      id: 'essential',
      title: 'Essential Veggie Pack',
      price: 249,
      marketPrice: 329,
      grade: 'Grade A',
      saves: 80,
      savePct: '24%',
      badge: 'Popular Family Choice',
      origin: 'Sasaram PACS Hub • Harvested 6 hrs ago',
      description: 'Daily kitchen essentials direct from village harvest without mandi markup.',
      items: [
        { name: 'Tomato', qty: '1 kg', icon: '🍅' },
        { name: 'Potato', qty: '2 kg', icon: '🥔' },
        { name: 'Onion', qty: '1 kg', icon: '🧅' },
        { name: 'Spinach', qty: '0.5 kg', icon: '🥬' },
      ],
    },
    {
      id: 'premium',
      title: 'Premium Seasonal Pack',
      price: 449,
      marketPrice: 599,
      grade: 'Grade A+',
      saves: 150,
      savePct: '25%',
      badge: 'Chef & Health Choice',
      origin: 'Bhojpur Organic Cluster • Fresh Batch',
      description: 'Exotic vegetables and seasonal immunity greens sorted by vision grading.',
      items: [
        { name: 'Broccoli', qty: '500g', icon: '🥦' },
        { name: 'Cherry Tomato', qty: '250g', icon: '🍅' },
        { name: 'Baby Carrot', qty: '500g', icon: '🥕' },
        { name: 'French Beans', qty: '500g', icon: '🫘' },
      ],
    },
    {
      id: 'budget',
      title: 'Budget Saver Pack',
      price: 149,
      marketPrice: 209,
      grade: 'Grade B',
      saves: 60,
      savePct: '28%',
      badge: 'Maximum Savings',
      origin: 'Mohania Farmer Collective',
      description: 'Nutritious everyday produce at wholesale society-pooling rates.',
      items: [
        { name: 'Mix Veggies', qty: '3 kg', icon: '🥗' },
        { name: 'Seasonal Greens', qty: '500g', icon: '🥬' },
      ],
    },
  ];

  const [selectedPackId, setSelectedPackId] = useState('essential');
  const [packWeeks, setPackWeeks] = useState<Record<string, number>>({
    essential: 1,
    premium: 1,
    budget: 1,
  });
  const [expandedPacks, setExpandedPacks] = useState<Record<string, boolean>>({
    essential: true,
    premium: false,
    budget: false,
  });

  const toggleExpand = (id: string) => {
    setExpandedPacks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateWeeks = (id: string, delta: number) => {
    setPackWeeks((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const selectedPack = harvestPacks.find((p) => p.id === selectedPackId) || harvestPacks[0];
  const selectedTotalAmount = selectedPack.price * (packWeeks[selectedPack.id] || 1);

  // Price breakdown for transparency (85% farmer realization)
  const farmerShare = Math.round(selectedTotalAmount * 0.85);
  const logisticsShare = Math.round(selectedTotalAmount * 0.11);
  const platformShare = selectedTotalAmount - farmerShare - logisticsShare;

  // ── AI Crop Grading State ──
  const [isGrading, setIsGrading] = useState(false);
  const [gradeProgress, setGradeProgress] = useState(0);
  const [gradingResult, setGradingResult] = useState<{
    uniformityPct: number;
    damagePct: number;
    freshnessPct: number;
    grade: string;
    evaluatedAt: string;
    sampleName: string;
  } | null>(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const runGradingSimulation = (sampleTitle: string) => {
    setSelectedImageName(sampleTitle);
    setIsGrading(true);
    setGradeProgress(0);
    setGradingResult(null);

    const startTime = Date.now();
    const duration = 2000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setGradeProgress(progress);

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsGrading(false);

        const uniformityPct = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // 65-95
        const damagePct = Math.floor(Math.random() * (15 - 2 + 1)) + 2; // 2-15
        const freshnessPct = Math.floor(Math.random() * (95 - 75 + 1)) + 75; // 75-95

        let grade = 'C';
        if (uniformityPct > 80 && damagePct < 5) {
          grade = 'A';
        } else if (uniformityPct >= 60 && damagePct <= 15) {
          grade = 'B';
        }

        setGradingResult({
          uniformityPct,
          damagePct,
          freshnessPct,
          grade,
          evaluatedAt: new Date().toLocaleTimeString(),
          sampleName: sampleTitle,
        });
      }
    }, 50);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    runGradingSimulation(file.name);
  };

  // ── Payment Simulation State ──
  const [payAmount, setPayAmount] = useState(selectedTotalAmount.toString());
  const [farmerUpi, setFarmerUpi] = useState('ramesh.farmer@upi');
  const [farmerName, setFarmerName] = useState('Ramesh Kumar');
  const [selectedUpiApp, setSelectedUpiApp] = useState('GPay');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [currentPayout, setCurrentPayout] = useState<{
    gatewayRef: string;
    status: string;
    amount: number;
    farmerUpi: string;
    farmerName: string;
    orderId: string;
    timestamp: string;
    upiApp: string;
  } | null>(null);
  const [payoutHistory, setPayoutHistory] = useState<Array<{
    gatewayRef: string;
    status: string;
    amount: number;
    farmerUpi: string;
    farmerName: string;
    orderId: string;
    timestamp: string;
  }>>([
    {
      gatewayRef: 'pay_test_88f9x2K1mP01qR',
      status: 'Confirmed',
      amount: 249,
      farmerUpi: 'ramesh.farmer@upi',
      farmerName: 'Ramesh Kumar',
      orderId: 'ORD-984210',
      timestamp: 'Yesterday, 04:30 PM',
    },
  ]);

  // Keep payment amount in sync when selected pack or quantity changes
  useEffect(() => {
    setPayAmount(selectedTotalAmount.toString());
  }, [selectedPackId, packWeeks, selectedTotalAmount]);

  const generateRandomRef = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 14; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return 'pay_test_' + result;
  };

  const handleSimulatePayout = () => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    setPaymentProgress(0);
    setCurrentPayout(null);

    const startTime = Date.now();
    const duration = 2000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, Math.floor((elapsed / duration) * 100));
      setPaymentProgress(progress);

      if (elapsed >= duration) {
        clearInterval(timer);
        setIsProcessingPayment(false);

        const isConfirmed = Math.random() < 0.85;
        const newRecord = {
          gatewayRef: generateRandomRef(),
          status: isConfirmed ? 'Confirmed' : 'Failed',
          amount: parseFloat(payAmount) || selectedTotalAmount,
          farmerUpi: farmerUpi || 'ramesh.farmer@upi',
          farmerName: farmerName || 'Ramesh Kumar',
          orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          upiApp: selectedUpiApp,
        };

        setCurrentPayout(newRecord);
        setPayoutHistory((prev) => [newRecord, ...prev]);
      }
    }, 50);
  };

  // ── Mock Society Activity Feed ──
  const societyActivity = [
    { apt: 'Apt 402', action: 'subscribed to Essential Pack', time: '5m ago', icon: '🍅' },
    { apt: 'Apt 108', action: 'ordered Premium Seasonal Pack', time: '14m ago', icon: '🥦' },
    { apt: 'Apt 304', action: 'confirmed delivery slot Gate 1', time: '32m ago', icon: '✅' },
    { apt: 'Apt 205', action: 'completed UPI escrow payout', time: '1h ago', icon: '💳' },
  ];

  return (
    <div className="min-h-screen bg-[#e2e8f0] flex justify-center items-start sm:py-6 font-sans antialiased text-[#0b2545]">
      {/* ── Centered Mobile Device Frame (max-w 420px) ── */}
      <div className="w-full max-w-[420px] min-h-screen bg-[#f1f5f9] flex flex-col shadow-2xl sm:rounded-3xl overflow-hidden border-x sm:border border-slate-200/90 relative">
        
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-2xl select-none" role="img" aria-label="wheat">🌾</span>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-[#0b2545]">KisanRahi</span>
                <span className="text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#138808] border border-emerald-200">
                  RWA Hub
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">View D • Retail Consumer</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="text-right">
              <span className="block text-[11px] font-bold text-[#0b2545]">Green Valley</span>
              <span className="block text-[9px] text-slate-400">Block C • Gate 1</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0b2545] text-[#ffffff] font-bold text-xs flex items-center justify-center border-2 border-[#f97316] shadow-sm select-none">
              SR
            </div>
          </div>
        </header>

        {/* 1. DELIVERY BANNER */}
        <div className="bg-gradient-to-r from-[#138808] to-[#0e6806] text-white p-4 shadow-sm relative overflow-hidden">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 text-white px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                <span>Next Society Drop</span>
              </span>
              <span className="text-[11px] text-emerald-100 font-medium">
                Cutoff: Friday 10 PM
              </span>
            </div>
            
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight pt-1">
              अगला वितरण: शनिवार सुबह 7:00 बजे
            </h2>
            
            <p className="text-[11px] text-emerald-100/90 font-medium">
              📍 Green Valley RWA — Block C Collection Point
            </p>

            {/* Live Countdown Box */}
            <div className="mt-2.5 bg-[#0b2545]/60 rounded-xl p-2.5 backdrop-blur-md border border-white/15 flex items-center justify-around text-center shadow-inner">
              <div>
                <span className="block text-base font-black text-white tracking-wider">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase font-bold text-emerald-200 tracking-wider">Days</span>
              </div>
              <span className="text-base font-bold text-white/40 pb-1">:</span>
              <div>
                <span className="block text-base font-black text-white tracking-wider">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase font-bold text-emerald-200 tracking-wider">Hours</span>
              </div>
              <span className="text-base font-bold text-white/40 pb-1">:</span>
              <div>
                <span className="block text-base font-black text-white tracking-wider">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase font-bold text-emerald-200 tracking-wider">Mins</span>
              </div>
              <span className="text-base font-bold text-white/40 pb-1">:</span>
              <div>
                <span className="block text-base font-black text-amber-300 tracking-wider">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[8px] uppercase font-bold text-emerald-200 tracking-wider">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION (Sticky below Navbar) */}
        <div className="sticky top-[57px] z-30 bg-[#ffffff] border-b border-slate-200 grid grid-cols-4 text-xs font-bold shadow-xs">
          {(['Order', 'Grade', 'Payment', 'History'] as const).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-center transition-colors relative flex items-center justify-center space-x-1 cursor-pointer ${
                  isActive
                    ? 'text-[#138808] bg-emerald-50/50 font-black'
                    : 'text-slate-600 hover:text-[#0b2545]'
                }`}
              >
                <span>
                  {tab === 'Order' && '🛒'}
                  {tab === 'Grade' && '🔬'}
                  {tab === 'Payment' && '💳'}
                  {tab === 'History' && '📜'}
                </span>
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#138808]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ── MAIN SCROLLABLE BODY ── */}
        <main className="p-3.5 flex-1 flex flex-col space-y-4">
          
          {/* TAB 1: ORDER */}
          {activeTab === 'Order' && (
            <>
              {/* Collection Point Info Card */}
              <div className="bg-[#ffffff] rounded-2xl p-3.5 border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-sm">📍</span>
                    <span className="font-extrabold text-xs text-[#0b2545]">Hub Delivery Point</span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-[#138808] border border-emerald-200 px-2 py-0.5 rounded-full">
                    47 families registered
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Name:</span>
                    <span className="font-bold text-[#0b2545]">Green Valley RWA Gate 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-medium text-[#0b2545]">Near Security Cabin, Sector 18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time Window:</span>
                    <span className="font-bold text-[#138808]">Saturday 7:00 AM to 10:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-[11px]">
                    <span className="text-slate-500">Coordinator:</span>
                    <span className="font-bold text-[#0b2545]">
                      Ramesh Ji (<a href="tel:+919876543210" className="text-[#f97316] underline">+91 98765 43210</a>)
                    </span>
                  </div>
                </div>
              </div>

              {/* Society Live Activity Ticker */}
              <div className="bg-emerald-50/60 rounded-xl p-2.5 border border-emerald-200/70 flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1.5 truncate">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-slate-600 font-medium truncate">
                    <strong className="text-[#0b2545]">Apt 402</strong> booked Essential Pack (5m ago)
                  </span>
                </div>
                <span className="text-[#138808] font-bold text-[10px] flex-shrink-0 pl-1">
                  182/200 kg (91%)
                </span>
              </div>

              {/* Weekly Harvest Packs List */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="font-black text-xs uppercase tracking-wide text-[#0b2545]">
                  Weekly Harvest Packs
                </h3>
                <span className="text-[10px] text-slate-400 font-medium">Direct Farm Pooling</span>
              </div>

              <div className="space-y-3">
                {harvestPacks.map((pack) => {
                  const isSelected = selectedPackId === pack.id;
                  const isExpanded = !!expandedPacks[pack.id];
                  const weeks = packWeeks[pack.id] || 1;
                  const total = pack.price * weeks;

                  return (
                    <div
                      key={pack.id}
                      className={`bg-[#ffffff] rounded-2xl p-3.5 transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-[#138808] shadow-md ring-2 ring-[#138808]/15'
                          : 'border-slate-200/80 shadow-xs'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-1 mb-1">
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                pack.grade.includes('A+')
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : pack.grade.includes('A')
                                  ? 'bg-emerald-100 text-[#138808] border border-emerald-300'
                                  : 'bg-blue-100 text-blue-900 border border-blue-300'
                              }`}
                            >
                              {pack.grade} Certified
                            </span>
                            <span className="text-[9px] font-bold text-[#138808] bg-emerald-50 px-1.5 py-0.5 rounded">
                              Saves ₹{pack.saves}
                            </span>
                          </div>
                          <h4 className="font-bold text-sm text-[#0b2545]">{pack.title}</h4>
                          <p className="text-[10px] text-emerald-800 font-medium mt-0.5">
                            🌱 {pack.origin}
                          </p>
                        </div>

                        <div className="text-right pl-2">
                          <div className="text-base font-black text-[#0b2545]">
                            ₹{pack.price}
                            <span className="text-[10px] font-medium text-slate-400">/wk</span>
                          </div>
                          <div className="text-[10px] text-slate-400 line-through">
                            ₹{pack.marketPrice} retail
                          </div>
                        </div>
                      </div>

                      {/* Veggie Produce Tags (Blinkit style visual chips) */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                        {pack.items.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center space-x-1 text-[11px] font-semibold bg-slate-50 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200/60"
                          >
                            <span>{item.icon}</span>
                            <span>{item.name}</span>
                            <span className="text-[9px] text-slate-400 font-normal">({item.qty})</span>
                          </span>
                        ))}
                      </div>

                      {/* Expandable item list */}
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => toggleExpand(pack.id)}
                          className="text-[11px] font-semibold text-[#f97316] flex items-center space-x-1 hover:underline cursor-pointer"
                        >
                          <span>{isExpanded ? 'Hide Produce Breakdown ▲' : 'View Pack Breakdown ▼'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                            <p className="text-[11px] text-slate-500">{pack.description}</p>
                            <p className="text-[10px] text-slate-400 leading-tight">
                              Sorted at village hub via KisanRahi Vision AI. Delivered in breathable eco-crates.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stepper & Select Button */}
                      <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs text-slate-500 font-medium">Weeks:</span>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateWeeks(pack.id, -1)}
                              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-[#0b2545]">
                              {weeks}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateWeeks(pack.id, 1)}
                              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <span className="text-[9px] text-slate-400 block">Total</span>
                            <span className="text-xs font-black text-[#0b2545]">₹{total}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedPackId(pack.id)}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#138808] text-white shadow-xs'
                                : 'bg-slate-100 text-[#0b2545] hover:bg-slate-200'
                            }`}
                          >
                            {isSelected ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sticky bottom floating checkout trigger */}
              <div className="pt-2 sticky bottom-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('Payment')}
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer"
                >
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Proceed to Payment
                  </span>
                  <span className="text-sm font-black bg-white/20 px-2 py-0.5 rounded-lg">
                    ₹{selectedTotalAmount} &rarr;
                  </span>
                </button>
              </div>
            </>
          )}

          {/* TAB 2: AI CROP GRADING PANEL */}
          {activeTab === 'Grade' && (
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">🔬</span>
                    <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                      AI Crop Grading Scanner
                    </h3>
                  </div>
                  <span className="text-[9px] uppercase font-bold bg-emerald-50 text-[#138808] px-2 py-0.5 rounded-full border border-emerald-200">
                    DoCA Standard
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Computer vision checks produce uniformity, damage & freshness metrics
                </p>
              </div>

              {/* 1-Click Samples */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-600 block">
                  ⚡ 1-Click Demo Lots:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => runGradingSimulation('Tomato_GradeA_Sasaram_Lot14.jpg')}
                    className="px-2 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer text-left truncate"
                  >
                    🍅 Tomato (Lot 14)
                  </button>
                  <button
                    type="button"
                    onClick={() => runGradingSimulation('Potato_GradeB_Dehri_Lot09.jpg')}
                    className="px-2 py-1.5 rounded-xl bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200 hover:bg-amber-100 transition cursor-pointer text-left truncate"
                  >
                    🥔 Potato (Lot 09)
                  </button>
                </div>
              </div>

              {/* Upload Input Area with Laser Radar effect */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#138808] rounded-2xl p-5 bg-slate-50/70 transition-colors relative overflow-hidden">
                {isGrading && (
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#138808] to-transparent shadow-lg shadow-emerald-500 animate-pulse" />
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-[#138808] flex items-center justify-center text-lg mb-2">
                  📸
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGrading}
                  className="bg-[#0b2545] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {isGrading ? 'Scanning Produce...' : 'Upload Crop Image'}
                </button>
                <p className="text-[10px] text-slate-400 mt-1.5 text-center">
                  Supports JPEG, PNG produce samples from farm harvest
                </p>
                {selectedImageName && (
                  <p className="text-xs font-semibold text-[#138808] mt-2 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 truncate max-w-[280px]">
                    📄 {selectedImageName}
                  </p>
                )}
              </div>

              {/* 2-Second Loading Animation */}
              {isGrading && (
                <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center text-xs font-bold text-[#138808]">
                    <span>Neural Analysis in progress...</span>
                    <span>{gradeProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#138808] h-full rounded-full transition-all duration-75"
                      style={{ width: `${gradeProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-center font-medium">
                    Surface defect mapping & spectral freshness scan
                  </div>
                </div>
              )}

              {/* Simulated Results Card */}
              {gradingResult && !isGrading && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400">
                        AI Quality Certification
                      </span>
                      <h4 className="font-bold text-xs text-[#0b2545]">Grading Evaluation Result</h4>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs ${
                        gradingResult.grade === 'A'
                          ? 'bg-[#138808] text-white'
                          : gradingResult.grade === 'B'
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <span>Grade {gradingResult.grade}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500">
                    {gradingResult.grade === 'A' && 'Premium export & direct retail quality (Uniformity > 80% & Damage < 5%).'}
                    {gradingResult.grade === 'B' && 'Standard retail acceptable produce (Uniformity ≥ 60% & Damage ≤ 15%).'}
                    {gradingResult.grade === 'C' && 'Substandard batch; designated for processing/pulping.'}
                  </p>

                  <div className="space-y-2 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Produce Uniformity</span>
                        <span className="text-[#0b2545] font-bold">{gradingResult.uniformityPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            gradingResult.uniformityPct > 80 ? 'bg-[#138808]' : 'bg-amber-500'
                          }`}
                          style={{ width: `${gradingResult.uniformityPct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Damage & Blemish</span>
                        <span className={`font-bold ${gradingResult.damagePct < 5 ? 'text-[#138808]' : 'text-rose-600'}`}>
                          {gradingResult.damagePct}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            gradingResult.damagePct < 5 ? 'bg-[#138808]' : 'bg-rose-500'
                          }`}
                          style={{ width: `${gradingResult.damagePct}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">Spectral Freshness</span>
                        <span className="text-[#138808] font-bold">{gradingResult.freshnessPct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#138808] h-full rounded-full"
                          style={{ width: `${gradingResult.freshnessPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-right text-[9px] text-slate-400">
                    Evaluated at {gradingResult.evaluatedAt}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENT SIMULATION */}
          {activeTab === 'Payment' && (
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💳</span>
                  <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                    UPI Payout Simulation
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct escrow settlement from RWA buyer pool to verified Farmer UPI
                </p>
              </div>

              {/* Selected Pack Reminder */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold text-slate-400 uppercase">Selected Order</div>
                  <div className="text-xs font-bold text-[#0b2545]">{selectedPack.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {packWeeks[selectedPack.id] || 1} week(s) delivery subscription
                  </div>
                </div>
                <span className="text-sm font-black text-[#138808]">
                  ₹{selectedTotalAmount}
                </span>
              </div>

              {/* Transparent Money Distribution */}
              <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/70 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                  <span>🌱 Transparent Money Distribution</span>
                  <span className="text-[9px] bg-[#138808] text-white px-2 py-0.5 rounded-full">
                    85% Farmer Share
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Farmer Direct Share (85%):</span>
                  <span className="font-bold text-[#138808]">₹{farmerShare}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hub Logistics & Crates (11%):</span>
                  <span>₹{logisticsShare}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>NPCI & Escrow Fee (4%):</span>
                  <span>₹{platformShare}</span>
                </div>
              </div>

              {/* UPI App Pills */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-700 block">Select Payment App:</span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['GPay', 'PhonePe', 'Paytm', 'BHIM'] as const).map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setSelectedUpiApp(app)}
                      className={`py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        selectedUpiApp === app
                          ? 'border-[#f97316] bg-orange-50 text-[#f97316]'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-[#0b2545] focus:outline-none focus:border-[#138808]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farmer UPI ID</label>
                  <input
                    type="text"
                    value={farmerUpi}
                    onChange={(e) => setFarmerUpi(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farmer Name</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                  />
                </div>
              </div>

              {/* Simulate UPI Payout Button */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleSimulatePayout}
                className="w-full bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
              >
                {isProcessingPayment ? (
                  <span>Processing Gateway Transfer...</span>
                ) : (
                  <span>Simulate UPI Payout with {selectedUpiApp}</span>
                )}
              </button>

              {/* 2-second processing animation */}
              {isProcessingPayment && (
                <div className="space-y-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <div className="flex justify-between items-center text-xs font-bold text-[#f97316]">
                    <span>Connecting NPCI / Razorpay Sandbox...</span>
                    <span>{paymentProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#f97316] h-full rounded-full transition-all duration-75"
                      style={{ width: `${paymentProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-center">
                    Verifying VPA handles & releasing escrow locks
                  </div>
                </div>
              )}

              {/* Latest Payout Record Card */}
              {currentPayout && !isProcessingPayment && (
                <div
                  className={`p-4 rounded-xl border-2 transition-all ${
                    currentPayout.status === 'Confirmed'
                      ? 'bg-emerald-50/50 border-[#138808]'
                      : 'bg-rose-50/50 border-rose-500'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                    <span className="text-[10px] font-bold uppercase text-slate-500">
                      Transaction Slip ({currentPayout.upiApp})
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        currentPayout.status === 'Confirmed'
                          ? 'bg-[#138808] text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      {currentPayout.status === 'Confirmed' ? '✓ Confirmed' : '✕ Failed'}
                    </span>
                  </div>

                  <div className="mt-2.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Gateway Ref:</span>
                      <span className="font-mono font-bold text-[#0b2545] text-[11px]">
                        {currentPayout.gatewayRef}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Order ID:</span>
                      <span className="font-bold text-[#0b2545]">{currentPayout.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Beneficiary:</span>
                      <span className="font-semibold text-[#0b2545]">
                        {currentPayout.farmerName} ({currentPayout.farmerUpi})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Amount Paid:</span>
                      <span className="font-black text-[#138808]">₹{currentPayout.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Timestamp:</span>
                      <span className="text-slate-700">{currentPayout.timestamp}</span>
                    </div>
                  </div>

                  {currentPayout.status === 'Confirmed' ? (
                    <div className="mt-3 text-[11px] text-[#138808] font-bold bg-white/70 p-2 rounded-lg text-center">
                      Funds instant-settled to farmer account via automated pooling escrow.
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] text-rose-700 font-bold bg-white/70 p-2 rounded-lg text-center">
                      Escrow reverted: Bank switch timed out. Please retry transaction.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRANSACTION & PAYOUT HISTORY */}
          {activeTab === 'History' && (
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                    Payout Audit Trail
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transparent record of all consumer society payouts to farmers
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {payoutHistory.length} logs
                </span>
              </div>

              <div className="space-y-2.5">
                {payoutHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-slate-600">
                        {item.gatewayRef}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          item.status === 'Confirmed'
                            ? 'bg-emerald-100 text-[#138808]'
                            : 'bg-rose-100 text-rose-600'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 font-semibold text-[#0b2545]">
                      <span>{item.orderId} • {item.farmerName}</span>
                      <span className="font-black text-sm text-[#138808]">₹{item.amount}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>UPI: {item.farmerUpi}</span>
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

        {/* Footer info note */}
        <footer className="p-3.5 text-center text-[10px] text-slate-400 border-t border-slate-200/60 bg-white/50">
          KisanRahi • Retail Consumer Society Hub
        </footer>
      </div>
    </div>
  );
};

export default RetailConsumerView;



