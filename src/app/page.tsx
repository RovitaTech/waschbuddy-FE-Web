"use client";

import { useState } from 'react';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminDashboard } from '@/components/AdminDashboard';
import { LocationSelector } from '@/components/LocationSelector';

type AppState = 'login' | 'location' | 'dashboard';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('login');
  const [selectedLocation, setSelectedLocation] = useState<{ city: string; dorm: string | 'all' } | null>(null);

  const handleLogin = (credentials: { email: string; password: string }) => {
    // Simple demo authentication - in real app, this would validate against a backend
    if (credentials.email === 'admin@waschbar.com' && credentials.password === 'admin123') {
      setAppState('location');
    } else {
      alert('Invalid credentials. Please use admin@waschbar.com / admin123');
    }
  };

  const handleLocationSelect = (location: { city: string; dorm: string | 'all' }) => {
    setSelectedLocation(location);
    setAppState('dashboard');
  };

  const handleLocationChange = (location: { city: string; dorm: string | 'all' }) => {
    setSelectedLocation(location);
  };

  const handleBackToLocationSelect = () => {
    setAppState('location');
  };

  const handleLogout = () => {
    setAppState('login');
    setSelectedLocation(null);
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
