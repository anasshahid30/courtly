// ============================================================
// COURTLY — HTTP API Client
// ============================================================

let inMemoryToken: string | null = null;

export function setAuthToken(token: string | null): void {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const effectiveToken = token !== undefined ? token : inMemoryToken;
  if (effectiveToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${effectiveToken}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let detailMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (typeof errorData?.detail === 'string') {
        detailMessage = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        detailMessage = errorData.detail
          .map((d: { msg?: string; loc?: string[] }) => d.msg || JSON.stringify(d))
          .join('; ');
      } else if (errorData?.message) {
        detailMessage = errorData.message;
      } else if (errorData) {
        detailMessage = JSON.stringify(errorData);
      }
    } catch {
      try {
        const text = await response.text();
        if (text) detailMessage = text;
      } catch {
        // fallback to statusText
      }
    }

    throw new Error(`HTTP ${response.status}: ${detailMessage}`);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return (await response.json()) as T;
}
