/**
 * Shared API client for Hydronyx frontend.
 * Uses STGNN and physics-informed backend; all data from real APIs.
 */

const getApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
};

export const apiUrl = getApiUrl();

function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchWithAuth(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const url = path.startsWith('http') ? path : `${apiUrl}${path}`;
  const headers = new Headers(getAuthHeaders());
  const existingHeaders = new Headers(options.headers);
  existingHeaders.forEach((value, key) => headers.set(key, value));
  return fetch(url, { ...options, headers });
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json();
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  const res = await fetchWithAuth(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail));
  }
  return res.json();
}
