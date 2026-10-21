// src/lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api/v1";

type ApiOptions = RequestInit & {
  token?: string | null;
};

export type ApiFieldError = { field: string; message: string };

export class ApiError extends Error {
  statusCode: number;
  details?: ApiFieldError[];
  constructor(message: string, statusCode: number, details?: ApiFieldError[]) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: ApiOptions = {},
): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      credentials: "include",
    });
  } catch {
    // fetch() throws a raw TypeError for CORS-blocked/network failures —
    // no status code, no body. Normalize it so callers get a real message
    // instead of silently getting undefined data.
    throw new ApiError(
      "Couldn't reach the server. Check your connection or API configuration.",
      0,
    );
  }

  const text = await response.text();
  let payload: { message?: string; error?: unknown } | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as { message?: string; error?: unknown };
    } catch {
      throw new ApiError(
        "The server returned an invalid response. Please try again.",
        response.status,
      );
    }
  }

  if (!response.ok) {
    const details = Array.isArray(payload?.error) ? payload.error : undefined;
    throw new ApiError(
      payload?.message ?? "Request failed",
      response.status,
      details,
    );
  }

  return payload as T;
}

export function unwrapList<T>(payload: unknown, fallback: T[]): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const data = (payload as { data?: unknown }).data;
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object") {
      const nested = data as Record<string, unknown>;
      const list =
        nested.items ??
        nested.docs ??
        nested.results ??
        nested.customers ??
        nested.bookings;
      if (Array.isArray(list)) return list as T[];
    }
  }
  return fallback;
}
