// Central type definitions for the WASCHBUDDY Admin Panel

export interface Machine {
  id: string;
  name: string;
  type: 'washer' | 'dryer';
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_order' | 'offline';
  location: string;
  dorm: string;
  city: string;
  machineNumber?: number;
  serialNumber?: string;
  installationDate?: string;
  clientId?: string;
  dormId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastMaintenanceDate?: string | null;
  maintenanceScheduled?: boolean;
  scheduledWindow?: string | null;
  queueCount?: number;
  isReserved?: boolean;
  currentReservation?: unknown;
  currentUser?: string;
  timeRemaining?: number;
  issue?: string;
  lastMaintenance: string;
  totalCycles: number;
  model: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  city: string;
  dorm: string;
  registrationDate: string;
  lastActive: string;
  totalReservations: number;
  studentId: string;
}

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  machineId: string;
  machineName: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'completed' | 'cancelled' | 'upcoming';
  city: string;
  dorm: string;
}

export interface ProfileRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  requestType: 'city_change' | 'dorm_change' | 'contact_update';
  currentValue: string;
  newValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  city: string;
  dorm: string;
}

export interface UserQuery {
  id: string;
  userId: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'resolved' | 'in_progress';
  priority: 'low' | 'medium' | 'high';
  submittedAt: string;
  resolvedAt?: string;
  adminResponse?: string;
  city: string;
  dorm: string;
}

export interface Notification {
  id: string;
  type: 'user_verification' | 'machine_issue' | 'query_submitted' | 'system_alert';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface Location {
  city: string;
  dorm: string | 'all';
  cityId?: string;
  dormId?: string;
}

export interface LocationStats {
  totalMachines: number;
  activeMachines: number;
  inUseMachines: number;
  maintenanceRequired: number;
  totalUsers: number;
  pendingVerifications: number;
}

export interface AuthCredentials {
  email: string;
  password: string;
  dataSource?: 'dummy' | 'api';
  isSuperAdmin?: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface FilterParams {
  city?: string;
  dorm?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}
