import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
import { Skeleton } from '../../ui/skeleton';
import { 
  ArrowLeft, 
  WashingMachine, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Settings,
  Wrench,
  User,
  Activity,
  Loader2
} from 'lucide-react';
import { mockMachines, mockReservations } from '@/dummy-data';
import { machineService } from '@/lib/api';
import { ClientMachineResponse } from '@/lib/api/types';
import { Machine } from '@/types';
import { toast } from 'sonner';

interface MachineDetailProps {
  machineId: string;
  location: { city: string; dorm: string | 'all' };
  onBack: () => void;
  accessType: 'dashboard' | 'machines'; // Different access paths
}

export function MachineDetail({ machineId, location, onBack, accessType }: MachineDetailProps) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    status: '',
    model: '',
    serialNumber: '',
    installationDate: ''
  });

  const mapApiStatusToUiStatus = (status?: string): Machine['status'] => {
    switch ((status ?? '').toUpperCase()) {
      case 'ACTIVE':
      case 'AVAILABLE':
        return 'available';
      case 'RESERVED':
      case 'IN_USE':
        return 'in_use';
      case 'MAINTENANCE':
        return 'maintenance';
      case 'OUT_OF_ORDER':
        return 'out_of_order';
      case 'INACTIVE':
      case 'OFFLINE':
        return 'offline';
      default:
        return 'available';
    }
  };

  const mapApiMachineToUiMachine = (apiMachine: ClientMachineResponse): Machine => {
    const suffix = typeof apiMachine.machineNumber === 'number' ? `-${String(apiMachine.machineNumber).padStart(3, '0')}` : '';

    return {
      id: apiMachine.id,
      name: apiMachine.name ? `${apiMachine.name}${suffix}` : `Machine${suffix || ''}`,
      type: apiMachine.type === 1 ? 'dryer' : 'washer',
      status: mapApiStatusToUiStatus(apiMachine.status),
      location: location.dorm === 'all' ? (apiMachine.dormId ?? location.dorm) : location.dorm,
      dorm: location.dorm === 'all' ? (apiMachine.dormId ?? 'Unknown dorm') : location.dorm,
      city: location.city,
      machineNumber: apiMachine.machineNumber,
      serialNumber: apiMachine.serialNumber,
      installationDate: apiMachine.installationDate,
      clientId: apiMachine.clientId,
      dormId: apiMachine.dormId,
      createdAt: apiMachine.createdAt,
      updatedAt: apiMachine.updatedAt,
      lastMaintenanceDate: apiMachine.lastMaintenanceDate,
      maintenanceScheduled: apiMachine.maintenanceScheduled,
      scheduledWindow: apiMachine.scheduledWindow,
      queueCount: apiMachine.queueCount,
      isReserved: apiMachine.isReserved,
      currentReservation: apiMachine.currentReservation,
      lastMaintenance: apiMachine.lastMaintenanceDate ?? apiMachine.updatedAt ?? apiMachine.createdAt ?? new Date().toISOString(),
      totalCycles: 0,
      model: apiMachine.model ?? 'Unknown model'
    };
  };

  useEffect(() => {
    let isActive = true;

    const loadMachine = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const apiMachines = await machineService.getMachines({
          ...(location.cityId ? { cityId: location.cityId } : {}),
          ...(location.dormId ? { dormId: location.dormId } : {})
        });

        const foundApiMachine = apiMachines.find((item) => item.id === machineId);

        if (foundApiMachine && isActive) {
          const mappedMachine = mapApiMachineToUiMachine(foundApiMachine);
          setMachine(mappedMachine);
          setEditForm({
            name: mappedMachine.name,
            status: mappedMachine.status,
            model: mappedMachine.model,
            serialNumber: mappedMachine.serialNumber ?? '',
            installationDate: mappedMachine.installationDate ? mappedMachine.installationDate.slice(0, 10) : ''
          });
          return;
        }
      } catch {
        // Fall back to dummy data below.
      }

      const foundMachine = mockMachines.find((m) => m.id === machineId);
      if (foundMachine && isActive) {
        setMachine(foundMachine);
        setEditForm({
          name: foundMachine.name,
          status: foundMachine.status,
          model: foundMachine.model,
          serialNumber: foundMachine.serialNumber ?? '',
          installationDate: foundMachine.installationDate ? foundMachine.installationDate.slice(0, 10) : ''
        });
        return;
      }

      if (isActive) {
        setMachine(null);
        setLoadError('Machine not found');
      }
    };

    void loadMachine().finally(() => {
      if (isActive) {
        setIsLoading(false);
      }
    });

    return () => {
      isActive = false;
    };
  }, [machineId, location.cityId, location.dormId, location.city, location.dorm]);

  const handleSave = () => {
    if (!machine || isSaving) {
      return;
    }

    setIsSaving(true);

    const apiStatusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'OFFLINE' | undefined> = {
      available: 'ACTIVE',
      in_use: 'RESERVED',
      maintenance: 'MAINTENANCE',
      out_of_order: 'OUT_OF_ORDER',
      offline: 'OFFLINE'
    };

    const updatePayload = {
      name: editForm.name.trim(),
      status: apiStatusMap[editForm.status],
      model: editForm.model.trim(),
      serialNumber: editForm.serialNumber.trim() || undefined,
      installationDate: editForm.installationDate ? new Date(`${editForm.installationDate}T00:00:00.000Z`).toISOString() : undefined
    };

    void (async () => {
      const apiStatusMap: Record<string, 'ACTIVE' | 'INACTIVE' | 'RESERVED' | 'MAINTENANCE' | 'OUT_OF_ORDER' | 'OFFLINE' | undefined> = {
        available: 'ACTIVE',
        in_use: 'RESERVED',
        maintenance: 'MAINTENANCE',
        out_of_order: 'OUT_OF_ORDER',
        offline: 'OFFLINE'
      };

      try {
        const updatedMachine = await machineService.updateMachine(machine.id, updatePayload);
        const mappedMachine = mapApiMachineToUiMachine(updatedMachine);
        setMachine(mappedMachine);
        setEditForm({
          name: mappedMachine.name,
          status: mappedMachine.status,
          model: mappedMachine.model,
          serialNumber: mappedMachine.serialNumber ?? '',
          installationDate: mappedMachine.installationDate ? mappedMachine.installationDate.slice(0, 10) : ''
        });
        setIsEditing(false);
      } catch {
        setLoadError('Failed to update machine');
      } finally {
        setIsSaving(false);
      }
    })();
  };

  const handleDelete = async () => {
    if (!machine || isDeleting) return;
    setIsDeleting(true);
    try {
      await machineService.deleteMachine(machine.id);
      toast.success('Machine deleted successfully');
      // Notify other parts of the app so they can refresh without a full reload
      try {
        window.dispatchEvent(new CustomEvent('machine:deleted', { detail: machine.id }));
      } catch {
        // ignore if dispatching fails
      }
      // Close detail view
      onBack();
    } catch (err) {
      toast.error('Failed to delete machine');
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_order':
        return 'bg-red-100 text-red-800';
      case 'offline':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_use':
        return <Clock className="h-4 w-4" />;
      case 'maintenance':
        return <Wrench className="h-4 w-4" />;
      case 'out_of_order':
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <Settings className="h-4 w-4" />;
      default:
        return <WashingMachine className="h-4 w-4" />;
    }
  };

  const getDisplayValue = (value?: string | number | boolean | null) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided';
    }

    return typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
  };

  const getMachineNumberLabel = (value?: number) => (typeof value === 'number' ? `#${String(value).padStart(3, '0')}` : 'Not provided');

  // Get recent reservations for this machine
  const recentReservations = mockReservations
    .filter(r => r.machineId === machineId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex items-center justify-between mb-6 gap-4">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-8 w-56" />
          </div>
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-44" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
                <Skeleton className="h-16 w-full rounded-lg" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-36" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
                <Skeleton className="h-10 w-full rounded-md" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!machine) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1>{loadError ?? 'Machine not found'}</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {accessType === 'dashboard' ? 'Dashboard' : 'Machines'}
          </Button>
          <div className="flex items-center space-x-2">
            <WashingMachine className="h-6 w-6" />
            <h1>{machine.name}</h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {accessType === 'dashboard' && (
            <Badge variant="secondary">Issue Report</Badge>
          )}
          <Button 
            variant={isEditing ? "default" : "outline"} 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={isSaving}
          >
            {isEditing ? (
              <>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Modify
              </>
            )}
          </Button>
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Machine Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Machine Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="machine-name">Machine Name</Label>
                  {isEditing ? (
                    <Input
                      id="machine-name"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="mt-1"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{machine.name}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="machine-type">Type</Label>
                  <p className="mt-1 p-2 bg-muted rounded capitalize">{machine.type}</p>
                </div>

                <div>
                  <Label htmlFor="machine-number">Machine Number</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getMachineNumberLabel(machine.machineNumber)}</p>
                </div>

                <div>
                  <Label htmlFor="machine-serial">Serial Number</Label>
                  {isEditing ? (
                    <Input
                      id="machine-serial"
                      value={editForm.serialNumber}
                      onChange={(e) => setEditForm({ ...editForm, serialNumber: e.target.value })}
                      className="mt-1"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.serialNumber)}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="machine-status">Status</Label>
                  {isEditing ? (
                    <Select value={editForm.status} onValueChange={(value) => setEditForm({ ...editForm, status: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="in_use">In Use</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="out_of_order">Out of Order</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="mt-1">
                      <Badge className={`${getStatusColor(machine.status)} flex items-center space-x-2 w-fit`}>
                        {getStatusIcon(machine.status)}
                        <span className="capitalize">{machine.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="machine-model">Model</Label>
                  {isEditing ? (
                    <Input
                      id="machine-model"
                      value={editForm.model}
                      onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                      className="mt-1"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{machine.model}</p>
                  )}
                </div>
                
                <div>
                  <Label>Location</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{machine.dorm}</p>
                </div>
                
                <div>
                  <Label>City</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{machine.city}</p>
                </div>

                <div>
                  <Label htmlFor="machine-installation-date">Installation Date</Label>
                  {isEditing ? (
                    <Input
                      id="machine-installation-date"
                      type="date"
                      value={editForm.installationDate}
                      onChange={(e) => setEditForm({ ...editForm, installationDate: e.target.value })}
                      className="mt-1"
                      disabled={isSaving}
                    />
                  ) : (
                    <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.installationDate ? new Date(machine.installationDate).toLocaleDateString() : undefined)}</p>
                  )}
                </div>
                
                <div>
                  <Label>Last Maintenance</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{machine.lastMaintenance}</p>
                </div>
                
                <div>
                  <Label>Created At</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.createdAt ? new Date(machine.createdAt).toLocaleString() : undefined)}</p>
                </div>

                <div>
                  <Label>Updated At</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.updatedAt ? new Date(machine.updatedAt).toLocaleString() : undefined)}</p>
                </div>

                <div>
                  <Label>Maintenance Scheduled</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.maintenanceScheduled)}</p>
                </div>

                <div>
                  <Label>Scheduled Window</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.scheduledWindow)}</p>
                </div>

                <div>
                  <Label>Queue Count</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{typeof machine.queueCount === 'number' ? machine.queueCount : 'Not provided'}</p>
                </div>

                <div>
                  <Label>Reserved</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{getDisplayValue(machine.isReserved)}</p>
                </div>
              </div>

              {machine.currentReservation && (
                <div>
                  <Label>Current Reservation</Label>
                  <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(machine.currentReservation, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Current Status Details */}
          {machine.status === 'in_use' && machine.currentUser && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Current Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Current User</Label>
                    <p className="mt-1 p-2 bg-blue-50 rounded">{machine.currentUser}</p>
                  </div>
                  <div>
                    <Label>Time Remaining</Label>
                    <p className="mt-1 p-2 bg-blue-50 rounded">
                      {machine.timeRemaining} minutes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {machine.status === 'in_use' && !machine.currentUser && machine.currentReservation && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Current Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Reservation data is available, but the API does not return a current user yet.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Recent Reservations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentReservations.length > 0 ? (
                <div className="space-y-3">
                  {recentReservations.map((reservation) => (
                    <div key={reservation.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm">{reservation.userName}</p>
                        <Badge 
                          variant={
                            reservation.status === 'active' ? 'default' :
                            reservation.status === 'completed' ? 'secondary' :
                            reservation.status === 'upcoming' ? 'outline' : 'destructive'
                          }
                        >
                          {reservation.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(reservation.startTime).toLocaleDateString()} at{' '}
                        {new Date(reservation.startTime).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No recent reservations
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Wrench className="h-4 w-4 mr-2" />
                Schedule Maintenance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                View Reservations
              </Button>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                disabled={machine.status === 'offline'}
              >
                <Settings className="h-4 w-4 mr-2" />
                Reset Machine
              </Button>
            </CardContent>
          </Card>
          <div>
            <Button
              className="w-full justify-center mt-2"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}