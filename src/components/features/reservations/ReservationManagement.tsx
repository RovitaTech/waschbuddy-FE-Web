import { useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { Progress } from '../../ui/progress';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Eye, 
  XCircle,
  AlertCircle,
  Timer,
  WashingMachine,
  CheckCircle
} from 'lucide-react';

interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  machineId: string;
  machineName: string;
  status: 'reserved' | 'in-use' | 'completed' | 'expired' | 'queued';
  reservedAt: string;
  startTime?: string;
  endTime?: string;
  timeRemaining?: number;
  queuePosition?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface ReservationManagementProps {
  location: { city: string; dorm: string | 'all' };
}

export function ReservationManagement({ location }: ReservationManagementProps) {
  const [reservations, setReservations] = useState<Reservation[]>([
    {
      id: 'R001',
      userId: '2',
      userName: 'Maria Schmidt',
      userEmail: 'ws-maria.schmidt@waschbar.com',
      machineId: 'A-002',
      machineName: 'Washer A-002',
      status: 'in-use',
      reservedAt: '2024-01-17T09:00:00',
      startTime: '2024-01-17T09:30:00',
      timeRemaining: 35,
      paymentStatus: 'paid'
    },
    {
      id: 'R002',
      userId: '3',
      userName: 'Alex Weber',
      userEmail: 'ws-alex.weber@waschbar.com',
      machineId: 'A-001',
      machineName: 'Washer A-001',
      status: 'reserved',
      reservedAt: '2024-01-17T10:15:00',
      paymentStatus: 'paid'
    },
    {
      id: 'R003',
      userId: '5',
      userName: 'Tom Mueller',
      userEmail: 'ws-tom.mueller@waschbar.com',
      machineId: 'A-001',
      machineName: 'Washer A-001',
      status: 'queued',
      reservedAt: '2024-01-17T10:30:00',
      queuePosition: 1,
      paymentStatus: 'pending'
    },
    {
      id: 'R004',
      userId: '6',
      userName: 'Sarah Johnson',
      userEmail: 'ws-sarah.johnson@waschbar.com',
      machineId: 'B-001',
      machineName: 'Washer B-001',
      status: 'expired',
      reservedAt: '2024-01-17T08:00:00',
      paymentStatus: 'refunded'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const machines = ['A-001', 'A-002', 'A-003', 'B-001', 'B-002'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reserved':
        return 'outline';
      case 'in-use':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'expired':
        return 'destructive';
      case 'queued':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reserved':
        return <Clock className="h-4 w-4" />;
      case 'in-use':
        return <WashingMachine className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      case 'queued':
        return <Users className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'outline';
      case 'refunded':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = reservation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reservation.machineId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    const matchesMachine = selectedMachine === 'all' || reservation.machineId === selectedMachine;
    return matchesSearch && matchesStatus && matchesMachine;
  });

  const handleCancelReservation = (reservationId: string) => {
    setReservations(reservations.map(reservation => 
      reservation.id === reservationId 
        ? { ...reservation, status: 'expired' as const, paymentStatus: 'refunded' as const }
        : reservation
    ));
  };

  const handleStartMachine = (reservationId: string) => {
    setReservations(reservations.map(reservation => 
      reservation.id === reservationId 
        ? { 
            ...reservation, 
            status: 'in-use' as const, 
            startTime: new Date().toISOString(),
            timeRemaining: 60
          }
        : reservation
    ));
  };

  const handleViewDetails = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setIsDetailDialogOpen(true);
  };

  const calculateTimeRemaining = (reservedAt: string) => {
    const reservationTime = new Date(reservedAt);
    const expiryTime = new Date(reservationTime.getTime() + 60 * 60 * 1000); // 1 hour
    const now = new Date();
    const remaining = Math.max(0, Math.floor((expiryTime.getTime() - now.getTime()) / (1000 * 60)));
    return remaining;
  };

  const getMachineReservations = (machineId: string) => {
    return reservations.filter(r => r.machineId === machineId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Reservation Management</h2>
          <p className="text-muted-foreground">Monitor and manage machine reservations and queues</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Active Reservations</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservations.filter(r => r.status === 'reserved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Use</CardTitle>
            <WashingMachine className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservations.filter(r => r.status === 'in-use').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Queue</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservations.filter(r => r.status === 'queued').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservations.filter(r => r.status === 'expired').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{reservations.filter(r => r.status === 'completed').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reservations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="in-use">In Use</SelectItem>
            <SelectItem value="queued">Queued</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={selectedMachine} onValueChange={setSelectedMachine}>
          <SelectTrigger className="w-48">
            <WashingMachine className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by machine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Machines</SelectItem>
            {machines.map(machine => (
              <SelectItem key={machine} value={machine}>{machine}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reservations Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>
                        {reservation.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{reservation.userName}</p>
                      <p className="text-sm text-muted-foreground">{reservation.userEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{reservation.machineName}</p>
                    <p className="text-sm text-muted-foreground">{reservation.machineId}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <Badge variant={getStatusColor(reservation.status)} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(reservation.status)}
                      {reservation.status}
                    </Badge>
                    {reservation.queuePosition && (
                      <p className="text-xs text-muted-foreground">
                        Position: #{reservation.queuePosition}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getPaymentStatusColor(reservation.paymentStatus)}>
                    {reservation.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">Reserved: {new Date(reservation.reservedAt).toLocaleString()}</p>
                    {reservation.status === 'reserved' && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Expires in: {calculateTimeRemaining(reservation.reservedAt)} min
                        </p>
                        <Progress 
                          value={(calculateTimeRemaining(reservation.reservedAt) / 60) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                    {reservation.status === 'in-use' && reservation.timeRemaining && (
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Time remaining: {reservation.timeRemaining} min
                        </p>
                        <Progress 
                          value={(reservation.timeRemaining / 60) * 100} 
                          className="h-1"
                        />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(reservation)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {reservation.status === 'reserved' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartMachine(reservation.id)}
                        >
                          Start
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelReservation(reservation.id)}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Machine Queue Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Machine Queue Overview</CardTitle>
          <CardDescription>Current reservations and queue for each machine</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {machines.map(machineId => {
              const machineReservations = getMachineReservations(machineId);
              const currentUser = machineReservations.find(r => r.status === 'in-use');
              const reserved = machineReservations.find(r => r.status === 'reserved');
              const queued = machineReservations.filter(r => r.status === 'queued').length;
              
              return (
                <Card key={machineId} className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4>{machineId}</h4>
                    <WashingMachine className="h-4 w-4" />
                  </div>
                  <div className="space-y-2 text-sm">
                    {currentUser ? (
                      <div className="p-2 bg-green-50 rounded">
                        <p className="text-green-700">In Use: {currentUser.userName}</p>
                        <p className="text-green-600">{currentUser.timeRemaining} min remaining</p>
                      </div>
                    ) : reserved ? (
                      <div className="p-2 bg-blue-50 rounded">
                        <p className="text-blue-700">Reserved: {reserved.userName}</p>
                        <p className="text-blue-600">{calculateTimeRemaining(reserved.reservedAt)} min left</p>
                      </div>
                    ) : (
                      <div className="p-2 bg-gray-50 rounded">
                        <p className="text-gray-700">Available</p>
                      </div>
                    )}
                    {queued > 0 && (
                      <div className="p-2 bg-orange-50 rounded">
                        <p className="text-orange-700">{queued} in queue</p>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Reservation Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reservation Details</DialogTitle>
            <DialogDescription>Complete information for reservation {selectedReservation?.id}</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">User</h4>
                  <p>{selectedReservation.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReservation.userEmail}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Machine</h4>
                  <p>{selectedReservation.machineName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReservation.machineId}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Status</h4>
                  <Badge variant={getStatusColor(selectedReservation.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedReservation.status)}
                    {selectedReservation.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Payment Status</h4>
                  <Badge variant={getPaymentStatusColor(selectedReservation.paymentStatus)}>
                    {selectedReservation.paymentStatus}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Reserved At</h4>
                  <p>{new Date(selectedReservation.reservedAt).toLocaleString()}</p>
                </div>
                {selectedReservation.startTime && (
                  <div>
                    <h4 className="text-sm text-muted-foreground">Started At</h4>
                    <p>{new Date(selectedReservation.startTime).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}