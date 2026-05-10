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
  WifiOff
} from 'lucide-react';
import { filterDataByLocation, mockMachines } from '@/dummy-data';
import { Machine } from '@/types';
import { CITIES_AND_DORMS } from '@/constants';
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
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

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
    
    // Sort machines by status priority: maintenance -> in_use -> available -> offline
    const allMachines = [...originalMachines, ...addedMachinesForLocation];
    const sortedMachines = allMachines.sort((a, b) => {
      const statusPriority = {
        'maintenance': 1,
        'in_use': 2,
        'available': 3,
        'offline': 4
      };
      
      const priorityA = statusPriority[a.status as keyof typeof statusPriority] || 5;
      const priorityB = statusPriority[b.status as keyof typeof statusPriority] || 5;
      
      if (priorityA === priorityB) {
        return a.id.localeCompare(b.id);
      }
      
      return priorityA - priorityB;
    });
    
    setMachines(sortedMachines);
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