import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Switch } from '../../ui/switch';
import { 
  WashingMachine, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  UserCheck,
  Settings,
  LogOut,
  Plus,
  Search,
  Filter,
  Bell,
  Moon,
  Sun,
  MapPin,
  Building,
  BarChart3
} from 'lucide-react';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { MachineManagement } from '../machines/MachineManagement';
import { UserManagement } from '../users/UserManagement';
import { ReservationManagement } from '../reservations/ReservationManagement';
import { ProfileRequestsManagement } from '../users/ProfileRequestsManagement';
import { UserQueriesManagement } from '../users/UserQueriesManagement';
import { AdminSettings } from './AdminSettings';
import { LocationSwitcher } from '../../layout/LocationSwitcher';
import { MachineDetail } from '../machines/MachineDetail';
import { NotificationsPanel } from '../../layout/NotificationsPanel';
import { mockNotifications } from '@/dummy-data';
import { overviewService } from '@/lib/api';
import { ClientsOverviewResponse } from '@/lib/api/types';
import { Location } from '@/types';
import { toast } from 'sonner';

interface AdminDashboardProps {
  onLogout: () => void;
  location: Location;
  onLocationChange: (location: Location) => void;
  onBackToLocationSelect: () => void;
}

export function AdminDashboard({ onLogout, location, onLocationChange, onBackToLocationSelect }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [machineAccessType, setMachineAccessType] = useState<'dashboard' | 'machines'>('dashboard');
  const [overviewData, setOverviewData] = useState<ClientsOverviewResponse | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [machineStatusPreset, setMachineStatusPreset] = useState<'all' | 'available' | 'in_use' | 'maintenance' | 'offline'>('all');

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  useEffect(() => {
    if (activeTab !== 'overview' || !location.cityId) {
      return;
    }

    const cityId = location.cityId;

    let isActive = true;

    const loadOverview = async () => {
      try {
        setIsLoadingOverview(true);
        setOverviewError(null);

        const response = await overviewService.getClientsOverview({
          cityId,
          ...(location.dormId ? { dormId: location.dormId } : {})
        });

        if (isActive) {
          setOverviewData(response);
        }
      } catch {
        if (isActive) {
          setOverviewData(null);
          setOverviewError('Unable to load overview data.');
        }
      } finally {
        if (isActive) {
          setIsLoadingOverview(false);
        }
      }
    };

    void loadOverview();

    return () => {
      isActive = false;
    };
  }, [activeTab, location.cityId, location.dormId]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    setSelectedMachineId(null); // Reset machine selection when changing tabs

    if (newTab !== 'machines') {
      setMachineStatusPreset('all');
    }
  };

  const handleMachineClick = (machineId: string, accessType: 'dashboard' | 'machines' = 'dashboard') => {
    setSelectedMachineId(machineId);
    setMachineAccessType(accessType);
  };

  const handleBackFromMachine = () => {
    setSelectedMachineId(null);
  };

  const handleStatsNavigation = (type: 'machines' | 'users', filter?: string) => {
    if (type === 'machines') {
      setActiveTab('machines');
      if (filter === 'in_use' || filter === 'maintenance' || filter === 'available' || filter === 'offline') {
        setMachineStatusPreset(filter);
      } else {
        setMachineStatusPreset('all');
      }
    } else if (type === 'users') {
      setActiveTab('users');
    }
  };

  const handleUserApproval = (userId: string, approved: boolean) => {
    // In a real app, this would call an API
    toast.success(`User ${approved ? 'approved' : 'rejected'} successfully`);
  };

  const unreadNotifications = mockNotifications.filter(n => !n.read).length;

  const recentMachineIssues = overviewData?.recentMachineIssues ?? [];
  const pendingVerifications = overviewData?.pendingVerifications ?? [];
  const getVerificationDisplayName = (user: typeof pendingVerifications[number]) => {
    const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    if (user.name?.trim()) return user.name.trim();
    return 'Unknown user';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="flex items-center gap-2">
              <Image
                src="/waschbuddy-logo.svg"
                alt="WASCHBUDDY logo"
                width={28}
                height={33}
                className="h-7 w-7"
              />
              <h1 className="text-base sm:text-lg md:text-xl">WASCHBUDDY</h1>
            </div>
            <div className="hidden md:block">
              <LocationSwitcher
                currentLocation={location}
                onLocationChange={onLocationChange}
                onBackToLocationSelect={onBackToLocationSelect}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="hidden sm:flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
              <Moon className="h-4 w-4" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowNotifications(true)}>
              <Bell className="h-4 w-4" />
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-1 text-xs">{unreadNotifications}</Badge>
              )}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/api/placeholder/32/32" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" onClick={onLogout} className="hidden sm:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout} className="sm:hidden">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden border-b bg-card">
        <div className="p-3">
          <div className="grid grid-cols-7 gap-1">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'overview'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <BarChart3 className="h-4 w-4 mb-1" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => handleTabChange('machines')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'machines'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <WashingMachine className="h-4 w-4 mb-1" />
              <span>Machines</span>
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'users'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4 mb-1" />
              <span>Users</span>
            </button>
            <button
              onClick={() => handleTabChange('reservations')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'reservations'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Clock className="h-4 w-4 mb-1" />
              <span>Bookings</span>
            </button>
            <button
              onClick={() => handleTabChange('profile-requests')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'profile-requests'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <UserCheck className="h-4 w-4 mb-1" />
              <span>Requests</span>
            </button>
            <button
              onClick={() => handleTabChange('queries')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'queries'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <MessageSquare className="h-4 w-4 mb-1" />
              <span>Queries</span>
            </button>
            <button
              onClick={() => handleTabChange('settings')}
              className={`flex flex-col items-center justify-center p-2 text-xs rounded-md transition-colors text-foreground relative ${
                activeTab === 'settings'
                  ? 'bg-primary/10 text-foreground shadow-sm border-b-2 border-primary/50'
                  : 'hover:bg-accent/50 hover:text-foreground'
              }`}
            >
              <Settings className="h-4 w-4 mb-1" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Location Switcher and Controls */}
      <div className="md:hidden p-4 border-b bg-card space-y-4">
        <LocationSwitcher
          currentLocation={location}
          onLocationChange={onLocationChange}
          onBackToLocationSelect={onBackToLocationSelect}
        />
        
        {/* Mobile Dark Mode Toggle */}
        <div className="flex items-center justify-center space-x-2 sm:hidden">
          <Sun className="h-4 w-4" />
          <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
          <Moon className="h-4 w-4" />
        </div>
      </div>

      <div className="md:flex">
        {/* Desktop Sidebar Navigation */}
        <nav className="w-64 bg-card border-r min-h-[calc(100vh-4rem)] hidden md:block">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-cols-1 h-auto gap-2 bg-transparent">
                <TabsTrigger 
                  value="overview" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'overview' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="machines" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'machines' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <WashingMachine className="h-4 w-4 mr-2" />
                  Machines
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'users' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </TabsTrigger>
                <TabsTrigger 
                  value="reservations" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'reservations' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Reservations
                </TabsTrigger>
                <TabsTrigger 
                  value="profile-requests" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'profile-requests' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Profile Requests
                </TabsTrigger>
                <TabsTrigger 
                  value="queries" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'queries' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  User Queries
                </TabsTrigger>
                <TabsTrigger 
                  value="settings" 
                  className={`justify-start w-full text-foreground relative ${activeTab === 'settings' ? 'bg-primary/10 text-foreground shadow-sm border-l-4 border-primary/50' : 'hover:bg-accent/50 hover:text-foreground'}`}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto md:min-h-[calc(100vh-4rem)]">

          <div className="p-4 md:p-6">
            {selectedMachineId ? (
              <MachineDetail
                machineId={selectedMachineId}
                location={location}
                onBack={handleBackFromMachine}
                accessType={machineAccessType}
              />
            ) : (
              <Tabs value={activeTab} className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
              <div>
                <h2 className="text-2xl mb-6">Dashboard Overview</h2>

                {isLoadingOverview && (
                  <p className="text-sm text-muted-foreground mb-4">Loading overview data...</p>
                )}

                {overviewError && (
                  <p className="text-sm text-destructive mb-4">{overviewError}</p>
                )}
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatsNavigation('machines')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Total Machines</CardTitle>
                      <WashingMachine className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{overviewData?.totalMachines ?? 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {overviewData?.activeMachines ?? 0} active
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatsNavigation('machines', 'in_use')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">In Use</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{overviewData?.machinesInUse ?? 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Currently running
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatsNavigation('machines', 'maintenance')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Maintenance</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{overviewData?.machinesInMaintenance ?? 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Require attention
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleStatsNavigation('users')}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm">Total Users</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl">{overviewData?.totalUsers ?? 0}</div>
                      <p className="text-xs text-muted-foreground">
                        {overviewData?.pendingUsers ?? 0} pending verification
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Machine Issues</CardTitle>
                      <CardDescription>Machines requiring attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {recentMachineIssues.slice(0, 2).map((issue, index) => (
                          <div 
                            key={issue.id ?? issue.machineId ?? `${index}`}
                            className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg cursor-pointer hover:bg-destructive/20 transition-colors"
                            onClick={() => {
                              if (issue.machineId) {
                                handleMachineClick(issue.machineId, 'dashboard');
                              }
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <div>
                                <p className="text-sm">{issue.title ?? (issue.machineId ? `Machine ${issue.machineId}` : 'Machine issue')}</p>
                                <p className="text-xs text-muted-foreground">{issue.message ?? issue.issue ?? 'Requires attention'}</p>
                              </div>
                            </div>
                            <Badge variant="destructive">{issue.severity ?? 'Issue'}</Badge>
                          </div>
                        ))}
                        {recentMachineIssues.length === 0 && (
                          <p className="text-muted-foreground text-center py-4">No machine issues</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Pending Verifications</CardTitle>
                      <CardDescription>New user accounts awaiting approval</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {pendingVerifications.slice(0, 3).map((user, index) => (
                            <div key={user.id ?? user.userId ?? `${index}`} className="flex items-center justify-between p-3 bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="dark:bg-gray-800 dark:text-gray-200">
                                    {getVerificationDisplayName(user).split(' ').map(n => n[0]).join('').toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm dark:text-black">{getVerificationDisplayName(user)}</p>
                                  <p className="text-xs text-muted-foreground dark:text-gray-400">{user.email ?? 'No email'}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserApproval(user.userId ?? user.id ?? `${index}`, true)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleUserApproval(user.userId ?? user.id ?? `${index}`, false)}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {pendingVerifications.length === 0 && (
                          <p className="text-muted-foreground text-center py-4">No pending verifications</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Machine Management Tab */}
            <TabsContent value="machines">
              <MachineManagement 
                location={location} 
                initialStatusFilter={machineStatusPreset}
                onMachineClick={(machineId) => handleMachineClick(machineId, 'machines')}
              />
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users">
              <UserManagement location={location} />
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations">
              <ReservationManagement location={location} />
            </TabsContent>

            {/* Profile Requests Tab */}
            <TabsContent value="profile-requests">
              <ProfileRequestsManagement location={location} />
            </TabsContent>

            {/* User Queries Tab */}
            <TabsContent value="queries">
              <UserQueriesManagement location={location} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <AdminSettings location={location} />
            </TabsContent>
            </Tabs>
            )}
          </div>
        </main>
      </div>

      {/* Notifications Panel */}
      <NotificationsPanel 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />
    </div>
  );
}