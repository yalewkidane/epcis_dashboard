export class ApiError extends Error {
  constructor(message, { status = 0, data = null, url = '' } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.url = url;
  }
}

const describe = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 300);
  return data.detail || data.error || data.message || data.title || JSON.stringify(data).slice(0, 300);
};

/**
 * fetch wrapper: JSON in/out, timeout, typed errors. Returns {status, data, headers}.
 * Non-2xx responses throw ApiError with the parsed body in `data`.
 */
export async function request(url, { method = 'GET', body, headers = {}, timeoutMs = 20000, raw = false } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const init = { method, headers: { Accept: 'application/json', ...headers }, signal: controller.signal };
  if (body !== undefined) {
    const isString = typeof body === 'string';
    init.body = isString ? body : JSON.stringify(body);
    if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json';
  }
  let res;
  try {
    res = await fetch(url, init);
  } catch (err) {
    clearTimeout(timer);
    const reason = err.name === 'AbortError' ? `timed out after ${timeoutMs / 1000}s` : 'network error (is the service running and CORS enabled?)';
    throw new ApiError(`${method} ${url}: ${reason}`, { url });
  }
  clearTimeout(timer);

  const text = await res.text();
  let data = text;
  if (!raw) {
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }
  const h = {};
  res.headers.forEach((v, k) => {
    h[k.toLowerCase()] = v;
  });
  if (!res.ok) throw new ApiError(`${method} ${url} -> ${res.status} ${describe(data)}`.trim(), { status: res.status, data, url });
  return { status: res.status, data, headers: h };
}

export const qs = (params = {}) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  if (!entries.length) return '';
  return '?' + entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
};
