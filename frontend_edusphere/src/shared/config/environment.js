/**
 * Deprecated shim: prefer using src/config/env.js (getEnv) for validated configuration.
 * This module remains for backward compatibility with existing imports.
 */
const env = {
  // PUBLIC_INTERFACE
  /** Returns raw environment configuration values without validation (deprecated). */
  getConfig() {
    return {
      apiBase: process.env.REACT_APP_API_BASE,
      backendUrl: process.env.REACT_APP_BACKEND_URL,
      frontendUrl: process.env.REACT_APP_FRONTEND_URL,
      wsUrl: process.env.REACT_APP_WS_URL,
      nodeEnv: process.env.REACT_APP_NODE_ENV || process.env.NODE_ENV,
      telemetryDisabled: process.env.REACT_APP_NEXT_TELEMETRY_DISABLED,
      enableSourceMaps: process.env.REACT_APP_ENABLE_SOURCE_MAPS,
      port: process.env.REACT_APP_PORT,
      trustProxy: process.env.REACT_APP_TRUST_PROXY,
      logLevel: process.env.REACT_APP_LOG_LEVEL,
      healthcheckPath: process.env.REACT_APP_HEALTHCHECK_PATH,
      featureFlags: process.env.REACT_APP_FEATURE_FLAGS,
      experimentsEnabled: process.env.REACT_APP_EXPERIMENTS_ENABLED,
      supabaseUrl: process.env.REACT_APP_SUPABASE_URL,
      supabaseKey: process.env.REACT_APP_SUPABASE_KEY,
    };
  }
};

export default env;
