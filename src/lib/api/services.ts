// API service layer — models are placeholders, update alongside real API integration

import { apiRequest } from './index';
import { ENDPOINTS } from './endpoints';
import {
  Machine,
  User,
  Reservation,
  ProfileRequest,
  UserQuery,
  FilterParams,
  PaginationParams
} from '@/types';
import {
  BulkCreateCitiesRequest,
  BulkCreateCitiesResponse,
  City,
  CityFilters,
  ClientCity,
  ClientDorm,
  ClientDormApiResponse,
  ClientDormsRequest,
  Country,
  CreateCountryRequest,
  CreateDormRequest,
  LoginRequest,
  LoginResponse,
  MachineStatusUpdate,
  SignupRequest,
  UserApprovalRequest,
  QueryResponseRequest,
  DormWithLocation,
  PaginatedResponse
} from './types';

const buildQueryString = (params: Record<string, string | undefined>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.append(key, value);
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

const extractList = <T>(response: unknown, collectionKeys: string[] = []): T[] => {
  if (Array.isArray(response)) return response as T[];
  if (!response || typeof response !== 'object') return [];

  const record = response as Record<string, unknown>;

  for (const key of collectionKeys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }

  if (Array.isArray(record.data)) return record.data as T[];
  if (record.data && typeof record.data === 'object') {
    const dataRecord = record.data as Record<string, unknown>;

    for (const key of collectionKeys) {
      if (Array.isArray(dataRecord[key])) return dataRecord[key] as T[];
    }

    if (Array.isArray(dataRecord.data)) return dataRecord.data as T[];
    if (Array.isArray(dataRecord.items)) return dataRecord.items as T[];
  }

  if (Array.isArray(record.items)) return record.items as T[];
  if (Array.isArray(record.results)) return record.results as T[];

  return [];
};

const mapClientDorm = (dorm: ClientDormApiResponse): ClientDorm => ({
  id: dorm.dormId ?? dorm.id ?? '',
  name: dorm.dormName ?? dorm.name ?? '',
  address: dorm.dormAddress ?? dorm.address,
  cityId: dorm.cityId,
  machineCount: dorm.machineCount ?? 0,
  userCount: dorm.userCount ?? 0
});

// Auth Services
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(ENDPOINTS.AUTH.ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  getProfile: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.PROFILE);
  },

  adminSignup: async (payload: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.ADMIN_SIGNUP, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  signup: async (payload: SignupRequest): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.SIGNUP, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  superAdminLogin: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>(ENDPOINTS.AUTH.SUPER_ADMIN_LOGIN, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  superAdminSignup: async (payload: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.SUPER_ADMIN_SIGNUP, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  forgotPassword: async (payload: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  resetPassword: async (payload: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.RESET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  setPassword: async (payload: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.AUTH.SET_PASSWORD, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  }
};

// Super Admin Services
export const superAdminService = {
  getAllUsers: async (): Promise<any[]> => {
    return apiRequest<any[]>(ENDPOINTS.SUPER_ADMIN.ALL_USERS);
  },

  getUsersStats: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SUPER_ADMIN.USERS_STATS);
  },

  getAllClients: async (): Promise<any[]> => {
    return apiRequest<any[]>(ENDPOINTS.SUPER_ADMIN.ALL_CLIENTS);
  },

  getClientById: async (id: string): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SUPER_ADMIN.CLIENT_BY_ID(id));
  },

  deleteClient: async (body: object): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.SUPER_ADMIN.DELETE_CLIENT, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  },

  getCountries: async (): Promise<Country[]> => {
    return apiRequest<Country[]>(ENDPOINTS.SUPER_ADMIN.COUNTRIES);
  },

  addCountry: async (body: CreateCountryRequest): Promise<Country> => {
    return apiRequest<Country>(ENDPOINTS.SUPER_ADMIN.COUNTRIES, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  getCities: async (filters?: CityFilters): Promise<City[]> => {
    const queryString = buildQueryString({
      countryId: filters?.countryId,
      clientId: filters?.clientId
    });

    return apiRequest<City[]>(`${ENDPOINTS.SUPER_ADMIN.CITIES}${queryString}`);
  },

  addCities: async (body: BulkCreateCitiesRequest): Promise<BulkCreateCitiesResponse> => {
    return apiRequest<BulkCreateCitiesResponse>(ENDPOINTS.SUPER_ADMIN.CITIES, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  deleteCity: async (id: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.SUPER_ADMIN.DELETE_CITY(id), {
      method: 'DELETE'
    });
  },

  getDorms: async (filters?: { clientId?: string }): Promise<DormWithLocation[]> => {
    const queryString = buildQueryString({ clientId: filters?.clientId });

    return apiRequest<DormWithLocation[]>(`${ENDPOINTS.SUPER_ADMIN.ALL_DORMS}${queryString}`);
  },

  addDorm: async (body: CreateDormRequest): Promise<DormWithLocation> => {
    return apiRequest<DormWithLocation>(ENDPOINTS.SUPER_ADMIN.ADD_DORM, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  deleteDorm: async (body: object): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.SUPER_ADMIN.DELETE_DORM, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  },

  deleteMultipleDorms: async (body: object): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.SUPER_ADMIN.DELETE_MULTIPLE_DORMS, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }
};

// Overview Services
export const overviewService = {
  getCities: async (body?: object): Promise<ClientCity[]> => {
    const response = await apiRequest<unknown>(ENDPOINTS.OVERVIEW.CITIES, {
      method: 'POST',
      body: JSON.stringify(body ?? {})
    });

    return extractList<ClientCity>(response, ['cities']);
  },

  getDorms: async (body: ClientDormsRequest): Promise<ClientDorm[]> => {
    const response = await apiRequest<unknown>(ENDPOINTS.OVERVIEW.DORMS, {
      method: 'POST',
      body: JSON.stringify(body)
    });

    return extractList<ClientDormApiResponse>(response, ['dorms'])
      .map(mapClientDorm)
      .filter((dorm) => dorm.id && dorm.name);
  },

  getDormDetail: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.OVERVIEW.DORM_DETAIL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  getDormMachines: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.OVERVIEW.DORM_MACHINES, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  getDormData: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.OVERVIEW.DORM_DATA, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  getDormsData: async (body: ClientDormsRequest): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.OVERVIEW.DORMS_DATA, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};

// Machine Services
export const machineService = {
  getAllMachines: async (): Promise<Machine[]> => {
    return apiRequest<Machine[]>(ENDPOINTS.MACHINES.ALL);
  },

  getMachinesByDorm: async (body: object): Promise<Machine[]> => {
    return apiRequest<Machine[]>(ENDPOINTS.MACHINES.BY_DORM, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  getMachineDetail: async (body: object): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.DETAIL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  addMachine: async (machine: Omit<Machine, 'id'>): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.ADD, {
      method: 'POST',
      body: JSON.stringify(machine)
    });
  },

  updateMachine: async (id: string, update: MachineStatusUpdate): Promise<Machine> => {
    return apiRequest<Machine>(ENDPOINTS.MACHINES.UPDATE(id), {
      method: 'PUT',
      body: JSON.stringify(update)
    });
  },

  deleteMachine: async (id: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.MACHINES.DELETE(id), {
      method: 'DELETE'
    });
  }
};

// User Management Services
export const userService = {
  getUsers: async (filters?: FilterParams & PaginationParams): Promise<PaginatedResponse<User>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.USER_MANAGEMENT.USERS}?${queryString}`
      : ENDPOINTS.USER_MANAGEMENT.USERS;

    return apiRequest<PaginatedResponse<User>>(endpoint);
  },

  getUsersStats: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.USER_MANAGEMENT.USERS_STATS);
  },

  getProfileChangeRequests: async (): Promise<any[]> => {
    return apiRequest<any[]>(ENDPOINTS.USER_MANAGEMENT.PROFILE_CHANGE_REQUESTS);
  },

  getProfileChangeRequestsStats: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.USER_MANAGEMENT.PROFILE_CHANGE_REQUESTS_STATS);
  },

  approveRejectRequest: async (body: UserApprovalRequest): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.USER_MANAGEMENT.APPROVE_REJECT_REQUEST, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  deleteUser: async (body: object): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.USER_MANAGEMENT.DELETE_USER, {
      method: 'DELETE',
      body: JSON.stringify(body)
    });
  }
};

// Reservation Services
export const reservationService = {
  getReservations: async (filters?: FilterParams): Promise<Reservation[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.RESERVATIONS.ALL}?${queryString}`
      : ENDPOINTS.RESERVATIONS.ALL;

    return apiRequest<Reservation[]>(endpoint);
  },

  getReservationStats: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.RESERVATIONS.STATS);
  },

  cancelReservation: async (reservationId: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.RESERVATIONS.CANCEL, {
      method: 'POST',
      body: JSON.stringify({ reservationId })
    });
  },

  startReservation: async (reservationId: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.RESERVATIONS.START, {
      method: 'POST',
      body: JSON.stringify({ reservationId })
    });
  },

  getAllQueues: async (): Promise<any[]> => {
    return apiRequest<any[]>(ENDPOINTS.RESERVATIONS.ALL_QUEUES);
  },

  cancelQueue: async (queueId: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.RESERVATIONS.CANCEL_QUEUE, {
      method: 'POST',
      body: JSON.stringify({ queueId })
    });
  },

  cancelAllQueues: async (body?: object): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.RESERVATIONS.CANCEL_ALL_QUEUES, {
      method: 'POST',
      body: JSON.stringify(body ?? {})
    });
  }
};

