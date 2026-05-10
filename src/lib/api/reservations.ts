// Reservations API functions
// Currently using mock data - replace with actual API calls when backend is ready

import { mockReservations } from '@/dummy-data';

export interface ReservationFilters {
  location?: { city: string; dorm: string | 'all' };
  status?: string;
  userId?: string;
  machineId?: string;
}

// Mock implementation - replace with actual API call
export async function getReservations(filters?: ReservationFilters): Promise<any[]> {
  // TODO: Replace with actual API call
  // const params = new URLSearchParams(filters);
  // const response = await fetch(`/api/reservations?${params}`);
  // return response.json();
  
  // Mock implementation - return filtered mock data
  return Promise.resolve(mockReservations);
}

export async function getReservationById(id: string): Promise<any | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/reservations/${id}`);
  // return response.json();
  
  // Mock implementation
  const reservation = mockReservations.find((r: any) => r.id === id);
  return Promise.resolve(reservation || null);
}

export async function updateReservationStatus(reservationId: string, status: string): Promise<any> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/reservations/${reservationId}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // });
  // return response.json();
  
  // Mock implementation
  const reservation = mockReservations.find((r: any) => r.id === reservationId);
  if (reservation) {
    reservation.status = status as typeof reservation.status;
  }
  return Promise.resolve(reservation);
}

export async function cancelReservation(reservationId: string): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/reservations/${reservationId}/cancel`, { method: 'POST' });
  
  // Mock implementation
  return Promise.resolve();
}