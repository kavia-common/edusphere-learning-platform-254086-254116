const LEVELS = ['debug', 'info', 'warn', 'error'];
const DEFAULT_LEVEL = (process.env.REACT_APP_LOG_LEVEL || 'info').toLowerCase();

function levelIndex(level) {
  const idx = LEVELS.indexOf(level);
  return idx === -1 ? LEVELS.indexOf('info') : idx;
}

function safe(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const redactKeys = ['password', 'token', 'authorization', 'secret', 'apikey', 'key'];
  const out = Array.isArray(obj) ? [...obj] : { ...obj };
  for (const k of Object.keys(out)) {
    if (redactKeys.includes(k.toLowerCase())) out[k] = '[REDACTED]';
  }
  return out;
}

/**
 * PUBLIC_INTERFACE
 * Returns a namespaced logger honoring REACT_APP_LOG_LEVEL.
 */
export function getLogger(namespace = 'app') {
  const threshold = levelIndex(DEFAULT_LEVEL);
  const base = (lvl) => (...args) => {
    if (levelIndex(lvl) < threshold) return;
    const ts = new Date().toISOString();
    const payload = args.map(a => (typeof a === 'object' ? safe(a) : a));
    // eslint-disable-next-line no-console
    console[lvl === 'debug' ? 'log' : lvl](`[${ts}] [${lvl.toUpperCase()}] [${namespace}]`, ...payload);
  };

  return {
    debug: base('debug'),
    info: base('info'),
    warn: base('warn'),
    error: base('error'),
  };
}
