'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { getApiErrorMessage, superAdminService } from '@/lib/api';
import type { City, Country, DormWithLocation } from '@/lib/api/types';
import {
  EMPTY_CITY_FORM,
  EMPTY_CLIENT_FORM,
  EMPTY_COUNTRY_FORM,
  EMPTY_DORM_FORM,
  type CityFormState,
  type ClientFormState,
  type ClientRecord,
  type CountryFormState,
  type DormFormState,
  type JsonRecord,
  type UserRecord,
  type UserRoleFilter,
} from '../types';
import { fetchDormsForClient } from '../utils/dorms';
import {
  matchesUserRoleFilter,
  normalizeClient,
  normalizeList,
  normalizeUser,
  pickText,
  resolveApiClientId,
} from '../utils/normalize';

export function useSuperAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [usersStats, setUsersStats] = useState<JsonRecord | null>(null);
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [dorms, setDorms] = useState<DormWithLocation[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [userRoleFilter, setUserRoleFilter] = useState<UserRoleFilter>('all');

  const [clientForm, setClientForm] = useState<ClientFormState>(EMPTY_CLIENT_FORM);
  const [countryForm, setCountryForm] = useState<CountryFormState>(EMPTY_COUNTRY_FORM);
  const [cityForm, setCityForm] = useState<CityFormState>(EMPTY_CITY_FORM);
  const [dormForm, setDormForm] = useState<DormFormState>(EMPTY_DORM_FORM);

  const [isSavingClient, setIsSavingClient] = useState(false);
  const [isSavingCountry, setIsSavingCountry] = useState(false);
  const [isSavingCity, setIsSavingCity] = useState(false);
  const [isSavingDorm, setIsSavingDorm] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);
  const [deletingDormId, setDeletingDormId] = useState<string | null>(null);
  const [dormsClientId, setDormsClientId] = useState('');
  const [isLoadingDorms, setIsLoadingDorms] = useState(false);
  const [dormsError, setDormsError] = useState<string | null>(null);

  const loadDormsForClient = useCallback(async (clientId: string) => {
    if (!clientId) {
      setDorms([]);
      setDormsError(null);
      return;
    }

    setIsLoadingDorms(true);
    setDormsError(null);

    const { dorms: loadedDorms, error } = await fetchDormsForClient(clientId);
    setDorms(loadedDorms);
    setDormsError(error);
    setIsLoadingDorms(false);
  }, []);

  const selectDormsClient = useCallback(
    (clientId: string) => {
      setDormsClientId(clientId);
      setDormForm((current) => ({
        ...current,
        clientId,
        cityId: current.clientId === clientId ? current.cityId : '',
      }));
    },
    [],
  );

  const loadData = useCallback(async () => {
    setError(null);

    try {
      const [
        usersResponse,
        usersStatsResponse,
        clientsResponse,
        countriesResponse,
        citiesResponse,
      ] = await Promise.allSettled([
        superAdminService.getAllUsers(),
        superAdminService.getUsersStats(),
        superAdminService.getAllClients(),
        superAdminService.getCountries(),
        superAdminService.getCities(),
      ]);

      const normalizedUsers =
        usersResponse.status === 'fulfilled'
          ? normalizeList<JsonRecord>(usersResponse.value).map(normalizeUser)
          : [];
      const normalizedClients =
        clientsResponse.status === 'fulfilled'
          ? normalizeList<JsonRecord>(clientsResponse.value).map(normalizeClient)
          : [];

      setUsers(normalizedUsers);
      setClients(normalizedClients);
      setUsersStats(
        usersStatsResponse.status === 'fulfilled'
          ? (usersStatsResponse.value as JsonRecord | null)
          : null,
      );
      setCountries(
        countriesResponse.status === 'fulfilled'
          ? normalizeList<Country>(countriesResponse.value)
          : [],
      );
      setCities(
        citiesResponse.status === 'fulfilled' ? normalizeList<City>(citiesResponse.value) : [],
      );

      const failedRequests = [
        { name: 'users', result: usersResponse },
        { name: 'users stats', result: usersStatsResponse },
        { name: 'clients', result: clientsResponse },
        { name: 'countries', result: countriesResponse },
        { name: 'cities', result: citiesResponse },
      ].filter(({ result }) => result.status === 'rejected');

      const failureDetails = failedRequests.map(({ name, result }) => {
        const reason =
          result.status === 'rejected' ? getApiErrorMessage(result.reason, 'Request failed') : '';
        return reason ? `${name} (${reason})` : name;
      });

      if (failureDetails.length > 0) {
        console.warn('Some super-admin dashboard requests failed:', failureDetails);
        setError(`Some dashboard data failed to load: ${failureDetails.join(', ')}`);
      }

      if (dormsClientId) {
        await loadDormsForClient(dormsClientId);
      }
    } catch (loadError) {
      console.error('Failed to load super-admin dashboard data:', loadError);
      setError('Unable to load super-admin dashboard data.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [dormsClientId, loadDormsForClient]);

  useEffect(() => {
    if (!dormsClientId) return;
    void loadDormsForClient(dormsClientId);
  }, [dormsClientId, loadDormsForClient]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const filteredClients = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.id.toLowerCase().includes(query) ||
        client.clientId.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query),
    );
  }, [clients, searchTerm]);

  const filteredClientsForDisplay = useMemo(() => {
    if (selectedClientId === 'all') {
      return filteredClients;
    }
    return filteredClients.filter(
      (client) =>
        resolveApiClientId(client) === selectedClientId || client.id === selectedClientId,
    );
  }, [filteredClients, selectedClientId]);

  const scopedClients = useMemo(
    () =>
      selectedClientId === 'all'
        ? clients
        : clients.filter(
            (client) =>
              resolveApiClientId(client) === selectedClientId || client.id === selectedClientId,
          ),
    [clients, selectedClientId],
  );

  const matchesSelectedClient = useCallback(
    (recordClientId: string) =>
      selectedClientId === 'all' ||
      recordClientId === selectedClientId ||
      clients.some(
        (client) =>
          (client.id === selectedClientId || resolveApiClientId(client) === selectedClientId) &&
          (recordClientId === resolveApiClientId(client) || recordClientId === client.id),
      ),
    [clients, selectedClientId],
  );

  const filteredByClient = useMemo(() => {
    if (selectedClientId === 'all') {
      return { users, cities };
    }

    return {
      users: users.filter((user) => {
        const recordClientId = pickText(user.raw, ['clientId', 'client_id', 'clientUUID']);
        return matchesSelectedClient(recordClientId);
      }),
      cities: cities.filter((city) => matchesSelectedClient(city.clientId)),
    };
  }, [cities, matchesSelectedClient, selectedClientId, users]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return filteredByClient.users.filter(
      (user) =>
        matchesUserRoleFilter(user.role, userRoleFilter) &&
        (user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query)),
    );
  }, [filteredByClient.users, searchTerm, userRoleFilter]);

  const filteredCities = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return filteredByClient.cities.filter(
      (city) =>
        city.name.toLowerCase().includes(query) ||
        city.countryId.toLowerCase().includes(query) ||
        city.clientId.toLowerCase().includes(query) ||
        (city.timezone ?? '').toLowerCase().includes(query),
    );
  }, [filteredByClient.cities, searchTerm]);

  const filteredDorms = useMemo(() => {
    const query = searchTerm.toLowerCase();
    return dorms.filter(
      (dorm) =>
        dorm.name.toLowerCase().includes(query) ||
        dorm.address.toLowerCase().includes(query) ||
        dorm.clientId.toLowerCase().includes(query),
    );
  }, [dorms, searchTerm]);

  const overviewDormCount = useMemo(() => {
    if (selectedClientId === 'all') {
      return clients.reduce((sum, client) => sum + client.dormCount, 0);
    }

    const client = clients.find(
      (entry) =>
        resolveApiClientId(entry) === selectedClientId || entry.id === selectedClientId,
    );

    return client?.dormCount ?? dorms.length;
  }, [clients, dorms.length, selectedClientId]);

  const overviewCounts = {
    users:
      (usersStats?.totalUsers as number | undefined) ?? filteredByClient.users.length,
    clients: selectedClientId === 'all' ? clients.length : scopedClients.length,
    countries: countries.length,
    cities: filteredByClient.cities.length,
    dorms: overviewDormCount,
  };

  const cityOptionsForDorms = useMemo(() => {
    const scopeClientId = dormsClientId || dormForm.clientId;
    return cities
      .filter((city) => !scopeClientId || city.clientId === scopeClientId)
      .map((city) => ({ value: city.id, label: city.name }));
  }, [cities, dormForm.clientId, dormsClientId]);

  const clientOptions = clients.map((client) => ({
    value: resolveApiClientId(client),
    label: client.name,
  }));
  const countryOptions = countries.map((country) => ({ value: country.id, label: country.name }));
  const cityOptions = cities.map((city) => ({ value: city.id, label: city.name }));

  const selectedClientLabel =
    selectedClientId === 'all'
      ? 'All clients'
      : (clients.find(
          (client) =>
            client.id === selectedClientId || resolveApiClientId(client) === selectedClientId,
        )?.name ?? 'Selected client');

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
      toast.error(getApiErrorMessage(saveError, 'Unable to onboard client right now.'));
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    setDeletingClientId(clientId);
    try {
      await superAdminService.deleteClient({ clientId });
      toast.success('Client deleted successfully.');
      await loadData();
    } catch (deleteError) {
      console.error('Failed to delete client:', deleteError);
      toast.error('Unable to delete client right now.');
    } finally {
      setDeletingClientId(null);
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
    if (!cityForm.name.trim() || !cityForm.countryId || !cityForm.clientId || !cityForm.timezone.trim()) {
      toast.error('City name, country, client, and timezone are required.');
      return;
    }

    setIsSavingCity(true);
    try {
      await superAdminService.addCities({
        cities: [
          {
            name: cityForm.name.trim(),
            countryId: cityForm.countryId,
            clientId: cityForm.clientId,
            timezone: cityForm.timezone.trim(),
          },
        ],
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

  const handleDeleteCity = async (cityId: string) => {
    setDeletingCityId(cityId);
    try {
      await superAdminService.deleteCity(cityId);
      toast.success('City deleted successfully.');
      await loadData();
    } catch (deleteError) {
      console.error('Failed to delete city:', deleteError);
      toast.error('Unable to delete city right now.');
    } finally {
      setDeletingCityId(null);
    }
  };

  const handleAddDorm = async () => {
    const clientId = dormsClientId || dormForm.clientId;

    if (!clientId) {
      toast.error('Select a client before adding a dorm.');
      return;
    }

    if (!dormForm.name.trim() || !dormForm.address.trim() || !dormForm.cityId) {
      toast.error('Dorm name, address, and city are required.');
      return;
    }

    setIsSavingDorm(true);
    try {
      await superAdminService.addDorm({
        name: dormForm.name.trim(),
        address: dormForm.address.trim(),
        cityId: dormForm.cityId,
        clientId,
      });
      toast.success('Dorm added successfully.');
      setDormForm({ ...EMPTY_DORM_FORM, clientId });
      await loadData();
    } catch (saveError) {
      console.error('Failed to add dorm:', saveError);
      toast.error(getApiErrorMessage(saveError, 'Unable to add dorm right now.'));
    } finally {
      setIsSavingDorm(false);
    }
  };

  const handleDeleteDorm = async (dormId: string) => {
    setDeletingDormId(dormId);
    try {
      await superAdminService.deleteDorm({ dormId });
      toast.success('Dorm deleted successfully.');
      if (dormsClientId) {
        await loadDormsForClient(dormsClientId);
      }
      await loadData();
    } catch (deleteError) {
      console.error('Failed to delete dorm:', deleteError);
      toast.error(getApiErrorMessage(deleteError, 'Unable to delete dorm right now.'));
    } finally {
      setDeletingDormId(null);
    }
  };

  return {
    isLoading,
    isRefreshing,
    error,
    searchTerm,
    setSearchTerm,
    userRoleFilter,
    setUserRoleFilter,
    selectedClientId,
    setSelectedClientId,
    refreshData,
    overviewCounts,
    filteredClientsForDisplay,
    filteredUsers,
    filteredCities,
    filteredDorms,
    countries,
    selectedClientLabel,
    filteredClientOptions,
    clientOptions,
    countryOptions,
    cityOptions,
    cityOptionsForDorms,
    dormsClientId,
    selectDormsClient,
    isLoadingDorms,
    dormsError,
    clientForm,
    setClientForm,
    countryForm,
    setCountryForm,
    cityForm,
    setCityForm,
    dormForm,
    setDormForm,
    isSavingClient,
    isSavingCountry,
    isSavingCity,
    isSavingDorm,
    deletingClientId,
    deletingCityId,
    deletingDormId,
    handleCreateClient,
    handleDeleteClient,
    handleAddCountry,
    handleAddCity,
    handleDeleteCity,
    handleAddDorm,
    handleDeleteDorm,
  };
}
