// Comprehensive mock data for the WASCHBÄR admin panel

import { 
  Machine, 
  User, 
  Reservation, 
  ProfileRequest, 
  UserQuery, 
  Notification,
  Location,
  LocationStats
} from '@/types';
import { CITIES_AND_DORMS } from '@/constants';

// Generate machines for each dorm
function generateMachines(): Machine[] {
  const machines: Machine[] = [];
  let machineCounter = 1;

  Object.entries(CITIES_AND_DORMS).forEach(([city, dorms]) => {
    dorms.forEach((dorm) => {
      const machineCount = Math.floor(Math.random() * 20) + 15; // 15-34 machines per dorm
      
      for (let i = 0; i < machineCount; i++) {
        const machineNum = String(machineCounter).padStart(3, '0');
        const type = Math.random() > 0.6 ? 'washer' : 'dryer';
        // Create a more predictable status distribution for testing sorting
        const statuses = ['maintenance', 'in_use', 'available', 'offline'];
        const statusIndex = (machineCounter - 1) % 4; // Cycle through statuses
        const status = statuses[statusIndex] as Machine['status'];
        
        machines.push({
          id: `${type.charAt(0).toUpperCase()}-${machineNum}`,
          name: `${type === 'washer' ? 'Washer' : 'Dryer'} M-${machineNum}`,
          type,
          status,
          location: dorm,
          dorm,
          city,
          currentUser: status === 'in_use' ? `user_${Math.floor(Math.random() * 100)}` : undefined,
          timeRemaining: status === 'in_use' ? Math.floor(Math.random() * 120) + 15 : undefined,
          issue: status === 'maintenance' ? ['Door sensor malfunction', 'Water level issue', 'Drainage problem', 'Control panel error'][Math.floor(Math.random() * 4)] : undefined,
          lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalCycles: Math.floor(Math.random() * 5000) + 1000,
          model: type === 'washer' ? 'AquaClean Pro 2000' : 'DryMaster Elite 1500'
        });
        
        machineCounter++;
      }
    });
  });

  return machines;
}

