// API index file - central export for all API functions
// This makes it easy to import all API functions from one place

export * from './auth';
export * from './users';
export * from './machines';
export * from './reservations';
export * from './types';
export * from './endpoints';
export * from './services';

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Common API utility functions
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // TODO: Add authentication token when available
  // const token = getAuthToken();
  // if (token) {
  //   defaultOptions.headers.Authorization = `Bearer ${token}`;
  // }

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}