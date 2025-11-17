//
// Environment configuration and validation for EduSphere frontend
// Reads REACT_APP_* variables, validates required ones, parses optional, and exposes helpers.
//
// PUBLIC INTERFACES are documented per project standards.
//

// Internal utils
function toBool(val, fallback = false) {
  if (typeof val === 'boolean') return val;
  if (val == null) return fallback;
  const v = String(val).trim().toLowerCase();
  if (['true', '1', 'yes', 'on', 'enabled'].includes(v)) return true;
  if (['false', '0', 'no', 'off', 'disabled'].includes(v)) return false;
  return fallback;
}

function toNumber(val, fallback = undefined) {
  if (val == null || val === '') return fallback;
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

function parseJSONSafe(val, fallback = undefined) {
  if (!val) return fallback;
  try {
    return JSON.parse(val);
  } catch {
    return fallback;
  }
}

function maskSecret(value) {
  if (!value) return '';
  const str = String(value);
  if (str.length <= 6) return '***';
  return `${str.slice(0, 3)}***${str.slice(-2)}`;
}

function normalizePath(path) {
  if (!path) return '';
  try {
    const s = String(path).trim();
    if (!s.startsWith('/')) return `/${s}`;
    return s;
  } catch {
    return '';
  }
}

const RAW = {
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL,
  SUPABASE_KEY: process.env.REACT_APP_SUPABASE_KEY,

  API_BASE: process.env.REACT_APP_API_BASE,
  BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
  FRONTEND_URL: process.env.REACT_APP_FRONTEND_URL,
  WS_URL: process.env.REACT_APP_WS_URL,

  NODE_ENV_NAME: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV,
  ENABLE_SOURCE_MAPS: process.env.REACT_APP_ENABLE_SOURCE_MAPS,
  LOG_LEVEL: process.env.REACT_APP_LOG_LEVEL,
  HEALTHCHECK_PATH: process.env.REACT_APP_HEALTHCHECK_PATH,

  FEATURE_FLAGS: process.env.REACT_APP_FEATURE_FLAGS,
  EXPERIMENTS_ENABLED: process.env.REACT_APP_EXPERIMENTS_ENABLED,
};

// Compute config
const computed = {
  supabaseUrl: RAW.SUPABASE_URL || '',
  supabaseKey: RAW.SUPABASE_KEY || '',

  apiBase: RAW.API_BASE || RAW.BACKEND_URL || '',
  wsUrl: RAW.WS_URL || '',
  frontendUrl: RAW.FRONTEND_URL || '',

  nodeEnv: (RAW.NODE_ENV_NAME || 'development').toLowerCase(),
  enableSourceMaps: toBool(RAW.ENABLE_SOURCE_MAPS, undefined),
  healthcheckPath: normalizePath(RAW.HEALTHCHECK_PATH || ''),
  logLevel: (RAW.LOG_LEVEL || 'info').toLowerCase(),

  featureFlagsRaw: RAW.FEATURE_FLAGS || '',
  experimentsEnabled: toBool(RAW.EXPERIMENTS_ENABLED, undefined),
};

// Validation state
const missing = [];
if (!computed.supabaseUrl) missing.push('REACT_APP_SUPABASE_URL');
if (!computed.supabaseKey) missing.push('REACT_APP_SUPABASE_KEY');

const warnings = [];
if (!computed.apiBase) warnings.push('REACT_APP_API_BASE (optional) not set; httpClient will use absolute paths.');
if (!computed.healthcheckPath) warnings.push('REACT_APP_HEALTHCHECK_PATH (optional) not set; HealthCheck page will display info message.');
if (!computed.frontendUrl) warnings.push('REACT_APP_FRONTEND_URL (optional) not set; emailRedirectTo will fall back to window.location.origin.');
if (!computed.wsUrl) warnings.push('REACT_APP_WS_URL (optional) not set; websocket-specific features must derive from Supabase Realtime.');

const isSupabaseConfigured = missing.length === 0;

// Non-throwing logger that avoids printing secrets
(function logEnvSummary() {
  try {
    const summary = {
      nodeEnv: computed.nodeEnv,
      apiBase: computed.apiBase || '(none)',
      wsUrl: computed.wsUrl || '(none)',
      frontendUrl: computed.frontendUrl || '(none)',
      healthcheckPath: computed.healthcheckPath || '(none)',
      featureFlagsRaw: computed.featureFlagsRaw ? '[present]' : '(none)',
      experimentsEnabled: typeof computed.experimentsEnabled === 'boolean' ? computed.experimentsEnabled : '(unset)',
      supabaseUrlPresent: !!computed.supabaseUrl,
      supabaseKeyMasked: maskSecret(computed.supabaseKey),
      hasMissingRequired: missing.length > 0,
    };
    // eslint-disable-next-line no-console
    console.info('[Env] configuration summary:', summary);
    if (missing.length) {
      // eslint-disable-next-line no-console
      console.warn('[Env] missing required variables:', missing);
    }
    if (warnings.length) {
      // eslint-disable-next-line no-console
      console.info('[Env] notes:', warnings);
    }
  } catch {
    // ignore
  }
})();

// PUBLIC_INTERFACE
export function getEnv() {
  /**
   * Returns normalized environment configuration.
   * Required: REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_KEY
   * Optional: REACT_APP_API_BASE, REACT_APP_WS_URL, REACT_APP_NODE_ENV, REACT_APP_ENABLE_SOURCE_MAPS,
   *           REACT_APP_HEALTHCHECK_PATH, REACT_APP_LOG_LEVEL, REACT_APP_FEATURE_FLAGS,
   *           REACT_APP_EXPERIMENTS_ENABLED, REACT_APP_FRONTEND_URL
   */
  return {
    supabaseUrl: computed.supabaseUrl,
    supabaseKey: computed.supabaseKey,
    apiBase: computed.apiBase,
    wsUrl: computed.wsUrl,
    frontendUrl: computed.frontendUrl,
    nodeEnv: computed.nodeEnv,
    enableSourceMaps: computed.enableSourceMaps,
    healthcheckPath: computed.healthcheckPath,
    logLevel: computed.logLevel,
    featureFlagsRaw: computed.featureFlagsRaw,
    experimentsEnabled: computed.experimentsEnabled,
    isSupabaseConfigured,
    missingRequired: [...missing],
    warnings: [...warnings],
  };
}

// PUBLIC_INTERFACE
export function isSupabaseEnabled() {
  /** Returns true if required Supabase envs are available (URL and KEY). */
  return isSupabaseConfigured;
}

// PUBLIC_INTERFACE
export function getHealthcheckUrl() {
  /** Returns absolute URL to healthcheck if HEALTHCHECK_PATH is set, otherwise empty string. */
  if (!computed.healthcheckPath) return '';
  try {
    const base = computed.apiBase || window.location.origin;
    return new URL(computed.healthcheckPath, base).toString();
  } catch {
    return computed.healthcheckPath;
  }
}
