import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '../../ui/alert-dialog';
import { Progress } from '../../ui/progress';
import Shimmer from '../../ui/shimmer';
import { reservationMachineIds, reservationManagementSeed } from '@/dummy-data/reservations-management/data';
import { reservationService } from '@/lib/api';
import type { ReservationStatsResponse } from '@/lib/api/types';
import { Location } from '@/types';
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
  status: 'reserved' | 'in-use' | 'completed' | 'expired' | 'queued' | 'cancelled';
  reservedAt: string;
  startTime?: string;
  endTime?: string;
  timeRemaining?: number;
  queuePosition?: number;
  paymentStatus: 'pending' | 'paid' | 'refunded';
}

interface ReservationApiItem {
  id?: string;
  reservationId?: string;
  userId?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  name?: string;
  email?: string;
  userEmail?: string;
  machineId?: string;
  machineName?: string;
  machine?: string;
  status?: string;
  reservedAt?: string;
  startTime?: string;
  endTime?: string;
  timeRemaining?: number;
  queuePosition?: number;
  paymentStatus?: string;
}

interface ReservationManagementProps {
  location: Location;
}

const EMPTY_STATS: ReservationStatsResponse = {
  active: 0,
  inQueue: 0,
  inUse: 0,
  expired: 0,
  completed: 0,
  cancelled: 0,
};

