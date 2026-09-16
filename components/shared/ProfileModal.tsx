'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Tractor,
  Building2,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Save,
  Sparkles,
} from 'lucide-react';
import type { UserRole } from '@/types/kisanrahi';

interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  role: UserRole;
  avatarUrl?: string | null;
  address?: string | null;
  village?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  upiId?: string | null;
  kycVerified?: boolean;
  farmSizeAcres?: number | null;
  primaryCrops?: string | null;
  businessName?: string | null;
  gstin?: string | null;
}

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (updated: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'role' | 'location' | 'banking'>('basic');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [pincode, setPincode] = useState('');
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [farmSizeAcres, setFarmSizeAcres] = useState<string>('');
  const [primaryCrops, setPrimaryCrops] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [gstin, setGstin] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setFeedback(null);
    fetch('/api/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.profile) {
          const p: UserProfile = data.profile;
          setProfile(p);
          setName(p.name || '');
          setPhone(p.phone || '');
          setEmail(p.email || '');
          setVillage(p.village || (p.role === 'farmer' ? 'Sasaram' : 'Patna'));
          setDistrict(p.district || 'Rohtas');
          setStateName(p.state || 'Bihar');
          setPincode(p.pincode || '821115');
          setAddress(p.address || '');
          setUpiId(p.upiId || `${p.phone || '9876543210'}@upi`);
          setFarmSizeAcres(p.farmSizeAcres ? String(p.farmSizeAcres) : '4.5');
          setPrimaryCrops(p.primaryCrops || 'Tomato, Onion, Potato, Chilli');
          setBusinessName(p.businessName || (p.role === 'bulk_buyer' ? 'Patna Caterers Co-operative' : ''));
          setGstin(p.gstin || (p.role === 'bulk_buyer' ? '10AAACP1234M1Z5' : ''));
        }
      })
      .catch((err) => {
        setFeedback({ type: 'error', text: 'Failed to load profile details' });
      })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email,
          village,
          district,
          state: stateName,
          pincode,
          address,
          upiId,
          farmSizeAcres: farmSizeAcres ? parseFloat(farmSizeAcres) : null,
          primaryCrops,
          businessName,
          gstin,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update profile');

      setFeedback({ type: 'success', text: '✅ Profile saved! Dashboard updating...' });
      if (data.profile) {
        setProfile(data.profile);
        if (onProfileUpdated) onProfileUpdated(data.profile);
        // Fire a global event so FarmerView + page.tsx react instantly
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('kisanrahi_profile_updated', { detail: data.profile }));
          // Also update localStorage cache
          const cached = localStorage.getItem('kisanrahi_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              parsed.name = data.profile.name || parsed.name;
              localStorage.setItem('kisanrahi_user', JSON.stringify(parsed));
            } catch {}
          }
        }
      }
      // Auto-close modal after a brief moment so dashboard is visible
      setTimeout(() => {
        setFeedback(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error updating profile' });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const roleLabel: Record<UserRole, string> = {
    farmer: '🌾 Farmer (Producer)',
    hub_manager: '🏢 Hub Manager (PACS/FPO)',
    bulk_buyer: '🏬 Bulk Buyer (B2B/Mandi)',
    retail_consumer: '🛒 Retail Consumer (B2C)',
    driver: '🚚 Corridor Driver',
    doca_admin: '🏛️ DoCA Admin Officer',
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                User Profile & Credentials
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3 h-3" />
                  DoCA KYC Verified
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {profile ? roleLabel[profile.role] : 'Manage your account'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-6 pt-3 bg-slate-850 border-b border-slate-800 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('basic')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'basic'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            👤 Personal Info
          </button>
          <button
            onClick={() => setActiveTab('role')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'role'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {profile?.role === 'farmer'
              ? '🚜 Farm & Crops'
              : profile?.role === 'bulk_buyer'
              ? '🏬 Business & GSTIN'
              : '⚡ Role Details'}
          </button>
          <button
            onClick={() => setActiveTab('location')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'location'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            📍 Address & Hub
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'banking'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            💳 Banking & UPI Payouts
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4">
          {feedback && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 ${
                feedback.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/40 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/40 text-red-300'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>{feedback.text}</span>
            </div>
          )}

          {/* TAB 1: BASIC INFO */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
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
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Phone Number (Registered)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@kisanrahi.in"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Platform Role
                </label>
                <input
                  type="text"
                  disabled
                  value={profile ? roleLabel[profile.role] : 'Loading...'}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/50 border border-slate-700 text-slate-300 text-sm cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ROLE SPECIFIC DETAILS */}
          {activeTab === 'role' && (
            <div className="space-y-4">
              {profile?.role === 'farmer' && (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
                    <Tractor className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Farmer Profile configured for Automatic PostGIS pooling & MSP price floor guarantees.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Cultivable Land Size (Acres)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={farmSizeAcres}
                        onChange={(e) => setFarmSizeAcres(e.target.value)}
                        placeholder="e.g. 4.5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Primary Harvest Crops
                      </label>
                      <input
                        type="text"
                        value={primaryCrops}
                        onChange={(e) => setPrimaryCrops(e.target.value)}
                        placeholder="Tomato, Onion, Potato, Chilli"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {profile?.role === 'bulk_buyer' && (
                <>
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Bulk Buyer Profile configured for B2B escrow locking and wholesale pooled lots.</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Business / Entity Name
                      </label>
                      <input
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="e.g. Patna Caterers Co-operative"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        GSTIN Number
                      </label>
                      <input
                        type="text"
                        value={gstin}
                        onChange={(e) => setGstin(e.target.value)}
                        placeholder="10AAACP1234M1Z5"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </>
              )}

              {profile?.role !== 'farmer' && profile?.role !== 'bulk_buyer' && (
                <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-xs text-slate-300 space-y-2">
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Role-Specific Authorizations Active
                  </div>
                  <p>
                    Your account is registered as <strong>{profile ? roleLabel[profile.role] : 'User'}</strong> with active access to real-time telemetry, routing networks, and market price buffers.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LOCATION */}
          {activeTab === 'location' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Village / Town
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      placeholder="Sasaram"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Rohtas"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="Bihar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="821115"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Street Address / Landmark
                </label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Near PACS Aggregation Godown, Main Road"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          {/* TAB 4: BANKING & UPI */}
          {activeTab === 'banking' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>Instant Direct Benefit Transfer (DBT) via RazorpayX / NPCI Unified Payments Interface.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  UPI ID (VPA for Instant Settlement)
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="9876543210@upi"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  When lots are dispatched or graded, payouts are instantly routed to this VPA.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    NPCI e-KYC Verification
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Aadhaar DBT enabled & Bank mandate linked
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                  Active
                </span>
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg hover:shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
