import { useState, useCallback } from 'react';
import { AuthCredentials, AuthUser } from '@/types';
import { DEMO_CREDENTIALS } from '@/constants';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (credentials: AuthCredentials): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo authentication
      if (credentials.email === DEMO_CREDENTIALS.email && 
          credentials.password === DEMO_CREDENTIALS.password) {
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
