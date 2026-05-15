// API endpoint definitions — admin + super-admin only (mobile user endpoints excluded)

export const ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    // Client admin
    ADMIN_LOGIN: '/auth/admin/login',
    ADMIN_SIGNUP: '/auth/admin/signup',
    PROFILE: '/auth/profile',
    // Super admin
    SUPER_ADMIN_LOGIN: '/auth/super-admin/login',
    SUPER_ADMIN_SIGNUP: '/auth/super-admin/signup',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    SET_PASSWORD: '/auth/set-password',
  },
  SUPER_ADMIN: {
    // Users / clients
    ALL_USERS: '/super-admin/clients/users',
    USERS_STATS: '/super-admin/clients/users/stats',
    ALL_CLIENTS: '/super-admin/clients',
    CLIENT_BY_ID: (id: string) => `/super-admin/clients/${id}`,
    DELETE_CLIENT: '/super-admin/clients/client',
    // Countries
    COUNTRIES: '/super-admin/countries',
    // Cities
    CITIES: '/super-admin/cities',
    DELETE_CITY: (id: string) => `/super-admin/cities/${id}`,
    // Dorms
    ALL_DORMS: '/super-admin/clients/dorms',
    ADD_DORM: '/super-admin/clients/dorms',
    DELETE_DORM: '/super-admin/clients/dorms',
    DELETE_MULTIPLE_DORMS: '/super-admin/clients/dorms/multiple',
  },
  OVERVIEW: {
    CLIENTS_OVERVIEW: '/clients/overview',
    CITIES: '/clients/cities',
    DORMS: '/clients/dorms',
    DORM_DETAIL: '/clients/dorm/detail',
    DORM_MACHINES: '/clients/dorm/machines',
    DORM_DATA: '/clients/dorm/data',
    DORMS_DATA: '/clients/dorms/data',
  },
  MACHINES: {
    ALL: '/clients/machines',
    ADD: '/clients/machines',
    BY_DORM: '/clients/machines/by-dorm',
    DETAIL: '/clients/machines/detail',
    UPDATE: (id: string) => `/clients/machines/${id}`,
    DELETE: (id: string) => `/clients/machines/${id}`,
  },
  USER_MANAGEMENT: {
    USERS: '/clients/user-management/users',
    USERS_STATS: '/clients/user-management/users/stats',
    PROFILE_CHANGE_REQUESTS: '/clients/user-management/profile-change-requests',
    PROFILE_CHANGE_REQUESTS_STATS: '/clients/user-management/profile-change-requests/stats',
    APPROVE_REJECT_REQUEST: '/clients/user-management/profile-change-requests/approve-reject',
    DELETE_USER: '/clients/user-management/users',
    SEND_EMAIL: '/clients/user-management/send-email',
  },
  RESERVATIONS: {
    ALL: '/clients/reservations',
    STATS: '/clients/reservations/stats',
    CANCEL: '/clients/reservations/cancel',
    START: '/clients/reservations/start',
    ALL_QUEUES: '/clients/reservations/queue',
    CANCEL_QUEUE: '/clients/reservations/queue/cancel',
    CANCEL_ALL_QUEUES: '/clients/reservations/queue/cancel-all',
  },
  PROFILE_REQUESTS: {
    PENDING: '/clients/profiles-management/pending-users',
    APPROVE: '/clients/profiles-management/approve-user',
    REJECT: '/clients/profiles-management/reject-user',
    SUSPEND: '/clients/profiles-management/suspend-user',
    REACTIVATE: '/clients/profiles-management/reactivate-user',
    SEND_EMAIL: '/clients/profiles-management/send-email',
  },
  USER_QUERIES: {
    ALL: '/clients/user-queries',
    STATS: '/clients/user-queries/stats',
    BY_ID: (id: string) => `/clients/user-queries/${id}`,
    REPLY: '/clients/user-queries/reply',
    UPDATE_STATUS: '/clients/user-queries',
  },
  SETTINGS: {
    GET_ALL: '/clients/settings',
    UPDATE_ALL_DORMS: '/clients/settings/dorms/bulk',
    RESET: '/clients/settings/reset',
    DORM_SPECIFIC: (dormId: string) => `/clients/settings/dorm/${dormId}`,
    ALL_DORMS_LIST: '/clients/settings/dorms/list',
    ADD_MAINTENANCE_MESSAGE: '/clients/settings/maintenance-messages',
    ADD_SINGLE_MACHINE_MAINTENANCE_MESSAGE: '/clients/settings/maintenance-messages/single-machine',
    DELETE_MAINTENANCE_MESSAGE: (id: string) => `/clients/settings/maintenance-messages/${id}`,
    SYSTEM_MESSAGES: '/clients/settings/system-messages',
  },
} as const;
