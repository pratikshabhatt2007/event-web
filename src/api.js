const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export function getToken() {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
}
export function setToken(token) {
  try {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
  } catch {
    /* storage unavailable */
  }
}

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function headers(json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qs.set(k, v);
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: headers(Boolean(body)),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the backend running?', 0);
  }

  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(data?.error?.message || `Request failed (${res.status})`, res.status, data?.error?.details);
  }
  return data;
}

/** Fetch the QR ticket PNG (needs the auth header, so we can't use a plain <img src>). */
export async function fetchQr(registrationId) {
  const res = await fetch(`${BASE}/me/registrations/${registrationId}/qr`, { headers: headers(false) });
  if (!res.ok) throw new ApiError('Could not load ticket', res.status);
  return URL.createObjectURL(await res.blob());
}
