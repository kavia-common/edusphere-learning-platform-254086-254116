/**
 * Lightweight HTTP client built on fetch with:
 * - Base URL (REACT_APP_API_BASE)
 * - RequestId generation
 * - Timeout via AbortController
 * - Retries with exponential backoff for idempotent GETs
 * - Normalized error format
 *
 * PUBLIC_INTERFACE
 * Use httpClient.get/post/put/patch/delete or httpClient.request.
 */

import { getEnv } from '../config/env';
import { getLogger } from '../shared/utils/logger';

const logger = getLogger('httpClient');

const {
  apiBase,
  nodeEnv
} = getEnv();

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 2;
const RETRY_STATUS = new Set([408, 409, 425, 429, 500, 502, 503, 504]);

function uuid() {
  try {
    // Not cryptographically strong; sufficient for request id
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  } catch {
    return String(Date.now());
  }
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildUrl(path) {
  if (!path) return '';
  try {
    if (/^https?:\/\//i.test(path)) return path;
    if (!apiBase) return path; // allow absolute paths
    return new URL(path, apiBase).toString();
  } catch {
    return path;
  }
}

function isIdempotent(method) {
  const m = String(method || 'GET').toUpperCase();
  return m === 'GET' || m === 'HEAD' || m === 'OPTIONS';
}

function shouldRetry(method, status) {
  if (!isIdempotent(method)) return false;
  return RETRY_STATUS.has(status);
}

async function doFetch(input, init, timeoutMs) {
  const controller = new AbortController();
  const id = uuid();

  const opts = {
    ...init,
    headers: {
      ...(init?.headers || {}),
      'X-Request-Id': id,
      'Accept': 'application/json',
    },
    signal: controller.signal,
  };

  const timer = setTimeout(() => controller.abort(), timeoutMs || DEFAULT_TIMEOUT);

  try {
    const res = await fetch(input, opts);
    clearTimeout(timer);
    return { res, requestId: id };
  } catch (err) {
    clearTimeout(timer);
    // Normalize abort vs network errors
    const aborted = err?.name === 'AbortError';
    const message = aborted ? 'Request timed out' : 'Network error';
    const code = aborted ? 'TIMEOUT' : 'NETWORK';
    const norm = { ok: false, error: message, code, status: 0, requestId: id };
    throw norm;
  }
}

async function parseJsonSafe(res) {
  try {
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function handleResponse(method, { res, requestId }) {
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await parseJsonSafe(res) : await res.text();

  if (res.ok) {
    return { ok: true, status: res.status, data, requestId };
  }

  const message = (data && (data.error || data.message)) || `HTTP ${res.status}`;
  const code = res.status === 401 ? 'UNAUTHORIZED'
    : res.status === 403 ? 'FORBIDDEN'
    : res.status === 404 ? 'NOT_FOUND'
    : res.status >= 500 ? 'SERVER_ERROR'
    : 'HTTP_ERROR';

  const norm = { ok: false, error: message, code, status: res.status, data, requestId };

  // Retry policy handled by caller (request loop)
  throw norm;
}

// PUBLIC_INTERFACE
export async function request(path, { method = 'GET', headers = {}, body, timeoutMs = DEFAULT_TIMEOUT, retries = MAX_RETRIES } = {}) {
  /**
   * Perform an HTTP request with normalized errors.
   *
   * @param {string} path - absolute URL or relative path joined with apiBase
   * @param {object} options - method, headers, body (object auto-JSON), timeoutMs, retries
   * @returns {Promise<{ ok: boolean, status: number, data: any, requestId: string }>}
   */
  const url = buildUrl(path);
  const m = (method || 'GET').toUpperCase();

  let payload = body;
  const hdrs = { ...headers };
  if (body && typeof body === 'object' && !(body instanceof FormData)) {
    hdrs['Content-Type'] = hdrs['Content-Type'] || 'application/json';
    if (hdrs['Content-Type'].includes('application/json')) {
      try {
        payload = JSON.stringify(body);
      } catch {
        // fallback
      }
    }
  }

  let attempt = 0;
  const maxAttempts = Math.max(0, retries) + 1;

  // Basic exponential backoff: base 300ms
  while (attempt < maxAttempts) {
    try {
      const { res, requestId } = await doFetch(url, { method: m, headers: hdrs, body: payload }, timeoutMs);
      return await handleResponse(m, { res, requestId });
    } catch (err) {
      // If err has normalized shape
      const status = err?.status ?? 0;

      const willRetry = status && shouldRetry(m, status) && attempt < maxAttempts - 1;
      if (willRetry) {
        const backoff = Math.min(300 * Math.pow(2, attempt), 2500);
        if ((nodeEnv || 'development') !== 'test') {
          logger.warn('Retrying request', { url, method: m, attempt: attempt + 1, status });
        }
        await sleep(backoff);
        attempt += 1;
        continue;
      }

      // Non-retriable or exhausted
      throw err;
    }
  }

  // Should not reach here
  throw { ok: false, error: 'Request failed', code: 'UNKNOWN', status: 0, requestId: '' };
}

// PUBLIC_INTERFACE
export const httpClient = {
  /** Perform GET request with retries/backoff */
  get: (path, opts = {}) => request(path, { ...opts, method: 'GET' }),
  /** Perform POST request */
  post: (path, body, opts = {}) => request(path, { ...opts, method: 'POST', body }),
  /** Perform PUT request */
  put: (path, body, opts = {}) => request(path, { ...opts, method: 'PUT', body }),
  /** Perform PATCH request */
  patch: (path, body, opts = {}) => request(path, { ...opts, method: 'PATCH', body }),
  /** Perform DELETE request */
  delete: (path, opts = {}) => request(path, { ...opts, method: 'DELETE' }),
  /** Low-level request */
  request,
};
