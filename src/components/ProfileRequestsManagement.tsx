import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { maskPhoneNumber } from './utils/privacy';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Mail,
  Phone,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ProfileRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: 'email' | 'phone';
  currentValue: string;
  requestedValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  processedDate?: string;
  processedBy?: string;
  adminNotes?: string;
}

interface ProfileRequestsManagementProps {
  location: { city: string; dorm: string | 'all' };
}

export function ProfileRequestsManagement({ location }: ProfileRequestsManagementProps) {
  const [requests, setRequests] = useState<ProfileRequest[]>([
    {
      id: 'PR001',
      userId: '2',
      userName: 'Maria Schmidt',
      userEmail: 'ws-maria.schmidt@waschbar.com',
      requestType: 'email',
      currentValue: 'maria.schmidt@student.uni.de',
      requestedValue: 'maria.s.new@student.uni.de',
      reason: 'University changed email format',
      status: 'pending',
      requestDate: '2024-01-17T10:30:00'
    },
    {
      id: 'PR002',
      userId: '3',
      userName: 'Alex Weber',
      userEmail: 'ws-alex.weber@waschbar.com',
      requestType: 'phone',
      currentValue: '+49 555 123 4567',
      requestedValue: '+49 777 999 8888',
      reason: 'Changed phone number',
      status: 'approved',
      requestDate: '2024-01-15T14:20:00',
      processedDate: '2024-01-16T09:15:00',
      processedBy: 'Admin User',
      adminNotes: 'Verified through university records'
    },
    {
      id: 'PR003',
      userId: '4',
      userName: 'Lisa Mueller',
      userEmail: 'ws-lisa.mueller@waschbar.com',
      requestType: 'email',
      currentValue: 'lisa.old@student.uni.de',
      requestedValue: 'lisa.suspicious@gmail.com',
      reason: 'Personal preference',
      status: 'rejected',
      requestDate: '2024-01-14T16:45:00',
      processedDate: '2024-01-15T10:30:00',
      processedBy: 'Admin User',
      adminNotes: 'Request denied - must use university email'
    },
    {
      id: 'PR004',
      userId: '5',
      userName: 'Tom Mueller',
      userEmail: 'ws-tom.mueller@waschbar.com',
      requestType: 'phone',
      currentValue: '+49 333 444 5555',
      requestedValue: '+49 111 222 3333',
      reason: 'Lost previous phone',
      status: 'pending',
      requestDate: '2024-01-17T08:15:00'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<ProfileRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline';
      case 'approved':
        return 'default';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'phone':
        return <Phone className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.requestedValue.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesType = typeFilter === 'all' || request.requestType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleApproveRequest = (requestId: string, notes: string = '') => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setRequests(requests.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            status: 'approved' as const,
            processedDate: new Date().toISOString(),
            processedBy: 'Admin User',
            adminNotes: notes
          }
        : r
    ));
    
    toast.success('Request approved!', {
      description: `${request.userName}'s ${request.requestType} change has been approved and they have been notified.`,
      duration: 5000,
    });
    
    setIsDetailDialogOpen(false);
    setAdminNotes('');
  };

  const handleRejectRequest = (requestId: string, notes: string) => {
    const request = requests.find(r => r.id === requestId);
    if (!request) return;

    setRequests(requests.map(r => 
      r.id === requestId 
        ? { 
            ...r, 
            status: 'rejected' as const,
            processedDate: new Date().toISOString(),
            processedBy: 'Admin User',
            adminNotes: notes
          }
        : r
    ));
    
    toast.error('Request rejected', {
      description: `${request.userName}'s ${request.requestType} change request has been rejected.`,
      duration: 4000,
    });
    
    setIsDetailDialogOpen(false);
    setAdminNotes('');
  };

  const handleViewDetails = (request: ProfileRequest) => {
    setSelectedRequest(request);
    setAdminNotes(request.adminNotes || '');
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Profile Change Requests</h2>
          <p className="text-muted-foreground">Review and manage user profile change requests</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{requests.filter(r => r.status === 'pending').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{requests.filter(r => r.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{requests.filter(r => r.status === 'rejected').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Email Requests</CardTitle>
            <Mail className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{requests.filter(r => r.requestType === 'email').length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search requests..."
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
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="email">Email Changes</SelectItem>
            <SelectItem value="phone">Phone Changes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Current Value</TableHead>
              <TableHead>Requested Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>
                        {request.userName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{request.userName}</p>
                      <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(request.requestType)}
                    <span className="capitalize">{request.requestType}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {request.requestType === 'phone' ? maskPhoneNumber(request.currentValue) : request.currentValue}
                  </code>
                </TableCell>
                <TableCell>
                  <code className="text-sm bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded">
                    {request.requestType === 'phone' ? maskPhoneNumber(request.requestedValue) : request.requestedValue}
                  </code>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(request.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(request.status)}
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{new Date(request.requestDate).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">{new Date(request.requestDate).toLocaleTimeString()}</p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {request.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApproveRequest(request.id)}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Reject
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

      {/* Request Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Change Request Details</DialogTitle>
            <DialogDescription>Review and process request {selectedRequest?.id}</DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">User</h4>
                  <p>{selectedRequest.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Request Type</h4>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(selectedRequest.requestType)}
                    <span className="capitalize">{selectedRequest.requestType}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Current Value</h4>
                  <code className="text-sm bg-muted px-2 py-1 rounded block">
                    {selectedRequest.requestType === 'phone' ? maskPhoneNumber(selectedRequest.currentValue) : selectedRequest.currentValue}
                  </code>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Requested Value</h4>
                  <code className="text-sm bg-blue-50 dark:bg-blue-950/20 px-2 py-1 rounded block">
                    {selectedRequest.requestType === 'phone' ? maskPhoneNumber(selectedRequest.requestedValue) : selectedRequest.requestedValue}
                  </code>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Status</h4>
                  <Badge variant={getStatusColor(selectedRequest.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Request Date</h4>
                  <p>{new Date(selectedRequest.requestDate).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">User Reason</h4>
                <p className="p-3 bg-muted rounded">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.status !== 'pending' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-muted-foreground">Processed Date</h4>
                    <p>{selectedRequest.processedDate ? new Date(selectedRequest.processedDate).toLocaleString() : 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-muted-foreground">Processed By</h4>
                    <p>{selectedRequest.processedBy || 'N/A'}</p>
                  </div>
                </div>
              )}
              
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Admin Notes</h4>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this request..."
                  disabled={selectedRequest.status !== 'pending'}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            {selectedRequest?.status === 'pending' && (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => selectedRequest && handleRejectRequest(selectedRequest.id, adminNotes)}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => selectedRequest && handleApproveRequest(selectedRequest.id, adminNotes)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}