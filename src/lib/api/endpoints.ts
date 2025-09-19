// API endpoint definitions

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  MACHINES: {
    LIST: '/api/machines',
    DETAIL: (id: string) => `/api/machines/${id}`,
    UPDATE_STATUS: (id: string) => `/api/machines/${id}/status`,
    CREATE: '/api/machines'
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
    UPDATE: (id: string) => `/api/users/${id}`,
    APPROVE: (id: string) => `/api/users/${id}/approve`,
    SUSPEND: (id: string) => `/api/users/${id}/suspend`
  },
  RESERVATIONS: {
    LIST: '/api/reservations',
    CREATE: '/api/reservations',
    UPDATE: (id: string) => `/api/reservations/${id}`,
    DELETE: (id: string) => `/api/reservations/${id}`
  },
  PROFILE_REQUESTS: {
    LIST: '/api/profile-requests',
    APPROVE: (id: string) => `/api/profile-requests/${id}/approve`,
    REJECT: (id: string) => `/api/profile-requests/${id}/reject`
  },
  QUERIES: {
    LIST: '/api/queries',
    UPDATE: (id: string) => `/api/queries/${id}`
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: (id: string) => `/api/notifications/${id}/read`
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    USAGE: '/api/analytics/usage'
  }
} as const;
