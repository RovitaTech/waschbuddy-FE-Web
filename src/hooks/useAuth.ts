import { useState, useCallback } from 'react';
import { AuthCredentials, AuthUser } from '@/types';
import { dummyLoginCredentials } from '@/dummy-data';
import { DataSource, getStoredDataSource, setStoredDataSource } from '@/lib/config/dataSource';
import { getApiBaseUrl } from '@/lib/config/environment';
import { ENDPOINTS } from '@/lib/api/endpoints';
import { clearAuthToken, setAuthToken } from '@/lib/api/authToken';

const AUTH_USER_KEY = 'authUser';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    console.info('[auth] login start', {
      email: credentials.email,
      source: credentials.dataSource,
    });

    try {
      const selectedSource: DataSource = credentials.dataSource ?? getStoredDataSource();
      setStoredDataSource(selectedSource);

      if (selectedSource === 'api') {
        console.info('[auth] api login request', {
          endpoint: `${getApiBaseUrl()}${ENDPOINTS.AUTH.ADMIN_LOGIN}`,
        });

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

        const payload = await response.json().catch(() => null);

        if (!response.ok) {
          // Extract error message from various response formats
          let apiMessage = '';

          if (typeof payload?.message === 'string') {
            apiMessage = payload.message;
          } else if (typeof payload?.message === 'object' && payload.message?.message) {
            apiMessage = payload.message.message;
          } else if (typeof payload?.error === 'string') {
            apiMessage = payload.error;
          } else if (payload?.data?.message) {
            apiMessage = payload.data.message;
          }

          // Provide helpful messages based on HTTP status
          if (!apiMessage) {
            if (response.status === 401) {
              apiMessage = 'Invalid email or password. Please try again.';
            } else if (response.status === 403) {
              apiMessage = 'You do not have permission to access this resource.';
            } else if (response.status === 404) {
              apiMessage = 'User not found. Please check your email.';
            } else if (response.status >= 500) {
              apiMessage = 'Server error. Please try again later.';
            } else {
              apiMessage = 'Login failed. Please try again.';
            }
          }

          console.error('[auth] api login failed', {
            status: response.status,
            message: apiMessage,
            fullResponse: payload,
          });

          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(AUTH_USER_KEY);
          }
          throw new Error(apiMessage);
        }

        const token = payload?.access_token ?? null;
        const apiUser = payload?.user ?? null;

        if (!token || typeof token !== 'string') {
          console.error('[auth] api login missing access_token in response');
          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(AUTH_USER_KEY);
          }
          throw new Error('Authentication token not found in response.');
        }

        if (!apiUser) {
          console.error('[auth] api login missing user data in response');
          clearAuthToken();
          if (typeof window !== 'undefined') {
            window.localStorage.removeItem(AUTH_USER_KEY);
          }
          throw new Error('User data not found in response.');
        }

        const authUser: AuthUser = {
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          role: apiUser.role,
        };

        setAuthToken(token);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
        }

        setUser(authUser);

        console.info('[auth] api login success, redirecting to /admin/dashboard');

        if (typeof window !== 'undefined') {
          window.location.assign('/admin/dashboard');
        }

        return true;
      }

      if (
        credentials.email === dummyLoginCredentials.email &&
        credentials.password === dummyLoginCredentials.password
      ) {
        const dummyUser: AuthUser = {
          id: 'dummy-user-id',
          email: credentials.email,
          firstName: 'Demo',
          lastName: 'User',
          role: 'admin'
        };

        setUser(dummyUser);
        setAuthToken('dummy-auth-token');

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(dummyUser));
        }

        console.info('[auth] dummy login success, redirecting to /admin/dashboard');

        if (typeof window !== 'undefined') {
          window.location.assign('/admin/dashboard');
        }

        return true;
      }

      throw new Error('Invalid credentials. Please check your email and password.');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Login failed.');
      console.error('[auth] login error', err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.info('[auth] logout');
    clearAuthToken();
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
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
