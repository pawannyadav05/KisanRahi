'use client';

import React, { useState, useEffect } from 'react';
import type { UserRole } from '@/types/kisanrahi';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { FarmerView } from '@/components/roles/farmer/FarmerView';
import { HubManagerView } from '@/components/roles/hub-manager/HubManagerView';
import { BulkBuyerView } from '@/components/roles/bulk-buyer/BulkBuyerView';
import { RetailConsumerView } from '@/components/roles/retail-consumer/RetailConsumerView';
import { DriverView } from '@/components/roles/driver/DriverView';
import { DoCAAdminView } from '@/components/roles/doca-admin/DoCAAdminView';
import { LandingPage } from '@/components/landing/LandingPage';
import { AuthModal } from '@/components/shared/AuthModal';
import { ArrowLeft, Home as HomeIcon } from 'lucide-react';

export default function Home() {
  const [viewMode, setViewMode] = useState<'landing' | 'app'>('landing');
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Check if user came with a specific hash or session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role') as UserRole;
      const appParam = params.get('app');
      if (roleParam) {
        setCurrentRole(roleParam);
        setViewMode('app');
      } else if (appParam === 'true') {
        setViewMode('app');
      }
    }
  }, []);

  const handleEnterApp = (role?: UserRole) => {
    if (role) {
      setCurrentRole(role);
    }
    setViewMode('app');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-full flex flex-col">
      {viewMode === 'landing' ? (
        <LandingPage
          onEnterApp={handleEnterApp}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Navigation Bar to return to Landing Page */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
            <button
              onClick={() => {
                setViewMode('landing');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white font-semibold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Back to Public Landing Page</span>
            </button>

            <div className="flex items-center gap-2 text-slate-400">
              <span className="hidden sm:inline">Active View:</span>
              <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Role Switcher Toolbar */}
          <RoleSwitcher currentRole={currentRole} onRoleSelect={setCurrentRole} />

          {/* Role View Render */}
          <div className="flex-1 py-6">
            {currentRole === 'farmer' && <FarmerView />}
            {currentRole === 'hub_manager' && <HubManagerView />}
            {currentRole === 'bulk_buyer' && <BulkBuyerView />}
            {currentRole === 'retail_consumer' && <RetailConsumerView />}
            {currentRole === 'driver' && <DriverView />}
            {currentRole === 'doca_admin' && <DoCAAdminView />}
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          setViewMode('app');
        }}
      />
    </div>
  );
}
