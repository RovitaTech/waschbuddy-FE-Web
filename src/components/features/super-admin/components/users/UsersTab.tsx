'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { formatDisplay } from '../../utils/normalize';
import { SearchInput } from '../shared/SearchInput';
import { TableShimmer } from '../shimmer/TableShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface UsersTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

const ROLE_FILTER_OPTIONS = [
  { value: 'all', label: 'All roles' },
  { value: 'admin', label: 'Admins' },
  { value: 'resident', label: 'Residents' },
] as const;

export function UsersTab({ dashboard, isLoading }: UsersTabProps) {
  const {
    filteredUsers,
    usersSearch,
    setUsersSearch,
    userRoleFilter,
    setUserRoleFilter,
    usersPage,
    setUsersPage,
    usersMeta,
    isLoadingUsers,
    selectedClientLabel,
  } = dashboard;

  const tableLoading = isLoading || isLoadingUsers;
  const canGoPrev = (usersMeta?.page ?? 1) > 1;
  const canGoNext = usersMeta?.hasNextPage ?? false;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            POST /super-admin/clients/users — server-side role and search for {selectedClientLabel}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select
            value={userRoleFilter}
            onValueChange={(value) => setUserRoleFilter(value as typeof userRoleFilter)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <SearchInput
            value={usersSearch}
            onChange={setUsersSearch}
            placeholder="Search users (email, name, clientId)"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {tableLoading ? (
            <TableShimmer rows={6} columns={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{formatDisplay(user.role)}</TableCell>
                    <TableCell>{formatDisplay(pickClientId(user))}</TableCell>
                    <TableCell>{formatDisplay(user.status)}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users match this filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {usersMeta && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">
            Page {usersMeta.page} of {usersMeta.totalPages} · {usersMeta.total} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoPrev || tableLoading}
              onClick={() => setUsersPage((page) => Math.max(1, page - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext || tableLoading}
              onClick={() => setUsersPage((page) => page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function pickClientId(user: { raw: Record<string, unknown> }) {
  const record = user.raw;
  const clientId = record.clientId ?? record.client_id;
  return typeof clientId === 'string' ? clientId : '';
}