export function ReservationManagement({ location }: ReservationManagementProps) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservationStats, setReservationStats] = useState<ReservationStatsResponse>(EMPTY_STATS);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [queueData, setQueueData] = useState<any[]>([]);
  const [isLoadingQueues, setIsLoadingQueues] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedMachine, setSelectedMachine] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [operatingReservationId, setOperatingReservationId] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const uniqueMachines = Array.from(
    new Set(reservations.map(r => r.machineId).filter(Boolean))
  ).sort();
  const machines = uniqueMachines.length > 0 ? uniqueMachines : [...reservationMachineIds];

  const normalizeReservationStatus = (status?: string): Reservation['status'] => {
    switch ((status ?? '').toLowerCase()) {
      case 'active':
      case 'reserved':
      case 'pending':
      case 'upcoming':
        return 'reserved';
      case 'in_use':
      case 'in-use':
      case 'in use':
      case 'running':
        return 'in-use';
      case 'queue':
      case 'queued':
      case 'inqueue':
        return 'queued';
      case 'expired':
        return 'expired';
      case 'completed':
        return 'completed';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'reserved';
    }
  };

  const mapReservation = (item: ReservationApiItem): Reservation => {
    const firstName = item.firstName ?? '';
    const lastName = item.lastName ?? '';
    const fallbackName = `${firstName} ${lastName}`.trim();
    const userName = item.userName ?? item.name ?? (fallbackName || 'Unknown user');

    return {
      id: item.id ?? item.reservationId ?? `${item.userId ?? 'unknown-user'}-${item.machineId ?? 'unknown-machine'}-${item.reservedAt ?? 'reservation'}`,
      userId: item.userId ?? '',
      userName,
      userEmail: item.userEmail ?? item.email ?? '',
      machineId: item.machineId ?? '',
      machineName: item.machineName ?? item.machine ?? item.machineId ?? 'Unknown machine',
      status: normalizeReservationStatus(item.status),
      reservedAt: item.reservedAt ?? new Date().toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
      timeRemaining: item.timeRemaining,
      queuePosition: item.queuePosition,
      paymentStatus: (item.paymentStatus === 'paid' || item.paymentStatus === 'pending' || item.paymentStatus === 'refunded'
        ? item.paymentStatus
        : 'pending') as Reservation['paymentStatus'],
    };
  };

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
      case 'cancelled':
        return 'destructive';
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
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
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

  const handleCancelReservation = async (reservationId: string) => {
    setOperatingReservationId(reservationId);
    try {
      await reservationService.cancelReservation(reservationId);
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { ...reservation, status: 'cancelled' as const }
          : reservation
      ));
      setCancelConfirmOpen(false);
      setReservationToCancel(null);
    } catch (error) {
      console.error('Error cancelling reservation:', error);
    } finally {
      setOperatingReservationId(null);
    }
  };

  const handleStartMachine = async (reservationId: string) => {
    setOperatingReservationId(reservationId);
    try {
      await reservationService.startReservation(reservationId);
      const startTime = new Date().toISOString();
      const endTime = calculateEndTime(startTime, 60);
      
      setReservations(reservations.map(reservation => 
        reservation.id === reservationId 
          ? { 
              ...reservation, 
              status: 'in-use' as const, 
              startTime,
              endTime,
              timeRemaining: 60
            }
          : reservation
      ));
    } catch (error) {
      console.error('Error starting machine:', error);
    } finally {
      setOperatingReservationId(null);
    }
  };

  const openCancelConfirm = (reservationId: string) => {
    setReservationToCancel(reservationId);
    setCancelConfirmOpen(true);
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

  const calculateEndTime = (startTime: string, durationMinutes: number = 60) => {
    const start = new Date(startTime);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
    return end.toISOString();
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return 'Not started';
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date(calculateEndTime(startTime));
    return `${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
  };

  const formatReservationTime = (reservation: Reservation) => {
    const reservedDate = new Date(reservation.reservedAt).toLocaleDateString();
    if (reservation.startTime) {
      const timeRange = formatTimeRange(reservation.startTime, reservation.endTime);
      return `Reserved: ${reservedDate}\n${timeRange}`;
    } else {
      return `Reserved: ${reservedDate}`;
    }
  };

  const getMachineReservations = (machineId: string) => {
    return reservations.filter(r => r.machineId === machineId);
  };

  useEffect(() => {
    let isActive = true;

    const loadReservations = async () => {
      if (!location.cityId) {
        setReservations([]);
        setIsLoadingReservations(false);
        return;
      }

      setIsLoadingReservations(true);

      try {
        const response = await reservationService.getReservations({
          cityId: location.cityId,
          ...(location.dormId ? { dormId: location.dormId } : {}),
        });

        if (isActive) {
          const list = Array.isArray(response) ? response : [];
          setReservations(list.map((reservation) => mapReservation(reservation as ReservationApiItem)));
        }
      } catch (error) {
        console.error('Error loading reservations:', error);
        if (isActive) {
          setReservations([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingReservations(false);
        }
      }
    };

    void loadReservations();

    return () => {
      isActive = false;
    };
  }, [location.cityId, location.dormId]);

  useEffect(() => {
    let isActive = true;

    const loadReservationStats = async () => {
      if (!location.cityId) {
        setReservationStats(EMPTY_STATS);
        setStatsError(null);
        setIsLoadingStats(false);
        return;
      }

      setIsLoadingStats(true);
      setStatsError(null);

      try {
        const stats = await reservationService.getReservationStats({
          cityId: location.cityId,
          ...(location.dormId ? { dormId: location.dormId } : {}),
        });

        if (isActive) {
          setReservationStats({
            active: stats.active ?? 0,
            inQueue: stats.inQueue ?? 0,
            inUse: stats.inUse ?? 0,
            expired: stats.expired ?? 0,
            completed: stats.completed ?? 0,
            cancelled: stats.cancelled ?? 0,
          });
        }
      } catch (error) {
        console.error('Error loading reservation stats:', error);
        if (isActive) {
          setReservationStats(EMPTY_STATS);
          setStatsError('Unable to load reservation stats.');
        }
      } finally {
        if (isActive) {
          setIsLoadingStats(false);
        }
      }
    };

    void loadReservationStats();

    return () => {
      isActive = false;
    };
  }, [location.cityId, location.dormId]);

  useEffect(() => {
    let isActive = true;

    const loadQueueData = async () => {
      if (!location.cityId) {
        setQueueData([]);
        setIsLoadingQueues(false);
        return;
      }

      setIsLoadingQueues(true);

      try {
        const queues = await reservationService.getAllQueues({
          cityId: location.cityId,
          ...(location.dormId ? { dormId: location.dormId } : {}),
        });

        if (isActive) {
          setQueueData(Array.isArray(queues) ? queues : []);
        }
      } catch (error) {
        console.error('Error loading queue data:', error);
        if (isActive) {
          setQueueData([]);
        }
      } finally {
        if (isActive) {
          setIsLoadingQueues(false);
        }
      }
    };

    void loadQueueData();

    return () => {
      isActive = false;
    };
  }, [location.cityId, location.dormId]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Reservation Management</h2>
          <p className="text-muted-foreground">Monitor and manage machine reservations and queues</p>
          {location.cityId && (
            <p className="mt-1 text-xs text-muted-foreground">
              {location.dorm === 'all'
                ? `Showing city-wide reservation totals for ${location.city}`
                : `Showing reservation totals for ${location.dorm}, ${location.city}`}
            </p>
          )}
        </div>
      </div>

      {statsError && <p className="text-sm text-destructive">{statsError}</p>}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 5 }).map((_, index) => (
            <div key={`reservation-stats-skeleton-${index}`} className="h-24 w-full rounded-lg overflow-hidden">
              <Shimmer style={{ height: '100%', borderRadius: 12 }} />
            </div>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active Reservations</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{reservationStats.active}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">In Use</CardTitle>
                <WashingMachine className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{reservationStats.inUse}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">In Queue</CardTitle>
                <Users className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{reservationStats.inQueue}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Expired</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl">{reservationStats.expired}</div>
                <p className="text-xs text-muted-foreground">Cancelled: {reservationStats.cancelled}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Completed</CardTitle>
                <CheckCircle className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{reservationStats.completed}</div>
              </CardContent>
            </Card>
          </>
        )}
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
            <SelectItem value="cancelled">Cancelled</SelectItem>
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
            {isLoadingReservations ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`reservation-row-skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden shrink-0">
                        <Shimmer style={{ height: 40, width: 40, borderRadius: 999 }} />
                      </div>
                      <div className="w-48 space-y-2">
                        <Shimmer style={{ height: 14, borderRadius: 6 }} />
                        <Shimmer style={{ height: 12, width: '60%', borderRadius: 6 }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-44 space-y-2">
                      <Shimmer style={{ height: 14, borderRadius: 6 }} />
                      <Shimmer style={{ height: 12, width: '70%', borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-28">
                      <Shimmer style={{ height: 22, borderRadius: 999 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Shimmer style={{ height: 22, borderRadius: 999 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-56 space-y-2">
                      <Shimmer style={{ height: 12, borderRadius: 6 }} />
                      <Shimmer style={{ height: 10, width: '80%', borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Shimmer style={{ height: 32, width: 40, borderRadius: 6 }} />
                      <Shimmer style={{ height: 32, width: 52, borderRadius: 6 }} />
                      <Shimmer style={{ height: 32, width: 40, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredReservations.map((reservation) => (
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
                      <div className="text-sm whitespace-pre-line">
                        {formatReservationTime(reservation)}
                      </div>
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
                            disabled={operatingReservationId === reservation.id}
                          >
                            {operatingReservationId === reservation.id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              'Start'
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCancelConfirm(reservation.id)}
                            disabled={operatingReservationId === reservation.id}
                          >
                            {operatingReservationId === reservation.id ? (
                              <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Machine Queue Overview */}
      {(isLoadingQueues || reservations.length > 0 || queueData.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Machine Queue Overview</CardTitle>
            <CardDescription>Current reservations and queue for each machine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingQueues ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={`queue-skeleton-${index}`} className="h-40 w-full rounded-lg overflow-hidden">
                    <Shimmer style={{ height: '100%', borderRadius: 12 }} />
                  </div>
                ))
              ) : (
                machines.map(machineId => {
                  const machineReservations = getMachineReservations(machineId);
                  const currentUser = machineReservations.find(r => r.status === 'in-use');
                  const reserved = machineReservations.find(r => r.status === 'reserved');
                  const queuedUsers = machineReservations.filter(r => r.status === 'queued').sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0));
                  const apiQueueForMachine = queueData.filter((q: any) => {
                    const qMachineId = q.machineId ?? q.machine ?? '';
                    return qMachineId === machineId;
                  });
                  
                  return (
                    <Card key={machineId} className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4>{machineId}</h4>
                        <WashingMachine className="h-4 w-4" />
                      </div>
                      <div className="space-y-2 text-sm">
                        {currentUser ? (
                          <div className="p-2 bg-green-50 rounded dark:bg-green-950/35">
                            <p className="text-green-700 font-medium dark:text-green-300">In Use: {currentUser.userName}</p>
                            <p className="text-green-600 dark:text-green-200">{currentUser.timeRemaining} min remaining</p>
                            <div className="text-green-500 text-xs whitespace-pre-line dark:text-green-200/80">
                              {formatReservationTime(currentUser)}
                            </div>
                          </div>
                        ) : reserved ? (
                          <div className="p-2 bg-blue-50 rounded dark:bg-blue-950/35">
                            <p className="text-blue-700 font-medium dark:text-blue-300">Reserved: {reserved.userName}</p>
                            <p className="text-blue-600 dark:text-blue-200">{calculateTimeRemaining(reserved.reservedAt)} min left</p>
                            <div className="text-blue-500 text-xs whitespace-pre-line dark:text-blue-200/80">
                              {formatReservationTime(reserved)}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 bg-gray-50 rounded dark:bg-gray-900">
                            <p className="text-gray-700 dark:text-gray-200">Available</p>
                          </div>
                        )}
                        {(queuedUsers.length > 0 || apiQueueForMachine.length > 0) && (
                          <div className="p-2 bg-orange-50 rounded dark:bg-orange-950/35">
                            <p className="text-orange-700 font-medium mb-2 dark:text-orange-300">Queue ({Math.max(queuedUsers.length, apiQueueForMachine.length)})</p>
                            <div className="space-y-1">
                              {queuedUsers.map((user, index) => (
                                <div key={user.id} className="flex justify-between items-center text-xs">
                                  <div>
                                    <p className="text-orange-600 font-medium dark:text-orange-200">#{user.queuePosition || index + 1} {user.userName}</p>
                                    <div className="text-orange-500 whitespace-pre-line dark:text-orange-200/80">
                                      {formatReservationTime(user)}
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {user.paymentStatus}
                                  </Badge>
                                </div>
                              ))}
                              {queuedUsers.length === 0 && apiQueueForMachine.length > 0 && (
                                <p className="text-orange-600 text-xs dark:text-orange-200/80">
                                  {apiQueueForMachine.length} user(s) in queue
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

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
                  <h4 className="text-sm text-muted-foreground">Reservation Time</h4>
                  <div className="whitespace-pre-line">
                    {formatReservationTime(selectedReservation)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Cancel */}
      <AlertDialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Reservation?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this reservation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => reservationToCancel && handleCancelReservation(reservationToCancel)}
              disabled={operatingReservationId === reservationToCancel}
              className="bg-red-600 hover:bg-red-700"
            >
              {operatingReservationId === reservationToCancel ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin h-3 w-3 border-2 border-current border-t-transparent rounded-full" />
                  Cancelling...
                </div>
              ) : (
                'Yes, cancel it'
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}