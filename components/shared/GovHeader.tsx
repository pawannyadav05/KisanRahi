'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wifi, WifiOff, Sun, Moon, UserCheck, LogOut, LogIn } from 'lucide-react';
import type { Language, UserRole } from '@/types/kisanrahi';

interface GovHeaderProps {
  language?: Language;
  onLanguageChange?: (lang: Language) => void;
}

interface UserSession {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
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

  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check user session
    fetch('/api/auth/me')
      .then((res) => res.ok ? res.json() : null)
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

  return (
    <header className={`w-full ${highContrast ? 'bg-black text-yellow-300' : 'bg-navy text-white'} transition-colors duration-200`}>
      {/* Top National Identity Bar */}
      <div className="border-b border-navyLight/50 px-4 py-1.5 flex flex-wrap items-center justify-between text-xs font-sans">
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-saffron">भारत सरकार</span>
          <span className="text-gray-400">|</span>
          <span className="font-medium text-gray-200">Government of India</span>
          <span className="hidden md:inline text-gray-400">|</span>
          <span className="hidden md:inline text-gray-300">उपभोक्ता मामले विभाग | DoCA</span>
        </div>

        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
          {/* Online/Offline Badge */}
          <div className={`flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium ${
            isOnline 
              ? 'bg-green/20 text-emerald-300 border border-green/40' 
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
          }`}>
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
              className={`px-1.5 py-0.5 ${textSize === 'sm' ? 'bg-saffron text-white font-bold' : 'hover:bg-navyLight'}`}
              title="Small Text"
            >
              A-
            </button>
            <button
              onClick={() => setTextSize('md')}
              className={`px-1.5 py-0.5 ${textSize === 'md' ? 'bg-saffron text-white font-bold' : 'hover:bg-navyLight'}`}
              title="Normal Text"
            >
              A
            </button>
            <button
              onClick={() => setTextSize('lg')}
              className={`px-1.5 py-0.5 ${textSize === 'lg' ? 'bg-saffron text-white font-bold' : 'hover:bg-navyLight'}`}
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
            {highContrast ? <Sun className="w-3.5 h-3.5 text-yellow-300" /> : <Moon className="w-3.5 h-3.5 text-gray-300" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-navyLight/80 rounded px-1 text-[11px]">
            <button
              onClick={() => handleLangToggle('hi')}
              className={`px-1.5 py-0.5 rounded font-semibold ${currentLang === 'hi' ? 'bg-green text-white' : 'text-gray-300 hover:text-white'}`}
            >
              हिंदी
            </button>
            <button
              onClick={() => handleLangToggle('en')}
              className={`px-1.5 py-0.5 rounded font-semibold ${currentLang === 'en' ? 'bg-green text-white' : 'text-gray-300 hover:text-white'}`}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* App Main Title & Branding Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-green to-saffron flex items-center justify-center font-black text-xl text-white shadow-md">
            KR
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              KisanRahi
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-saffron text-white">
                PWA Active
              </span>
            </h1>
            <p className="text-xs text-gray-300">Direct Farm-to-Buyer Pooling & Voice Logistics Platform</p>
          </div>
        </div>

        {/* User Session / Auth Quick Action */}
        <div className="flex items-center space-x-2">
          {session ? (
            <div className="flex items-center space-x-2 bg-navyLight/90 border border-navyLight px-3 py-1.5 rounded-lg text-xs">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <div className="hidden sm:block">
                <span className="font-bold text-white">{session.name}</span>
                <span className="text-gray-400 ml-1">({session.role})</span>
              </div>
              <button
                onClick={handleLogout}
                className="ml-2 px-2 py-0.5 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40 transition-colors text-[11px] flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
                <span className="hidden md:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / 1-Click Demo</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
