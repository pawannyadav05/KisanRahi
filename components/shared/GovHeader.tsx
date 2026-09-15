'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wifi,
  WifiOff,
  Sun,
  Moon,
  UserCheck,
  LogOut,
  LogIn,
  User,
  Settings,
  ChevronDown,
} from 'lucide-react';
import type { Language, UserRole } from '@/types/kisanrahi';
import { ProfileModal } from './ProfileModal';
import { AuthModal } from './AuthModal';

interface GovHeaderProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string | null;
}

export const GovHeader: React.FC<GovHeaderProps> = ({
  language = 'en',
  onLanguageChange,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [currentLang, setCurrentLang] = useState<Language>(language);
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [session, setSession] = useState<UserSession | null>(null);

  // Modals
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check user session
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated && data?.user) {
          setSession(data.user);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      setShowDropdown(false);
      window.location.href = '/login';
    } catch {}
  };

  const handleLangToggle = (lang: Language) => {
    setCurrentLang(lang);
    if (onLanguageChange) onLanguageChange(lang);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    if (document.documentElement) {
      document.documentElement.classList.toggle('high-contrast');
    }
  };

  const roleEmoji: Record<UserRole, string> = {
    farmer: '🌾 Farmer',
    hub_manager: '🏢 Hub Manager',
    bulk_buyer: '🏬 Bulk Buyer',
    retail_consumer: '🛒 Consumer',
    driver: '🚚 Driver',
    doca_admin: '🏛️ DoCA Admin',
  };

  return (
    <>
      <header
        className={`w-full ${
          highContrast ? 'bg-black text-yellow-300' : 'bg-navy text-white'
        } transition-colors duration-200 relative z-40`}
      >
        {/* Top National Identity Bar */}
        <div className="border-b border-navyLight/50 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-sans">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-saffron">भारत सरकार</span>
            <span className="text-gray-400">|</span>
            <span className="font-medium text-gray-200">Government of India</span>
            <span className="hidden md:inline text-gray-400">|</span>
            <span className="hidden md:inline text-gray-300">
              उपभोक्ता मामले विभाग | DoCA
            </span>
          </div>

          <div className="flex items-center space-x-3 mt-1 sm:mt-0">
            {/* Online/Offline Badge */}
            <div
              className={`flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
                isOnline
                  ? 'bg-green/20 text-emerald-300 border border-green/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="w-3 h-3 mr-1 text-emerald-400 animate-pulse" />
                  <span>● ऑनलाइन (Online)</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 mr-1 text-amber-400" />
                  <span>○ ऑफलाइन सुरक्षित (Offline Cached)</span>
                </>
              )}
            </div>

            {/* Text Size Controls */}
            <div className="flex items-center border border-gray-600 rounded overflow-hidden text-[11px]">
              <button
                onClick={() => setTextSize('sm')}
                className={`px-1.5 py-0.5 ${
                  textSize === 'sm'
                    ? 'bg-saffron text-white font-bold'
                    : 'hover:bg-navyLight'
                }`}
                title="Small Text"
              >
                A-
              </button>
              <button
                onClick={() => setTextSize('md')}
                className={`px-1.5 py-0.5 ${
                  textSize === 'md'
                    ? 'bg-saffron text-white font-bold'
                    : 'hover:bg-navyLight'
                }`}
                title="Normal Text"
              >
                A
              </button>
              <button
                onClick={() => setTextSize('lg')}
                className={`px-1.5 py-0.5 ${
                  textSize === 'lg'
                    ? 'bg-saffron text-white font-bold'
                    : 'hover:bg-navyLight'
                }`}
                title="Large Text"
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              onClick={toggleHighContrast}
              className="p-1 rounded hover:bg-navyLight transition-colors"
              title="Toggle High Contrast"
            >
              {highContrast ? (
                <Sun className="w-3.5 h-3.5 text-yellow-300" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-gray-300" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-navyLight/80 rounded px-1 text-[11px]">
              <button
                onClick={() => handleLangToggle('hi')}
                className={`px-1.5 py-0.5 rounded font-semibold ${
                  currentLang === 'hi'
                    ? 'bg-green text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => handleLangToggle('en')}
                className={`px-1.5 py-0.5 rounded font-semibold ${
                  currentLang === 'en'
                    ? 'bg-green text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </div>

        {/* App Main Title & Branding Bar */}
        <div className="px-4 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green to-saffron flex items-center justify-center font-black text-xl text-white shadow-md group-hover:scale-105 transition-transform">
              KR
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                KisanRahi
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-saffron text-white">
                  PWA Active
                </span>
              </h1>
              <p className="text-xs text-gray-300">
                Direct Farm-to-Buyer Pooling & Voice Logistics Platform
              </p>
            </div>
          </Link>

          {/* User Session / Auth Quick Action */}
          <div className="flex items-center space-x-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-navyLight/90 hover:bg-navyLight border border-slate-600 px-3 py-1.5 rounded-xl text-xs transition-all shadow-sm"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow">
                    {session.name ? session.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white text-xs truncate max-w-[120px]">
                      {session.name}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-medium">
                      {roleEmoji[session.role] || session.role}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <div className="font-bold text-white truncate">{session.name}</div>
                      <div className="text-[11px] text-slate-400">{session.phone}</div>
                    </div>

                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setIsProfileOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-400" />
                      Edit Profile & Address
                    </button>

                    <Link
                      href="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-blue-400" />
                      Full Account Settings
                    </Link>

                    <Link
                      href="/login"
                      onClick={() => setShowDropdown(false)}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <LogIn className="w-4 h-4 text-amber-400" />
                      Switch Role / Demo Account
                    </Link>

                    <div className="border-t border-slate-800 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full px-3 py-2 text-left text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all shadow-md hover:shadow-emerald-500/20"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login / Sign Up</span>
                </button>
                <Link
                  href="/login"
                  className="hidden md:inline-flex items-center px-2.5 py-1.5 rounded-xl bg-navyLight hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-600 transition-colors"
                >
                  ⚡ 1-Click Demo
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onProfileUpdated={(updated) => {
          setSession((prev) => (prev ? { ...prev, name: updated.name } : null));
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => {
          fetch('/api/auth/me')
            .then((r) => r.json())
            .then((d) => {
              if (d?.authenticated && d?.user) setSession(d.user);
            });
        }}
      />
    </>
  );
};
