export type DataSource = 'dummy' | 'api';

const DATA_SOURCE_KEY = 'waschbuddy_data_source';

export function getStoredDataSource(): DataSource {
  if (typeof window === 'undefined') {
    return 'dummy';
  }

  const value = window.localStorage.getItem(DATA_SOURCE_KEY);
  if (value === 'api' || value === 'dummy') {
    return value;
  }

  return 'dummy';
}

export function setStoredDataSource(source: DataSource): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DATA_SOURCE_KEY, source);
}