// Generate users for each dorm
function generateUsers(): User[] {
  const users: User[] = [];
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Maria', 'Thomas', 'Jennifer', 'Daniel', 'Laura', 'Christopher'];
  const lastNames = ['Schmidt', 'Müller', 'Weber', 'Fischer', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Schäfer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf'];
  let userCounter = 1;

  Object.entries(CITIES_AND_DORMS).forEach(([city, dorms]) => {
    dorms.forEach((dorm) => {
      const userCount = Math.floor(Math.random() * 60) + 40; // 40-99 users per dorm
      
      for (let i = 0; i < userCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const statuses = ['active', 'pending', 'suspended'];
        const status = statuses[Math.floor(Math.random() * statuses.length)] as User['status'];
        
        users.push({
          id: `user_${userCounter}`,
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@student.uni.de`,
          phone: `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 9000) + 1000}`,
          status,
          city,
          dorm,
          registrationDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          totalReservations: Math.floor(Math.random() * 50) + 1,
          studentId: `ST${String(userCounter).padStart(6, '0')}`
        });
        
        userCounter++;
      }
    });
  });

  return users;
}

// Generate reservations
function generateReservations(): Reservation[] {
  const reservations: Reservation[] = [];
  const machines = generateMachines();
  const users = generateUsers();
  
  for (let i = 0; i < 500; i++) {
    const machine = machines[Math.floor(Math.random() * machines.length)];
    const user = users.filter(u => u.city === machine.city && u.dorm === machine.dorm)[0];
    
    if (user) {
      const statuses = ['active', 'completed', 'cancelled', 'upcoming'];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as Reservation['status'];
      const startTime = new Date(Date.now() + (Math.random() - 0.5) * 7 * 24 * 60 * 60 * 1000);
      
      reservations.push({
        id: `res_${i + 1}`,
        userId: user.id,
        userName: user.name,
        machineId: machine.id,
        machineName: machine.name,
        startTime: startTime.toISOString(),
        endTime: new Date(startTime.getTime() + (Math.random() * 120 + 30) * 60 * 1000).toISOString(),
        status,
        city: machine.city,
        dorm: machine.dorm
      });
    }
  }
  
  return reservations;
}

// Generate profile requests
function generateProfileRequests(): ProfileRequest[] {
  const requests: ProfileRequest[] = [];
  const users = generateUsers();
  
  for (let i = 0; i < 150; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const requestTypes = ['city_change', 'dorm_change', 'contact_update'];
    const requestType = requestTypes[Math.floor(Math.random() * requestTypes.length)] as ProfileRequest['requestType'];
    
    let currentValue, newValue;
    switch (requestType) {
      case 'city_change':
        currentValue = user.city;
        newValue = Object.keys(CITIES_AND_DORMS)[Math.floor(Math.random() * Object.keys(CITIES_AND_DORMS).length)];
        break;
      case 'dorm_change':
        currentValue = user.dorm;
        newValue = CITIES_AND_DORMS[user.city as keyof typeof CITIES_AND_DORMS][Math.floor(Math.random() * CITIES_AND_DORMS[user.city as keyof typeof CITIES_AND_DORMS].length)];
        break;
      case 'contact_update':
        currentValue = user.phone;
        newValue = `+49 ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}${Math.floor(Math.random() * 9000) + 1000}`;
        break;
    }
    
    requests.push({
      id: `req_${i + 1}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      requestType,
      currentValue: currentValue!,
      newValue: newValue!,
      reason: ['Moving to different location', 'Closer to classes', 'Better facilities', 'Personal reasons'][Math.floor(Math.random() * 4)],
      status: ['pending', 'approved', 'rejected'][Math.floor(Math.random() * 3)] as ProfileRequest['status'],
      submittedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      city: user.city,
      dorm: user.dorm
    });
  }
  
  return requests;
}

// Generate user queries
function generateUserQueries(): UserQuery[] {
  const queries: UserQuery[] = [];
  const users = generateUsers();
  const subjects = [
    'Machine not working properly',
    'Unable to make reservation',
    'Payment issue',
    'Account verification problem',
    'App login issues',
    'Reservation cancellation',
    'Machine stuck during cycle',
    'Detergent dispenser problem'
  ];
  
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const status = ['open', 'resolved', 'in_progress'][Math.floor(Math.random() * 3)] as UserQuery['status'];
    
    queries.push({
      id: `query_${i + 1}`,
      userId: user.id,
      userName: user.name,
      email: user.email,
      subject,
      message: `I'm having an issue with ${subject.toLowerCase()}. Could you please help me resolve this?`,
      status,
      priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as UserQuery['priority'],
      submittedAt: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      resolvedAt: status === 'resolved' ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      adminResponse: status === 'resolved' ? 'Thank you for reporting this issue. It has been resolved.' : undefined,
      city: user.city,
      dorm: user.dorm
    });
  }
  
  return queries;
}

// Generate notifications
function generateNotifications(): Notification[] {
  const notifications: Notification[] = [
    {
      id: 'notif_1',
      type: 'user_verification',
      title: 'New User Registration',
      message: 'John Doe has registered and needs verification',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium'
    },
    {
      id: 'notif_2',
      type: 'machine_issue',
      title: 'Machine Malfunction',
      message: 'Washer M-012 in Berlin - Adlershof has a door sensor issue',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'high'
    },
    {
      id: 'notif_3',
      type: 'query_submitted',
      title: 'New User Query',
      message: 'Sarah Weber submitted a query about payment issues',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'low'
    },
    {
      id: 'notif_4',
      type: 'system_alert',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tomorrow from 2-4 AM',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      read: false,
      priority: 'medium'
    },
    {
      id: 'notif_5',
      type: 'user_verification',
      title: 'Verification Request',
      message: 'Emma Fischer has submitted documents for verification',
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      read: true,
      priority: 'medium'
    }
  ];
  
  return notifications;
}

// Export all mock data
export const mockMachines = generateMachines();
export const mockUsers = generateUsers();
export const mockReservations = generateReservations();
export const mockProfileRequests = generateProfileRequests();
export const mockUserQueries = generateUserQueries();
export const mockNotifications = generateNotifications();

// Helper functions to filter data by location
export const filterDataByLocation = <T extends { city: string; dorm: string }>(
  data: T[],
  location: { city: string; dorm: string | 'all' }
): T[] => {
  if (location.dorm === 'all') {
    return data.filter(item => item.city === location.city);
  }
  return data.filter(item => item.city === location.city && item.dorm === location.dorm);
};

// Get statistics for a location
export const getLocationStats = (location: { city: string; dorm: string | 'all' }) => {
  const machines = filterDataByLocation(mockMachines, location);
  const users = filterDataByLocation(mockUsers, location);
  const reservations = filterDataByLocation(mockReservations, location);
  
  return {
    totalMachines: machines.length,
    activeMachines: machines.filter(m => m.status !== 'offline').length,
    inUseMachines: machines.filter(m => m.status === 'in_use').length,
    maintenanceRequired: machines.filter(m => m.status === 'maintenance').length,
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingVerifications: users.filter(u => u.status === 'pending').length,
    activeReservations: reservations.filter(r => r.status === 'active').length,
    queueLength: reservations.filter(r => r.status === 'upcoming').length
  };
};