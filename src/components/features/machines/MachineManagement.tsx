import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Label } from '../../ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { 
  WashingMachine, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Power,
  Settings,
  Tag,
  Calendar,
  Cpu,
  Wifi,
  WifiOff,
  Loader2
} from 'lucide-react';
import { filterDataByLocation, mockMachines } from '@/dummy-data';
import { machineService, overviewService } from '@/lib/api';
import { ClientMachineResponse, ClientDorm, CreateMachineStatus } from '@/lib/api/types';
import { ApiHttpError } from '@/lib/api';
import { Machine } from '@/types';
import { Location } from '@/types';
import { CITIES_AND_DORMS } from '@/constants';
import { toast } from 'sonner';

interface MachineManagementProps {
  location: Location;
  initialStatusFilter?: 'all' | 'available' | 'in_use' | 'maintenance' | 'offline';
  onMachineClick?: (machineId: string) => void;
}

// Store added machines globally to persist across location changes
let globalAddedMachines: Machine[] = [];

const mapApiStatusToUiStatus = (status?: string): Machine['status'] => {
  switch ((status ?? '').toUpperCase()) {
    case 'ACTIVE':
    case 'AVAILABLE':
      return 'available';
    case 'RESERVED':
    case 'IN_USE':
      return 'in_use';
    case 'OUT_OF_ORDER':
    case 'MAINTENANCE':
      return 'maintenance';
    case 'INACTIVE':
    case 'OFFLINE':
      return 'offline';
    default:
      return 'available';
  }
};

const mapUiStatusToApiStatus = (status: string): CreateMachineStatus | undefined => {
  switch (status) {
    case 'in_use':
      return 'RESERVED';
    case 'maintenance':
      return 'MAINTENANCE';
    case 'offline':
      return 'OFFLINE';
    case 'available':
      return 'ACTIVE';
    default:
      return undefined;
  }
};

const mapApiMachineToUiMachine = (machine: ClientMachineResponse, location: Location): Machine => {
  const machineNumberSuffix = typeof machine.machineNumber === 'number' ? `-${String(machine.machineNumber).padStart(3, '0')}` : '';

  return {
    id: machine.id,
    name: machine.name ? `${machine.name}${machineNumberSuffix}` : `Machine${machineNumberSuffix || ''}`,
    type: machine.type === 1 ? 'dryer' : 'washer',
    status: mapApiStatusToUiStatus(machine.status),
    location: machine.dormId ?? location.dorm,
    dorm: location.dorm === 'all' ? (machine.dormId ?? 'Unknown dorm') : location.dorm,
    city: location.city,
    lastMaintenance: machine.lastMaintenanceDate ?? machine.updatedAt ?? machine.createdAt ?? new Date().toISOString(),
    totalCycles: 0,
    model: machine.model ?? 'Unknown model'
  };
};

