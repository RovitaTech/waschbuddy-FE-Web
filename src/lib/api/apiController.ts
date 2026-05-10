import { getApiBaseUrl } from '@/lib/config/environment';
import { getAuthToken } from './authToken';

export const API_BASE_URL = getApiBaseUrl();

export class ApiHttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public responseBody?: unknown,
  ) {
    super(message);
    this.name = 'ApiHttpError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseBody = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

  if (!response.ok) {
    const message =
      (isJson && (responseBody as { message?: string } | null)?.message) ||
      response.statusText ||
      'API request failed';

    throw new ApiHttpError(message, response.status, responseBody);
  }

  return responseBody as T;
}
