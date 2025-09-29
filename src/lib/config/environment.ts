// Environment configuration utility
// Centralizes all environment variable handling

export type Environment = 'development' | 'staging' | 'integration' | 'production';

export interface AppConfig {
  // App Info
  name: string;
  version: string;
  environment: Environment;
  
  // API Configuration
  apiUrl: string;
  apiTimeout: number;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableDebug: boolean;
  maintenanceMode: boolean;
  mockData: boolean;
  showDevTools: boolean;
  
  // Logging
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  
  // Cache
  cacheDuration: number;
}

// Get environment configuration
export function getEnvironmentConfig(): AppConfig {
  const environment = (process.env.NEXT_PUBLIC_ENVIRONMENT || 'development') as Environment;
  
  return {
    // App Info
    name: process.env.NEXT_PUBLIC_APP_NAME || 'WASCHBUDDY Admin Panel',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment,
    
    // API Configuration
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    apiTimeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '5000'),
    
    // Feature Flags
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    enableDebug: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
    maintenanceMode: process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true',
    mockData: process.env.NEXT_PUBLIC_MOCK_DATA !== 'false', // Default to true for development
    showDevTools: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true',
    
    // Logging
    logLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as AppConfig['logLevel']) || 'info',
    
    // Cache
    cacheDuration: parseInt(process.env.NEXT_PUBLIC_CACHE_DURATION || '300'),
  };
}

// Environment checks
export function isDevelopment(): boolean {
  return getEnvironmentConfig().environment === 'development';
}

export function isStaging(): boolean {
  return getEnvironmentConfig().environment === 'staging';
}

export function isIntegration(): boolean {
  return getEnvironmentConfig().environment === 'integration';
}

export function isProduction(): boolean {
  return getEnvironmentConfig().environment === 'production';
}

// Feature flag helpers
export function shouldUseMockData(): boolean {
  return getEnvironmentConfig().mockData;
}

export function shouldShowDebugInfo(): boolean {
  return getEnvironmentConfig().enableDebug;
}

export function shouldShowDevTools(): boolean {
  return getEnvironmentConfig().showDevTools;
}

// API helpers
export function getApiBaseUrl(): string {
  return getEnvironmentConfig().apiUrl;
}

export function getApiTimeout(): number {
  return getEnvironmentConfig().apiTimeout;
}

// Default export for easy access
export default getEnvironmentConfig();
