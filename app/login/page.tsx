'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AuthModal } from '@/components/shared/AuthModal';

export default function LoginPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#081B33]">
      <AuthModal 
        isOpen={true} 
        onClose={() => router.push('/')} 
      />
    </div>
  );
}
