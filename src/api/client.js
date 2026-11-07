// Client HTTP dùng chung cho toàn app. Khi NestJS sẵn sàng chỉ cần đặt VITE_USE_MOCK=false.
export const API_URL = import.meta.env.VITE_API_URL || '/api';
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true';

const TOKEN_KEY = 'tromanager_token';
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

function buildQuery(params) {
  if (!params) return '';
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '' && v !== 'all') qs.append(k, v);
  });
  const s = qs.toString();
  return s ? `?${s}` : '';
}

/**
 * request(method, path, { params, body })
 * - Tự gắn Authorization: Bearer <JWT>
 * - 401 => xóa token và phát sự kiện 'auth:logout' để AuthContext đưa về /login
 * - Lỗi NestJS có dạng { statusCode, message, error } => hiển thị message
 */
async function request(method, path, { params, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}${buildQuery(params)}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    if (res.status === 401) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:logout'));
    }
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new ApiError(msg || `Lỗi ${res.status}`, res.status, data);
  }
  return data;
}

export const http = {
  get: (path, params) => request('GET', path, { params }),
  post: (path, body) => request('POST', path, { body }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path),
};
