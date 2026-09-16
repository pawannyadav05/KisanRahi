
'use client';

import React, { useState, useMemo } from 'react';
import {
  X,
  Phone,
  Lock,
  User,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Shield,
  Search,
  Tractor,
  Store,
  ShoppingBag,
  Users,
  Truck,
  ShieldAlert,
  ChevronRight,
  Landmark
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';
const FALLBACK_USERS: Record<string, any> = {
  '9876543210': { id: 'F1', name: 'Ramesh Yadav', phone: '9876543210', category: 'farmer', village: 'Sasaram PACS Zone', farmSizeAcres: 5.5, password: 'password123' },
  '9876543211': { id: 'F2', name: 'Sunita Devi', phone: '9876543211', category: 'farmer', village: 'Sasaram North', farmSizeAcres: 3.2, password: 'password123' },
  '9876543217': { id: 'F3', name: 'Bimal Singh', phone: '9876543217', category: 'farmer', village: 'Nokha Village', farmSizeAcres: 4.8, password: 'password123' },
  '9876543218': { id: 'F4', name: 'Rajeshwar Kushwaha', phone: '9876543218', category: 'farmer', village: 'Kargahar Mandi Zone', farmSizeAcres: 6.0, password: 'password123' },
  '9876543219': { id: 'F5', name: 'Meena Kumari', phone: '9876543219', category: 'farmer', village: 'Chenari Hills FPO', farmSizeAcres: 2.5, password: 'password123' },
  '9876543220': { id: 'F6', name: 'Dharmendra Mahto', phone: '9876543220', category: 'farmer', village: 'Dehri-on-Sone Aggregation', farmSizeAcres: 7.1, password: 'password123' },
  '9876543212': { id: 'HM1', name: 'Vikas Sharma', phone: '9876543212', category: 'hub_manager', village: 'Sasaram Hub #3', district: 'Rohtas', password: 'password123' },
  '9876543221': { id: 'HM2', name: 'Anita Choudhary', phone: '9876543221', category: 'hub_manager', village: 'Dehri FPO Aggregation Centre', district: 'Rohtas', password: 'password123' },
  '9876543213': { id: 'B1', name: 'Patna Caterers Co-op', phone: '9876543213', category: 'bulk_buyer', businessName: 'Patna Caterers Co-operative Apex', district: 'Patna', password: 'password123' },
  '9876543222': { id: 'B2', name: 'Magadh Agro Processing Ltd', phone: '9876543222', category: 'bulk_buyer', businessName: 'Magadh Agro Food Processing Ltd', district: 'Gaya', password: 'password123' },
  '9876543214': { id: 'RC1', name: 'Priya Verma', phone: '9876543214', category: 'retail_consumer', village: 'Patna Central B2C Area', district: 'Patna', password: 'password123' },
  '9876543223': { id: 'RC2', name: 'Amit Kumar', phone: '9876543223', category: 'retail_consumer', village: 'Danapur Railway Colony B2C', district: 'Patna', password: 'password123' },
  '9876543215': { id: 'D1', name: 'Minhaj Ansari', phone: '9876543215', category: 'driver', village: 'Sasaram-Patna Corridor', district: 'Rohtas', password: 'password123' },
  '9876543216': { id: 'A1', name: 'DOCA Officer R.K. Mehta', phone: '9876543216', category: 'doca_admin', village: 'DoCA Central Command', district: 'New Delhi', password: 'password123' },
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [tab, setTab] = useState<'quick' | 'phone' | 'register'>('quick');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fallbackUsersList = useMemo(() => Object.values(FALLBACK_USERS), []);

  const filteredUsers = useMemo(() => {
    return fallbackUsersList.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.village && user.village.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.businessName && user.businessName.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = activeCategoryFilter === 'all' || user.category === activeCategoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategoryFilter, fallbackUsersList]);

  if (!isOpen) return null;

  const handleAuthSuccess = (user: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kisanrahi_user', JSON.stringify(user));
      sessionStorage.setItem('kr_session_active', '1');
    }
    onClose();
    if (onSuccess) onSuccess(user);
  };

  const handleLoginSubmit = async (phoneToLogin: string, pwdToLogin: string, e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneToLogin, password: pwdToLogin }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      setSuccess(`Welcome, ${data.user.name}! Redirecting to Dashboard...`);
      setTimeout(() => {
        handleAuthSuccess(data.user);
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Login failed');
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
      setSuccess(`Signed in with Google! Redirecting...`);
      setTimeout(() => {
        handleAuthSuccess(data.user);
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Google authentication failed');
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
        body: JSON.stringify({ name, phone, password: password || 'password123', role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess(`Account created! Redirecting...`);
      setTimeout(() => {
        handleAuthSuccess(data.user);
      }, 50);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'All Roles' },
    { id: 'farmer', label: 'Farmers', icon: Tractor, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { id: 'hub_manager', label: 'Hubs / PACS', icon: Store, color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
    { id: 'bulk_buyer', label: 'B2B / Buyers', icon: ShoppingBag, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { id: 'retail_consumer', label: 'B2C Consumers', icon: Users, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
    { id: 'driver', label: 'Drivers', icon: Truck, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
    { id: 'doca_admin', label: 'Admin', icon: ShieldAlert, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#081B33]/90 backdrop-blur-md flex flex-col items-center py-6 px-4 sm:px-6">
      
      {/* Government Style Top Bar */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-white/5 border-b border-white/10 flex items-center justify-between px-4 sm:px-8 text-[11px] font-medium text-white/80 tracking-wide z-10 backdrop-blur-lg hidden sm:flex">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5 text-orange-400" />
            भारत सरकार | Government of India
          </span>
          <span className="text-white/30">|</span>
          <span>उपभोक्ता मामले विभाग | DoCA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="bg-saffron/20 text-saffron px-2 py-0.5 rounded border border-saffron/30 font-bold">Smart India Hackathon 2026 Prototype</span>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-2">
            <button className="hover:text-white transition-colors">हिंदी</button>
            <span className="text-white/30">|</span>
            <button className="text-white font-bold">EN</button>
          </div>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-1.5">
            <button className="hover:text-white transition-colors">A-</button>
            <button className="hover:text-white transition-colors">A</button>
            <button className="hover:text-white transition-colors">A+</button>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[760px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mt-8 sm:mt-10 flex flex-col max-h-[85vh] relative z-20">
        
        {/* Header */}
        <div className="bg-[#081B33] text-white p-5 sm:p-6 relative shrink-0">
          <button onClick={onClose} className="absolute top-5 right-5 p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-green to-saffron flex items-center justify-center font-extrabold text-xl text-white shadow-lg shrink-0 border border-white/20">
              KR
            </div>
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-5 h-5 text-green" />
                KisanRahi RBAC Authentication
              </h2>
              <p className="text-sm text-blue-200/80 mt-1">Strict Role-Based Access Control Protected</p>
              <p className="text-xs text-white/50 mt-1">Secure Digital Access • Direct Farm-to-Buyer Pooling & Voice Logistics Platform</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0 bg-slate-50/50">
          {[
            { id: 'quick', label: 'Quick Role Logins' },
            { id: 'phone', label: 'Phone Login' },
            { id: 'register', label: 'Register New ID' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id as any); setError(null); setSuccess(null); }}
              className={`flex-1 py-3.5 text-sm font-semibold transition-colors border-b-2 ${
                tab === t.id 
                  ? 'border-saffron text-saffron bg-white' 
                  : 'border-transparent text-slate-500 hover:text-navy hover:bg-slate-100/50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/30">
          
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green/5 border border-green/20 text-green text-sm flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Quick Role Logins Tab */}
          {tab === 'quick' && (
            <div className="space-y-5 animate-fade-in">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search by name, ID or org..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-colors bg-white"
                  />
                </div>
                
                {/* Category Filters */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 hide-scrollbar">
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setActiveCategoryFilter(c.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeCategoryFilter === c.id 
                          ? 'bg-navy text-white shadow-sm' 
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredUsers.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                    No matching demonstration accounts found.
                  </div>
                ) : (
                  filteredUsers.map(user => {
                    const catInfo = categories.find(c => c.id === user.category) || categories[1];
                    const Icon = catInfo.icon || User;
                    
                    let subtext = '';
                    if (user.category === 'farmer') subtext = `${user.village || 'Farmer'} • ${user.farmSizeAcres} Acres`;
                    else if (user.category === 'bulk_buyer') subtext = `${user.businessName || 'B2B'} • ${user.district || 'Location'}`;
                    else subtext = `${user.village || 'Demo'} • ${user.district || 'Location'}`;

                    return (
                      <button
                        key={user.id}
                        onClick={() => handleLoginSubmit(user.phone, user.password || 'password123')}
                        disabled={loading}
                        className={`flex items-start text-left gap-3 p-3.5 rounded-xl border transition-all duration-200 group hover:-translate-y-0.5 hover:shadow-md bg-white ${catInfo.border} hover:border-saffron`}
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${catInfo.bg} ${catInfo.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-bold text-navy truncate text-sm">{user.name}</h3>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0 border border-slate-200">
                              {user.id}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mt-0.5">{subtext}</p>
                          <p className="text-[10px] text-slate-400 mt-1 opacity-60">ID: {user.phone.replace(/(\d{4})(\d{3})(\d{3})/, '•••• $2 $3')}</p>
                        </div>
                        <div className="pt-2 shrink-0 text-slate-300 group-hover:text-saffron transition-colors">
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          )}

          {/* Phone Login Tab */}
          {tab === 'phone' && (
            <div className="max-w-sm mx-auto space-y-5 animate-fade-in py-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-navy">Manual Login</h3>
                <p className="text-sm text-slate-500 mt-1">Enter your registered mobile number</p>
              </div>

              <form onSubmit={(e) => handleLoginSubmit(phone, password || 'password123', e)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number / User ID</label>
                  <div className="flex shadow-sm">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-500 font-bold">+91</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter mobile number"
                      className="w-full px-3 py-2.5 rounded-r-lg border border-slate-300 text-navy text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                  <div className="relative shadow-sm">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Enter your password" 
                      className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-navy text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all" 
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#081B33] text-white font-bold text-sm hover:bg-navy transition-colors flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  {loading ? 'Authenticating...' : 'Secure Login'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 border-t border-slate-200" />
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">OR</span>
                <div className="flex-1 border-t border-slate-200" />
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-2.5 rounded-lg bg-white text-slate-700 font-semibold text-sm border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2.5 shadow-sm"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            </div>
          )}

          {/* Register New ID Tab */}
          {tab === 'register' && (
            <div className="max-w-sm mx-auto animate-fade-in py-2">
              <div className="text-center mb-5">
                <h3 className="text-lg font-bold text-navy">New Registration</h3>
                <p className="text-sm text-slate-500 mt-1">Create a new role-based account</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
                  <div className="relative shadow-sm">
                    <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your full name" className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-navy text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Mobile Number</label>
                  <div className="flex shadow-sm">
                    <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-sm text-slate-500 font-bold">+91</span>
                    <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="Enter mobile number" className="w-full px-3 py-2.5 rounded-r-lg border border-slate-300 text-navy text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Create Password</label>
                  <div className="relative shadow-sm">
                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a strong password" className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-navy text-sm bg-white placeholder-slate-400 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Role Category</label>
                  <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full px-3 py-2.5 rounded-lg border border-slate-300 text-navy text-sm bg-white focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition-all shadow-sm">
                    <option value="farmer">🌾 Farmer / Producer / FPO</option>
                    <option value="hub_manager">🏢 Hub Manager / PACS</option>
                    <option value="bulk_buyer">🏭 Bulk Buyer / Processor</option>
                    <option value="retail_consumer">🏠 Retail Consumer (B2C)</option>
                    <option value="driver">🚚 Logistics Driver</option>
                  </select>
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-lg bg-green text-white font-bold text-sm hover:bg-greenDark transition-colors flex items-center justify-center gap-2 mt-2 shadow-md hover:shadow-lg">
                  {loading ? 'Creating Account...' : 'Register Account'} 
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

        </div>

        {/* Security / Trust Footer */}
        <div className="bg-slate-100/80 border-t border-slate-200 p-3 sm:px-6 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3 text-emerald-600" /> Secure Authentication</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-blue-600" /> Role-Based Access</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1">🌾 Farmer-First Platform</span>
          </div>
          <div className="text-slate-400 font-semibold uppercase tracking-wider">
            Smart India Hackathon 2026 Prototype
          </div>
        </div>

      </div>
    </div>
  );
};
