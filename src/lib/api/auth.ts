// Authentication API functions
// Currently using mock data - replace with actual API calls when backend is ready

import { mockUsers } from '@/components/utils/mockData';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

// Mock implementation - replace with actual API call
export async function loginAdmin(credentials: LoginCredentials): Promise<AuthResponse> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/auth/login', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(credentials)
  // });
  // return response.json();
  
  // Mock validation
  if (credentials.email === 'admin@waschbar.com' && credentials.password === 'admin123') {
    return {
      success: true,
      token: 'mock-jwt-token',
      user: { email: credentials.email, role: 'admin' }
    };
  }
  
  return {
    success: false,
    message: 'Invalid credentials'
  };
}

export async function logoutAdmin(): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch('/api/auth/logout', { method: 'POST' });
  
  // Mock implementation
  return Promise.resolve();
}

export async function validateToken(token: string): Promise<boolean> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/auth/validate', {
  //   headers: { Authorization: `Bearer ${token}` }
  // });
  // return response.ok;
  
  // Mock validation
  return token === 'mock-jwt-token';
}