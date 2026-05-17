import { getApiBaseUrl } from '@/lib/config/environment';
import type { ApiRequestOptions } from './types';
import { apiFetch } from './index';
import { ENDPOINTS } from './endpoints';
import { clearAuthToken, getAuthToken, getRefreshToken, setAuthToken, setRefreshToken } from './authToken';
import { ApiHttpError, getApiErrorMessage } from './errors';

export { ApiHttpError } from './errors';
export const API_BASE_URL = getApiBaseUrl();

const toLoggableHeaders = (headers: Headers): Record<string, string> => {
  const result: Record<string, string> = {};

  headers.forEach((value, key) => {
    if (key.toLowerCase() === 'authorization') {
      result[key] = value ? '[redacted]' : value;
      return;
    }

    result[key] = value;
  });

  return result;
};

const toLoggableBody = (body: RequestInit['body']): unknown => {
  if (!body) return undefined;

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  if (body instanceof URLSearchParams) {
    return body.toString();
  }

  return '[non-string body]';
};

const now = (): number => {
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    return performance.now();
  }

  return Date.now();
};

let refreshPromise: Promise<boolean> | null = null;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.REFRESH_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        return false;
      }

      const nextAccessToken = payload?.access_token ?? payload?.accessToken ?? payload?.token ?? payload?.data?.access_token ?? payload?.data?.accessToken ?? payload?.data?.token;
      const nextRefreshToken = payload?.refresh_token ?? payload?.refreshToken ?? payload?.data?.refresh_token ?? payload?.data?.refreshToken;

      if (typeof nextAccessToken === 'string' && nextAccessToken) {
        setAuthToken(nextAccessToken);
      }

      if (typeof nextRefreshToken === 'string' && nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }

      return typeof nextAccessToken === 'string' && nextAccessToken.length > 0;
    } catch {
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const method = options.method ?? 'GET';

  const headers = new Headers(options.headers ?? {});
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  const requestBody = toLoggableBody(options.body);
  const requestHeaders = toLoggableHeaders(headers);
  const startedAt = now();

  console.groupCollapsed(`[api:request] ${method} ${endpoint}`);
  console.log('url:', url);
  console.log('method:', method);
  console.log('headers:', requestHeaders);
  if (requestBody !== undefined) {
    console.log('body:', requestBody);
  }
  console.groupEnd();

  let response = await apiFetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401 && !options.skipAuth) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      const retryHeaders = new Headers(options.headers ?? {});
      if (!retryHeaders.has('Content-Type') && options.body) {
        retryHeaders.set('Content-Type', 'application/json');
      }

      const renewedToken = getAuthToken();
      if (renewedToken) {
        retryHeaders.set('Authorization', `Bearer ${renewedToken}`);
      }

      response = await apiFetch(url, {
        ...options,
        headers: retryHeaders,
      });
    }
  }

  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const responseBody = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');
  const responseHeaders = toLoggableHeaders(response.headers);
  const durationMs = Math.round((now() - startedAt) * 100) / 100;

  console.groupCollapsed(`[api:response] ${method} ${endpoint} (${response.status})`);
  console.log('ok:', response.ok);
  console.log('durationMs:', durationMs);
  console.log('headers:', responseHeaders);
  console.log('body:', responseBody);
  console.groupEnd();

  if (!response.ok) {
    const message = getApiErrorMessage(
      new ApiHttpError('API request failed', response.status, responseBody),
      response.statusText || 'API request failed',
    );

    console.groupCollapsed(`[api:error] ${method} ${endpoint} (${response.status})`);
    console.warn('message:', message);
    console.debug('url:', url);
    console.debug('requestHeaders:', requestHeaders);
    console.debug('requestBody:', requestBody);
    console.debug('responseHeaders:', responseHeaders);
    console.debug('responseBody:', responseBody);
    console.groupEnd();

    if (response.status === 401 && typeof window !== 'undefined') {
      clearAuthToken();
      if (window.location.pathname !== '/') {
        window.location.assign('/');
      }
    }

    throw new ApiHttpError(message, response.status, responseBody);
  }

  return responseBody as T;
}
