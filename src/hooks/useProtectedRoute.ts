'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types';

interface UseProtectedRouteResult {
  isAuthenticated: boolean;
  user: AuthUser | null;
  logout: () => void;
}

export function useProtectedRoute(): UseProtectedRouteResult {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const token = window.localStorage.getItem('authToken');
    const storedUser = window.localStorage.getItem('authUser');

    console.info('[protected-route] mount check', {
      hasToken: !!token,
      hasUser: !!storedUser,
    });

    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      router.replace('/');
      return;
    }

    setIsAuthenticated(true);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as AuthUser);
      } catch {
        setUser(null);
      }
    }
  }, [router]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      console.info('[protected-route] logout');
      window.localStorage.clear();
    }

    setIsAuthenticated(false);
    setUser(null);
    router.replace('/');
  }, [router]);

  return { isAuthenticated, user, logout };
}
