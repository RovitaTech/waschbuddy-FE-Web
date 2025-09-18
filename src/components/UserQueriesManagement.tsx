import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { filterDataByLocation, mockUserQueries, UserQuery } from './utils/mockData';
import { 
  Search, 
  Filter, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Send,
  AlertCircle,
  Star
} from 'lucide-react';

interface UserQueriesManagementProps {
  location: { city: string; dorm: string | 'all' };
}

export function UserQueriesManagement({ location }: UserQueriesManagementProps) {
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  // Update queries when location changes
  useEffect(() => {
    const filteredQueries = filterDataByLocation(mockUserQueries, location);
    setQueries(filteredQueries);
  }, [location]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'destructive';
      case 'in_progress':
        return 'outline';
      case 'resolved':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'medium':
        return 'outline';
      case 'high':
        return 'default';
      default:
        return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Star className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredQueries = queries.filter(query => {
    const matchesSearch = query.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         query.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || query.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || query.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleUpdateStatus = (queryId: string, newStatus: UserQuery['status']) => {
    setQueries(queries.map(query => 
      query.id === queryId 
        ? { 
            ...query, 
            status: newStatus
          }
        : query
    ));

    const statusMessages = {
      'open': 'Query reopened',
      'in_progress': 'Query marked as in progress',
      'resolved': 'Query resolved'
    };

    toast.success(statusMessages[newStatus] || 'Status updated');
  };

  const handleSendResponse = (queryId: string, response: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !response.trim()) {
      toast.error('Please provide a response before resolving');
      return;
    }

    setQueries(queries.map(q => 
      q.id === queryId 
        ? { 
            ...q, 
            adminResponse: response,
            resolvedAt: new Date().toISOString(),
            status: 'resolved' as const
          }
        : q
    ));
    
    toast.success('Response sent successfully!', {
      description: `Your response has been sent to ${query.userName} and the query has been marked as resolved.`,
      duration: 5000,
    });
    
    setAdminResponse('');
    setIsDetailDialogOpen(false);
  };

  const handleMarkResolved = (queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !query.adminResponse) {
      toast.error('Cannot resolve query without a response');
      return;
    }

    setQueries(queries.map(q => 
      q.id === queryId 
        ? { 
            ...q, 
            status: 'resolved' as const,
            resolvedAt: new Date().toISOString()
          }
        : q
    ));
    
    toast.success('Query marked as resolved');
  };

  const handleViewDetails = (query: UserQuery) => {
    setSelectedQuery(query);
    setAdminResponse(query.adminResponse || '');
    setIsDetailDialogOpen(true);
  };

  const stats = {
    open: queries.filter(q => q.status === 'open').length,
    inProgress: queries.filter(q => q.status === 'in_progress').length,
    resolved: queries.filter(q => q.status === 'resolved').length,
    high: queries.filter(q => q.priority === 'high').length,
    total: queries.length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">User Queries & Support</h2>
          <p className="text-muted-foreground">
            {location.dorm === 'all' 
              ? `Manage user queries across all dorms in ${location.city}` 
              : `Manage user queries in ${location.dorm}, ${location.city}`}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Queries</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.open}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">High Priority</CardTitle>
            <Star className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search queries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Queries Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQueries.map((query) => (
              <TableRow key={query.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={`/api/placeholder/40/40`} />
                      <AvatarFallback>
                        {query.userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{query.userName}</p>
                      <p className="text-sm text-muted-foreground">{query.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs">
                    <p className="truncate">{query.subject}</p>
                    <p className="text-sm text-muted-foreground truncate">{query.message}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(query.priority)}
                    <Badge variant={getPriorityColor(query.priority)} className="capitalize">
                      {query.priority}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(query.status)} className="flex items-center gap-1 w-fit">
                    {getStatusIcon(query.status)}
                    {query.status.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  <p>{new Date(query.submittedAt).toLocaleDateString()}</p>
                  <p className="text-muted-foreground">{new Date(query.submittedAt).toLocaleTimeString()}</p>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(query)}
                    >
                      <Eye className="h-3 w-3" />
                    </Button>
                    {query.status === 'open' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUpdateStatus(query.id, 'in_progress')}
                      >
                        Start
                      </Button>
                    )}
                    {query.adminResponse && query.status !== 'resolved' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkResolved(query.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {filteredQueries.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No queries found matching your criteria</p>
        </div>
      )}

      {/* Query Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Query Details</DialogTitle>
            <DialogDescription>Review and respond to query {selectedQuery?.id}</DialogDescription>
          </DialogHeader>
          {selectedQuery && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm text-muted-foreground">User</h4>
                  <p>{selectedQuery.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedQuery.email}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Submitted</h4>
                  <p>{new Date(selectedQuery.submittedAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Priority</h4>
                  <div className="flex items-center space-x-1">
                    {getPriorityIcon(selectedQuery.priority)}
                    <Badge variant={getPriorityColor(selectedQuery.priority)} className="capitalize">
                      {selectedQuery.priority}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm text-muted-foreground">Status</h4>
                  <Select
                    value={selectedQuery.status}
                    onValueChange={(value: UserQuery['status']) => {
                      handleUpdateStatus(selectedQuery.id, value);
                      setSelectedQuery({...selectedQuery, status: value});
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">Subject</h4>
                <p className="p-3 bg-muted rounded">{selectedQuery.subject}</p>
              </div>
              
              <div>
                <h4 className="text-sm text-muted-foreground mb-2">User Message</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p>{selectedQuery.message}</p>
                </div>
              </div>
              
              {selectedQuery.adminResponse && (
                <div>
                  <h4 className="text-sm text-muted-foreground mb-2">Admin Response</h4>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p>{selectedQuery.adminResponse}</p>
                    {selectedQuery.resolvedAt && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Resolved: {new Date(selectedQuery.resolvedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {selectedQuery.status !== 'resolved' && (
                <div>
                  <Label htmlFor="admin-response" className="text-sm text-muted-foreground">
                    {selectedQuery.adminResponse ? 'Update Response' : 'Admin Response'}
                  </Label>
                  <Textarea
                    id="admin-response"
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Type your response to the user..."
                    className="mt-2"
                    rows={4}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {selectedQuery?.status !== 'resolved' && (
              <Button
                onClick={() => selectedQuery && handleSendResponse(selectedQuery.id, adminResponse)}
                disabled={!adminResponse.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                Send Response & Mark Resolved
              </Button>
            )}
            {selectedQuery?.adminResponse && selectedQuery.status !== 'resolved' && (
              <Button
                variant="outline"
                onClick={() => selectedQuery && handleMarkResolved(selectedQuery.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Resolved
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}