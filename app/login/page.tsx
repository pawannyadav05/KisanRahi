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

const DEMO_ACCOUNTS: Array<{
  role: UserRole;
  name: string;
  phone: string;
  location: string;
  icon: React.ElementType;
  badgeColor: string;
  description: string;
}> = [
  {
    role: 'farmer',
    name: 'Ramesh Yadav',
    phone: '9876543210',
    location: 'Sasaram, Rohtas',
    icon: Tractor,
    badgeColor: 'bg-green-600 hover:bg-green-700 text-white',
    description: 'List produce, check AI grading & receive guaranteed MSP payout',
  },
  {
    role: 'hub_manager',
    name: 'Vikas Sharma',
    phone: '9876543212',
    location: 'Sasaram Hub #3',
    icon: Warehouse,
    badgeColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    description: 'Scan incoming lots, verify weight, trigger batch pooling',
  },
  {
    role: 'bulk_buyer',
    name: 'Patna Caterers Co-op',
    phone: '9876543213',
    location: 'Patna Mandi B2B',
    icon: ShoppingBag,
    badgeColor: 'bg-blue-600 hover:bg-blue-700 text-white',
    description: 'Order aggregate pooled lots, lock escrow, track dispatch',
  },
  {
    role: 'retail_consumer',
    name: 'Priya Verma',
    phone: '9876543214',
    location: 'Patna Central B2C',
    icon: ShoppingCart,
    badgeColor: 'bg-purple-600 hover:bg-purple-700 text-white',
    description: 'Community bulk-buy, 28% cheaper fresh farm vegetables',
  },
  {
    role: 'driver',
    name: 'Minhaj Ansari',
    phone: '9876543215',
    location: 'Sasaram ↔ Patna Corridor',
    icon: Truck,
    badgeColor: 'bg-amber-600 hover:bg-amber-700 text-white',
    description: 'Dynamic milk-run routing, digital weighbridge QR pickup',
  },
  {
    role: 'doca_admin',
    name: 'DOCA Officer R.K. Mehta',
    phone: '9876543216',
    location: 'DoCA Central Command',
    icon: Building2,
    badgeColor: 'bg-red-600 hover:bg-red-700 text-white',
    description: 'Price stabilization buffer, dynamic MSP, anti-hoarding radar',
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

  const handleDemoLogin = async (demoPhone: string) => {
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

      setSuccess(`Logged in as ${data.user.name} (${data.user.role})! Redirecting...`);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
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

      setSuccess(`Welcome back, ${data.user.name}!`);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 600);
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

      setSuccess(`Account created for ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 600);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Banner */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center px-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <ShieldCheck className="w-4 h-4" />
          Government of India • DoCA Direct Procurement
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-3">
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-emerald-400 bg-clip-text text-transparent">
            KisanRahi Auth Portal
          </span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to access your role dashboard, smart contracts, and real-time PostGIS pooling.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl px-4">
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
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
              1-Click Demo Login
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Manual Login
            </button>
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'signup'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New
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

          {/* TAB 1: 1-CLICK HACKATHON DEMO LOGINS */}
          {activeTab === 'demo' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select a Role to Sign In Instantly:
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-700/60 text-slate-300">
                  Password: <code className="text-amber-400 font-mono">password123</code>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DEMO_ACCOUNTS.map((account) => {
                  const Icon = account.icon;
                  return (
                    <button
                      key={account.role}
                      type="button"
                      disabled={loading}
                      onClick={() => handleDemoLogin(account.phone)}
                      className="group flex flex-col text-left p-4 rounded-xl bg-slate-900/60 border border-slate-700/70 hover:border-emerald-500/50 hover:bg-slate-900/90 transition-all shadow-sm hover:shadow-md relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-lg ${account.badgeColor} shadow`}>
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                              {account.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {account.location}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {account.description}
                      </p>
                      <div className="mt-2 text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {account.phone}
                      </div>
                    </button>
                  );
                })}
              </div>
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
                  {loading ? 'Authenticating...' : 'Sign In'}
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
                  {loading ? 'Creating Account...' : 'Create Account & Sign In'}
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
              ← Return to Main KisanRahi Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
