'use client';

import { Loader2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { DeleteEntityButton } from '../shared/DeleteEntityButton';
import { SearchInput } from '../shared/SearchInput';
import { TableShimmer } from '../shimmer/TableShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface ClientsTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

export function ClientsTab({ dashboard, isLoading }: ClientsTabProps) {
  const {
    filteredClientsForDisplay,
    searchTerm,
    setSearchTerm,
    clientForm,
    setClientForm,
    isSavingClient,
    handleCreateClient,
    handleDeleteClient,
    deletingClientId,
  } = dashboard;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Clients</h2>
          <p className="text-sm text-muted-foreground">Global client records managed by super-admins.</p>
        </div>
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search clients" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Onboard Client</CardTitle>
          <CardDescription>
            Enter first name, last name, and email to send the client a password reset/onboarding email.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-4">
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="client-first-name">First name</Label>
            <Input
              id="client-first-name"
              value={clientForm.firstName}
              onChange={(event) => setClientForm((current) => ({ ...current, firstName: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="client-last-name">Last name</Label>
            <Input
              id="client-last-name"
              value={clientForm.lastName}
              onChange={(event) => setClientForm((current) => ({ ...current, lastName: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="client-email">Email</Label>
            <Input
              id="client-email"
              type="email"
              value={clientForm.email}
              onChange={(event) => setClientForm((current) => ({ ...current, email: event.target.value }))}
            />
          </div>
          <div className="flex items-end md:col-span-1">
            <Button onClick={handleCreateClient} disabled={isSavingClient} className="w-full">
              {isSavingClient ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Onboard Client
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <TableShimmer rows={5} columns={6} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dorms</TableHead>
                  <TableHead>Cities</TableHead>
                  <TableHead className="w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClientsForDisplay.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div>
                              <p className="font-medium">{client.name}</p>
                              <p className="text-sm text-muted-foreground">Client ID: {client.clientId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{client.status}</Badge>
                    </TableCell>
                    <TableCell>{client.dormCount}</TableCell>
                    <TableCell>{client.cityCount}</TableCell>
                    <TableCell>
                      <DeleteEntityButton
                        entityLabel={client.name}
                        onConfirm={() => handleDeleteClient(client.clientId)}
                        isDeleting={deletingClientId === client.clientId}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {filteredClientsForDisplay.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No matching clients.
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
