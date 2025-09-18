import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
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
  Settings
} from 'lucide-react';
import { filterDataByLocation, mockMachines, Machine, CITIES_AND_DORMS } from './utils/mockData';
import { toast } from 'sonner';

interface MachineManagementProps {
  location: { city: string; dorm: string | 'all' };
  onMachineClick?: (machineId: string) => void;
}

// Store added machines globally to persist across location changes
let globalAddedMachines: Machine[] = [];

export function MachineManagement({ location, onMachineClick }: MachineManagementProps) {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDorm, setSelectedDorm] = useState('');

  const [newMachine, setNewMachine] = useState({
    name: '',
    type: 'washer' as 'washer' | 'dryer',
    dorm: '',
    model: '',
    status: 'available' as Machine['status']
  });

  // Update machines when location changes, including any added machines
  useEffect(() => {
    const originalMachines = filterDataByLocation(mockMachines, location);
    const addedMachinesForLocation = globalAddedMachines.filter(machine => {
      if (location.dorm === 'all') {
        return machine.city === location.city;
      }
      return machine.city === location.city && machine.dorm === location.dorm;
    });
    setMachines([...originalMachines, ...addedMachinesForLocation]);
  }, [location.city, location.dorm]); // More specific dependencies to prevent unnecessary re-renders

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <Power className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const filteredMachines = machines.filter(machine => {
    const matchesSearch = machine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.dorm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         machine.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || machine.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getNextMachineId = () => {
    const targetDorm = location.dorm === 'all' ? selectedDorm : location.dorm;
    const existingMachines = filterDataByLocation(mockMachines, { city: location.city, dorm: targetDorm });
    const addedMachinesForDorm = globalAddedMachines.filter(machine => 
      machine.city === location.city && machine.dorm === targetDorm
    );
    
    const allMachines = [...existingMachines, ...addedMachinesForDorm];
    
    const maxId = allMachines.reduce((max, machine) => {
      const idParts = machine.id.split('-');
      if (idParts.length > 1) {
        const idNum = parseInt(idParts[1]);
        return idNum > max ? idNum : max;
      }
      return max;
    }, 0);
    
    return String(maxId + 1).padStart(3, '0');
  };

  const handleAddMachine = () => {
    if (!newMachine.type || (location.dorm === 'all' && !selectedDorm)) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetDorm = location.dorm === 'all' ? selectedDorm : location.dorm;
    const nextId = getNextMachineId();
    const machineId = `${newMachine.type === 'washer' ? 'W' : 'D'}-${nextId}`;
    
    const newMachineData: Machine = {
      id: machineId,
      name: `${newMachine.type === 'washer' ? 'Washer' : 'Dryer'} M-${nextId}`,
      type: newMachine.type,
      status: newMachine.status,
      location: targetDorm,
      dorm: targetDorm,
      city: location.city,
      lastMaintenance: new Date().toISOString().split('T')[0],
      totalCycles: 0,
      model: newMachine.model || (newMachine.type === 'washer' ? 'AquaClean Pro 2000' : 'DryMaster Elite 1500')
    };

    // Add to global storage and local state
    globalAddedMachines.push(newMachineData);
    setMachines([...machines, newMachineData]);
    
    setNewMachine({
      name: '',
      type: 'washer',
      dorm: '',
      model: '',
      status: 'available'
    });
    setSelectedDorm('');
    setIsAddDialogOpen(false);
    
    toast.success(`Machine ${newMachineData.name} added successfully to ${targetDorm}`);
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
                  <Select value={selectedDorm} onValueChange={setSelectedDorm}>
                    <SelectTrigger className="sm:col-span-3">
                      <SelectValue placeholder="Select dorm" />
                    </SelectTrigger>
                    <SelectContent>
                      {CITIES_AND_DORMS[location.city as keyof typeof CITIES_AND_DORMS]?.map((dorm) => (
                        <SelectItem key={dorm} value={dorm}>{dorm}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
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
                <Label htmlFor="machine-status" className="sm:text-right">Status</Label>
                <Select value={newMachine.status} onValueChange={(value: Machine['status']) => setNewMachine({...newMachine, status: value})}>
                  <SelectTrigger className="sm:col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleAddMachine}>Add Machine</Button>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <Card key={machine.id} className="relative hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <WashingMachine className="h-5 w-5" />
                    {machine.name}
                  </CardTitle>
                  <CardDescription>{machine.dorm}</CardDescription>
                </div>
                <Badge variant={getStatusColor(machine.status)} className="flex items-center gap-1">
                  {getStatusIcon(machine.status)}
                  {machine.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Model</p>
                  <p>{machine.model}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Type</p>
                  <p className="capitalize">{machine.type}</p>
                </div>
              </div>
              
              {machine.status === 'in_use' && machine.currentUser && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm font-medium">In Use</p>
                  <p className="text-xs text-muted-foreground truncate">{machine.currentUser}</p>
                  {machine.timeRemaining && (
                    <p className="text-xs text-muted-foreground">
                      {machine.timeRemaining} min remaining
                    </p>
                  )}
                </div>
              )}

              {machine.status === 'maintenance' && machine.issue && (
                <div className="p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">Issue</p>
                  <p className="text-xs text-red-600 dark:text-red-300">{machine.issue}</p>
                </div>
              )}
              
              <div className="text-sm">
                <p className="text-muted-foreground">Last Maintenance</p>
                <p>{machine.lastMaintenance}</p>
              </div>
              
              <div className="flex gap-2">
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
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onMachineClick?.(machine.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
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
    </div>
  );
}