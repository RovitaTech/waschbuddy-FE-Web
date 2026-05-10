"use client";

import { useState } from 'react';
import { AdminLogin } from '@/components/features/auth/AdminLogin';
import { AdminDashboard } from '@/components/features/admin/AdminDashboard';
import { LocationSelector } from '@/components/layout/LocationSelector';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/hooks/useLocation';
import { Location } from '@/types';
import { DataSource } from '@/lib/config/dataSource';

type AppState = 'login' | 'location' | 'dashboard';

export default function AdminPage() {
  const [appState, setAppState] = useState<AppState>('login');
  const { login, logout, isAuthenticated } = useAuth();
  const { selectedLocation, selectLocation, clearLocation } = useLocation();

  const handleLogin = async (credentials: { email: string; password: string; dataSource: DataSource }) => {
    const success = await login(credentials);
    if (success) {
      setAppState('location');
    } else {
      alert('Invalid credentials. Please use admin@waschbar.com / admin123');
    }
  };

  const handleLocationSelect = (location: Location) => {
    selectLocation(location);
    setAppState('dashboard');
  };

  const handleLocationChange = (location: Location) => {
    selectLocation(location);
  };

  const handleBackToLocationSelect = () => {
    setAppState('location');
  };

  const handleLogout = () => {
    logout();
    clearLocation();
    setAppState('login');
  };

  return (
    <>
      {appState === 'login' && (
        <AdminLogin onLogin={handleLogin} />
      )}
      
      {appState === 'location' && (
        <LocationSelector onLocationSelect={handleLocationSelect} />
      )}
      
      {appState === 'dashboard' && selectedLocation && (
        <AdminDashboard 
          onLogout={handleLogout} 
          location={selectedLocation} 
          onLocationChange={handleLocationChange}
          onBackToLocationSelect={handleBackToLocationSelect}
        />
      )}
    </>
  );
}
