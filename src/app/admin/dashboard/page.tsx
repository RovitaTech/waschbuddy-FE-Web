"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/features/admin/AdminDashboard';
import { LocationSelector } from '@/components/layout/LocationSelector';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { useLocation } from '@/hooks/useLocation';
import { getStoredAuthUser } from '@/lib/api/authToken';
import { Location } from '@/types';

type DashboardState = 'location' | 'dashboard';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useProtectedRoute();
  const { selectedLocation, selectLocation, clearLocation } = useLocation();
  const [state, setState] = useState<DashboardState>(() => (selectedLocation ? 'dashboard' : 'location'));
  const [isRoleResolved, setIsRoleResolved] = useState(false);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    const isSuperAdmin = (storedUser?.role ?? '').toLowerCase().includes('super');

    if (isSuperAdmin) {
      router.replace('/super-admin/dashboard');
      return;
    }

    setIsRoleResolved(true);
  }, [router]);

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

  if (!isAuthenticated || !isRoleResolved) {
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
