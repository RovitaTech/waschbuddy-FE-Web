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

const readMessage = (value: unknown): string | undefined => {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return undefined;
};

export const getApiErrorMessage = (error: unknown, fallback = 'API request failed'): string => {
  if (error instanceof ApiHttpError) {
    const body = error.responseBody;

    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      const topLevel = readMessage(record.message);
      if (topLevel) return topLevel;

      if (record.error && typeof record.error === 'object') {
        const nested = record.error as Record<string, unknown>;
        const nestedMessage = readMessage(nested.message);
        if (nestedMessage) return nestedMessage;
      }

      if (Array.isArray(record.errors) && record.errors.length > 0) {
        const first = record.errors[0];
        if (typeof first === 'string') return first;
        if (first && typeof first === 'object') {
          const firstRecord = first as Record<string, unknown>;
          const fromFirst = readMessage(firstRecord.message) ?? readMessage(firstRecord.msg);
          if (fromFirst) return fromFirst;
        }
      }
    }

    if (error.message && error.message !== 'API request failed') {
      return error.message;
    }

    return `${fallback} (HTTP ${error.status})`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};
