import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Label } from '../../ui/label';
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
  Activity
} from 'lucide-react';
import { mockMachines, mockReservations, filterDataByLocation } from '@/dummy-data';
import { Machine } from '@/types';

interface MachineDetailProps {
  machineId: string;
  location: { city: string; dorm: string | 'all' };
  onBack: () => void;
  accessType: 'dashboard' | 'machines'; // Different access paths
}

export function MachineDetail({ machineId, location, onBack, accessType }: MachineDetailProps) {
  const [machine, setMachine] = useState<Machine | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    status: '',
    issue: '',
    model: '',
    location: ''
  });

  useEffect(() => {
    const foundMachine = mockMachines.find(m => m.id === machineId);
    if (foundMachine) {
      setMachine(foundMachine);
      setEditForm({
        name: foundMachine.name,
        status: foundMachine.status,
        issue: foundMachine.issue || '',
        model: foundMachine.model,
        location: foundMachine.location
      });
    }
  }, [machineId]);

  const handleSave = () => {
    if (machine) {
      const updatedMachine = {
        ...machine,
        name: editForm.name,
        status: editForm.status as Machine['status'],
        issue: editForm.issue || undefined,
        model: editForm.model,
        location: editForm.location
      };
      setMachine(updatedMachine);
      setIsEditing(false);
      // In a real app, this would save to the backend
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'in_use':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
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
        return <AlertTriangle className="h-4 w-4" />;
      case 'offline':
        return <Settings className="h-4 w-4" />;
      default:
        return <WashingMachine className="h-4 w-4" />;
    }
  };

  // Get recent reservations for this machine
  const recentReservations = mockReservations
    .filter(r => r.machineId === machineId)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(0, 5);

  if (!machine) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1>Machine not found</h1>
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
          >
            {isEditing ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Changes
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Modify
              </>
            )}
          </Button>
          {isEditing && (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
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
                  <Label>Last Maintenance</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{machine.lastMaintenance}</p>
                </div>
                
                <div>
                  <Label>Total Cycles</Label>
                  <p className="mt-1 p-2 bg-muted rounded">{machine.totalCycles.toLocaleString()}</p>
                </div>
              </div>

              {(machine.issue || isEditing) && (
                <div>
                  <Label htmlFor="machine-issue">Issue Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="machine-issue"
                      value={editForm.issue}
                      onChange={(e) => setEditForm({ ...editForm, issue: e.target.value })}
                      className="mt-1"
                      placeholder="Describe any issues with this machine..."
                      rows={3}
                    />
                  ) : machine.issue ? (
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded">
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                        <p className="text-red-800">{machine.issue}</p>
                      </div>
                    </div>
                  ) : null}
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
        </div>
      </div>
    </div>
  );
}