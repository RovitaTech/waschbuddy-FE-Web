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
  token: string;
  user: {
    email: string;
    role: string;
  };
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