// Profile Request Services
export const profileRequestService = {
  getPendingUsers: async (): Promise<ProfileRequest[]> => {
    return apiRequest<ProfileRequest[]>(ENDPOINTS.PROFILE_REQUESTS.PENDING);
  },

  approveUser: async (body: object): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.APPROVE, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  rejectUser: async (body: object): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.REJECT, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  suspendUser: async (body: object): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.SUSPEND, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  reactivateUser: async (body: object): Promise<ProfileRequest> => {
    return apiRequest<ProfileRequest>(ENDPOINTS.PROFILE_REQUESTS.REACTIVATE, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  sendEmail: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.PROFILE_REQUESTS.SEND_EMAIL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};

// User Query Services
export const queryService = {
  getQueries: async (filters?: FilterParams): Promise<UserQuery[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);

    const queryString = params.toString();
    const endpoint = queryString
      ? `${ENDPOINTS.USER_QUERIES.ALL}?${queryString}`
      : ENDPOINTS.USER_QUERIES.ALL;

    return apiRequest<UserQuery[]>(endpoint);
  },

  getQueriesStats: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.USER_QUERIES.STATS);
  },

  getQueryById: async (id: string): Promise<UserQuery> => {
    return apiRequest<UserQuery>(ENDPOINTS.USER_QUERIES.BY_ID(id));
  },

  replyToQuery: async (id: string, body: QueryResponseRequest): Promise<UserQuery> => {
    return apiRequest<UserQuery>(ENDPOINTS.USER_QUERIES.REPLY, {
      method: 'POST',
      body: JSON.stringify({ ...body, queryId: id })
    });
  },

  updateQueryStatus: async (id: string, body: object): Promise<UserQuery> => {
    return apiRequest<UserQuery>(ENDPOINTS.USER_QUERIES.UPDATE_STATUS, {
      method: 'PATCH',
      body: JSON.stringify({ ...body, queryId: id })
    });
  }
};

// Settings Services
export const settingsService = {
  getAllSettings: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.GET_ALL);
  },

  updateAllDorms: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.UPDATE_ALL_DORMS, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  },

  resetSettings: async (): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.RESET, { method: 'POST' });
  },

  getDormSettings: async (dormId: string): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.DORM_SPECIFIC(dormId));
  },

  getDormsList: async (): Promise<any[]> => {
    return apiRequest<any[]>(ENDPOINTS.SETTINGS.ALL_DORMS_LIST);
  },

  addMaintenanceMessage: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.ADD_MAINTENANCE_MESSAGE, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  addSingleMachineMaintenanceMessage: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.ADD_SINGLE_MACHINE_MAINTENANCE_MESSAGE, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  },

  deleteMaintenanceMessage: async (id: string): Promise<void> => {
    return apiRequest<void>(ENDPOINTS.SETTINGS.DELETE_MAINTENANCE_MESSAGE(id), {
      method: 'DELETE'
    });
  },

  addSystemMessage: async (body: object): Promise<any> => {
    return apiRequest<any>(ENDPOINTS.SETTINGS.SYSTEM_MESSAGES, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
