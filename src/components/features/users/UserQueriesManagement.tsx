 'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../ui/avatar';
import { Input } from '../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { toast } from 'sonner';
import { queryService } from '@/lib/api';
import type { UserQueryApiItem, UserQueryStatsResponse } from '@/lib/api/types';
import { Location, UserQuery } from '@/types';
import Shimmer from '../../ui/shimmer';
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
  location: Location;
}

const EMPTY_STATS: UserQueryStatsResponse = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  highPriority: 0,
};

const coerceText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;

    for (const key of ['status', 'name', 'value', 'label', 'text']) {
      const candidate = record[key];
      if (typeof candidate === 'string' || typeof candidate === 'number' || typeof candidate === 'boolean') {
        return String(candidate);
      }
    }
  }

  return '';
};

const normalizeStatus = (status?: unknown): UserQuery['status'] => {
  const normalized = coerceText(status).replace(/\s+/g, '_').replace(/-/g, '_').toLowerCase();

  if (normalized === '2') return 'resolved';
  if (normalized === '1') return 'in_progress';
  if (normalized === '0') return 'open';
  if (normalized === 'resolved') return 'resolved';
  if (normalized === 'in_progress' || normalized === 'inprogress') return 'in_progress';
  return 'open';
};

const normalizePriority = (priority?: unknown): UserQuery['priority'] => {
  const normalized = coerceText(priority).toLowerCase();

  if (normalized === '2') return 'high';
  if (normalized === '1') return 'medium';
  if (normalized === '0') return 'low';
  if (normalized === 'high') return 'high';
  if (normalized === 'medium') return 'medium';
  return 'low';
};

const toApiStatus = (status: UserQuery['status']): 0 | 1 | 2 => {
  if (status === 'in_progress') return 1;
  if (status === 'resolved') return 2;
  return 0;
};

const toApiPriority = (priority: UserQuery['priority']): 0 | 1 | 2 => {
  if (priority === 'medium') return 1;
  if (priority === 'high') return 2;
  return 0;
};

const getDisplayName = (query: UserQueryApiItem): string => {
  const fullName = `${query.firstName ?? ''} ${query.lastName ?? ''}`.trim();
  return query.userName ?? fullName ?? 'Unknown user';
};

const mapQuery = (query: UserQueryApiItem, index: number): UserQuery => ({
  id: query.queryId ?? query.id ?? `${index}`,
  userId: query.userId ?? query.id ?? query.queryId ?? `${index}`,
  userName: getDisplayName(query),
  email: query.email ?? '',
  subject: query.subject ?? 'No subject',
  message: query.message ?? '',
  status: normalizeStatus(query.status),
  priority: normalizePriority(query.priority),
  submittedAt: query.submittedAt ?? new Date().toISOString(),
  resolvedAt: query.resolvedAt,
  adminResponse: query.adminResponse,
  city: query.cityName ?? query.city ?? '',
  dorm: query.dormName ?? query.dorm ?? '',
});

const mapStats = (stats?: Partial<UserQueryStatsResponse>): UserQueryStatsResponse => ({
  ...EMPTY_STATS,
  ...(stats ?? {}),
});

