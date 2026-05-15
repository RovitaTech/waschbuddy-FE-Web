"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/components/features/auth/AdminLogin';
import { useAuth } from '@/hooks/useAuth';
import { getStoredAuthUser } from '@/lib/api/authToken';
import type { AuthCredentials } from '@/types';

export default function SuperAdminPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('authToken');
    if (token) {
      const storedUser = getStoredAuthUser();
      const isSuperAdmin = (storedUser?.role ?? '').toLowerCase().includes('super');
      router.replace(isSuperAdmin ? '/super-admin/dashboard' : '/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (credentials: AuthCredentials) => {
    try {
      await login(credentials);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      alert(message);
    }
  };

  return <AdminLogin onLogin={handleLogin} />;
}
