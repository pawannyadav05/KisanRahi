'use client';

import React, { useState } from 'react';
import {
  X,
  Zap,
  Phone,
  Lock,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Tractor,
  Warehouse,
  ShoppingBag,
  ShoppingCart,
  Truck,
  Building2,
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';

const DEMO_CATEGORIES = [
  {
    categoryTitle: '🌾 6 Farmers (Producers / Sellers)',
    items: [
      { name: 'Ramesh Yadav', phone: '9876543210', location: 'Sasaram PACS (5.5 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
      { name: 'Sunita Devi', phone: '9876543211', location: 'Sasaram North (3.2 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
      { name: 'Bimal Singh', phone: '9876543217', location: 'Nokha Village (4.8 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
      { name: 'Rajeshwar Kushwaha', phone: '9876543218', location: 'Kargahar Mandi (6.0 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
      { name: 'Meena Kumari', phone: '9876543219', location: 'Chenari FPO (2.5 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
      { name: 'Dharmendra Mahto', phone: '9876543220', location: 'Dehri Aggregation (7.1 Acres)', role: 'farmer' as UserRole, icon: Tractor, color: 'bg-green-600' },
    ],
  },
  {
    categoryTitle: '🏢 2 Hub Managers (PACS / Aggregators)',
    items: [
      { name: 'Vikas Sharma', phone: '9876543212', location: 'Sasaram Hub #3 (Cap: 2,500kg)', role: 'hub_manager' as UserRole, icon: Warehouse, color: 'bg-teal-600' },
      { name: 'Anita Choudhary', phone: '9876543221', location: 'Dehri FPO Center (Cap: 3,500kg)', role: 'hub_manager' as UserRole, icon: Warehouse, color: 'bg-teal-600' },
    ],
  },
  {
    categoryTitle: '🏬 2 Bulk Buyers (B2B / Processors)',
    items: [
      { name: 'Patna Caterers Co-op', phone: '9876543213', location: 'Patna Mandi B2B Center', role: 'bulk_buyer' as UserRole, icon: ShoppingBag, color: 'bg-blue-600' },
      { name: 'Magadh Agro Ltd', phone: '9876543222', location: 'Gaya Industrial Hub', role: 'bulk_buyer' as UserRole, icon: ShoppingBag, color: 'bg-blue-600' },
    ],
  },
  {
    categoryTitle: '🛒 2 Retail Consumers (B2C / Society)',
    items: [
      { name: 'Priya Verma', phone: '9876543214', location: 'Patna Central B2C', role: 'retail_consumer' as UserRole, icon: ShoppingCart, color: 'bg-purple-600' },
      { name: 'Amit Kumar', phone: '9876543223', location: 'Danapur Railway Colony B2C', role: 'retail_consumer' as UserRole, icon: ShoppingCart, color: 'bg-purple-600' },
    ],
  },
  {
    categoryTitle: '⚡ Corridor Logistics & DoCA Oversight',
    items: [
      { name: 'Minhaj Ansari (Driver)', phone: '9876543215', location: 'Sasaram-Patna Corridor', role: 'driver' as UserRole, icon: Truck, color: 'bg-amber-600' },
      { name: 'DOCA Officer R.K. Mehta', phone: '9876543216', location: 'National Price Radar', role: 'doca_admin' as UserRole, icon: Building2, color: 'bg-red-600' },
    ],
  },
];

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (role: UserRole) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'demo' | 'login' | 'signup'>('demo');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async (demoPhone: string, demoRole: UserRole) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: demoPhone, password: 'password123' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setSuccess(`Authenticated as ${data.user.name} (${data.user.role})! Redirecting to Dashboard...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(data.user.role);
        window.location.href = `/?role=${data.user.role}&app=true`;
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
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

      setSuccess(`Signed in with Google! Redirecting to Dashboard...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(data.user.role);
        window.location.href = `/?role=${data.user.role}&app=true`;
      }, 400);
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');

      setSuccess(`Welcome back, ${data.user.name}! Redirecting...`);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess(data.user.role);
        window.location.href = `/?role=${data.user.role}&app=true`;
      }, 400);
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
        onClose();
        if (onSuccess) onSuccess(data.user.role);
        window.location.href = `/?role=${data.user.role}&app=true`;
      }, 400);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-bold text-white text-base block">KisanRahi RBAC Authentication</span>
              <span className="text-[11px] text-slate-400">Strict Role-Based Access Control Protected</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            disabled={loading}
            onClick={handleGoogleAuth}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all border border-slate-300"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            Continue with Google
          </button>

          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-slate-700" />
            <span className="px-3 text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Or</span>
            <div className="flex-1 border-t border-slate-700" />
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-800 p-1 border border-slate-700 text-xs">
            <button
              onClick={() => setTab('demo')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                tab === 'demo' ? 'bg-amber-500 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Quick Role Logins (Password: password123)
            </button>
            <button
              onClick={() => setTab('login')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                tab === 'login' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Phone Login
            </button>
            <button
              onClick={() => setTab('signup')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                tab === 'signup' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Register New ID
            </button>
          </div>

          {/* Feedback */}
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* TAB 1: 1-CLICK DEMO (6 Farmers, 2 Hubs, 2 Bulk, 2 Retail, 1 Driver, 1 Admin) */}
          {tab === 'demo' && (
            <div className="space-y-4 pt-1 pr-1">
              {DEMO_CATEGORIES.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider px-1">
                    {cat.categoryTitle}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((acc, i) => {
                      const Icon = acc.icon;
                      return (
                        <button
                          key={i}
                          type="button"
                          disabled={loading}
                          onClick={() => handleDemoLogin(acc.phone, acc.role)}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500 text-left transition-all group shadow-sm"
                        >
                          <div className={`p-2 rounded-lg ${acc.color} text-white flex-shrink-0 shadow`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="overflow-hidden flex-1">
                            <div className="text-xs font-bold text-white truncate group-hover:text-emerald-300">
                              {acc.name}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">{acc.location}</div>
                            <div className="text-[9px] text-slate-500 font-mono">Ph: {acc.phone}</div>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: MANUAL LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleManualLogin} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Authenticating...' : 'Sign In & Enter Dashboard'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}

          {/* TAB 3: SIGNUP */}
          {tab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Full Name / Entity Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Yadav"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9812345678"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Assign System Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="farmer">Farmer (Producer)</option>
                  <option value="hub_manager">Hub Manager (PACS/FPO)</option>
                  <option value="bulk_buyer">Bulk Buyer (B2B)</option>
                  <option value="retail_consumer">Retail Consumer (B2C)</option>
                  <option value="driver">Logistics Driver</option>
                  <option value="doca_admin">DoCA Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? 'Creating...' : 'Register Account & Launch View'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
