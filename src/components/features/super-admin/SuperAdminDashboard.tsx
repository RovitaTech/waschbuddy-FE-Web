'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { Textarea } from '../../ui/textarea';
import { 
  BarChart3,
  Building2,
  Globe2,
  LogOut,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Users,
  Loader2,
} from 'lucide-react';
import { superAdminService } from '@/lib/api';
import type { City, Country, DormWithLocation } from '@/lib/api/types';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

type SuperAdminTab = 'overview' | 'clients' | 'users' | 'countries' | 'cities' | 'dorms';

type JsonRecord = Record<string, unknown>;

interface ClientRecord {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  dorm: string;
  status: string;
  clientId: string;
  raw: JsonRecord;
}

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  dorm: string;
  status: string;
  raw: JsonRecord;
}

interface CountryFormState {
  name: string;
  code: string;
  dialCode: string;
}

interface CityFormState {
  name: string;
  countryId: string;
  clientId: string;
}

interface DormFormState {
  name: string;
  address: string;
  cityId: string;
  clientId: string;
}

interface ClientFormState {
  firstName: string;
  lastName: string;
  email: string;
}

const EMPTY_COUNTRY_FORM: CountryFormState = {
  name: '',
  code: '',
  dialCode: '',
};

const EMPTY_CITY_FORM: CityFormState = {
  name: '',
  countryId: '',
  clientId: '',
};

const EMPTY_DORM_FORM: DormFormState = {
  name: '',
  address: '',
  cityId: '',
  clientId: '',
};

const EMPTY_CLIENT_FORM: ClientFormState = {
  firstName: '',
  lastName: '',
  email: '',
};

const normalizeList = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  const candidates = [record.data, record.items, record.results, record.clients, record.users, record.countries, record.cities, record.dorms];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
};

const pickText = (record: JsonRecord, keys: string[], fallback = '') => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return fallback;
};

const capitalize = (value: string) => value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

const formatDisplay = (value: unknown, fallback = '—') => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const normalizeClient = (item: JsonRecord, index: number): ClientRecord => ({
  id: pickText(item, ['id', 'clientId', '_id'], `client-${index + 1}`),
  name: pickText(item, ['name', 'clientName', 'title'], `${pickText(item, ['firstName', 'first_name'])} ${pickText(item, ['lastName', 'last_name'])}`.trim() || 'Unknown client'),
  firstName: pickText(item, ['firstName', 'first_name']),
  lastName: pickText(item, ['lastName', 'last_name']),
  email: pickText(item, ['email', 'contactEmail'], '—'),
  city: pickText(item, ['city', 'cityName'], '—'),
  dorm: pickText(item, ['dorm', 'dormName'], '—'),
  status: pickText(item, ['status', 'state'], 'active'),
  clientId: pickText(item, ['clientId', 'client_id', 'id', '_id'], `client-${index + 1}`),
  raw: item,
});

const normalizeUser = (item: JsonRecord, index: number): UserRecord => {
  const firstName = pickText(item, ['firstName', 'first_name']);
  const lastName = pickText(item, ['lastName', 'last_name']);
  const combinedName = `${firstName} ${lastName}`.trim();

  return {
    id: pickText(item, ['id', 'userId', '_id'], `user-${index + 1}`),
    name: pickText(item, ['name', 'fullName', 'userName'], combinedName || 'Unknown user'),
    email: pickText(item, ['email', 'userEmail'], '—'),
    role: pickText(item, ['role', 'userRole'], '—'),
    city: pickText(item, ['city', 'cityName'], '—'),
    dorm: pickText(item, ['dorm', 'dormName'], '—'),
    status: pickText(item, ['status', 'state'], '—'),
    raw: item,
  };
};

const getMachineCount = (record: JsonRecord, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return 0;
};