export function MachineManagement({ location, initialStatusFilter = 'all', onMachineClick }: MachineManagementProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isLoadingMachines, setIsLoadingMachines] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isAddingMachine, setIsAddingMachine] = useState(false);
  const [selectedDormId, setSelectedDormId] = useState('');
  const [dormOptions, setDormOptions] = useState<ClientDorm[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'washer' as 'washer' | 'dryer',
    serialNumber: '',
    model: '',
    installationDate: '',
    status: 'ACTIVE' as CreateMachineStatus
  });

  const CREATE_MACHINE_STATUSES: Array<Exclude<CreateMachineStatus, 'RESERVED'>> = [
    'ACTIVE',
    'INACTIVE',
    'MAINTENANCE',
    'OUT_OF_ORDER',
    'OFFLINE'
  ];

  useEffect(() => {
    let isActive = true;

    const loadDormOptions = async () => {
      if (!location.cityId) {
        if (isActive) {
          const fallbackDorms = (CITIES_AND_DORMS[location.city as keyof typeof CITIES_AND_DORMS] ?? []).map((name) => ({
            id: name,
            name
          }));
          setDormOptions(fallbackDorms);
        }
        return;
      }

      try {
        const dorms = await overviewService.getDorms({ cityId: location.cityId });
        if (isActive) {
          setDormOptions(dorms);
        }
      } catch {
        if (isActive) {
          setDormOptions([]);
        }
      }
    };

    void loadDormOptions();

    return () => {
      isActive = false;
    };
  }, [location.city, location.cityId]);

  useEffect(() => {
    setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    let isActive = true;

    const loadMachines = async () => {
      if (!location.cityId) {
        const originalMachines = filterDataByLocation(mockMachines, location);
        if (isActive) {
          setMachines(originalMachines);
          setLoadError(null);
        }
        return;
      }

      try {
        setIsLoadingMachines(true);
        setLoadError(null);

        const apiMachines = await machineService.getMachines({
          cityId: location.cityId,
          ...(location.dormId ? { dormId: location.dormId } : {}),
          ...(statusFilter !== 'all' ? { status: mapUiStatusToApiStatus(statusFilter) } : {})
        });

        if (!isActive) return;

        const mappedMachines = apiMachines.map((machine) => mapApiMachineToUiMachine(machine, location));

        const addedMachinesForLocation = globalAddedMachines.filter(machine => {
          if (location.dorm === 'all') {
            return machine.city === location.city;
          }
          return machine.city === location.city && machine.dorm === location.dorm;
        });

        setMachines([...mappedMachines, ...addedMachinesForLocation]);
      } catch {
        if (!isActive) return;

        setLoadError('Unable to load machines.');
        const fallbackMachines = filterDataByLocation(mockMachines, location);
        setMachines(fallbackMachines);
      } finally {
        if (isActive) {
          setIsLoadingMachines(false);
        }
      }
    };

    void loadMachines();

    return () => {
      isActive = false;
    };
  }, [location.city, location.dorm, location.cityId, location.dormId, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'default';
      case 'in_use':
        return 'secondary';
      case 'maintenance':
        return 'destructive';
      case 'offline':
        return 'outline';
      default:
        return 'default';
    }
  };

  const getStatusBorderColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'border-green-500 border';
      case 'in_use':
        return 'border-blue-500 border';
      case 'maintenance':
        return 'border-red-500 border';
      case 'offline':
        return 'border-gray-500 border';
      default:
        return 'border-gray-300 border';
    }
  };

  const getStatusBorderStyle = (status: string) => {
    switch (status) {
      case 'available':
        return { borderColor: '#10b981', borderWidth: '1px' };
      case 'in_use':
        return { borderColor: '#3b82f6', borderWidth: '1px' };
      case 'maintenance':
        return { borderColor: '#ef4444', borderWidth: '1px' };
      case 'offline':
        return { borderColor: '#6b7280', borderWidth: '1px' };
      default:
        return { borderColor: '#d1d5db', borderWidth: '1px' };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <WifiOff className="h-4 w-4" />;
      default:
        return <Power className="h-4 w-4" />;
    }
  };

  const handleCardClick = (machine: Machine) => {
    setSelectedMachine(machine);
    setIsDetailDialogOpen(true);
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.dorm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const handleAddMachine = async () => {
    if (isAddingMachine) {
      return;
    }

    if (!location.cityId) {
      toast.error('City ID is missing. Please reselect location.');
      return;
    }

    const inferredDormId = dormOptions.find((dorm) => dorm.name === location.dorm)?.id;
    const targetDormId = location.dorm === 'all' ? selectedDormId : (location.dormId ?? inferredDormId ?? '');

    if (
      !newMachine.name.trim() ||
      !newMachine.serialNumber.trim() ||
      !newMachine.model.trim() ||
      !newMachine.installationDate ||
      !targetDormId
    ) {
      toast.error('Please fill in all required fields');
      return;
    }

    const machineName = newMachine.name.trim();
    const targetDormName = dormOptions.find((dorm) => dorm.id === targetDormId)?.name ?? location.dorm;
    const machineType: 0 | 1 = newMachine.type === 'washer' ? 0 : 1;

    try {
      setIsAddingMachine(true);

      const payload = {
        name: machineName,
        type: machineType,
        status: newMachine.status,
        dormId: targetDormId,
        serialNumber: newMachine.serialNumber.trim(),
        model: newMachine.model.trim(),
        installationDate: new Date(`${newMachine.installationDate}T00:00:00.000Z`).toISOString()
      };

      await machineService.addMachine(payload);

      const apiMachines = await machineService.getMachines({
        cityId: location.cityId,
        ...(location.dormId ? { dormId: location.dormId } : {}),
        ...(statusFilter !== 'all' ? { status: mapUiStatusToApiStatus(statusFilter) } : {})
      });
      setMachines(apiMachines.map((machine) => mapApiMachineToUiMachine(machine, location)));

      setNewMachine({
        name: '',
        type: 'washer',
        serialNumber: '',
        model: '',
        installationDate: '',
        status: 'ACTIVE'
      });
      setSelectedDormId('');
      setIsAddDialogOpen(false);

      toast.success(`Machine ${machineName} added successfully to ${targetDormName}`);
    } catch (error) {
      if (error instanceof ApiHttpError) {
        const responseMessage =
          error.responseBody && typeof error.responseBody === 'object'
            ? (error.responseBody as { message?: string }).message
            : undefined;

        const message = responseMessage || error.message || 'Failed to add machine. Please try again.';
        console.groupCollapsed(`[machines:add] API error (${error.status})`);
        console.warn('message:', message);
        console.debug('responseBody:', error.responseBody);
        console.groupEnd();
        toast.error(message);
        return;
      }

      console.warn('[machines:add] unexpected error');
      console.debug(error);
      toast.error('Failed to add machine. Please try again.');
    } finally {
      setIsAddingMachine(false);
    }
  };

  const handleDeleteMachine = (machineId: string) => {
    // Remove from both local state and global storage
    setMachines(machines.filter(machine => machine.id !== machineId));
    globalAddedMachines = globalAddedMachines.filter(machine => machine.id !== machineId);
    toast.success('Machine deleted successfully');
  };

  const handleStatusChange = (machineId: string, newStatus: Machine['status']) => {
    const updateMachine = (machine: Machine) => 
      machine.id === machineId 
        ? { 
            ...machine, 
            status: newStatus, 
            ...(newStatus !== 'in_use' && { currentUser: undefined, timeRemaining: undefined }) 
          }
        : machine;

    // Update local state
    setMachines(machines.map(updateMachine));
    
    // Update global storage if machine is there
    globalAddedMachines = globalAddedMachines.map(updateMachine);
    
    toast.success('Machine status updated');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl">Machine Management</h2>
          <p className="text-muted-foreground">
            {location.dorm === 'all' 
              ? `Manage machines across all dorms in ${location.city}` 
              : `Manage machines in ${location.dorm}, ${location.city}`}
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Machine
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Machine</DialogTitle>
              <DialogDescription>Add a new machine to the system</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-name" className="sm:text-right">Name</Label>
                <Input
                  id="machine-name"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({...newMachine, name: e.target.value})}
                  className="sm:col-span-3"
                  placeholder="e.g., Wascher"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-type" className="sm:text-right">Type</Label>
                <Select value={newMachine.type} onValueChange={(value: 'washer' | 'dryer') => setNewMachine({...newMachine, type: value})}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="washer">Washer</SelectItem>
                    <SelectItem value="dryer">Dryer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {location.dorm === 'all' && (
                <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                  <Label htmlFor="machine-dorm" className="sm:text-right">Dorm</Label>
                  <Select value={selectedDormId} onValueChange={setSelectedDormId}>
                    <SelectTrigger className="sm:col-span-3">
                      <SelectValue placeholder="Select dorm" />
                    </SelectTrigger>
                    <SelectContent>
                      {dormOptions.map((dorm) => (
                        <SelectItem key={`${dorm.id}-${dorm.name}`} value={dorm.id}>{dorm.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-serial" className="sm:text-right">Serial Number</Label>
                <Input
                  id="machine-serial"
                  value={newMachine.serialNumber}
                  onChange={(e) => setNewMachine({...newMachine, serialNumber: e.target.value})}
                  className="sm:col-span-3"
                  placeholder="e.g., WM002"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-model" className="sm:text-right">Model</Label>
                <Input
                  id="machine-model"
                  value={newMachine.model}
                  onChange={(e) => setNewMachine({...newMachine, model: e.target.value})}
                  className="sm:col-span-3"
                  placeholder="e.g., AquaClean Pro 2000"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-installation-date" className="sm:text-right">Installation Date</Label>
                <Input
                  id="machine-installation-date"
                  type="date"
                  value={newMachine.installationDate}
                  onChange={(e) => setNewMachine({...newMachine, installationDate: e.target.value})}
                  className="sm:col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-4">
                <Label htmlFor="machine-status" className="sm:text-right">Status</Label>
                <Select value={newMachine.status} onValueChange={(value: CreateMachineStatus) => setNewMachine({...newMachine, status: value})}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CREATE_MACHINE_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replaceAll('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMachine} disabled={isAddingMachine}>
                {isAddingMachine && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isAddingMachine ? 'Adding...' : 'Add Machine'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="in_use">In Use</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Machine Grid */}
      {isLoadingMachines && (
        <p className="text-sm text-muted-foreground">Loading machines...</p>
      )}

      {loadError && (
        <p className="text-sm text-destructive">{loadError}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <Card 
            key={machine.id} 
            className={`relative hover:shadow-md transition-all duration-200 cursor-pointer ${getStatusBorderColor(machine.status)}`}
            style={getStatusBorderStyle(machine.status)}
            onClick={() => handleCardClick(machine)}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${getStatusBorderColor(machine.status).replace('border-', 'bg-').replace('-500', '-100')}`}>
                    {getStatusIcon(machine.status)}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">
                      {machine.name}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{machine.dorm}</CardDescription>
                  </div>
                </div>
                <Badge 
                  variant={getStatusColor(machine.status)} 
                  className={`flex items-center gap-1 font-semibold ${
                    machine.status === 'available' ? 'bg-green-100 text-green-800' :
                    machine.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                    machine.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {machine.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Model:</span>
                  <span className="font-medium">{machine.model}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{machine.type}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Last Service:</span>
                  <span className="font-medium">{new Date(machine.lastMaintenance).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <div onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={machine.status}
                    onValueChange={(value: Machine['status']) => handleStatusChange(machine.id, value)}
                  >
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="in_use">In Use</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMachineClick?.(machine.id);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:text-red-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Machine</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {machine.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteMachine(machine.id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMachines.length === 0 && (
        <div className="text-center py-12">
          <WashingMachine className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No machines found matching your criteria</p>
        </div>
      )}

      {/* Machine Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          {selectedMachine && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${getStatusBorderColor(selectedMachine.status).replace('border-', 'bg-').replace('-500', '-100')}`}>
                      {getStatusIcon(selectedMachine.status)}
                    </div>
                    <div>
                      <DialogTitle className="text-2xl font-bold">{selectedMachine.name}</DialogTitle>
                      <DialogDescription className="text-lg">{selectedMachine.dorm}</DialogDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={getStatusColor(selectedMachine.status)} 
                    className={`text-lg px-4 py-2 ${
                      selectedMachine.status === 'available' ? 'bg-green-100 text-green-800' :
                      selectedMachine.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                      selectedMachine.status === 'maintenance' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {selectedMachine.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
                {/* Machine Details */}
                <div className="space-y-4 pr-6 lg:border-r border-gray-200">
                  <h3 className="text-lg font-semibold">Machine Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg w-full min-h-[60px]">
                      <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Machine ID</p>
                        <p className="font-medium">{selectedMachine.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg w-full min-h-[60px]">
                      <Cpu className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Model</p>
                        <p className="font-medium">{selectedMachine.model}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg w-full min-h-[60px]">
                      <Tag className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium capitalize">{selectedMachine.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg w-full min-h-[60px]">
                      <Calendar className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">Last Service</p>
                        <p className="font-medium">{new Date(selectedMachine.lastMaintenance).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div className="space-y-4 pl-6">
                  <h3 className="text-lg font-semibold">Status Information</h3>
                  
                  {selectedMachine.status === 'in_use' && selectedMachine.currentUser && (
                    <div className="space-y-4">
                      <div className="p-4 bg-blue-50 rounded-lg w-full min-h-[60px]">
                        <p className="text-sm font-medium text-blue-800">Current User</p>
                        <p className="text-blue-600">{selectedMachine.currentUser}</p>
                      </div>
                      {selectedMachine.timeRemaining && (
                        <div className="p-4 bg-blue-50 rounded-lg w-full min-h-[80px]">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-800">Time Remaining</p>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${(selectedMachine.timeRemaining / 90) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-sm text-blue-600 mt-2">{selectedMachine.timeRemaining} min remaining</p>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedMachine.status === 'maintenance' && selectedMachine.issue && (
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200 w-full min-h-[80px]">
                      <p className="text-sm font-medium text-red-800 mb-2">Issues:</p>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-600">{selectedMachine.issue}</p>
                      </div>
                    </div>
                  )}

                  {selectedMachine.status === 'available' && (
                    <div className="p-4 bg-green-50 rounded-lg w-full min-h-[60px]">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-green-800">Machine is ready for use</p>
                      </div>
                    </div>
                  )}

                  {selectedMachine.status === 'offline' && (
                    <div className="p-4 bg-gray-50 rounded-lg w-full min-h-[60px]">
                      <div className="flex items-center gap-2">
                        <WifiOff className="h-4 w-4 text-gray-600 flex-shrink-0" />
                        <p className="text-sm font-medium text-gray-800">Machine is currently offline</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    onMachineClick?.(selectedMachine.id);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Machine</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete {selectedMachine.name}? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          handleDeleteMachine(selectedMachine.id);
                          setIsDetailDialogOpen(false);
                        }} 
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}