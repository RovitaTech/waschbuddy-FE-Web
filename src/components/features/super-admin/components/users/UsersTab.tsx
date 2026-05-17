'use client';

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
    searchTerm,
    setSearchTerm,
    userRoleFilter,
    setUserRoleFilter,
    selectedClientLabel,
  } = dashboard;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Users</h2>
          <p className="text-sm text-muted-foreground">
            Super-admin user registry and access roles for {selectedClientLabel}.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Select value={userRoleFilter} onValueChange={(value) => setUserRoleFilter(value as typeof userRoleFilter)}>
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
          <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search users" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableShimmer rows={6} columns={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Dorm</TableHead>
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
                    <TableCell>{user.city}</TableCell>
                    <TableCell>{user.dorm}</TableCell>
                    <TableCell>{formatDisplay(user.status)}</TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No matching users for this role filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