export function SuperAdminDashboard({ onLogout }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [usersStats, setUsersStats] = useState<JsonRecord | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [dorms, setDorms] = useState<DormWithLocation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('all');

  const [clientForm, setClientForm] = useState<ClientFormState>(EMPTY_CLIENT_FORM);
  const [countryForm, setCountryForm] = useState<CountryFormState>(EMPTY_COUNTRY_FORM);
  const [cityForm, setCityForm] = useState<CityFormState>(EMPTY_CITY_FORM);
  const [dormForm, setDormForm] = useState<DormFormState>(EMPTY_DORM_FORM);
  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const [isSavingCity, setIsSavingCity] = useState(false);
  const [isSavingDorm, setIsSavingDorm] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [usersResponse, usersStatsResponse, clientsResponse, countriesResponse, citiesResponse, dormsResponse] = await Promise.allSettled([
        superAdminService.getAllUsers(),
        superAdminService.getUsersStats(),
        superAdminService.getAllClients(),
        superAdminService.getCountries(),
        superAdminService.getCities(),
        superAdminService.getDorms(),
      ]);

      const normalizedUsers = usersResponse.status === 'fulfilled'
        ? normalizeList<JsonRecord>(usersResponse.value).map(normalizeUser)
        : [];
      const normalizedClients = clientsResponse.status === 'fulfilled'
        ? normalizeList<JsonRecord>(clientsResponse.value).map(normalizeClient)
        : [];

      setUsers(normalizedUsers);
      setClients(normalizedClients);

      setUsersStats(usersStatsResponse.status === 'fulfilled' ? (usersStatsResponse.value as JsonRecord | null) : null);
      setCountries(countriesResponse.status === 'fulfilled' ? normalizeList<Country>(countriesResponse.value) : []);
      setCities(citiesResponse.status === 'fulfilled' ? normalizeList<City>(citiesResponse.value) : []);
      setDorms(dormsResponse.status === 'fulfilled' ? normalizeList<DormWithLocation>(dormsResponse.value) : []);

      const failedRequests = [
        { name: 'users', result: usersResponse },
        { name: 'users stats', result: usersStatsResponse },
        { name: 'clients', result: clientsResponse },
        { name: 'countries', result: countriesResponse },
        { name: 'cities', result: citiesResponse },
        { name: 'dorms', result: dormsResponse },
      ].filter(({ result }) => result.status === 'rejected');

      if (failedRequests.length > 0) {
        console.warn('Some super-admin dashboard requests failed:', failedRequests.map(({ name }) => name));
        setError(`Some dashboard data failed to load: ${failedRequests.map(({ name }) => name).join(', ')}`);
      }
    } catch (loadError) {
      console.error('Failed to load super-admin dashboard data:', loadError);
      setError('Unable to load super-admin dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const filteredClients = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return clients.filter((client) => (
      client.name.toLowerCase().includes(query)
      || client.id.toLowerCase().includes(query)
      || client.email.toLowerCase().includes(query)
    ));
  }, [clients, searchTerm]);

  const filteredClientsForDisplay = useMemo(() => {
    if (selectedClientId === 'all') {
      return filteredClients;
    }

    return filteredClients.filter((client) => client.id === selectedClientId || client.clientId === selectedClientId);
  }, [filteredClients, selectedClientId]);

  const scopedClients = useMemo(() => (
    selectedClientId === 'all'
      ? clients
      : clients.filter((client) => client.id === selectedClientId || client.clientId === selectedClientId)
  ), [clients, selectedClientId]);

  const filteredByClient = useMemo(() => {
    if (selectedClientId === 'all') {
      return {
        users,
        cities,
        dorms,
      };
    }

    return {
      users: users.filter((user) => {
        const recordClientId = pickText(user.raw, ['clientId', 'client_id']);
        return recordClientId === selectedClientId;
      }),
      cities: cities.filter((city) => city.clientId === selectedClientId),
      dorms: dorms.filter((dorm) => dorm.clientId === selectedClientId),
    };
  }, [cities, dorms, selectedClientId, users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return filteredByClient.users.filter((user) => (
      user.name.toLowerCase().includes(query)
      || user.email.toLowerCase().includes(query)
      || user.role.toLowerCase().includes(query)
    ));
  }, [filteredByClient.users, searchTerm]);

  const filteredCities = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return filteredByClient.cities.filter((city) => (
      city.name.toLowerCase().includes(query)
      || city.countryId.toLowerCase().includes(query)
      || city.clientId.toLowerCase().includes(query)
    ));
  }, [filteredByClient.cities, searchTerm]);

  const filteredDorms = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return filteredByClient.dorms.filter((dorm) => (
      dorm.name.toLowerCase().includes(query)
      || dorm.address.toLowerCase().includes(query)
      || dorm.clientId.toLowerCase().includes(query)
    ));
  }, [filteredByClient.dorms, searchTerm]);

  const overviewCounts = {
    users: usersStats?.totalUsers as number | undefined ?? filteredByClient.users.length,
    clients: selectedClientId === 'all' ? clients.length : scopedClients.length,
    countries: countries.length,
    cities: filteredByClient.cities.length,
    dorms: filteredByClient.dorms.length,
  };

  const clientOptions = clients.map((client) => ({ value: client.id, label: client.name }));
  const countryOptions = countries.map((country) => ({ value: country.id, label: country.name }));
  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }));
  const selectedClientLabel = selectedClientId === 'all'
    ? 'All clients'
    : (clients.find((client) => client.id === selectedClientId || client.clientId === selectedClientId)?.name ?? 'Selected client');

  const filteredClientOptions = [{ value: 'all', label: 'All clients' }, ...clientOptions];

  const handleCreateClient = async () => {
    if (!clientForm.firstName.trim() || !clientForm.lastName.trim() || !clientForm.email.trim()) {
      toast.error('First name, last name, and email are required.');
      return;
    }

    setIsSavingClient(true);
    try {
      await superAdminService.createClient({
        firstName: clientForm.firstName.trim(),
        lastName: clientForm.lastName.trim(),
        email: clientForm.email.trim(),
      });
      toast.success('Client onboarding email sent.');
      setClientForm(EMPTY_CLIENT_FORM);
      await loadData();
    } catch (saveError) {
      console.error('Failed to onboard client:', saveError);
      toast.error('Unable to onboard client right now.');
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleAddCountry = async () => {
    if (!countryForm.name.trim() || !countryForm.code.trim()) {
      toast.error('Country name and code are required.');
      return;
    }

    setIsSavingCountry(true);
    try {
      await superAdminService.addCountry({
        name: countryForm.name.trim(),
        code: countryForm.code.trim(),
        dialCode: countryForm.dialCode.trim(),
      });
      toast.success('Country added successfully.');
      setCountryForm(EMPTY_COUNTRY_FORM);
      await loadData();
    } catch (saveError) {
      console.error('Failed to add country:', saveError);
      toast.error('Unable to add country right now.');
    } finally {
      setIsSavingCountry(false);
    }
  };

  const handleAddCity = async () => {
    if (!cityForm.name.trim() || !cityForm.countryId || !cityForm.clientId) {
      toast.error('City, country, and client are required.');
      return;
    }

    setIsSavingCity(true);
    try {
      await superAdminService.addCities({
        cities: [{
          name: cityForm.name.trim(),
          countryId: cityForm.countryId,
          clientId: cityForm.clientId,
        }],
      });
      toast.success('City added successfully.');
      setCityForm(EMPTY_CITY_FORM);
      await loadData();
    } catch (saveError) {
      console.error('Failed to add city:', saveError);
      toast.error('Unable to add city right now.');
    } finally {
      setIsSavingCity(false);
    }
  };

  const handleAddDorm = async () => {
    if (!dormForm.name.trim() || !dormForm.address.trim() || !dormForm.cityId || !dormForm.clientId) {
      toast.error('Dorm name, address, city, and client are required.');
      return;
    }

    setIsSavingDorm(true);
    try {
      await superAdminService.addDorm({
        name: dormForm.name.trim(),
        address: dormForm.address.trim(),
        cityId: dormForm.cityId,
        clientId: dormForm.clientId,
      });
      toast.success('Dorm added successfully.');
      setDormForm(EMPTY_DORM_FORM);
      await loadData();
    } catch (saveError) {
      console.error('Failed to add dorm:', saveError);
      toast.error('Unable to add dorm right now.');
    } finally {
      setIsSavingDorm(false);
    }
  };

  const renderLoadingState = () => (
    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-card">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading super-admin dashboard...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <Image
              src="/waschbuddy-logo-light.png"
              alt="WASCHBUDDY"
              width={190}
              height={60}
              className="h-12 w-auto"
            />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-muted-foreground">Super Admin Console</p>
              <p className="text-xs text-muted-foreground">Global administration across clients, countries, cities, and dorms</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={onLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="md:hidden border-b bg-card px-3 py-3">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium">
          {([
            ['overview', 'Overview', BarChart3],
            ['clients', 'Clients', Building2],
            ['users', 'Users', Users],
            ['countries', 'Countries', Globe2],
            ['cities', 'Cities', MapPin],
            ['dorms', 'Dorms', Building2],
          ] as const).map(([value, label, Icon]) => (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-2 transition-colors ${
                activeTab === value ? 'bg-primary/10 border-primary/40 text-foreground' : 'bg-background hover:bg-accent/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="md:flex">
        <aside className="hidden w-72 border-r bg-card md:block">
          <div className="p-4">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SuperAdminTab)} orientation="vertical">
              <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0">
                <TabsTrigger value="overview" className="justify-start">
                  <BarChart3 className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="clients" className="justify-start">
                  <Building2 className="h-4 w-4" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="users" className="justify-start">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="countries" className="justify-start">
                  <Globe2 className="h-4 w-4" />
                  Countries
                </TabsTrigger>
                <TabsTrigger value="cities" className="justify-start">
                  <MapPin className="h-4 w-4" />
                  Cities
                </TabsTrigger>
                <TabsTrigger value="dorms" className="justify-start">
                  <Building2 className="h-4 w-4" />
                  Dorms
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </aside>

        <main className="flex-1">
          <div className="p-4 md:p-6">
            {isLoading ? renderLoadingState() : (
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SuperAdminTab)} className="space-y-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <h1 className="text-2xl font-semibold tracking-tight">Super Admin Overview</h1>
                      <p className="text-sm text-muted-foreground">Overview of global platform data and entity management for {selectedClientLabel}.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="min-w-[220px]">
                        <Select value={selectedClientId} onValueChange={setSelectedClientId}>
                          <SelectTrigger>
                            <SelectValue placeholder="All clients" />
                          </SelectTrigger>
                          <SelectContent>
                            {filteredClientOptions.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
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
                        {filteredClientsForDisplay.length === 0 && <p className="text-sm text-muted-foreground">No clients available.</p>}
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
                        {filteredUsers.length === 0 && <p className="text-sm text-muted-foreground">No users available.</p>}
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="clients" className="space-y-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Clients</h2>
                      <p className="text-sm text-muted-foreground">Global client records managed by super-admins.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search clients"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Onboard Client</CardTitle>
                      <CardDescription>Enter first name, last name, and email to send the client a password reset/onboarding email.</CardDescription>
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
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Client</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>City</TableHead>
                            <TableHead>Dorm</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClientsForDisplay.map((client) => (
                            <TableRow key={client.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{client.name}</p>
                                  <p className="text-sm text-muted-foreground">{client.id}</p>
                                </div>
                              </TableCell>
                              <TableCell>{client.email}</TableCell>
                              <TableCell>{client.city}</TableCell>
                              <TableCell>{client.dorm}</TableCell>
                              <TableCell><Badge variant="outline">{client.status}</Badge></TableCell>
                            </TableRow>
                          ))}
                          {filteredClientsForDisplay.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center text-muted-foreground">No matching clients.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="users" className="space-y-4">
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Users</h2>
                      <p className="text-sm text-muted-foreground">Super-admin user registry and access roles for {selectedClientLabel}.</p>
                    </div>
                    <div className="relative w-full md:w-80">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Search users"
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
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
                              <TableCell colSpan={6} className="text-center text-muted-foreground">No matching users.</TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="countries" className="space-y-4">
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
                                <TableCell colSpan={3} className="text-center text-muted-foreground">No countries available.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="cities" className="space-y-4">
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
                          <p className="text-sm text-muted-foreground">Cities available to clients and dorms for {selectedClientLabel}.</p>
                          <Select value={cityForm.countryId} onValueChange={(value) => setCityForm((current) => ({ ...current, countryId: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
                            <SelectContent>
                              {countryOptions.map((country) => (
                                <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Client</Label>
                          <Select value={cityForm.clientId} onValueChange={(value) => setCityForm((current) => ({ ...current, clientId: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                            <SelectContent>
                              {clientOptions.map((client) => (
                                <SelectItem key={client.value} value={client.value}>{client.label}</SelectItem>
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
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Country</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>ID</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredCities.map((city) => (
                              <TableRow key={city.id}>
                                <TableCell className="font-medium">{city.name}</TableCell>
                                <TableCell>{formatDisplay(city.countryId)}</TableCell>
                                <TableCell>{formatDisplay(city.clientId)}</TableCell>
                                <TableCell>{city.id}</TableCell>
                              </TableRow>
                            ))}
                            {filteredCities.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-muted-foreground">No cities available.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="dorms" className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
                    <Card>
                      <CardHeader>
                        <CardTitle>Add Dorm</CardTitle>
                        <CardDescription>Create a dorm under a city and client.</CardDescription>
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
                          <p className="text-sm text-muted-foreground">Property and client associations managed by super-admins for {selectedClientLabel}.</p>
                          <Textarea
                            id="dorm-address"
                            value={dormForm.address}
                            onChange={(event) => setDormForm((current) => ({ ...current, address: event.target.value }))}
                            rows={3}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>City</Label>
                          <Select value={dormForm.cityId} onValueChange={(value) => setDormForm((current) => ({ ...current, cityId: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
                            <SelectContent>
                              {cityOptions.map((city) => (
                                <SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label>Client</Label>
                          <Select value={dormForm.clientId} onValueChange={(value) => setDormForm((current) => ({ ...current, clientId: value }))}>
                            <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                            <SelectContent>
                              {clientOptions.map((client) => (
                                <SelectItem key={client.value} value={client.value}>{client.label}</SelectItem>
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
                        <CardDescription>Property and client associations managed by super-admins.</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>City</TableHead>
                              <TableHead>Client</TableHead>
                              <TableHead>Address</TableHead>
                              <TableHead>ID</TableHead>
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
                              </TableRow>
                            ))}
                            {filteredDorms.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground">No dorms available.</TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
