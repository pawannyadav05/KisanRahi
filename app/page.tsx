'use client';

import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types/kisanrahi';
import { FarmerView } from '@/components/roles/farmer/FarmerView';
import { HubManagerView } from '@/components/roles/hub-manager/HubManagerView';
import { BulkBuyerView } from '@/components/roles/bulk-buyer/BulkBuyerView';
import { RetailConsumerView } from '@/components/roles/retail-consumer/RetailConsumerView';
import { DriverView } from '@/components/roles/driver/DriverView';
import { DoCAAdminView } from '@/components/roles/doca-admin/DoCAAdminView';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/shared/AuthModal';
import { ProfileModal } from '@/components/shared/ProfileModal';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  KeyRound,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
}

export default function Home() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  // Check URL params and active session on load
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          // Auto-launch role dashboard if user is authenticated or came via query param
          setViewMode('app');
        } else {
          // If query param specifies role or app=true
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const roleParam = params.get('role') as UserRole;
            const appParam = params.get('app');
            if (roleParam) {
              setCurrentUser({
                id: 'demo_user',
                name: roleParam === 'farmer' ? 'Ramesh Yadav' : roleParam === 'hub_manager' ? 'Vikas Sharma' : roleParam === 'bulk_buyer' ? 'Patna Caterers' : roleParam === 'retail_consumer' ? 'Priya Verma' : roleParam === 'driver' ? 'Minhaj Ansari' : 'DOCA Officer',
                phone: '9876543210',
                role: roleParam,
              });
              setViewMode('app');
            } else if (appParam === 'true') {
              setViewMode('app');
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false));
  }, []);

  const handleEnterApp = (role?: UserRole) => {
    if (currentUser) {
      setViewMode('app');
    } else if (role) {
      // Set temporary session for demo explore
      setCurrentUser({
        id: 'demo_user',
        name: role === 'farmer' ? 'Ramesh Yadav' : role === 'hub_manager' ? 'Vikas Sharma' : role === 'bulk_buyer' ? 'Patna Caterers Co-op' : role === 'retail_consumer' ? 'Priya Verma' : role === 'driver' ? 'Minhaj Ansari' : 'DOCA Officer',
        phone: '9876543210',
        role: role,
      });
      setViewMode('app');
    } else {
      setIsAuthOpen(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    setViewMode('landing');
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const roleLabel: Record<UserRole, { title: string; color: string }> = {
    farmer: { title: '🌾 Farmer (Producer)', color: 'bg-green-600/20 text-green-300 border-green-500/40' },
    hub_manager: { title: '🏢 Hub Manager (PACS)', color: 'bg-teal-600/20 text-teal-300 border-teal-500/40' },
    bulk_buyer: { title: '🏬 Bulk Buyer (B2B)', color: 'bg-blue-600/20 text-blue-300 border-blue-500/40' },
    retail_consumer: { title: '🛒 Retail Consumer (B2C)', color: 'bg-purple-600/20 text-purple-300 border-purple-500/40' },
    driver: { title: '🚚 Corridor Driver', color: 'bg-amber-600/20 text-amber-300 border-amber-500/40' },
    doca_admin: { title: '🏛️ DoCA Central Command', color: 'bg-red-600/20 text-red-300 border-red-500/40' },
  };

  const activeRole: UserRole = currentUser?.role || 'farmer';

  return (
    <div className="min-h-full flex flex-col">
      {viewMode === 'landing' ? (
        <LandingPage
          onEnterApp={handleEnterApp}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* RBAC Top Status & Security Bar (Replaces old RoleSwitcher) */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setViewMode('landing');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Public Landing Page</span>
              </button>

              <div className="hidden sm:inline text-slate-600">|</div>

              {/* Strict RBAC Active Role Tag */}
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-medium">Active ID:</span>
                <span className="font-bold text-white">
                  {currentUser?.name || 'Authorized User'}
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full border ${roleLabel[activeRole].color}`}
                >
                  <ShieldCheck className="w-3 h-3" />
                  {roleLabel[activeRole].title}
                </span>
              </div>
            </div>

            {/* Account Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Switch Account / Role</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-medium text-xs transition-colors flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Strict RBAC View Render (Only renders authorized view) */}
          <div className="flex-1 py-6">
            {activeRole === 'farmer' && <FarmerView />}
            {activeRole === 'hub_manager' && <HubManagerView />}
            {activeRole === 'bulk_buyer' && <BulkBuyerView />}
            {activeRole === 'retail_consumer' && <RetailConsumerView />}
            {activeRole === 'driver' && <DriverView />}
            {activeRole === 'doca_admin' && <DoCAAdminView />}
          </div>
        </div>
      )}

      {/* Auth Modal (with 6 Farmers, 2 Hubs, 2 Bulk, 2 Retail, 1 Driver, 1 Admin) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(role) => {
          setViewMode('app');
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(updated) => {
          setCurrentUser((prev) => (prev ? { ...prev, name: updated.name } : null));
        }}
      />
    </div>
  );
}
