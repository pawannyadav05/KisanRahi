'use client';

import React, { useState } from 'react';
import type { UserRole } from '@/types/kisanrahi';
import { RoleSwitcher } from '@/components/shared/RoleSwitcher';
import { FarmerView } from '@/components/roles/farmer/FarmerView';
import { HubManagerView } from '@/components/roles/hub-manager/HubManagerView';
import { BulkBuyerView } from '@/components/roles/bulk-buyer/BulkBuyerView';
import { RetailConsumerView } from '@/components/roles/retail-consumer/RetailConsumerView';
import { DriverView } from '@/components/roles/driver/DriverView';
import { DoCAAdminView } from '@/components/roles/doca-admin/DoCAAdminView';

export default function Home() {
  const [currentRole, setCurrentRole] = useState<UserRole>('farmer');

  return (
    <div className="min-h-full flex flex-col">
      <RoleSwitcher currentRole={currentRole} onRoleSelect={setCurrentRole} />

      <div className="flex-1 py-6">
        {currentRole === 'farmer' && <FarmerView />}
        {currentRole === 'hub_manager' && <HubManagerView />}
        {currentRole === 'bulk_buyer' && <BulkBuyerView />}
        {currentRole === 'retail_consumer' && <RetailConsumerView />}
        {currentRole === 'driver' && <DriverView />}
        {currentRole === 'doca_admin' && <DoCAAdminView />}
      </div>
    </div>
  );
}
