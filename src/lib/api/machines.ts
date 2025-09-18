// Machines API functions
// Currently using mock data - replace with actual API calls when backend is ready

import { mockMachines, Machine } from '@/components/utils/mockData';

export interface MachineFilters {
  location?: { city: string; dorm: string | 'all' };
  status?: string;
  type?: string;
}

// Mock implementation - replace with actual API call
export async function getMachines(filters?: MachineFilters): Promise<Machine[]> {
  // TODO: Replace with actual API call
  // const params = new URLSearchParams(filters);
  // const response = await fetch(`/api/machines?${params}`);
  // return response.json();
  
  // Mock implementation - return filtered mock data
  return Promise.resolve(mockMachines);
}

export async function getMachineById(id: string): Promise<Machine | null> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/machines/${id}`);
  // return response.json();
  
  // Mock implementation
  const machine = mockMachines.find(m => m.id === id);
  return Promise.resolve(machine || null);
}

export async function updateMachineStatus(machineId: string, status: string): Promise<Machine> {
  // TODO: Replace with actual API call
  // const response = await fetch(`/api/machines/${machineId}/status`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ status })
  // });
  // return response.json();
  
  // Mock implementation
  const machine = mockMachines.find(m => m.id === machineId);
  if (machine) {
    machine.status = status as Machine['status'];
  }
  return Promise.resolve(machine!);
}

export async function createMachine(machineData: Partial<Machine>): Promise<Machine> {
  // TODO: Replace with actual API call
  // const response = await fetch('/api/machines', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(machineData)
  // });
  // return response.json();
  
  // Mock implementation
  const newMachine: Machine = {
    id: `machine_${Date.now()}`,
    name: machineData.name || 'New Machine',
    type: machineData.type || 'washing',
    status: 'available',
    location: machineData.location || '',
    city: machineData.city || '',
    dorm: machineData.dorm || '',
    floor: machineData.floor || 1,
    lastMaintenance: new Date().toISOString(),
    nextMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cycleTime: machineData.cycleTime || 45,
    energyRating: machineData.energyRating || 'A+++'
  };
  
  return Promise.resolve(newMachine);
}

export async function deleteMachine(machineId: string): Promise<void> {
  // TODO: Replace with actual API call
  // await fetch(`/api/machines/${machineId}`, { method: 'DELETE' });
  
  // Mock implementation
  return Promise.resolve();
}