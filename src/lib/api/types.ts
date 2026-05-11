// API-specific type definitions

export interface ApiRequestOptions extends RequestInit {
  timeout?: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  accessToken?: string;
  data?: {
    token?: string;
    accessToken?: string;
    user?: {
      email?: string;
      role?: string;
    };
  };
  user: {
    email: string;
    role: string;
  };
}

export interface SignupRequest {
  email: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  cityId: string;
  dormId: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  dialCode: string;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
  dialCode: string;
}

export interface City {
  id: string;
  name: string;
  countryId: string;
  clientId: string;
  country?: Country;
}

export interface ClientCity {
  id: string;
  name: string;
  country: Pick<Country, 'name' | 'code'>;
  dormCount: number;
}

export interface ClientDorm {
  id: string;
  name: string;
  cityId?: string;
  address?: string;
  machineCount?: number;
  userCount?: number;
}

export interface ClientDormApiResponse {
  dormId?: string;
  id?: string;
  dormName?: string;
  name?: string;
  dormAddress?: string;
  address?: string;
  cityId?: string;
  machineCount?: number;
  userCount?: number;
}

export interface CityFilters {
  countryId?: string;
  clientId?: string;
}

export interface CreateCityRequest {
  name: string;
  countryId: string;
  clientId: string;
}

export interface BulkCreateCitiesRequest {
  cities: CreateCityRequest[];
}

export interface BulkCreateCitiesResponse {
  created: City[];
  skipped: CreateCityRequest[];
  summary: {
    created: number;
    skipped: number;
  };
}

export interface DormWithLocation {
  id: string;
  name: string;
  address: string;
  cityId: string;
  clientId: string;
  city?: City;
  country?: Country;
}

export interface CreateDormRequest {
  name: string;
  address: string;
  cityId: string;
  clientId: string;
}

export interface ClientDormsRequest {
  cityId: string;
}

export interface MachineStatusUpdate {
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  issue?: string;
}

export interface UserApprovalRequest {
  approved: boolean;
  reason?: string;
}

export interface QueryResponseRequest {
  response: string;
  status: 'resolved' | 'in_progress';
}