export function UserQueriesManagement({ location }: UserQueriesManagementProps) {
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [stats, setStats] = useState<UserQueryStatsResponse>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedQuery, setSelectedQuery] = useState<UserQuery | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    let isActive = true;

    const loadQueries = async () => {
      if (!location.cityId) {
        if (isActive) {
          setQueries([]);
          setStats(EMPTY_STATS);
          setLoadError(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (isActive) {
          setIsLoading(true);
          setLoadError(null);
        }

        const filters = {
          cityId: location.cityId,
          dormId: location.dormId || undefined,
        };

        const [queryItems, queryStats] = await Promise.all([
          queryService.getQueries(filters),
          queryService.getQueriesStats(filters),
        ]);

        if (!isActive) return;

        const mappedQueries = queryItems.map((query, index) => mapQuery(query, index));
        setQueries(mappedQueries);
        setStats(mapStats(queryStats));
        setSelectedQuery((current) => current ? mappedQueries.find((query) => query.id === current.id) ?? current : current);
      } catch (error) {
        console.error('Error loading user queries:', error);
        if (!isActive) return;

        setQueries([]);
        setStats(EMPTY_STATS);
        setLoadError('Unable to load user queries right now.');
        toast.error('Failed to load user queries');
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadQueries();

    return () => {
      isActive = false;
    };
  }, [location.cityId, location.dormId]);

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

  const handleUpdateStatus = async (queryId: string, newStatus: UserQuery['status']) => {
    const query = queries.find((item) => item.id === queryId);
    if (!query) {
      toast.error('Query not found');
      return;
    }

    try {
      await queryService.updateQueryStatus(queryId, {
        status: toApiStatus(newStatus),
        priority: toApiPriority(query.priority),
      });

      const resolvedAt = newStatus === 'resolved' ? new Date().toISOString() : undefined;

      setQueries((prev) => prev.map((query) => (
        query.id === queryId
          ? {
              ...query,
              status: newStatus,
              resolvedAt: resolvedAt ?? query.resolvedAt,
            }
          : query
      )));

      setSelectedQuery((current) => (
        current && current.id === queryId
          ? {
              ...current,
              status: newStatus,
              resolvedAt: resolvedAt ?? current.resolvedAt,
            }
          : current
      ));

      const statusMessages = {
        open: 'Query reopened',
        in_progress: 'Query marked as in progress',
        resolved: 'Query resolved',
      };

      toast.success(statusMessages[newStatus] || 'Status updated');
    } catch (error) {
      console.error('Error updating query status:', error);
      console.debug('API error response body:', (error as any)?.responseBody ?? null);
      toast.error((error as any)?.message || 'Failed to update query status');
    }
  };

  const handleSendResponse = async (queryId: string, response: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !response.trim()) {
      toast.error('Please provide a response before resolving');
      return;
    }

    try {
      await queryService.replyToQuery(queryId, {
        response,
        status: 'resolved',
      });

      const resolvedAt = new Date().toISOString();

      setQueries((prev) => prev.map((item) => (
        item.id === queryId
          ? {
              ...item,
              adminResponse: response,
              resolvedAt,
              status: 'resolved',
            }
          : item
      )));

      setSelectedQuery((current) => (
        current && current.id === queryId
          ? {
              ...current,
              adminResponse: response,
              resolvedAt,
              status: 'resolved',
            }
          : current
      ));

      toast.success('Response sent successfully!', {
        description: `Your response has been sent to ${query.userName} and the query has been marked as resolved.`,
        duration: 5000,
      });

      setAdminResponse('');
      setIsDetailDialogOpen(false);
    } catch (error) {
      console.error('Error sending query response:', error);
      console.debug('API error response body:', (error as any)?.responseBody ?? null);
      toast.error((error as any)?.message || 'Failed to send response');
    }
  };

  const handleMarkResolved = async (queryId: string) => {
    const query = queries.find(q => q.id === queryId);
    if (!query || !query.adminResponse) {
      toast.error('Cannot resolve query without a response');
      return;
    }

    try {
      await queryService.updateQueryStatus(queryId, {
        status: 2,
        priority: toApiPriority(query.priority),
      });

      const resolvedAt = new Date().toISOString();

      setQueries((prev) => prev.map((item) => (
        item.id === queryId
          ? {
              ...item,
              status: 'resolved',
              resolvedAt,
            }
          : item
      )));

      setSelectedQuery((current) => (
        current && current.id === queryId
          ? {
              ...current,
              status: 'resolved',
              resolvedAt,
            }
          : current
      ));

      toast.success('Query marked as resolved');
    } catch (error) {
      console.error('Error resolving query:', error);
      console.debug('API error response body:', (error as any)?.responseBody ?? null);
      toast.error((error as any)?.message || 'Failed to resolve query');
    }
  };

  const handleViewDetails = (query: UserQuery) => {
    setSelectedQuery(query);
    setAdminResponse(query.adminResponse || '');
    setIsDetailDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">User Queries & Support</h2>
          <p className="text-muted-foreground">
            {location.cityId
              ? location.dorm === 'all'
                ? `Manage user queries across all dorms in ${location.city}`
                : `Manage user queries in ${location.dorm}, ${location.city}`
              : 'Select a city and dorm to load user queries.'}
          </p>
          {loadError && <p className="mt-2 text-sm text-destructive">{loadError}</p>}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, index) => (
            <Card key={`stat-skeleton-${index}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Shimmer style={{ height: 14, width: '64%', borderRadius: 6 }} />
                <Shimmer style={{ height: 16, width: 16, borderRadius: 999 }} />
              </CardHeader>
              <CardContent>
                <Shimmer style={{ height: 32, width: '40%', borderRadius: 8 }} />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
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
                <div className="text-2xl">{stats.highPriority}</div>
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
            {isLoading ? (
              Array.from({ length: 5 }).map((_, rowIndex) => (
                <TableRow key={`query-skeleton-${rowIndex}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Shimmer style={{ height: 40, width: 40, borderRadius: 999 }} />
                      <div className="space-y-2 flex-1">
                        <Shimmer style={{ height: 14, width: '55%', borderRadius: 6 }} />
                        <Shimmer style={{ height: 12, width: '70%', borderRadius: 6 }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 max-w-xs">
                      <Shimmer style={{ height: 14, width: '80%', borderRadius: 6 }} />
                      <Shimmer style={{ height: 12, width: '95%', borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Shimmer style={{ height: 24, width: 72, borderRadius: 999 }} />
                  </TableCell>
                  <TableCell>
                    <Shimmer style={{ height: 24, width: 88, borderRadius: 999 }} />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      <Shimmer style={{ height: 12, width: '70%', borderRadius: 6 }} />
                      <Shimmer style={{ height: 12, width: '55%', borderRadius: 6 }} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Shimmer style={{ height: 32, width: 40, borderRadius: 6 }} />
                      <Shimmer style={{ height: 32, width: 52, borderRadius: 6 }} />
                      <Shimmer style={{ height: 32, width: 52, borderRadius: 6 }} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              filteredQueries.map((query) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {!isLoading && filteredQueries.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {queries.length === 0 ? 'No user queries found for this location' : 'No queries found matching your criteria'}
          </p>
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