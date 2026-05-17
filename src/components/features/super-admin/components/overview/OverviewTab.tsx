'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { formatDisplay } from '../../utils/normalize';
import { OverviewListsShimmer, OverviewStatsShimmer } from '../shimmer/OverviewShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface OverviewTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

export function OverviewTab({ dashboard, isLoading }: OverviewTabProps) {
  const {
    error,
    overviewCounts,
    filteredClientsForDisplay,
    filteredUsers,
    selectedClientLabel,
    filteredClientOptions,
    selectedClientId,
    setSelectedClientId,
    searchTerm,
    setSearchTerm,
  } = dashboard;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Super Admin Overview</h1>
          <p className="text-sm text-muted-foreground">
            Overview of global platform data and entity management for {selectedClientLabel}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="min-w-[220px]">
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger>
                <SelectValue placeholder="All clients" />
              </SelectTrigger>
              <SelectContent>
                {filteredClientOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search clients or users"
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {isLoading ? (
        <>
          <OverviewStatsShimmer />
          <OverviewListsShimmer />
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="text-3xl">{overviewCounts.users}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total Clients</CardDescription>
                <CardTitle className="text-3xl">{overviewCounts.clients}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Countries</CardDescription>
                <CardTitle className="text-3xl">{overviewCounts.countries}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cities</CardDescription>
                <CardTitle className="text-3xl">{overviewCounts.cities}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Dorms</CardDescription>
                <CardTitle className="text-3xl">{overviewCounts.dorms}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Clients</CardTitle>
                <CardDescription>Latest client records loaded from the super-admin API.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredClientsForDisplay.slice(0, 5).map((client) => (
                  <div key={client.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.email}</p>
                    </div>
                    <Badge variant="outline">{client.status}</Badge>
                  </div>
                ))}
                {filteredClientsForDisplay.length === 0 && (
                  <p className="text-sm text-muted-foreground">No clients available.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
                <CardDescription>Latest user records and roles.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {filteredUsers.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline">{formatDisplay(user.role)}</Badge>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <p className="text-sm text-muted-foreground">No users available.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
