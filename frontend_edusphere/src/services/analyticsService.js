import { supabase } from '../lib/supabaseClient';
import env from '../shared/config/environment';
import { getLogger } from '../shared/utils/logger';
import { getAllFeatureFlags } from '../shared/featureFlags/featureFlags';

const logger = getLogger('analyticsService');

const { nodeEnv } = env.getConfig();
const FLAGS = getAllFeatureFlags();

// Sampling strategy by environment: lower in development/test to reduce noise.
const SAMPLING_RATES = {
  production: 1.0,
  staging: 0.5,
  development: 0.25,
  test: 0.0
};

// PUBLIC_INTERFACE
export function isAnalyticsEnabled() {
  /** Returns true if analytics feature flag is enabled. */
  return FLAGS.analytics !== false; // default on unless explicitly disabled
}

function getSamplingRate() {
  const envName = (nodeEnv || process.env.NODE_ENV || 'development').toLowerCase();
  return SAMPLING_RATES[envName] ?? 0.25;
}

function samplePass() {
  const rate = getSamplingRate();
  return Math.random() < rate;
}

function safeString(s, maxLen = 256) {
  if (!s) return '';
  try {
    const str = String(s);
    return str.slice(0, maxLen);
  } catch {
    return '';
  }
}

function redact(obj) {
  // Redact typical PII keys and limit payload size/shape
  if (!obj || typeof obj !== 'object') return {};
  const forbiddenKeys = new Set([
    'email', 'name', 'full_name', 'first_name', 'last_name', 'phone', 'address',
    'token', 'authorization', 'password', 'ssn', 'credit_card'
  ]);
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = String(k || '').toLowerCase();
    if (forbiddenKeys.has(key)) {
      out[k] = '[REDACTED]';
      continue;
    }
    if (v == null) {
      out[k] = v;
    } else if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      out[k] = typeof v === 'string' ? safeString(v, 256) : v;
    } else if (Array.isArray(v)) {
      out[k] = v.slice(0, 10).map((item) => (typeof item === 'string' ? safeString(item, 128) : null));
    } else if (typeof v === 'object') {
      // shallow 1-level to avoid large payloads
      const inner = {};
      let count = 0;
      for (const [ik, iv] of Object.entries(v)) {
        if (count++ > 10) break;
        const ikl = String(ik || '').toLowerCase();
        if (forbiddenKeys.has(ikl)) {
          inner[ik] = '[REDACTED]';
        } else if (typeof iv === 'string') {
          inner[ik] = safeString(iv, 128);
        } else if (typeof iv === 'number' || typeof iv === 'boolean') {
          inner[ik] = iv;
        } else {
          inner[ik] = null;
        }
      }
      out[k] = inner;
    } else {
      out[k] = null;
    }
  }
  return out;
}

function anonId() {
  // Non-PII per-session anonymous id stored in memory; no localStorage persistence to minimize tracking
  if (!window.__edusphereAnonId) {
    window.__edusphereAnonId = Math.random().toString(36).slice(2);
  }
  return window.__edusphereAnonId;
}

/**
 * Insert analytics event to Supabase table "analytics_events".
 * Table expected schema (public):
 * - id: uuid (default gen_random_uuid())
 * - ts: timestamptz (default now())
 * - event_name: text
 * - path: text
 * - user_id: uuid nullable (store only hashed or omit; we omit PII and send null)
 * - anon_id: text
 * - context: jsonb
 * - metadata: jsonb
 * Ensure RLS allows insert from public anon key restricted to specific columns.
 */
// PUBLIC_INTERFACE
export async function recordEvent(eventName, { path, context = {}, metadata = {} } = {}) {
  /** Records a sanitized analytics event with sampling and feature flag checking. */
  try {
    if (!isAnalyticsEnabled()) return { skipped: true, reason: 'flag_disabled' };
    if (!samplePass()) return { skipped: true, reason: 'sampled_out' };

    const payload = {
      event_name: safeString(eventName, 64),
      path: safeString(path || window.location?.pathname || '/', 300),
      anon_id: safeString(anonId(), 64),
      // user_id intentionally omitted to avoid PII; downstream could join server-side if needed
      context: redact({
        ua: safeString(navigator?.userAgent || '', 200),
        lang: safeString(navigator?.language || '', 16),
        viewport: {
          w: Number(window?.innerWidth) || null,
          h: Number(window?.innerHeight) || null
        },
        referrer: safeString(document?.referrer || '', 256),
        env: safeString(nodeEnv || process.env.NODE_ENV || '', 32)
      }),
      metadata: redact(metadata)
    };

    const { error } = await supabase.from('analytics_events').insert(payload);
    if (error) {
      logger.warn('recordEvent insert failed', { error: String(error) });
      return { success: false, error: String(error) };
    }
    logger.debug('recordEvent inserted', { eventName: payload.event_name });
    return { success: true };
  } catch (err) {
    logger.warn('recordEvent exception', { error: String(err) });
    return { success: false, error: String(err) };
  }
}

// PUBLIC_INTERFACE
export function recordPageView(pathname) {
  /** Convenience to record a page_view event with normalized path. */
  return recordEvent('page_view', { path: pathname || window.location?.pathname, metadata: {} });
}

// PUBLIC_INTERFACE
export function recordKPI(name, value, metadata = {}) {
  /** Records a numeric KPI observation; value coerced to number. */
  const v = Number(value);
  if (!Number.isFinite(v)) return Promise.resolve({ skipped: true, reason: 'invalid_value' });
  return recordEvent('kpi_observation', { path: window.location?.pathname, metadata: { name: safeString(name, 64), value: v, ...metadata } });
}
