import { useState, useEffect } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../../ui/alert-dialog';
import { Label } from '../../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { toast } from 'sonner';
import { maskPhoneNumber } from '../../../utils/privacy';
import { filterDataByLocation, mockUsers } from '../../../utils/mockData';
import { User } from '@/types';
import { 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  Eye, 
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Trash2,
  Send,
  UserMinus
} from 'lucide-react';

interface UserManagementProps {
  location: { city: string; dorm: string | 'all' };
}

export function UserManagement({ location }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');

  // Update users when location changes
  useEffect(() => {
    const filteredUsers = filterDataByLocation(mockUsers, location);
    setUsers(filteredUsers);
  }, [location.city, location.dorm]); // More specific dependencies to prevent unnecessary re-renders

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'active':
        return 'default';
      case 'suspended':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      case 'active':
        return <CheckCircle className="h-4 w-4" />;
      case 'suspended':
        return <UserMinus className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.dorm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleVerifyUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.map(u => 
      u.id === userId 
        ? { 
            ...u, 
            status: 'active'
          }
        : u
    ));

    toast.success('User verified successfully!', {
      description: `Email with login credentials has been sent to ${user.name} at ${user.email}`,
      duration: 5000,
    });
  };

  const handleRejectUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'rejected' } : u
    ));

    toast.error('User account rejected', {
      description: `Rejection notification has been sent to ${user.name}`,
      duration: 4000,
    });
  };

  const handleSuspendUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: 'suspended' } : u
    ));

    toast.warning('User account suspended', {
      description: `${user.name}'s account has been suspended`,
      duration: 4000,
    });
  };

  const handleRemoveUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    setUsers(users.filter(u => u.id !== userId));

    toast.success('User removed successfully', {
      description: `${user.name} has been removed from the system`,
      duration: 4000,
    });
  };

  const handleSendEmail = () => {
    if (!selectedUser || !emailSubject || !emailMessage) {
      toast.error('Please fill in all email fields');
      return;
    }

    // In a real app, this would call an API to send the email
    toast.success('Email sent successfully!', {
      description: `Email sent to ${selectedUser.name} at ${selectedUser.email}`,
      duration: 4000,
    });

    setEmailSubject('');
    setEmailMessage('');
    setIsEmailDialogOpen(false);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailDialogOpen(true);
  };

  const handleOpenEmailDialog = (user: User) => {
    setSelectedUser(user);
    setIsEmailDialogOpen(true);
  };

  const stats = {
    pending: users.filter(u => u.status === 'pending').length,
    active: users.filter(u => u.status === 'active').length,
    suspended: users.filter(u => u.status === 'suspended').length,
    rejected: users.filter(u => u.status === 'rejected').length,
    total: users.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">User Management</h2>
          <p className="text-muted-foreground">
            {location.dorm === 'all' 
              ? `Manage users across all dorms in ${location.city}` 
              : `Manage users in ${location.dorm}, ${location.city}`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.pending}</div>
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
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>
                        {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
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
                  <Badge variant={getStatusColor(user.status)} className="flex items-center gap-1 w-fit">
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(user)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenEmailDialog(user)}
                    >
                      <Mail className="h-3 w-3" />
                    </Button>
                    
                    {user.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <UserCheck className="h-3 w-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Reject User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to reject {user.name}'s application?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRejectUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                Reject
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
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-yellow-600 hover:text-yellow-700"
                            >
                              <UserMinus className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Suspend User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to suspend {user.name}'s account?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleSuspendUser(user.id)} className="bg-yellow-600 hover:bg-yellow-700">
                                Suspend
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete {user.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
                    )}
                    
                    {(user.status === 'suspended' || user.status === 'rejected') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently remove {user.name} from the system? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700">
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
                  <AvatarFallback>
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">ID: {user.studentId}</p>
                </div>
              </div>
              <Badge variant={getStatusColor(user.status)} className="flex items-center gap-1">
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(user)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                View
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleOpenEmailDialog(user)}
                className="flex-1"
              >
                <Mail className="h-3 w-3 mr-1" />
                Email
              </Button>
              
              {user.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVerifyUser(user.id)}
                    className="text-green-600 hover:text-green-700 flex-1"
                  >
                    <UserCheck className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1"
                      >
                        <UserX className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Reject User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to reject {user.name}'s application?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRejectUser(user.id)} className="bg-red-600 hover:bg-red-700">
                          Reject
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
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-yellow-600 hover:text-yellow-700 flex-1"
                      >
                        <UserMinus className="h-3 w-3 mr-1" />
                        Suspend
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Suspend User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to suspend {user.name}'s account?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleSuspendUser(user.id)} className="bg-yellow-600 hover:bg-yellow-700">
                          Suspend
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to permanently delete {user.name}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
              
              {(user.status === 'suspended' || user.status === 'rejected') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex-1"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove User</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to permanently remove {user.name} from the system? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleRemoveUser(user.id)} className="bg-red-600 hover:bg-red-700">
                        Remove
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
                  <AvatarFallback className="text-lg">
                    {selectedUser.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg">{selectedUser.name}</h3>
                  <Badge variant={getStatusColor(selectedUser.status)} className="flex items-center gap-1 w-fit">
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
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    handleVerifyUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Verify & Activate
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
                >
                  Suspend User
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Delete User
                </Button>
              </div>
            )}
            
            {(selectedUser?.status === 'suspended' || selectedUser?.status === 'rejected') && (
              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleRemoveUser(selectedUser.id);
                    setIsDetailDialogOpen(false);
                  }}
                >
                  Remove User
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email</DialogTitle>
            <DialogDescription>Send an email to {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email-to">To</Label>
              <Input
                id="email-to"
                value={selectedUser?.email || ''}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Email subject..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Your message..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}