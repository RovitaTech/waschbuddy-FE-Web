'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { formatDisplay } from '../../utils/normalize';
import { DeleteEntityButton } from '../shared/DeleteEntityButton';
import { SearchInput } from '../shared/SearchInput';
import { TableShimmer } from '../shimmer/TableShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface CitiesTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

export function CitiesTab({ dashboard, isLoading }: CitiesTabProps) {
  const {
    filteredCities,
    searchTerm,
    setSearchTerm,
    selectedClientLabel,
    cityForm,
    setCityForm,
    countryOptions,
    clientOptions,
    isSavingCity,
    handleAddCity,
    handleDeleteCity,
    deletingCityId,
  } = dashboard;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Cities</h2>
          <p className="text-sm text-muted-foreground">Cities for {selectedClientLabel}.</p>
        </div>
        <SearchInput value={searchTerm} onChange={setSearchTerm} placeholder="Search cities" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Add City</CardTitle>
            <CardDescription>Create a city and attach it to a country and client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="city-name">City Name</Label>
              <Input
                id="city-name"
                value={cityForm.name}
                onChange={(event) => setCityForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city-timezone">Timezone</Label>
              <Input
                id="city-timezone"
                value={cityForm.timezone}
                onChange={(event) => setCityForm((current) => ({ ...current, timezone: event.target.value }))}
                placeholder="e.g. Europe/Berlin"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Select
                value={cityForm.countryId}
                onValueChange={(value) => setCityForm((current) => ({ ...current, countryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Client</Label>
              <Select
                value={cityForm.clientId}
                onValueChange={(value) => setCityForm((current) => ({ ...current, clientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clientOptions.map((client) => (
                    <SelectItem key={client.value} value={client.value}>
                      {client.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleAddCity} disabled={isSavingCity} className="w-full">
              {isSavingCity ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add City
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cities</CardTitle>
            <CardDescription>Cities available to clients and dorms.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <TableShimmer rows={6} columns={5} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCities.map((city) => (
                    <TableRow key={city.id}>
                      <TableCell className="font-medium">{city.name}</TableCell>
                      <TableCell>{formatDisplay(city.timezone)}</TableCell>
                      <TableCell>{formatDisplay(city.countryId)}</TableCell>
                      <TableCell>{formatDisplay(city.clientId)}</TableCell>
                      <TableCell>
                        <DeleteEntityButton
                          entityLabel={city.name}
                          onConfirm={() => handleDeleteCity(city.id)}
                          isDeleting={deletingCityId === city.id}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredCities.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No cities available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
