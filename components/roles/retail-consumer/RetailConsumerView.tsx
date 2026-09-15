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
    <div className="min-h-screen bg-[#f1f5f9] text-[#0b2545] font-sans antialiased pb-12">
      {/* ── Sticky Top Navbar ── */}
      <header className="sticky top-0 z-40 bg-[#ffffff]/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="text-2xl select-none" role="img" aria-label="wheat">🌾</span>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight text-[#0b2545]">KisanRahi</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-[#138808] border border-emerald-200/60 hidden sm:inline">
                  Direct Farm-to-Fork
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium hidden xs:block">
                View D • Retail Consumer & RWA Society Hub
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-[#0b2545]">Green Valley RWA</span>
              <span className="block text-[10px] text-slate-500">Block C • Gate 1</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#0b2545] text-[#ffffff] font-bold text-xs flex items-center justify-center border-2 border-[#f97316] shadow-sm select-none">
              SR
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Container (Responsive Grid: 1 col on mobile, 12 cols on desktop) ── */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        
        {/* 1. DELIVERY BANNER */}
        <div className="rounded-3xl bg-gradient-to-r from-[#138808] to-[#0e6806] text-[#ffffff] p-4 sm:p-6 shadow-md shadow-emerald-900/10 mb-5 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none blur-2xl" />

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-xs flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-ping inline-block" />
                  <span>Next Society Drop</span>
                </span>
                <span className="text-xs text-emerald-100 font-medium">
                  Cutoff: Friday 10 PM
                </span>
              </div>
              
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight pt-1">
                अगला वितरण: शनिवार सुबह 7:00 बजे
              </h2>
              
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium flex items-center space-x-1">
                <span>📍</span>
                <span>Green Valley RWA — Block C Collection Point (Near Security Cabin)</span>
              </p>
            </div>

            {/* Live Countdown Box */}
            <div className="bg-[#0b2545]/60 rounded-2xl p-3 sm:p-3.5 backdrop-blur-md border border-white/15 flex items-center space-x-3 sm:space-x-4 self-start md:self-auto shadow-inner">
              <div className="text-center px-1">
                <span className="block text-lg sm:text-xl font-black text-white tracking-wider">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Days</span>
              </div>
              <span className="text-xl font-bold text-white/40 pb-2">:</span>
              <div className="text-center px-1">
                <span className="block text-lg sm:text-xl font-black text-white tracking-wider">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Hours</span>
              </div>
              <span className="text-xl font-bold text-white/40 pb-2">:</span>
              <div className="text-center px-1">
                <span className="block text-lg sm:text-xl font-black text-white tracking-wider">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Mins</span>
              </div>
              <span className="text-xl font-bold text-white/40 pb-2">:</span>
              <div className="text-center px-1">
                <span className="block text-lg sm:text-xl font-black text-amber-300 tracking-wider">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-200">Secs</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-Column Layout on Desktop ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ════════ LEFT COLUMN: MAIN INTERACTIVE TABS (8 Cols) ════════ */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* TABS NAVIGATION */}
            <div className="bg-[#ffffff] rounded-2xl border border-slate-200/80 p-1.5 shadow-xs grid grid-cols-4 gap-1">
              {(['Order', 'Grade', 'Payment', 'History'] as const).map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-[#138808] text-white shadow-md shadow-emerald-700/20'
                        : 'text-slate-600 hover:text-[#0b2545] hover:bg-slate-100/70'
                    }`}
                  >
                    <span>
                      {tab === 'Order' && '🛒'}
                      {tab === 'Grade' && '🔬'}
                      {tab === 'Payment' && '💳'}
                      {tab === 'History' && '📜'}
                    </span>
                    <span>{tab}</span>
                  </button>
                );
              })}
            </div>

            {/* ── TAB 1: ORDER ── */}
            {activeTab === 'Order' && (
              <div className="space-y-4">
                
                {/* Collection Point Card */}
                <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">📍</span>
                      <div>
                        <h4 className="font-extrabold text-sm text-[#0b2545]">Society Collection Point</h4>
                        <p className="text-[11px] text-slate-500">Shared bulk batch drop for society residents</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold bg-emerald-50 text-[#138808] border border-emerald-200/80 px-2.5 py-1 rounded-full flex items-center space-x-1">
                      <span>👥</span>
                      <span>47 families registered</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Location</span>
                      <p className="font-bold text-[#0b2545]">Green Valley RWA Gate 1</p>
                      <p className="text-slate-500 text-[11px]">Near Security Cabin, Sector 18</p>
                    </div>

                    <div className="bg-slate-50/70 p-2.5 rounded-xl border border-slate-100 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Distribution Window</span>
                      <p className="font-bold text-[#138808]">Saturday 7:00 AM to 10:00 AM</p>
                      <p className="text-slate-500 text-[11px]">Coordinator: Ramesh Ji (+91 98765 43210)</p>
                    </div>
                  </div>
                </div>

                {/* Section Header */}
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                      Weekly Harvest Packs
                    </h3>
                    <p className="text-xs text-slate-500">Zero middleman markup • Sourced direct from PACS village pools</p>
                  </div>
                  <span className="text-xs font-bold text-[#138808] bg-emerald-50 px-2.5 py-1 rounded-full hidden sm:inline">
                    Save up to ₹150/week
                  </span>
                </div>

                {/* 3 Pack Cards */}
                <div className="space-y-3.5">
                  {harvestPacks.map((pack) => {
                    const isSelected = selectedPackId === pack.id;
                    const isExpanded = !!expandedPacks[pack.id];
                    const weeks = packWeeks[pack.id] || 1;
                    const total = pack.price * weeks;

                    return (
                      <div
                        key={pack.id}
                        className={`bg-[#ffffff] rounded-2xl p-4 sm:p-5 transition-all duration-200 border-2 ${
                          isSelected
                            ? 'border-[#138808] shadow-md shadow-emerald-800/10 ring-2 ring-[#138808]/15'
                            : 'border-slate-200/80 shadow-xs hover:border-slate-300'
                        }`}
                      >
                        {/* Header: Badge + Title + Pricing */}
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1 min-w-[200px]">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  pack.grade.includes('A+')
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300/60'
                                    : pack.grade.includes('A')
                                    ? 'bg-emerald-100 text-[#138808] border border-emerald-300/60'
                                    : 'bg-blue-100 text-blue-900 border border-blue-300/60'
                                }`}
                              >
                                {pack.grade} Certified
                              </span>
                              <span className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {pack.badge}
                              </span>
                              <span className="text-[10px] font-bold text-[#138808] bg-emerald-50 px-2 py-0.5 rounded-full">
                                Saves ₹{pack.saves} ({pack.savePct})
                              </span>
                            </div>

                            <h4 className="font-extrabold text-base sm:text-lg text-[#0b2545]">
                              {pack.title}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {pack.description}
                            </p>
                            <p className="text-[11px] font-medium text-emerald-800 mt-1 flex items-center space-x-1">
                              <span>🌱</span>
                              <span>{pack.origin}</span>
                            </p>
                          </div>

                          {/* Price Tag */}
                          <div className="text-right">
                            <div className="flex items-baseline justify-end space-x-1.5">
                              <span className="text-xl sm:text-2xl font-black text-[#0b2545]">
                                ₹{pack.price}
                              </span>
                              <span className="text-xs font-medium text-slate-400">/week</span>
                            </div>
                            <div className="text-[11px] text-slate-400 line-through">
                              ₹{pack.marketPrice} retail
                            </div>
                          </div>
                        </div>

                        {/* Veggie Produce Tags (Blinkit style visual chips) */}
                        <div className="mt-3.5 pt-3 border-t border-slate-100">
                          <div className="flex flex-wrap items-center gap-2">
                            {pack.items.map((item, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center space-x-1 text-xs font-semibold bg-slate-50 text-slate-700 px-2.5 py-1 rounded-xl border border-slate-200/60"
                              >
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                                <span className="text-[10px] text-slate-400 font-medium">({item.qty})</span>
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Expandable Breakdown Toggle */}
                        <div className="mt-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(pack.id)}
                            className="text-xs font-semibold text-[#f97316] hover:text-orange-600 transition flex items-center space-x-1 cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide pack specifications ▲' : 'View pack specifications ▼'}</span>
                          </button>

                          {isExpanded && (
                            <div className="mt-2 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-1.5">
                              <div className="font-semibold text-[#0b2545]">Quality Guarantee:</div>
                              <p className="text-slate-600 text-[11px] leading-relaxed">
                                Sorted at source via KisanRahi Vision AI. Delivered in breathable eco-crates to Green Valley Gate 1. If any item fails Grade standards, instant escrow refund is credited.
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Quantity Stepper & Select Button */}
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-semibold text-slate-600">Weeks:</span>
                            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => updateWeeks(pack.id, -1)}
                                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                              >
                                -
                              </button>
                              <span className="px-2.5 text-xs font-black text-[#0b2545]">
                                {weeks}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateWeeks(pack.id, 1)}
                                className="px-3 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <span className="text-[10px] text-slate-400 block">Total</span>
                              <span className="text-sm font-black text-[#0b2545]">₹{total}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setSelectedPackId(pack.id)}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#138808] text-white shadow-sm'
                                  : 'bg-slate-100 text-[#0b2545] hover:bg-slate-200'
                              }`}
                            >
                              {isSelected ? '✓ Selected' : 'Select Pack'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Mobile Proceed CTA */}
                <div className="pt-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setActiveTab('Payment')}
                    className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-black py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-between transition-transform active:scale-[0.99] cursor-pointer"
                  >
                    <span className="text-xs uppercase tracking-wider">
                      Proceed to UPI Payment
                    </span>
                    <span className="text-sm font-black bg-white/20 px-2.5 py-0.5 rounded-lg">
                      ₹{selectedTotalAmount} &rarr;
                    </span>
                  </button>
                </div>
              </div>
            )}

            {/* ── TAB 2: AI CROP GRADING PANEL ── */}
            {activeTab === 'Grade' && (
              <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">🔬</span>
                      <div>
                        <h3 className="font-black text-base text-[#0b2545]">
                          AI Vision Crop Grading System
                        </h3>
                        <p className="text-xs text-slate-500">
                          Automated optical inspection checking uniformity, skin defects & ripeness
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-[#138808] px-2.5 py-1 rounded-full border border-emerald-200/70 hidden sm:inline">
                      DoCA & Agmarknet Standard
                    </span>
                  </div>
                </div>

                {/* 1-Click Quick Samples for Presentation */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">
                    ⚡ Instant Demo: Choose a harvest lot to test scanner:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => runGradingSimulation('Tomato_GradeA_Sasaram_Lot14.jpg')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>🍅</span>
                      <span>Scan Tomato Harvest (Lot 14)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => runGradingSimulation('Potato_GradeB_Dehri_Lot09.jpg')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <span>🥔</span>
                      <span>Scan Potato Lot (Dehri)</span>
                    </button>
                  </div>
                </div>

                {/* Upload or Drop Area */}
                <div className="border-2 border-dashed border-slate-300 hover:border-[#138808] rounded-2xl p-6 bg-slate-50/70 text-center transition relative overflow-hidden">
                  {/* Laser Radar Scan Effect during grading */}
                  {isGrading && (
                    <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#138808] to-transparent animate-pulse shadow-lg shadow-emerald-500" />
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-[#138808] flex items-center justify-center text-xl mx-auto mb-2.5">
                    📷
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGrading}
                    className="bg-[#0b2545] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {isGrading ? 'Processing Neural Scan...' : 'Upload Crop Image from Camera'}
                  </button>
                  <p className="text-[11px] text-slate-400 mt-2">
                    Supports high-res field photos of tomatoes, potatoes, onions & exotic greens
                  </p>
                  {selectedImageName && (
                    <p className="text-xs font-semibold text-[#138808] mt-2.5 inline-block bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                      📄 Current Lot: {selectedImageName}
                    </p>
                  )}
                </div>

                {/* Progress Bar with Milestones */}
                {isGrading && (
                  <div className="space-y-2 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between items-center text-xs font-bold text-[#138808]">
                      <span className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        <span>AI Vision Neural Network Active</span>
                      </span>
                      <span>{gradeProgress}%</span>
                    </div>
                    <div className="w-full bg-emerald-200/50 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#138808] h-full rounded-full transition-all duration-75"
                        style={{ width: `${gradeProgress}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-3 text-center text-[10px] text-slate-500 font-medium pt-1">
                      <span>1. Surface Detection</span>
                      <span>2. Color Spectroscopy</span>
                      <span>3. Grade Categorization</span>
                    </div>
                  </div>
                )}

                {/* Simulated Certificate Result */}
                {gradingResult && !isGrading && (
                  <div className="p-5 rounded-2xl border-2 border-emerald-200/80 bg-emerald-50/30 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Verified Lot Certificate
                        </span>
                        <h4 className="font-extrabold text-sm text-[#0b2545]">
                          AI Quality Certificate #{gradingResult.sampleName.substring(0, 10)}
                        </h4>
                      </div>
                      <div
                        className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-xs ${
                          gradingResult.grade === 'A'
                            ? 'bg-[#138808] text-white'
                            : gradingResult.grade === 'B'
                            ? 'bg-amber-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        Grade {gradingResult.grade} Certified
                      </div>
                    </div>

                    <p className="text-xs text-slate-600">
                      {gradingResult.grade === 'A' && '✅ Premium export & direct retail quality. Uniformity exceeds 80% with transit damage strictly below 5%.'}
                      {gradingResult.grade === 'B' && '⚠️ Standard quality acceptable for retail consumption. Designated for Budget Saver Pack.'}
                      {gradingResult.grade === 'C' && '❌ Substandard produce. Diverted to pulp/food processing channels.'}
                    </p>

                    {/* Progress Bars for Metrics */}
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-700">Produce Uniformity</span>
                          <span className="font-black text-[#0b2545]">{gradingResult.uniformityPct}%</span>
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
                          <span className="text-slate-700">Skin Defect & Transit Damage</span>
                          <span className={`font-black ${gradingResult.damagePct < 5 ? 'text-[#138808]' : 'text-rose-600'}`}>
                            {gradingResult.damagePct}% (Threshold: &lt; 5%)
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
                          <span className="text-slate-700">Spectral Freshness Index</span>
                          <span className="font-black text-[#138808]">{gradingResult.freshnessPct}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#138808] h-full rounded-full"
                            style={{ width: `${gradingResult.freshnessPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 text-right text-[10px] text-slate-400">
                      Scanned at {gradingResult.evaluatedAt} • KisanRahi DoCA Edge Model v2.4
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 3: PAYMENT SIMULATION ── */}
            {activeTab === 'Payment' && (
              <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-5">
                <div className="border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">💳</span>
                    <div>
                      <h3 className="font-black text-base text-[#0b2545]">
                        Direct Escrow UPI Payout Simulator
                      </h3>
                      <p className="text-xs text-slate-500">
                        Consumer payments are escrow-locked and settled direct to farmer UPI upon society delivery
                      </p>
                    </div>
                  </div>
                </div>

                {/* Selected Pack Reminder */}
                <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subscribed Pack</span>
                    <h4 className="text-sm font-extrabold text-[#0b2545]">{selectedPack.title}</h4>
                    <p className="text-[11px] text-slate-500">
                      {packWeeks[selectedPack.id] || 1} week(s) delivery subscription • Saturday 7 AM
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Total</span>
                    <span className="text-lg font-black text-[#138808]">₹{selectedTotalAmount}</span>
                  </div>
                </div>

                {/* Transparent Price Breakdown (Solves Middlemen Problem) */}
                <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-900 border-b border-emerald-100 pb-1.5">
                    <span>🌱 Transparent Money Distribution</span>
                    <span className="text-[10px] bg-[#138808] text-white px-2 py-0.5 rounded-full">
                      Zero Mandi Commission
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>Farmer Direct Share (85%):</span>
                      <span className="font-bold text-[#138808]">₹{farmerShare}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Hub Logistics & Crates (11%):</span>
                      <span className="font-semibold text-slate-700">₹{logisticsShare}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>NPCI & Escrow Fee (4%):</span>
                      <span className="font-semibold text-slate-700">₹{platformShare}</span>
                    </div>
                  </div>
                </div>

                {/* UPI Apps Pills Selector */}
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 block">Select Payment App:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {(['GPay', 'PhonePe', 'Paytm', 'BHIM'] as const).map((app) => (
                      <button
                        key={app}
                        type="button"
                        onClick={() => setSelectedUpiApp(app)}
                        className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          selectedUpiApp === app
                            ? 'border-[#f97316] bg-orange-50 text-[#f97316] shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {app}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Form Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-bold text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farmer VPA / UPI ID</label>
                    <input
                      type="text"
                      value={farmerUpi}
                      onChange={(e) => setFarmerUpi(e.target.value)}
                      className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Farmer Beneficiary Name</label>
                    <input
                      type="text"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    />
                  </div>
                </div>

                {/* Payout Action Button */}
                <button
                  type="button"
                  disabled={isProcessingPayment}
                  onClick={handleSimulatePayout}
                  className="w-full bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white font-black py-3.5 px-4 rounded-xl shadow-md shadow-orange-500/20 transition-transform active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isProcessingPayment ? (
                    <span>Connecting NPCI Escrow Switch...</span>
                  ) : (
                    <span>Simulate UPI Payout with {selectedUpiApp}</span>
                  )}
                </button>

                {/* 2-second processing animation */}
                {isProcessingPayment && (
                  <div className="space-y-2 p-3 bg-amber-50/60 rounded-xl border border-amber-100">
                    <div className="flex justify-between items-center text-xs font-bold text-[#f97316]">
                      <span>Authorizing UPI Escrow Sandbox...</span>
                      <span>{paymentProgress}%</span>
                    </div>
                    <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-[#f97316] h-full rounded-full transition-all duration-75"
                        style={{ width: `${paymentProgress}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-500 text-center">
                      Validating VPA & locking funds in Smart Escrow
                    </div>
                  </div>
                )}

                {/* Latest Transaction Slip */}
                {currentPayout && !isProcessingPayment && (
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                      currentPayout.status === 'Confirmed'
                        ? 'bg-emerald-50/40 border-[#138808]'
                        : 'bg-rose-50/40 border-rose-500'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Payment Receipt</span>
                        <span className="text-xs font-bold text-[#0b2545]">{currentPayout.upiApp} UPI Transfer</span>
                      </div>
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full ${
                          currentPayout.status === 'Confirmed'
                            ? 'bg-[#138808] text-white'
                            : 'bg-rose-600 text-white'
                        }`}
                      >
                        {currentPayout.status === 'Confirmed' ? '✓ Confirmed' : '✕ Failed'}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Gateway Reference:</span>
                        <span className="font-mono font-bold text-[#0b2545]">{currentPayout.gatewayRef}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Order ID:</span>
                        <span className="font-bold text-[#0b2545]">{currentPayout.orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Beneficiary Farmer:</span>
                        <span className="font-semibold text-[#0b2545]">
                          {currentPayout.farmerName} ({currentPayout.farmerUpi})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Settled Amount:</span>
                        <span className="font-black text-[#0b2545]">₹{currentPayout.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Timestamp:</span>
                        <span className="text-slate-700">{currentPayout.timestamp}</span>
                      </div>
                    </div>

                    {currentPayout.status === 'Confirmed' ? (
                      <div className="mt-3 text-[11px] text-[#138808] font-bold bg-white/80 p-2.5 rounded-xl text-center border border-emerald-200">
                        Funds instant-settled to farmer account via automated pooling escrow.
                      </div>
                    ) : (
                      <div className="mt-3 text-[11px] text-rose-700 font-bold bg-white/80 p-2.5 rounded-xl text-center border border-rose-200">
                        Escrow reverted: Bank switch timed out. Please retry transaction.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB 4: HISTORY ── */}
            {activeTab === 'History' && (
              <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-black text-base text-[#0b2545]">
                      Escrow Payout Audit Trail
                    </h3>
                    <p className="text-xs text-slate-500">
                      Immutable record of all consumer society payouts to village farmers
                    </p>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                    {payoutHistory.length} logs
                  </span>
                </div>

                <div className="space-y-3">
                  {payoutHistory.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 space-y-1.5 text-xs"
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
                      <div className="flex items-center justify-between font-semibold text-[#0b2545]">
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

          </div>

          {/* ════════ RIGHT COLUMN: SOCIETY PULSE & DESKTOP SIDEBAR (4 Cols) ════════ */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Live Society Activity Feed */}
            <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div className="flex items-center space-x-1.5">
                  <span className="text-sm">🏢</span>
                  <h4 className="font-extrabold text-xs uppercase tracking-wide text-[#0b2545]">
                    Green Valley Society Pulse
                  </h4>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="space-y-2.5">
                {societyActivity.map((act, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs">
                    <span className="text-sm select-none">{act.icon}</span>
                    <div className="flex-1">
                      <span className="font-bold text-[#0b2545]">{act.apt}</span>{' '}
                      <span className="text-slate-600 text-[11px]">{act.action}</span>
                      <span className="block text-[10px] text-slate-400">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex justify-between text-[11px] font-bold mb-1">
                  <span className="text-slate-600">Batch Target (200 kg):</span>
                  <span className="text-[#138808]">182 kg Booked (91%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#138808] h-full rounded-full w-[91%]" />
                </div>
              </div>
            </div>

            {/* Sticky Summary & Escrow Box on Desktop */}
            <div className="bg-[#ffffff] rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-3 sticky top-20">
              <h4 className="font-extrabold text-xs uppercase tracking-wide text-[#0b2545] border-b border-slate-100 pb-2">
                Order & Escrow Summary
              </h4>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-600">Pack:</span>
                  <span className="font-bold text-[#0b2545] text-right">{selectedPack.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Duration:</span>
                  <span className="font-bold text-[#0b2545]">{packWeeks[selectedPack.id] || 1} week(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Delivery Slot:</span>
                  <span className="font-bold text-[#138808]">Sat 7:00 AM @ Gate 1</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-100 font-extrabold text-sm">
                  <span>Total Amount:</span>
                  <span className="text-[#0b2545]">₹{selectedTotalAmount}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('Payment')}
                className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-black py-3 px-4 rounded-xl shadow-md shadow-orange-500/20 transition-transform active:scale-[0.99] text-xs uppercase tracking-wider cursor-pointer"
              >
                Proceed with Escrow UPI
              </button>

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                🛡️ 100% Escrow Protection: Funds released to farmer only after produce verified by RWA coordinator.
              </div>
            </div>

          </div>

        </div>

        {/* Footer info note */}
        <footer className="mt-8 text-center text-[11px] text-slate-400">
          KisanRahi SIH Hackathon • View D Retail Consumer Society Hub • 85%+ Farmer Price Realization
        </footer>
      </div>
    </div>
  );
};

export default RetailConsumerView;

