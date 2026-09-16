'use client';

import React from 'react';
import type { UserRole } from '@/types/kisanrahi';
import { User, Store, ShoppingBag, Users, Truck, ShieldAlert } from 'lucide-react';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleSelect: (role: UserRole) => void;
}

const roles: { id: UserRole; label: string; viewName: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'farmer', label: 'Farmer', viewName: 'View A', icon: User },
  { id: 'hub_manager', label: 'FPO Hub Manager', viewName: 'View B', icon: Store },
  { id: 'bulk_buyer', label: 'Bulk Buyer', viewName: 'View C', icon: ShoppingBag },
  { id: 'retail_consumer', label: 'Retail Consumer / RWA', viewName: 'View D', icon: Users },
  { id: 'driver', label: '3PL Driver', viewName: 'View E', icon: Truck },
  { id: 'doca_admin', label: 'DoCA Admin', viewName: 'View F', icon: ShieldAlert },
];

export const RoleSwitcher: React.FC<RoleSwitcherProps> = ({ currentRole, onRoleSelect }) => {
  return (
    <div className="w-full bg-navyLight/90 text-white border-b border-navyLight px-4 py-2 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
          <span className="w-2 h-2 rounded-full bg-saffron animate-ping" />
          <span>Demo Role Switcher:</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-1.5 w-full sm:w-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const active = currentRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => onRoleSelect(role.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  active
                    ? 'bg-saffron text-white shadow font-bold ring-2 ring-saffron/40'
                    : 'bg-navy/70 text-gray-200 hover:bg-navy hover:text-white border border-gray-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{role.label}</span>
                <span className={`text-[10px] px-1 rounded ${active ? 'bg-black/20 text-white' : 'bg-navyLight text-gray-400'}`}>
                  {role.viewName}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
