import type { ClientRecord, JsonRecord, UserRecord, UserRoleFilter } from '../types';

export const normalizeList = <T,>(response: unknown): T[] => {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const record = response as Record<string, unknown>;
  const candidates = [
    record.data,
    record.items,
    record.results,
    record.clients,
    record.users,
    record.countries,
    record.cities,
    record.dorms,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }

    if (candidate && typeof candidate === 'object') {
      const nested = candidate as Record<string, unknown>;
      const nestedCandidates = [
        nested.data,
        nested.items,
        nested.clients,
        nested.users,
        nested.countries,
        nested.cities,
        nested.dorms,
      ];

      for (const nestedList of nestedCandidates) {
        if (Array.isArray(nestedList)) {
          return nestedList as T[];
        }
      }
    }
  }

  return [];
};

export const pickText = (record: JsonRecord, keys: string[], fallback = '') => {
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

export const matchesUserRoleFilter = (role: string, filter: UserRoleFilter): boolean => {
  if (filter === 'all') return true;

  const normalized = role.toLowerCase().trim();
  if (!normalized) return false;

  if (filter === 'admin') {
    return normalized.includes('admin') && !normalized.includes('super');
  }

  return normalized.includes('resident');
};

export const formatDisplay = (value: unknown, fallback = '—') => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
};

const pickNumber = (record: JsonRecord, keys: string[], fallback = 0) => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return fallback;
};

/** CLIENT_xxx from API — never fall back to admin user `id`. */
const extractApiClientId = (item: JsonRecord): string => {
  const direct = pickText(item, ['clientId', 'client_id', 'clientUUID', 'client_uuid']);
  if (direct) return direct;

  if (item.client && typeof item.client === 'object') {
    return pickText(item.client as JsonRecord, ['clientId', 'client_id', 'id', '_id']);
  }

  return '';
};

/** Client entity id for super-admin mutations (dorms, cities, delete). */
export const resolveApiClientId = (client: Pick<ClientRecord, 'clientId' | 'id'>): string =>
  client.clientId || client.id;

export const normalizeClient = (item: JsonRecord, index: number): ClientRecord => {
  const clientId = extractApiClientId(item) || `client-${index + 1}`;
  const rowId = pickText(item, ['id', 'userId', 'user_id', '_id'], `user-${index + 1}`);

  return {
    id: rowId,
    clientId,
    name: pickText(item, ['name', 'clientName', 'title'], `${pickText(item, ['firstName', 'first_name'])} ${pickText(item, ['lastName', 'last_name'])}`.trim() || 'Unknown client'),
    firstName: pickText(item, ['firstName', 'first_name']),
    lastName: pickText(item, ['lastName', 'last_name']),
    email: pickText(item, ['email', 'contactEmail'], '—'),
    city: pickText(item, ['city', 'cityName'], '—'),
    dorm: pickText(item, ['dorm', 'dormName'], '—'),
    status: pickText(item, ['status', 'state'], 'active'),
    dormCount: pickNumber(item, ['dormCount', 'dorm_count']),
    cityCount: pickNumber(item, ['cityCount', 'city_count']),
    raw: item,
  };
};

export const normalizeUser = (item: JsonRecord, index: number): UserRecord => {
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
