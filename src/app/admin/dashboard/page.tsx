"use client";

import { useState } from 'react';
import { AdminDashboard } from '@/components/features/admin/AdminDashboard';
import { LocationSelector } from '@/components/layout/LocationSelector';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useLocation } from '@/hooks/useLocation';
import { Location } from '@/types';

type DashboardState = 'location' | 'dashboard';

export default function AdminDashboardPage() {
  const [state, setState] = useState<DashboardState>('location');
  const { isAuthenticated, logout } = useProtectedRoute();
  const { selectedLocation, selectLocation, clearLocation } = useLocation();

  const handleLocationSelect = (location: Location) => {
    selectLocation(location);
    setState('dashboard');
  };

  const handleLocationChange = (location: Location) => {
    selectLocation(location);
  };

  const handleBackToLocationSelect = () => {
    setState('location');
  };

  const handleLogout = () => {
    clearLocation();
    logout();
  };

  if (!isAuthenticated) {
    return null;
  }

  if (state === 'location') {
    return <LocationSelector onLocationSelect={handleLocationSelect} />;
  }

  if (state === 'dashboard' && selectedLocation) {
    return (
      <AdminDashboard
        onLogout={handleLogout}
        location={selectedLocation}
        onLocationChange={handleLocationChange}
        onBackToLocationSelect={handleBackToLocationSelect}
      />
    );
  }

  return null;
}
