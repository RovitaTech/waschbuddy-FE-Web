export type SuperAdminTab = 'overview' | 'clients' | 'users' | 'countries' | 'cities' | 'dorms';

/** Users tab role filter — sent to POST /super-admin/clients/users. */
export type UserRoleFilter = 'all' | 'admin' | 'resident';

export type JsonRecord = Record<string, unknown>;

export interface ClientRecord {
  /** Admin user record id (UUID). */
  id: string;
  /** Client entity id from API, e.g. CLIENT_36B10A6C. */
  clientId: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  dorm: string;
  status: string;
  dormCount: number;
  cityCount: number;
  raw: JsonRecord;
}

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  city: string;
  dorm: string;
  status: string;
  raw: JsonRecord;
}

export interface CountryFormState {
  name: string;
  code: string;
  dialCode: string;
}

export interface CityFormState {
  name: string;
  countryId: string;
  clientId: string;
  timezone: string;
}

export interface DormFormState {
  name: string;
  address: string;
  cityId: string;
  clientId: string;
}

export interface ClientFormState {
  firstName: string;
  lastName: string;
  email: string;
}

export const EMPTY_COUNTRY_FORM: CountryFormState = {
  name: '',
  code: '',
  dialCode: '',
};

export const EMPTY_CITY_FORM: CityFormState = {
  name: '',
  countryId: '',
  clientId: '',
  timezone: '',
};

export const EMPTY_DORM_FORM: DormFormState = {
  name: '',
  address: '',
  cityId: '',
  clientId: '',
};

export const EMPTY_CLIENT_FORM: ClientFormState = {
  firstName: '',
  lastName: '',
  email: '',
};
