"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SuperAdminDashboard } from '@/components/features/super-admin/SuperAdminDashboard';
import { useProtectedRoute } from '@/hooks/useProtectedRoute';
import { getStoredAuthUser } from '@/lib/api/authToken';

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, logout } = useProtectedRoute();
  const [isRoleResolved, setIsRoleResolved] = useState(false);

  useEffect(() => {
    const storedUser = getStoredAuthUser();
    const isSuperAdmin = (storedUser?.role ?? '').toLowerCase().includes('super');

    if (isAuthenticated && !isSuperAdmin) {
      router.replace('/admin/dashboard');
      return;
    }

    setIsRoleResolved(true);
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !isRoleResolved) {
    return null;
  }

  return <SuperAdminDashboard onLogout={logout} />;
}
