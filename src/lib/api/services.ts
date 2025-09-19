// API service layer

import { apiRequest } from './index';
import { ENDPOINTS } from './endpoints';
import { 
  Machine, 
  User, 
  Reservation, 
  ProfileRequest, 
  UserQuery, 
  Notification,
  LocationStats,
  FilterParams,
  PaginationParams
} from '@/types';
import { 
  LoginRequest, 
  LoginResponse, 
  MachineStatusUpdate, 
  UserApprovalRequest,
  QueryResponseRequest,
  PaginatedResponse
} from './types';

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  logout: async (): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST'
    });
  },

  refresh: async (): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(ENDPOINTS.AUTH.REFRESH, {
      method: 'POST'
    });
  }
};

// Machine Services
export const machineService = {
  getMachines: async (filters?: FilterParams): Promise<Machine[]> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.MACHINES.LIST}?${queryString}` : ENDPOINTS.MACHINES.LIST;
    
    return apiRequest<Machine[]>(endpoint);
  },

  getMachine: async (id: string): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.DETAIL(id));
  },

  updateMachineStatus: async (id: string, update: MachineStatusUpdate): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.UPDATE_STATUS(id), {
      method: 'PATCH',
      body: JSON.stringify(update)
    });
  },

  createMachine: async (machine: Omit<Machine, 'id'>): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.CREATE, {
      method: 'POST',
      body: JSON.stringify(machine)
    });
  }
};

// User Services
export const userService = {
  getUsers: async (filters?: FilterParams & PaginationParams): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.USERS.LIST}?${queryString}` : ENDPOINTS.USERS.LIST;
    
    return apiRequest<PaginatedResponse<User>>(endpoint);
  },

  getUser: async (id: string): Promise<User> => {
    return apiRequest<User>(ENDPOINTS.USERS.DETAIL(id));
  },

  updateUser: async (id: string, updates: Partial<User>): Promise<User> => {
    return apiRequest<User>(ENDPOINTS.USERS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  approveUser: async (id: string, approval: UserApprovalRequest): Promise<User> => {
    return apiRequest<User>(ENDPOINTS.USERS.APPROVE(id), {
      method: 'POST',
      body: JSON.stringify(approval)
    });
  },

  suspendUser: async (id: string, reason?: string): Promise<User> => {
    return apiRequest<User>(ENDPOINTS.USERS.SUSPEND(id), {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};

// Reservation Services
export const reservationService = {
  getReservations: async (filters?: FilterParams): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.RESERVATIONS.LIST}?${queryString}` : ENDPOINTS.RESERVATIONS.LIST;
    
    return apiRequest<Reservation[]>(endpoint);
  },

  createReservation: async (reservation: Omit<Reservation, 'id'>): Promise<Reservation> => {
    return apiRequest<Reservation>(ENDPOINTS.RESERVATIONS.CREATE, {
      method: 'POST',
      body: JSON.stringify(reservation)
    });
  },

  updateReservation: async (id: string, updates: Partial<Reservation>): Promise<Reservation> => {
    return apiRequest<Reservation>(ENDPOINTS.RESERVATIONS.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  deleteReservation: async (id: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.RESERVATIONS.DELETE(id), {
      method: 'DELETE'
    });
  }
};

// Profile Request Services
export const profileRequestService = {
  getProfileRequests: async (filters?: FilterParams): Promise<ProfileRequest[]> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.PROFILE_REQUESTS.LIST}?${queryString}` : ENDPOINTS.PROFILE_REQUESTS.LIST;
    
    return apiRequest<ProfileRequest[]>(endpoint);
  },

  approveRequest: async (id: string): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.APPROVE(id), {
      method: 'POST'
    });
  },

  rejectRequest: async (id: string, reason?: string): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.REJECT(id), {
      method: 'POST',
      body: JSON.stringify({ reason })
    });
  }
};

// Query Services
export const queryService = {
  getQueries: async (filters?: FilterParams): Promise<UserQuery[]> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.QUERIES.LIST}?${queryString}` : ENDPOINTS.QUERIES.LIST;
    
    return apiRequest<UserQuery[]>(endpoint);
  },

  updateQuery: async (id: string, response: QueryResponseRequest): Promise<UserQuery> => {
    return apiRequest<UserQuery>(ENDPOINTS.QUERIES.UPDATE(id), {
      method: 'PATCH',
      body: JSON.stringify(response)
    });
  }
};

// Notification Services
export const notificationService = {
  getNotifications: async (): Promise<Notification[]> => {
    return apiRequest<Notification[]>(ENDPOINTS.NOTIFICATIONS.LIST);
  },

  markAsRead: async (id: string): Promise<Notification> => {
    return apiRequest<Notification>(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {
      method: 'PATCH'
    });
  }
};

// Analytics Services
export const analyticsService = {
  getDashboardStats: async (filters?: FilterParams): Promise<LocationStats> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.ANALYTICS.DASHBOARD}?${queryString}` : ENDPOINTS.ANALYTICS.DASHBOARD;
    
    return apiRequest<LocationStats>(endpoint);
  },

  getUsageAnalytics: async (filters?: FilterParams & { period?: string }): Promise<any> => {
    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.dorm) params.append('dorm', filters.dorm);
    if (filters?.period) params.append('period', filters.period);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const endpoint = queryString ? `${ENDPOINTS.ANALYTICS.USAGE}?${queryString}` : ENDPOINTS.ANALYTICS.USAGE;
    
    return apiRequest<any>(endpoint);
  }
};
