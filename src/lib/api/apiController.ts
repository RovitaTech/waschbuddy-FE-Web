import { getApiBaseUrl } from '@/lib/config/environment';
import { apiFetch } from './index';

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

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
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

  const response = await apiFetch(url, {
    ...options,
    headers,
  });

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
    const message =
      (isJson && (responseBody as { message?: string } | null)?.message) ||
      response.statusText ||
      'API request failed';

    console.groupCollapsed(`[api:error] ${method} ${endpoint} (${response.status})`);
    console.warn('message:', message);
    console.debug('url:', url);
    console.debug('requestHeaders:', requestHeaders);
    console.debug('requestBody:', requestBody);
    console.debug('responseHeaders:', responseHeaders);
    console.debug('responseBody:', responseBody);
    console.groupEnd();

    throw new ApiHttpError(message, response.status, responseBody);
  }

  return responseBody as T;
}
