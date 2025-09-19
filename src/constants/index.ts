// Application constants

export const CITIES_AND_DORMS = {
  'Berlin': ['Studentenwohnheim Adlershof', 'Wohnheim Charlottenburg', 'Campus Residenz Mitte', 'Studentendorf Schlachtensee', 'Wohnanlage Friedrichshain', 'Campus Lodge Prenzlauer Berg', 'Studierendenwohnen Tempelhof', 'Residenz Kreuzberg'],
  'Munich': ['Studentenstadt Freimann', 'Wohnheim Garching', 'Campus Lodge', 'Olympiadorf', 'Studentenwohnheim Biederstein', 'Wohnanlage Maxvorstadt', 'Residenz Schwabing', 'Campus Village Sendling'],
  'Hamburg': ['Wohnheim Harvestehude', 'Campus Residenz Altona', 'Studentendorf Bergedorf', 'Wohnanlage St. Pauli', 'Grindel Residenz', 'HafenCity Residence', 'Eimsbüttel Campus', 'Student Village Wilhelmsburg'],
  'Cologne': ['Wohnheim Sülz', 'Campus Residenz Deutz', 'Studentendorf Lindenthal', 'Wohnanlage Ehrenfeld', 'Südstadt Residenz', 'Dom Residenz', 'Nippes Campus Lodge', 'Chorweiler Student Housing'],
  'Frankfurt': ['Campus Westend', 'Studentenwohnheim Bockenheim', 'Wohnanlage Sachsenhausen', 'Nordend Residenz', 'Studentendorf Niederrad', 'Ostend Campus', 'Gallus Residence', 'Fechenheim Lodge'],
  'Stuttgart': ['Campus Vaihingen', 'Stadtmitte Residence', 'Bad Cannstatt Lodge', 'Degerloch Student Village', 'Feuerbach Campus', 'Zuffenhausen Wohnheim'],
  'Düsseldorf': ['Altstadt Campus', 'Bilk Residence', 'Oberkassel Lodge', 'Pempelfort Student Housing', 'Flingern Village', 'Golzheim Dorm'],
  'Leipzig': ['Zentrum Campus', 'Südvorstadt Residence', 'Plagwitz Student Lodge', 'Gohlis Wohnheim', 'Reudnitz Village', 'Connewitz Campus'],
  'Dresden': ['Neustadt Campus', 'Altstadt Residence', 'Blasewitz Student Lodge', 'Striesen Wohnheim', 'Löbtau Village', 'Prohlis Dorm']
} as const;

export const DEMO_CREDENTIALS = {
  email: 'admin@waschbar.com',
  password: 'admin123'
} as const;

export const MACHINE_TYPES = ['washer', 'dryer'] as const;
export const MACHINE_STATUSES = ['available', 'in_use', 'maintenance', 'offline'] as const;
export const USER_STATUSES = ['active', 'pending', 'suspended', 'rejected'] as const;
export const RESERVATION_STATUSES = ['active', 'completed', 'cancelled', 'upcoming'] as const;
export const QUERY_STATUSES = ['open', 'resolved', 'in_progress'] as const;
export const QUERY_PRIORITIES = ['low', 'medium', 'high'] as const;
export const NOTIFICATION_TYPES = ['user_verification', 'machine_issue', 'query_submitted', 'system_alert'] as const;

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh'
  },
  MACHINES: {
    LIST: '/api/machines',
    DETAIL: '/api/machines/:id',
    UPDATE_STATUS: '/api/machines/:id/status',
    CREATE: '/api/machines'
  },
  USERS: {
    LIST: '/api/users',
    DETAIL: '/api/users/:id',
    UPDATE: '/api/users/:id',
    APPROVE: '/api/users/:id/approve',
    SUSPEND: '/api/users/:id/suspend'
  },
  RESERVATIONS: {
    LIST: '/api/reservations',
    CREATE: '/api/reservations',
    UPDATE: '/api/reservations/:id',
    DELETE: '/api/reservations/:id'
  },
  PROFILE_REQUESTS: {
    LIST: '/api/profile-requests',
    APPROVE: '/api/profile-requests/:id/approve',
    REJECT: '/api/profile-requests/:id/reject'
  },
  QUERIES: {
    LIST: '/api/queries',
    UPDATE: '/api/queries/:id'
  },
  NOTIFICATIONS: {
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/:id/read'
  },
  ANALYTICS: {
    DASHBOARD: '/api/analytics/dashboard',
    USAGE: '/api/analytics/usage'
  }
} as const;
