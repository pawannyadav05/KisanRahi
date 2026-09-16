'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Tractor,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Building2,
  Lock,
  Phone,
  User,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';

const DEMO_CATEGORIES = [
  {
    categoryTitle: '🌾 6 Farmers (Producers / Sellers)',
    items: [
      { name: 'Ramesh Yadav', phone: '9876543210', location: 'Sasaram PACS (5.5 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'Tomato, Potato, Onion & MSP Floor' },
      { name: 'Sunita Devi', phone: '9876543211', location: 'Sasaram North (3.2 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'Tomato, Chilli & AI Quality Grade A' },
      { name: 'Bimal Singh', phone: '9876543217', location: 'Nokha Village (4.8 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'Paddy, Wheat & Direct PACS Pooling' },
      { name: 'Rajeshwar Kushwaha', phone: '9876543218', location: 'Kargahar Mandi (6.0 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'Green Peas & Cold Storage Staging' },
      { name: 'Meena Kumari', phone: '9876543219', location: 'Chenari FPO (2.5 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'Organic Mustard, Chilli & Garlic' },
      { name: 'Dharmendra Mahto', phone: '9876543220', location: 'Dehri Aggregation (7.1 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600', desc: 'High-Volume Tomato & Maize' },
    ],
  },
  {
    categoryTitle: '🏢 2 Hub Managers (PACS / Aggregators)',
    items: [
      { name: 'Vikas Sharma', phone: '9876543212', location: 'Sasaram Hub #3', role: 'hub_manager' as UserRole, icon: Warehouse, color: 'bg-teal-600', desc: '2,500kg Capacity • Digital Weighbridge' },
      { name: 'Anita Choudhary', phone: '9876543221', location: 'Dehri FPO Center', role: 'hub_manager' as UserRole, icon: Warehouse, color: 'bg-teal-600', desc: '3,500kg Capacity • Corridor Dispatch' },
    ],
  },
  {
    categoryTitle: '🏬 2 Bulk Buyers (B2B / Processors)',
    items: [
      { name: 'Patna Caterers Co-op', phone: '9876543213', location: 'Patna Mandi B2B', role: 'bulk_buyer' as UserRole, icon: ShoppingBag, color: 'bg-blue-600', desc: 'Escrow Locked 10-Tonne Lot Sourcing' },
      { name: 'Magadh Agro Processing Ltd', phone: '9876543222', location: 'Gaya Industrial Hub', role: 'bulk_buyer' as UserRole, icon: ShoppingBag, color: 'bg-blue-600', desc: 'Direct Tomato Paste & Sauce Factory' },
    ],
  },
  {
    categoryTitle: '🛒 2 Retail Consumers (B2C / Society)',
    items: [
      { name: 'Priya Verma', phone: '9876543214', location: 'Patna Central B2C', role: 'retail_consumer' as UserRole, icon: ShoppingCart, color: 'bg-purple-600', desc: '28% Cheaper Farm-Fresh Community Drop' },
      { name: 'Amit Kumar', phone: '9876543223', location: 'Danapur Railway Colony', role: 'retail_consumer' as UserRole, icon: ShoppingCart, color: 'bg-purple-600', desc: 'Daily Fresh Vegetables & Provenance QR' },
    ],
  },
  {
    categoryTitle: '⚡ Corridor Logistics & DoCA Oversight',
    items: [
      { name: 'Minhaj Ansari (Driver)', phone: '9876543215', location: 'Sasaram-Patna Corridor', role: 'driver' as UserRole, icon: Truck, color: 'bg-amber-600', desc: 'Dynamic Multi-Stop Milk-Run Routing' },
      { name: 'DOCA Officer R.K. Mehta', phone: '9876543216', location: 'DoCA Central Command', role: 'doca_admin' as UserRole, icon: Building2, color: 'bg-red-600', desc: 'Anti-Hoarding Radar & Price Stabilization' },
    ],
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'signup'>('demo');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDemoLogin = async (demoPhone: string, demoRole: UserRole) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, password: 'password123' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setSuccess(`Authenticated as ${data.user.name}! Launching dashboard...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kisanrahi_user', JSON.stringify(data.user));
        sessionStorage.setItem('kr_session_active', '1');
      }
      setTimeout(() => {
        window.location.href = `/?app=true`;
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'pawan.farmer@kisanrahi.in',
          name: 'Pawan Yadav (Google Verified)',
          role: role || 'farmer',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Google auth failed');

      setSuccess(`Signed in with Google as ${data.user.name}! Launching dashboard...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kisanrahi_user', JSON.stringify(data.user));
        sessionStorage.setItem('kr_session_active', '1');
      }
      setTimeout(() => {
        window.location.href = `/?app=true`;
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      setSuccess(`Welcome back, ${data.user.name}! Redirecting to dashboard...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kisanrahi_user', JSON.stringify(data.user));
        sessionStorage.setItem('kr_session_active', '1');
      }
      setTimeout(() => {
        window.location.href = `/?app=true`;
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      setSuccess(`Account registered for ${data.user.name}! Launching view...`);
      if (typeof window !== 'undefined') {
        localStorage.setItem('kisanrahi_user', JSON.stringify(data.user));
        sessionStorage.setItem('kr_session_active', '1');
      }
      setTimeout(() => {
        window.location.href = `/?app=true`;
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Government of India • DoCA Direct Procurement Grid
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
            KisanRahi RBAC Authentication
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your role-specific dashboard with strict access control.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-3xl px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
          {/* Google OAuth Button */}
          <div className="mb-6">
            <button
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all border border-slate-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-slate-700" />
              <span className="px-3 text-xs text-slate-500 uppercase tracking-wider font-semibold">
                Or Sign In With
              </span>
              <div className="flex-1 border-t border-slate-700" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex rounded-xl bg-slate-900/80 p-1.5 mb-6 border border-slate-700/50">
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'demo'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" />
              ⚡ Quick Role Logins
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New ID
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO */}
          {activeTab === 'demo' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select a Role Account to Launch Directly:
                </span>
                <span className="text-[11px] px-2.5 py-1 rounded bg-slate-700/60 text-slate-300 border border-slate-600">
                  Password: <code className="text-amber-400 font-mono font-bold">password123</code>
                </span>
              </div>

              {DEMO_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    {cat.categoryTitle}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cat.items.map((acc, i) => {
                      const Icon = acc.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={loading}
                          onClick={() => handleDemoLogin(acc.phone, acc.role)}
                          className="flex flex-col text-left p-3.5 rounded-xl bg-slate-900/70 border border-slate-700/80 hover:border-emerald-500/60 hover:bg-slate-900 transition-all group shadow-sm relative overflow-hidden"
                        >
                          <div className="flex items-center justify-between w-full mb-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`p-2 rounded-lg ${acc.color} text-white shadow`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <div>
                                <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                                  {acc.name}
                                </div>
                                <div className="text-[11px] text-slate-400">{acc.location}</div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {acc.desc}
                          </p>
                          <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {acc.phone}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleManualLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Authenticating...' : 'Sign In & Enter Dashboard'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SIGNUP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name / Entity Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Yadav"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 9812345678"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Assign System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="farmer">Farmer (Producer / Seller)</option>
                  <option value="hub_manager">Hub Manager (PACS / FPO Aggregator)</option>
                  <option value="bulk_buyer">Bulk Buyer (Mandi / Processor / B2B)</option>
                  <option value="retail_consumer">Retail Consumer (Direct B2C Buyer)</option>
                  <option value="driver">Logistics Driver (Corridor Carrier)</option>
                  <option value="doca_admin">DoCA Admin (Market Oversight)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating Account...' : 'Create Account & Launch View'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* Quick Return to Dashboard */}
          <div className="mt-6 pt-4 border-t border-slate-700/60 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Return to Main Landing Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
