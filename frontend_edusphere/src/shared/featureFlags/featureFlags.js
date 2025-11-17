import React from "react";

/**
 * Internal: Safely coerce various string representations to boolean.
 */
function toBool(val, fallback = false) {
  if (typeof val === "boolean") return val;
  if (val == null) return fallback;
  const v = String(val).trim().toLowerCase();
  if (["true", "1", "yes", "on", "enabled"].includes(v)) return true;
  if (["false", "0", "no", "off", "disabled"].includes(v)) return false;
  return fallback;
}

/**
 * Internal: Parse key=value or key (implies true) entries separated by comma or semicolon.
 */
function parseFlagsString(input) {
  const str = typeof input === "string" ? input : "";
  const entries = str
    .split(/[;,]/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const out = {};
  for (const entry of entries) {
    const eq = entry.indexOf("=");
    if (eq === -1) {
      // "flag" => true
      out[entry] = true;
      continue;
    }
    const key = entry.slice(0, eq).trim();
    const raw = entry.slice(eq + 1).trim();
    if (!key) continue;
    out[key] = toBool(raw, false);
  }
  return out;
}

/**
 * PUBLIC_INTERFACE
 * Parses feature flags from environment and exposes helpers.
 * Supported REACT_APP_FEATURE_FLAGS examples:
 * - "realtime_collab=true, analytics_charts=on, experiments=yes"
 * - "realtime_collab;experiments" (flags without value default to true)
 * REACT_APP_EXPERIMENTS_ENABLED (boolean-ish) acts as a global gate for 'experiments' flag.
 */
export function getAllFeatureFlags() {
  const rawFlags = process.env.REACT_APP_FEATURE_FLAGS || "";
  const parsed = parseFlagsString(rawFlags);

  // Global experiments gate (environment-level) — if explicitly false, force experiments off
  const experimentsGate = toBool(process.env.REACT_APP_EXPERIMENTS_ENABLED, undefined);
  if (experimentsGate !== undefined) {
    parsed.experiments = experimentsGate && toBool(parsed.experiments, false);
  } else {
    // If not provided, keep parsed value or default false
    parsed.experiments = toBool(parsed.experiments, false);
  }

  // Provide explicit defaults for known flags to ensure predictability.
  const defaults = {
    realtime_collab: false,
    analytics_charts: true,
    experiments: parsed.experiments, // already normalized above
    magic_link_auth: true, // allow magic link by default unless disabled
  };

  return { ...defaults, ...parsed };
}

/**
 * PUBLIC_INTERFACE
 * useFeatureFlag returns boolean state of a specific feature flag with optional defaultValue.
 * It reads once at module-load and can be overridden via optional defaultValue.
 */
export function useFeatureFlag(name, defaultValue = false) {
  const flagsRef = React.useRef(getAllFeatureFlags());
  const val = Object.prototype.hasOwnProperty.call(flagsRef.current, name)
    ? !!flagsRef.current[name]
    : defaultValue;
  // Hook returns a stable boolean; feature flags are static for current build/runtime session.
  return val;
}
