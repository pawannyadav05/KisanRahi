'use client';

import React, { useState, useEffect, useRef } from 'react';

export const RetailConsumerView = () => {
  // ── Tab State ──
  const [activeTab, setActiveTab] = useState('Order'); // 'Order' | 'Grade' | 'Payment' | 'History'

  // ── Countdown Timer to next Saturday 7:00 AM ──
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    function getNextSaturday7AM() {
      const now = new Date();
      const target = new Date(now);
      const day = now.getDay(); // 0: Sun, 6: Sat
      let diff = (6 - day + 7) % 7;
      
      // If it's Saturday, check if 7:00 AM has already passed
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
      grade: 'Grade A',
      saves: 80,
      description: 'Staples for everyday Indian kitchen fresh from farms.',
      items: ['Tomato 1kg', 'Potato 2kg', 'Onion 1kg', 'Spinach 0.5kg'],
    },
    {
      id: 'premium',
      title: 'Premium Seasonal Pack',
      price: 449,
      grade: 'Grade A+',
      saves: 150,
      description: 'Curated exotic greens and seasonal superfoods.',
      items: ['Broccoli', 'Cherry Tomato', 'Baby Carrot', 'French Beans'],
    },
    {
      id: 'budget',
      title: 'Budget Saver Pack',
      price: 149,
      grade: 'Grade B',
      saves: 60,
      description: 'Nutritious everyday produce at unbeatable pooled rates.',
      items: ['Grade B produce - Mix Veg 3kg', 'Seasonal Greens 500g'],
    },
  ];

  const [selectedPackId, setSelectedPackId] = useState('essential');
  const [packWeeks, setPackWeeks] = useState({
    essential: 1,
    premium: 1,
    budget: 1,
  });
  const [expandedPacks, setExpandedPacks] = useState({
    essential: true,
    premium: false,
    budget: false,
  });

  const toggleExpand = (id) => {
    setExpandedPacks((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const updateWeeks = (id, delta) => {
    setPackWeeks((prev) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta),
    }));
  };

  const selectedPack = harvestPacks.find((p) => p.id === selectedPackId) || harvestPacks[0];
  const selectedTotalAmount = selectedPack.price * (packWeeks[selectedPack.id] || 1);

  // ── AI Crop Grading State ──
  const [isGrading, setIsGrading] = useState(false);
  const [gradeProgress, setGradeProgress] = useState(0);
  const [gradingResult, setGradingResult] = useState(null);
  const [selectedImageName, setSelectedImageName] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImageName(file.name);
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

        // Calculate random metrics
        const uniformityPct = Math.floor(Math.random() * (95 - 65 + 1)) + 65; // 65-95
        const damagePct = Math.floor(Math.random() * (15 - 2 + 1)) + 2; // 2-15
        const freshnessPct = Math.floor(Math.random() * (95 - 75 + 1)) + 75; // 75-95

        // Determine Grade
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
        });
      }
    }, 50);
  };

  // ── Payment Simulation State ──
  const [payAmount, setPayAmount] = useState(selectedTotalAmount.toString());
  const [farmerUpi, setFarmerUpi] = useState('ramesh.farmer@upi');
  const [farmerName, setFarmerName] = useState('Ramesh Kumar');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentProgress, setPaymentProgress] = useState(0);
  const [currentPayout, setCurrentPayout] = useState(null);
  const [payoutHistory, setPayoutHistory] = useState([
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
  }, [selectedPackId, packWeeks]);

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

        // 85% confirmed, 15% failed
        const isConfirmed = Math.random() < 0.85;
        const newRecord = {
          gatewayRef: generateRandomRef(),
          status: isConfirmed ? 'Confirmed' : 'Failed',
          amount: parseFloat(payAmount) || selectedTotalAmount,
          farmerUpi: farmerUpi || 'ramesh.farmer@upi',
          farmerName: farmerName || 'Ramesh Kumar',
          orderId: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        setCurrentPayout(newRecord);
        setPayoutHistory((prev) => [newRecord, ...prev]);
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] font-sans antialiased text-[#0b2545] flex flex-col items-center">
      {/* Mobile Frame Container max-w 420px */}
      <div className="w-full max-w-[420px] bg-[#f1f5f9] min-h-screen flex flex-col shadow-xl">
        
        {/* Sticky Top Navbar */}
        <header className="sticky top-0 z-40 bg-[#ffffff] border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <span className="text-2xl select-none" role="img" aria-label="wheat">🌾</span>
            <span className="text-xl font-black tracking-tight text-[#0b2545]">KisanRahi</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              RWA Hub
            </span>
            <div className="w-9 h-9 rounded-full bg-[#0b2545] text-[#ffffff] font-bold text-xs flex items-center justify-center border-2 border-[#f97316] shadow-sm">
              SR
            </div>
          </div>
        </header>

        {/* 1. DELIVERY BANNER */}
        <div className="bg-[#138808] text-[#ffffff] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-semibold bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-xs">
              ⚡ Next Society Drop
            </span>
            <span className="text-xs font-mono font-medium text-emerald-100">
              Live Countdown
            </span>
          </div>
          
          <h2 className="text-lg font-bold mt-1 text-[#ffffff] leading-snug">
            अगला वितरण: शनिवार सुबह 7:00 बजे
          </h2>
          
          <p className="text-xs text-emerald-50 opacity-90 mt-0.5 font-medium">
            Green Valley RWA — Block C Collection Point
          </p>

          {/* Live Countdown Box */}
          <div className="mt-3 bg-[#0b2545]/40 rounded-xl p-2.5 backdrop-blur-md border border-white/10 flex items-center justify-around text-center">
            <div>
              <span className="block text-base font-black tracking-wider text-white">
                {String(timeLeft.days).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-200">Days</span>
            </div>
            <span className="text-lg font-bold text-white/40">:</span>
            <div>
              <span className="block text-base font-black tracking-wider text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-200">Hours</span>
            </div>
            <span className="text-lg font-bold text-white/40">:</span>
            <div>
              <span className="block text-base font-black tracking-wider text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-200">Mins</span>
            </div>
            <span className="text-lg font-bold text-white/40">:</span>
            <div>
              <span className="block text-base font-black tracking-wider text-amber-300">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-emerald-200">Secs</span>
            </div>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="sticky top-[61px] z-30 bg-[#ffffff] border-b border-slate-200 grid grid-cols-4 text-xs font-bold shadow-xs">
          {['Order', 'Grade', 'Payment', 'History'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 text-center transition-colors relative flex items-center justify-center space-x-1 ${
                  isActive
                    ? 'text-[#138808] bg-emerald-50/50'
                    : 'text-slate-600 hover:text-[#0b2545]'
                }`}
              >
                <span>{tab}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#138808]" />
                )}
              </button>
            );
          })}
        </div>

        {/* MAIN BODY PER TAB */}
        <main className="p-4 flex-1 flex flex-col space-y-4">
          
          {/* TAB 1: ORDER (Collection Point Info + Weekly Harvest Packs) */}
          {activeTab === 'Order' && (
            <>
              {/* COLLECTION POINT INFO CARD */}
              <section className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[#138808] font-bold text-sm">📍 Hub Delivery Point</span>
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-100 text-[#138808] px-2 py-0.5 rounded-full">
                    47 families registered
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Name:</span>
                    <span className="font-bold text-[#0b2545] text-right">Green Valley RWA Gate 1</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Address:</span>
                    <span className="font-medium text-[#0b2545] text-right">Near Security Cabin, Sector 18</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-medium">Time Window:</span>
                    <span className="font-semibold text-[#138808] text-right">Saturday 7:00 AM to 10:00 AM</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                    <span className="text-slate-500 font-medium">Coordinator:</span>
                    <span className="font-bold text-[#0b2545]">
                      Ramesh Ji (<a href="tel:+919876543210" className="text-[#f97316] underline">+91 98765 43210</a>)
                    </span>
                  </div>
                </div>
              </section>

              {/* 2. WEEKLY HARVEST PACKS */}
              <div className="flex items-center justify-between pt-1">
                <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                  Weekly Harvest Packs
                </h3>
                <span className="text-[11px] text-slate-500 font-medium">Direct Farm Pooling</span>
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
                      className={`bg-[#ffffff] rounded-2xl p-4 transition-all duration-200 border-2 ${
                        isSelected
                          ? 'border-[#138808] shadow-md ring-2 ring-[#138808]/10'
                          : 'border-slate-200 shadow-xs'
                      }`}
                    >
                      {/* Top Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                pack.grade.includes('A+')
                                  ? 'bg-amber-100 text-amber-800'
                                  : pack.grade.includes('A')
                                  ? 'bg-emerald-100 text-[#138808]'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {pack.grade}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              saves ₹{pack.saves}
                            </span>
                          </div>
                          <h4 className="font-bold text-base text-[#0b2545] mt-1">
                            {pack.title}
                          </h4>
                        </div>

                        <div className="text-right pl-2">
                          <div className="text-lg font-black text-[#0b2545]">
                            ₹{pack.price}
                            <span className="text-[10px] font-medium text-slate-500">/week</span>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Item List Toggle */}
                      <div className="mt-2.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(pack.id)}
                          className="text-xs font-semibold text-[#f97316] flex items-center space-x-1 hover:underline focus:outline-none"
                        >
                          <span>{isExpanded ? 'Hide Produce Breakdown ▲' : 'View Pack Contents ▼'}</span>
                        </button>

                        {isExpanded && (
                          <div className="mt-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-xs">
                            <p className="text-[11px] text-slate-500 mb-1">{pack.description}</p>
                            <ul className="list-disc list-inside text-[#0b2545] space-y-0.5 font-medium">
                              {pack.items.map((item, idx) => (
                                <li key={idx} className="text-slate-700">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Quantity Selector & Select Button */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {/* Quantity (weeks) */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500 font-medium">Weeks:</span>
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                            <button
                              type="button"
                              onClick={() => updateWeeks(pack.id, -1)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-[#0b2545]">
                              {weeks}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateWeeks(pack.id, 1)}
                              className="px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="flex items-center space-x-2">
                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 font-medium">Total</div>
                            <div className="text-xs font-black text-[#0b2545]">₹{total}</div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPackId(pack.id);
                            }}
                            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              isSelected
                                ? 'bg-[#138808] text-[#ffffff] shadow-sm'
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
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('Payment')}
                  className="w-full bg-[#f97316] hover:bg-orange-600 text-white font-bold py-3.5 px-4 rounded-2xl shadow-lg shadow-orange-500/20 flex items-center justify-between transition-transform active:scale-[0.99]"
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
            <section className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📷</span>
                  <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                    AI Crop Grading Scanner
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Computer vision computerizes farm uniformity, damage & freshness metrics instantly.
                </p>
              </div>

              {/* Upload Input Area */}
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#138808] rounded-2xl p-6 bg-slate-50/60 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#138808] flex items-center justify-center text-xl mb-2">
                  📸
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGrading}
                  className="bg-[#0b2545] hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs disabled:opacity-50"
                >
                  {isGrading ? 'Scanning Produce...' : 'Upload Crop Image'}
                </button>
                <p className="text-[11px] text-slate-400 mt-2 text-center">
                  Supports JPEG, PNG produce samples from farm harvest
                </p>
                {selectedImageName && (
                  <p className="text-xs font-medium text-[#138808] mt-2 bg-emerald-50 px-2.5 py-1 rounded-full">
                    📄 {selectedImageName}
                  </p>
                )}
              </div>

              {/* 2-Second Loading Animation with Progress Bar */}
              {isGrading && (
                <div className="space-y-2 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="flex justify-between items-center text-xs font-bold text-[#138808]">
                    <span>Neural Analysis in progress...</span>
                    <span>{gradeProgress}%</span>
                  </div>
                  <div className="w-full bg-emerald-200/50 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#138808] h-full rounded-full transition-all duration-75"
                      style={{ width: `${gradeProgress}%` }}
                    />
                  </div>
                  <div className="text-[10px] text-slate-500 text-center font-medium">
                    Detecting surface blemishes, spectral ripeness & sizing geometry
                  </div>
                </div>
              )}

              {/* Simulated Results Card */}
              {gradingResult && !isGrading && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        AI Quality Certification
                      </span>
                      <h4 className="font-bold text-sm text-[#0b2545]">Grading Evaluation Result</h4>
                    </div>
                    {/* Grade Badge */}
                    <div
                      className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center space-x-1 shadow-xs ${
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

                  {/* Criteria explanation */}
                  <p className="text-[11px] text-slate-500">
                    {gradingResult.grade === 'A' && 'Premium export & direct retail quality (Uniformity > 80% & Damage < 5%).'}
                    {gradingResult.grade === 'B' && 'Standard retail acceptable produce (Uniformity ≥ 60% & Damage ≤ 15%).'}
                    {gradingResult.grade === 'C' && 'Substandard batch; designated for processing/pulping.'}
                  </p>

                  {/* Progress bars for metrics */}
                  <div className="space-y-2.5 pt-1">
                    {/* Uniformity */}
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

                    {/* Transit & Surface Damage */}
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

                    {/* Freshness Index */}
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

                  <div className="pt-2 text-right">
                    <span className="text-[10px] text-slate-400">
                      Evaluated at {gradingResult.evaluatedAt}
                    </span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* TAB 3: PAYMENT SIMULATION */}
          {activeTab === 'Payment' && (
            <section className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">💳</span>
                  <h3 className="font-black text-sm uppercase tracking-wide text-[#0b2545]">
                    UPI Payout Simulation
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct escrow settlement from RWA buyer pool directly to verified Farmer UPI.
                </p>
              </div>

              {/* Selected Pack Reminder */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Selected Order</div>
                  <div className="text-xs font-bold text-[#0b2545]">{selectedPack.title}</div>
                  <div className="text-[11px] text-slate-500">
                    {packWeeks[selectedPack.id] || 1} week(s) delivery subscription
                  </div>
                </div>
                <span className="text-sm font-black text-[#138808]">
                  ₹{selectedTotalAmount}
                </span>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-sm font-bold text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    placeholder="Enter amount"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farmer UPI ID</label>
                  <input
                    type="text"
                    value={farmerUpi}
                    onChange={(e) => setFarmerUpi(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    placeholder="e.g. ramesh.farmer@upi"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Farmer Name</label>
                  <input
                    type="text"
                    value={farmerName}
                    onChange={(e) => setFarmerName(e.target.value)}
                    className="w-full bg-[#ffffff] border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0b2545] focus:outline-none focus:border-[#138808]"
                    placeholder="Farmer Name"
                  />
                </div>
              </div>

              {/* Simulate UPI Payout Button */}
              <button
                type="button"
                disabled={isProcessingPayment}
                onClick={handleSimulatePayout}
                className="w-full bg-[#f97316] hover:bg-orange-600 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform active:scale-[0.99] flex items-center justify-center space-x-2"
              >
                {isProcessingPayment ? (
                  <span>Processing Gateway Transfer...</span>
                ) : (
                  <span>Simulate UPI Payout</span>
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
                    <span className="text-[11px] font-bold uppercase text-slate-500">
                      Transaction Slip
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
                      <span className="font-mono font-bold text-[#0b2545]">
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
                      <span className="font-black text-[#0b2545]">₹{currentPayout.amount}</span>
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
            </section>
          )}

          {/* TAB 4: TRANSACTION & PAYOUT HISTORY */}
          {activeTab === 'History' && (
            <section className="bg-[#ffffff] rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
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

              {payoutHistory.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">No payouts recorded yet.</p>
              ) : (
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
                        <span className="font-black text-sm">₹{item.amount}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>UPI: {item.farmerUpi}</span>
                        <span>{item.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </main>

        {/* Footer info note */}
        <footer className="p-4 text-center text-[11px] text-slate-400">
          KisanRahi SIH Hackathon • View D Retail Consumer Society Hub
        </footer>
      </div>
    </div>
  );
};

export default RetailConsumerView;

