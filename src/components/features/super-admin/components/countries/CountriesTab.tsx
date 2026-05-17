'use client';

import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { useSuperAdminDashboard } from '../../hooks/useSuperAdminDashboard';
import { TableShimmer } from '../shimmer/TableShimmer';

type DashboardState = ReturnType<typeof useSuperAdminDashboard>;

interface CountriesTabProps {
  dashboard: DashboardState;
  isLoading: boolean;
}

export function CountriesTab({ dashboard, isLoading }: CountriesTabProps) {
  const { countries, countryForm, setCountryForm, isSavingCountry, handleAddCountry } = dashboard;

  return (
    <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Add Country</CardTitle>
          <CardDescription>Create a new country entry.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="country-name">Name</Label>
            <Input
              id="country-name"
              value={countryForm.name}
              onChange={(event) => setCountryForm((current) => ({ ...current, name: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country-code">Code</Label>
            <Input
              id="country-code"
              value={countryForm.code}
              onChange={(event) => setCountryForm((current) => ({ ...current, code: event.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="country-dial">Dial Code</Label>
            <Input
              id="country-dial"
              value={countryForm.dialCode}
              onChange={(event) => setCountryForm((current) => ({ ...current, dialCode: event.target.value }))}
            />
          </div>
          <Button onClick={handleAddCountry} disabled={isSavingCountry} className="w-full">
            {isSavingCountry ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Country
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Countries</CardTitle>
          <CardDescription>Country list sourced from the super-admin API.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <TableShimmer rows={6} columns={3} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Dial Code</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countries.map((country) => (
                  <TableRow key={country.id}>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>{country.code}</TableCell>
                    <TableCell>{country.dialCode}</TableCell>
                  </TableRow>
                ))}
                {countries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      No countries available.
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
