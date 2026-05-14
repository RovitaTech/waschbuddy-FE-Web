'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Eye,
  UserCheck,
  AlertCircle,
  CheckCircle,
  UserMinus,
  XCircle,
  Trash2,
  UserX,
  Filter,
} from 'lucide-react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { toast } from 'sonner';
import { maskPhoneNumber } from '../../../utils/privacy';
import { User, Location } from '@/types';
import { userService } from '@/lib/api';
import Shimmer from '../../../components/ui/shimmer';

interface UserManagementProps {
  location: Location;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    case 'suspended':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'active':
      return <CheckCircle className="h-3 w-3" />;
    case 'pending':
      return <AlertCircle className="h-3 w-3" />;
    case 'suspended':
      return <UserMinus className="h-3 w-3" />;
    case 'rejected':
      return <XCircle className="h-3 w-3" />;
    default:
      return null;
  }
};

export function UserManagement({ location }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsFromApi, setStatsFromApi] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
    rejected: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});
  const [isEmailSending, setIsEmailSending] = useState(false);

  const setActionLoading = (action: string, userId: string, value: boolean) => {
    setLoadingActions((prev) => ({ ...prev, [`${action}:${userId}`]: value }));
  };

  const isActionLoading = (action: string, userId: string) => !!loadingActions[`${action}:${userId}`];

  // Load users from API
  const loadUsers = async () => {
    if (!location.cityId) return;

    setIsLoadingUsers(true);
    let didUnmount = false;

    try {
      const response = await userService.getUsers({
        cityId: location.cityId,
        dormId: location.dormId || undefined,
        page,
        limit,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });

      if (!didUnmount && response?.data) {
        const mapped: User[] = response.data.map((u: any): User => ({
          id: u.id,
          name: `${u.firstName ?? u.name ?? ''} ${u.lastName ?? ''}`.trim(),
          email: u.email ?? '',
          phone: u.mobileNumber ?? u.phone ?? '',
          status: (u.status as User['status']) ?? 'pending',
          city: u.cityName ?? u.city ?? '',
          dorm: u.dormName ?? u.dorm ?? '',
          registrationDate: u.createdAt ?? '',
          lastActive: u.lastLoginAt ?? u.updatedAt ?? '',
          totalReservations: u.totalReservations ?? 0,
          studentId: u.studentId ?? u.student_id ?? '',
        }));
        setUsers(mapped);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      if (!didUnmount) {
        setIsLoadingUsers(false);
      }
    }

    return () => {
      didUnmount = true;
    };
  };

  // Load stats from API
  const loadStats = async () => {
    if (!location.cityId) return;

    setIsLoadingStats(true);
    let didUnmount = false;

    try {
      const stats = await userService.getUsersStats({
        cityId: location.cityId,
        dormUUID: location.dormId || undefined,
        dormId: location.dormId || undefined,
      });

      if (!didUnmount && stats) {
        setStatsFromApi(stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      toast.error('Failed to load stats');
    } finally {
      if (!didUnmount) {
        setIsLoadingStats(false);
      }
    }

    return () => {
      didUnmount = true;
    };
  };

  // Load users and stats on mount and when location changes
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [location.cityId, location.dormId, page, limit, searchTerm, statusFilter]);

  // Filter users based on search and status
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleOpenEmailDialog = (user: User) => {
    setSelectedUser(user);
    setEmailSubject('');
    setEmailMessage('');
    setIsEmailDialogOpen(true);
  };

  const handleSendEmail = async () => {
    if (!selectedUser) return;
    setIsEmailSending(true);
    try {
      const res = await userService.sendEmail({
        userId: selectedUser.id,
        subject: emailSubject,
        body: emailMessage,
      });
      const msg = (res && (res.message || res.msg)) || 'Email sent successfully.';
      toast.success(msg);
      setIsEmailDialogOpen(false);
    } catch (err: any) {
      console.error('sendEmail error', err);
      toast.error(err?.message || 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    setActionLoading('approve', userId, true);
    try {
      const res = await userService.approveUser(userId);
      const msg = (res && (res.message || res.msg)) || 'User approved.';
      toast.success(msg);
      await loadUsers();
    } catch (err: any) {
      console.error('approveUser error', err);
      toast.error(err?.message || 'Failed to approve user');
    } finally {
      setActionLoading('approve', userId, false);
    }
  };

  const handleRejectUser = async (userId: string) => {
    setActionLoading('delete', userId, true);
    try {
      // reuse delete for rejecting if API lacks dedicated reject endpoint
      const res = await userService.deleteUser(userId);
      const msg = (res && (res.message || res.msg)) || 'User rejected/removed.';
      toast.success(msg);
      await loadUsers();
    } catch (err: any) {
      console.error('rejectUser/delete error', err);
      toast.error(err?.message || 'Failed to reject user');
    } finally {
      setActionLoading('delete', userId, false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    setActionLoading('suspend', userId, true);
    try {
      const res = await userService.suspendUser(userId);
      const msg = (res && (res.message || res.msg)) || 'User suspended.';
      toast.success(msg);
      await loadUsers();
    } catch (err: any) {
      console.error('suspendUser error', err);
      toast.error(err?.message || 'Failed to suspend user');
    } finally {
      setActionLoading('suspend', userId, false);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    setActionLoading('delete', userId, true);
    try {
      const res = await userService.deleteUser(userId);
      const msg = (res && (res.message || res.msg)) || 'User removed.';
      toast.success(msg);
      await loadUsers();
    } catch (err: any) {
      console.error('deleteUser error', err);
      toast.error(err?.message || 'Failed to remove user');
    } finally {
      setActionLoading('delete', userId, false);
    }
  };

  const handleReactivateUser = async (userId: string) => {
    setActionLoading('reactivate', userId, true);
    try {
      const res = await userService.reactivateUser(userId);
      const msg = (res && (res.message || res.msg)) || 'User reactivated.';
      toast.success(msg);
      await loadUsers();
    } catch (err: any) {
      console.error('reactivateUser error', err);
      toast.error(err?.message || 'Failed to reactivate user');
    } finally {
      setActionLoading('reactivate', userId, false);
    }
  };

  const stats = {
    total: statsFromApi.total ?? 0,
    active: statsFromApi.active ?? 0,
    pending: statsFromApi.pending ?? 0,
    suspended: statsFromApi.suspended ?? 0,
    rejected: statsFromApi.rejected ?? 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-normal mb-6">User Management</h1>
        <p className="text-muted-foreground">
          {location.dorm === 'all'
            ? `Manage users across all dorms in ${location.city}`
            : `Manage users in ${location.dorm}, ${location.city}`}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="w-full">
              <div className="h-28 w-full rounded-lg overflow-hidden">
                <Shimmer style={{ height: '100%', borderRadius: 12 }} />
              </div>
            </div>
          ))
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total Users</CardTitle>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.total}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Active</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.pending}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Suspended</CardTitle>
                <UserMinus className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.suspended}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Rejected</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{stats.rejected}</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table - Desktop */}
      <Card className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoadingUsers ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <TableRow key={`row-skel-${idx}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full overflow-hidden">
                        <Shimmer style={{ height: 40, width: 40, borderRadius: 999 }} />
                      </div>
                      <div className="w-48">
                        <Shimmer style={{ height: 14, borderRadius: 6, marginBottom: 6 }} />
                        <Shimmer style={{ height: 12, borderRadius: 6, width: '60%' }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-40">
                      <Shimmer style={{ height: 12, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-40">
                      <Shimmer style={{ height: 12, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-24">
                      <Shimmer style={{ height: 20, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-32">
                      <Shimmer style={{ height: 12, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Shimmer style={{ height: 32, width: 40, borderRadius: 6 }} />
                      <Shimmer style={{ height: 32, width: 40, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={`/api/placeholder/40/40`} />
                          <AvatarFallback>
                            {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{user.name}</p>
                          <p className="text-sm text-muted-foreground">ID: {user.studentId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="h-3 w-3 mr-1" />
                          {user.email}
                        </div>
                        <div className="flex items-center text-sm">
                          <Phone className="h-3 w-3 mr-1" />
                          {maskPhoneNumber(user.phone)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-3 w-3 mr-1" />
                          {user.city}
                        </div>
                        <p className="text-sm text-muted-foreground">{user.dorm}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(user.status)}`}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <p>{user.registrationDate}</p>
                      <p className="text-muted-foreground">Last: {user.lastActive}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleOpenEmailDialog(user)}>
                          <Mail className="h-3 w-3" />
                        </Button>

                        {user.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleVerifyUser(user.id)}
                              className="text-green-600 hover:text-green-700"
                              disabled={isActionLoading('approve', user.id)}
                            >
                              {isActionLoading('approve', user.id) ? (
                                <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <UserCheck className="h-3 w-3" />
                              )}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <UserX className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Reject User</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to reject {user.name}'s application?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRejectUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                                    {isActionLoading('delete', user.id) ? (
                                      <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Reject'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {user.status === 'active' && (
                          <>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700">
                                  <UserMinus className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to suspend {user.name}'s account?</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleSuspendUser(user.id)} className="bg-yellow-600 hover:bg-yellow-700" disabled={isActionLoading('suspend', user.id)}>
                                    {isActionLoading('suspend', user.id) ? (
                                      <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Suspend'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>Are you sure you want to permanently delete {user.name}? This action cannot be undone.</AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                                    {isActionLoading('delete', user.id) ? (
                                      <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Delete'
                                    )}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {(user.status === 'suspended' || user.status === 'rejected') && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove User</AlertDialogTitle>
                                <AlertDialogDescription>Are you sure you want to permanently remove {user.name} from the system? This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                                    {isActionLoading('delete', user.id) ? (
                                      <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      'Remove'
                                    )}
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Users Cards - Mobile */}
      <div className="md:hidden space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`/api/placeholder/40/40`} />
                  <AvatarFallback>{user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.studentId}</p>
                </div>
              </div>
              <Badge className={`flex items-center gap-1 ${getStatusColor(user.status)}`}>
                {getStatusIcon(user.status)}
                {user.status}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm">
                <Mail className="h-3 w-3 mr-2" />
                {user.email}
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-3 w-3 mr-2" />
                {maskPhoneNumber(user.phone)}
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-3 w-3 mr-2" />
                {user.city}, {user.dorm}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)} className="flex-1">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>

              <Button variant="outline" size="sm" onClick={() => handleOpenEmailDialog(user)} className="flex-1">
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>

              {user.status === 'pending' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleVerifyUser(user.id)} className="text-green-600 hover:text-green-700 flex-1" disabled={isActionLoading('approve', user.id)}>
                    {isActionLoading('approve', user.id) ? (
                      <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                    ) : (
                      <UserCheck className="h-3 w-3 mr-1" />
                    )}
                    Approve
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1">
                        <UserX className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject User</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to reject {user.name}'s application?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRejectUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                            {isActionLoading('delete', user.id) ? (
                              <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              'Reject'
                            )}
                          </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {user.status === 'active' && (
                <>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-yellow-600 hover:text-yellow-700 flex-1">
                        <UserMinus className="h-3 w-3 mr-1" />
                        Suspend
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Suspend User</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to suspend {user.name}'s account?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSuspendUser(user.id)} className="bg-yellow-600 hover:bg-yellow-700" disabled={isActionLoading('suspend', user.id)}>
                          {isActionLoading('suspend', user.id) ? (
                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Suspend'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1">
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>Are you sure you want to permanently delete {user.name}? This action cannot be undone.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                          {isActionLoading('delete', user.id) ? (
                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Delete'
                          )}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}

              {(user.status === 'suspended' || user.status === 'rejected') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 flex-1">
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove User</AlertDialogTitle>
                      <AlertDialogDescription>Are you sure you want to permanently remove {user.name} from the system? This action cannot be undone.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700" disabled={isActionLoading('delete', user.id)}>
                          {isActionLoading('delete', user.id) ? (
                            <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            'Remove'
                          )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No users found matching your criteria</p>
        </div>
      )}

      {/* User Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete information for {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`/api/placeholder/64/64`} />
                  <AvatarFallback className="text-lg">{selectedUser.name.split(' ').map((n) => n[0]).join('').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg">{selectedUser.name}</h3>
                  <Badge className={`flex items-center gap-1 w-fit ${getStatusColor(selectedUser.status)}`}>
                    {getStatusIcon(selectedUser.status)}
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">Email</h4>
                  <p>{selectedUser.email}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Phone Number</h4>
                  <p>{maskPhoneNumber(selectedUser.phone)}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Student ID</h4>
                  <p>{selectedUser.studentId}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Total Reservations</h4>
                  <p>{selectedUser.totalReservations}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">City</h4>
                  <p>{selectedUser.city}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Dorm</h4>
                  <p>{selectedUser.dorm}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Registration Date</h4>
                  <p>{selectedUser.registrationDate}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Last Active</h4>
                  <p>{selectedUser.lastActive}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedUser?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejectUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={isActionLoading('delete', selectedUser.id)}
                >
                  {isActionLoading('delete', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reject'
                  )}
                </Button>
                <Button
                  onClick={() => {
                    handleVerifyUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={isActionLoading('approve', selectedUser.id)}
                >
                  {isActionLoading('approve', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Activate'
                  )}
                </Button>
              </div>
            )}

            {selectedUser?.status === 'active' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleSuspendUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  className="text-yellow-600 hover:text-yellow-700"
                  disabled={isActionLoading('suspend', selectedUser.id)}
                >
                  {isActionLoading('suspend', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Suspend User'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={isActionLoading('delete', selectedUser.id)}
                >
                  {isActionLoading('delete', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Delete User'
                  )}
                </Button>
              </div>
            )}

            {selectedUser?.status === 'suspended' && (
              <div className="flex space-x-2">
                <Button
                  onClick={() => {
                    handleReactivateUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  className="bg-green-600 hover:bg-green-700"
                  disabled={isActionLoading('reactivate', selectedUser.id)}
                >
                  {isActionLoading('reactivate', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reactivate User'
                  )}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={isActionLoading('delete', selectedUser.id)}
                >
                  {isActionLoading('delete', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Delete User'
                  )}
                </Button>
              </div>
            )}

            {selectedUser?.status === 'rejected' && (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                  disabled={isActionLoading('delete', selectedUser.id)}
                >
                  {isActionLoading('delete', selectedUser.id) ? (
                    <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Remove User'
                  )}
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Compose an email to {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input placeholder="Subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} />
            <Textarea placeholder="Message" value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail} disabled={isEmailSending}>
              {isEmailSending ? (
                <span className="inline-block h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Send'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
