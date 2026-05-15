// API index file - central export for all API functions
// This makes it easy to import all API functions from one place

import type { ApiRequestOptions } from './types';

export async function apiFetch(input: RequestInfo | URL, init: ApiRequestOptions = {}): Promise<Response> {
	const { skipAuth, ...fetchInit } = init;
	const headers = new Headers(fetchInit.headers ?? {});

	if (!skipAuth && typeof window !== 'undefined') {
		const authToken = window.localStorage.getItem('authToken');
		if (authToken && !headers.has('Authorization')) {
			headers.set('Authorization', `Bearer ${authToken}`);
			console.info('[api] attached auth token to request');
		}
	}

	const response = await fetch(input, {
		...fetchInit,
		headers,
	});

	if (response.status === 401 && typeof window !== 'undefined') {
		console.warn('[api] received 401, clearing localStorage and redirecting to /');
		window.localStorage.clear();
		if (window.location.pathname !== '/') {
			window.location.assign('/');
		}
	}

	return response;
}

export * from './auth';
export * from './users';
export * from './machines';
export * from './reservations';
export * from './types';
export * from './endpoints';
export * from './services';
export * from './apiController';