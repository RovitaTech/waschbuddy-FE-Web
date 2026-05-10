import { useState, useCallback } from 'react';
import { AuthCredentials, AuthUser } from '@/types';
import { dummyLoginCredentials } from '@/dummy-data';
import { DataSource, getStoredDataSource, setStoredDataSource } from '@/lib/config/dataSource';
import { getApiBaseUrl } from '@/lib/config/environment';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { clearAuthToken, setAuthToken } from '@/lib/api/authToken';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const selectedSource: DataSource = credentials.dataSource ?? getStoredDataSource();
      setStoredDataSource(selectedSource);

      if (selectedSource === 'api') {
        const response = await fetch(`${getApiBaseUrl()}${ENDPOINTS.AUTH.ADMIN_LOGIN}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          }),
        });

        if (!response.ok) {
          clearAuthToken();
          return false;
        }

        const payload = await response.json().catch(() => null);
        const token =
          payload?.token ??
          payload?.data?.token ??
          payload?.accessToken ??
          payload?.data?.accessToken ??
          null;

        if (!token || typeof token !== 'string') {
          clearAuthToken();
          return false;
        }

        setAuthToken(token);
        setUser({
          email: payload?.user?.email ?? credentials.email,
          role: payload?.user?.role ?? 'admin',
        });
        return true;
      }

      if (
        credentials.email === dummyLoginCredentials.email &&
        credentials.password === dummyLoginCredentials.password
      ) {
        setUser({
          email: credentials.email,
          role: 'admin'
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const isAuthenticated = !!user;

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };
}
