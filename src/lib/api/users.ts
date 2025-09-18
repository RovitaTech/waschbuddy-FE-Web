// Users API functions
// Currently using mock data - replace with actual API calls when backend is ready

import { mockUsers, User } from '@/components/utils/mockData';

export interface UserFilters {
  search?: string;
  status?: string;
  location?: { city: string; dorm: string | 'all' };
}

// Mock implementation - replace with actual API call
export async function getUsers(filters?: UserFilters): Promise<User[]> {
  // TODO: Replace with actual API call
  // const params = new URLSearchParams(filters);
  // const response = await fetch(`/api/users?${params}`);
  // return response.json();
  
  // Mock implementation - return filtered mock data
  return Promise.resolve(mockUsers);
}

export async function getUserById(id: string): Promise<User | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users/${id}`);
  // return response.json();
  
  // Mock implementation
  const user = mockUsers.find(u => u.id === id);
  return Promise.resolve(user || null);
}

export async function updateUserStatus(userId: string, status: string): Promise<User> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/users/${userId}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // });
  // return response.json();
  
  // Mock implementation
  const user = mockUsers.find(u => u.id === userId);
  if (user) {
    user.status = status as User['status'];
  }
  return Promise.resolve(user!);
}

export async function deleteUser(userId: string): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/users/${userId}`, { method: 'DELETE' });
  
  // Mock implementation
  return Promise.resolve();
}

export async function sendUserEmail(userId: string, message: string): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/users/${userId}/email`, {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ message })
  // });
  
  // Mock implementation
  return Promise.resolve();
}