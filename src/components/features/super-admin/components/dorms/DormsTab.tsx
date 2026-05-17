'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { formatDisplay } from '../../utils/normalize';
import { DeleteEntityButton } from '../shared/DeleteEntityButton';
import { SearchInput } from '../shared/SearchInput';
import { TableShimmer } from '../shimmer/TableShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface DormsTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

export function DormsTab({ dashboard, isLoading }: DormsTabProps) {
  const {
    filteredDorms,
    searchTerm,
    setSearchTerm,
    dormForm,
    setDormForm,
    cityOptionsForDorms,
    clientOptions,
    dormsClientId,
    selectDormsClient,
    isLoadingDorms,
    dormsError,
    isSavingDorm,
    handleAddDorm,
    handleDeleteDorm,
    deletingDormId,
  } = dashboard;

  const selectedClientLabel =
    clientOptions.find((client) => client.value === dormsClientId)?.label ?? null;

  const tableLoading = isLoading || isLoadingDorms;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dorms</h2>
          <p className="text-sm text-muted-foreground">
            Dorms are loaded per client. Select a client to view and manage their properties.
          </p>
        </div>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search dorms"
          className={dormsClientId ? 'w-full md:w-80' : 'w-full md:w-80 opacity-60'}
        />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Client</CardTitle>
          <CardDescription>
            Uses <code className="text-xs">clientId</code> from{' '}
            <code className="text-xs">GET /super-admin/clients</code> (e.g. CLIENT_36B10A6C).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={dormsClientId || undefined} onValueChange={selectDormsClient}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Select a client to load dorms" />
            </SelectTrigger>
            <SelectContent>
              {clientOptions.map((client) => (
                <SelectItem key={client.value} value={client.value}>
                  {client.label} ({client.value})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {dormsError && (
        <p className="text-sm text-destructive">{dormsError}</p>
      )}

      {!dormsClientId ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Select a client above to load dorms for that client.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Add Dorm</CardTitle>
              <CardDescription>
                Creating dorm for {selectedClientLabel} ({dormsClientId}).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="dorm-name">Dorm Name</Label>
                <Input
                  id="dorm-name"
                  value={dormForm.name}
                  onChange={(event) => setDormForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="dorm-address">Address</Label>
                <Textarea
                  id="dorm-address"
                  value={dormForm.address}
                  onChange={(event) => setDormForm((current) => ({ ...current, address: event.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>City</Label>
                <Select
                  value={dormForm.cityId}
                  onValueChange={(value) => setDormForm((current) => ({ ...current, cityId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city for this client" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityOptionsForDorms.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddDorm} disabled={isSavingDorm} className="w-full">
                {isSavingDorm ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add Dorm
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dorms</CardTitle>
              <CardDescription>
                Loaded from GET /super-admin/clients/dorms?clientId={dormsClientId}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {tableLoading ? (
                <TableShimmer rows={6} columns={6} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDorms.map((dorm) => (
                      <TableRow key={dorm.id}>
                        <TableCell className="font-medium">{dorm.name}</TableCell>
                        <TableCell>{formatDisplay(dorm.cityId)}</TableCell>
                        <TableCell>{formatDisplay(dorm.clientId)}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{formatDisplay(dorm.address)}</TableCell>
                        <TableCell>{dorm.id}</TableCell>
                        <TableCell>
                          <DeleteEntityButton
                            entityLabel={dorm.name}
                            onConfirm={() => handleDeleteDorm(dorm.id)}
                            isDeleting={deletingDormId === dorm.id}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredDorms.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No dorms for this client yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
