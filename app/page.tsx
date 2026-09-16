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

  // Check cached session, URL params, and active session on load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if page was reloaded/refreshed
      const navEntries = window.performance?.getEntriesByType
        ? window.performance.getEntriesByType('navigation')
        : [];
      const isReload = navEntries.length > 0
        ? (navEntries[0] as PerformanceNavigationTiming).type === 'reload'
        : Boolean((window.performance as any)?.navigation?.type === 1);

      if (isReload) {
        // Refresh requested -> clear session and redirect to /login
        localStorage.removeItem('kisanrahi_user');
        sessionStorage.removeItem('kr_session_active');
        fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
        window.location.href = '/login';
        return;
      }

      const cachedUser = localStorage.getItem('kisanrahi_user');
      const params = new URLSearchParams(window.location.search);
      const appParam = params.get('app');
      const roleParam = params.get('role') as UserRole;

      if (cachedUser) {
        try {
          const parsed = JSON.parse(cachedUser);
          setCurrentUser(parsed);
          setViewMode('app');
        } catch {}
      } else if (appParam === 'true' || roleParam) {
        const defaultRole = roleParam || 'farmer';
        const defaultUser: UserSession = {
          id: defaultRole === 'farmer' ? 'F1' : 'U1',
          name: defaultRole === 'farmer' ? 'Ramesh Yadav' : defaultRole === 'hub_manager' ? 'Vikas Sharma' : defaultRole === 'bulk_buyer' ? 'Patna Caterers' : defaultRole === 'retail_consumer' ? 'Priya Verma' : defaultRole === 'driver' ? 'Minhaj Ansari' : 'DOCA Officer',
          phone: '9876543210',
          role: defaultRole,
        };
        setCurrentUser(defaultUser);
        setViewMode('app');
      }
    }

    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setCurrentUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('kisanrahi_user', JSON.stringify(data.user));
          }
          setViewMode('app');
        }
      })
      .catch(() => {})
      .finally(() => setLoadingSession(false));

    const handleProfileEvent = (e: any) => {
      if (e.detail) {
        setCurrentUser((prev) => (prev ? { ...prev, ...e.detail, name: e.detail.name || prev.name } : null));
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem('kisanrahi_user');
          if (cached) {
            try {
              const parsed = JSON.parse(cached);
              Object.assign(parsed, e.detail);
              localStorage.setItem('kisanrahi_user', JSON.stringify(parsed));
            } catch {}
          }
        }
      }
    };

    window.addEventListener('kisanrahi_profile_updated', handleProfileEvent);
    return () => {
      window.removeEventListener('kisanrahi_profile_updated', handleProfileEvent);
    };
  }, []);

  const handleEnterApp = (role?: UserRole) => {
    if (currentUser) {
      setViewMode('app');
    } else {
      setIsAuthOpen(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kisanrahi_user');
      sessionStorage.removeItem('kr_session_active');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    setViewMode('landing');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const handleSwitchRole = async () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kisanrahi_user');
      sessionStorage.removeItem('kr_session_active');
    }
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const roleLabel: Record<UserRole, { title: string; color: string }> = {
    farmer: { title: '🌾 Farmer (Producer)', color: 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20 border-emerald-400' },
    hub_manager: { title: '🏢 Hub Manager (PACS)', color: 'bg-teal-500 text-slate-950 font-black shadow-md border-teal-400' },
    bulk_buyer: { title: '🏬 Bulk Buyer (B2B)', color: 'bg-blue-500 text-slate-950 font-black shadow-md border-blue-400' },
    retail_consumer: { title: '🛒 Retail Consumer (B2C)', color: 'bg-purple-500 text-slate-950 font-black shadow-md border-purple-400' },
    driver: { title: '🚚 Corridor Driver', color: 'bg-amber-500 text-slate-950 font-black shadow-md border-amber-400' },
    doca_admin: { title: '🏛️ DoCA Central Command', color: 'bg-red-500 text-white font-black shadow-md border-red-400' },
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
          {/* RBAC Top Status & Security Bar */}
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
                <span className="font-extrabold text-white text-sm">
                  {currentUser?.name || 'Authorized User'}{' '}
                  <span className="text-emerald-400 font-extrabold text-xs ml-0.5">
                    (ID: {currentUser?.id || 'F1'})
                  </span>
                </span>
                <span
                  className={`inline-flex items-center gap-1 font-black text-[11px] px-3 py-1 rounded-full border ${roleLabel[activeRole].color}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {roleLabel[activeRole].title}
                </span>
              </div>
            </div>

            {/* Account Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsProfileOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>My Profile</span>
              </button>

              <button
                onClick={handleSwitchRole}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Switch Account / Role</span>
              </button>

              <button
                onClick={handleLogout}
                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 font-medium text-xs transition-colors flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Strict RBAC View Render */}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(userOrRole) => {
          if (typeof userOrRole === 'object' && userOrRole) {
            setCurrentUser(userOrRole);
            if (typeof window !== 'undefined') {
              localStorage.setItem('kisanrahi_user', JSON.stringify(userOrRole));
              sessionStorage.setItem('kr_session_active', '1');
            }
          }
          setViewMode('app');
        }}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(updated) => {
          setCurrentUser((prev) => (prev ? { ...prev, name: updated.name } : null));
          if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('kisanrahi_user');
            if (cached) {
              try {
                const parsed = JSON.parse(cached);
                parsed.name = updated.name;
                localStorage.setItem('kisanrahi_user', JSON.stringify(parsed));
              } catch {}
            }
          }
        }}
      />
    </div>
  );
}
