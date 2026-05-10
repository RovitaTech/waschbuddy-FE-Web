"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLogin } from '@/components/features/auth/AdminLogin';
import { useAuth } from '@/hooks/useAuth';
import { DataSource } from '@/lib/config/dataSource';

export default function AdminPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('authToken');
    if (token) {
      router.replace('/admin/dashboard');
    }
  }, [router]);

  const handleLogin = async (credentials: { email: string; password: string; dataSource: DataSource }) => {
    try {
      await login(credentials);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed. Please try again.';
      alert(message);
    }
  };

  return (
    <AdminLogin onLogin={handleLogin} />
  );
}
