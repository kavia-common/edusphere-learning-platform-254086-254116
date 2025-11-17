const FLAGS_ENV = process.env.REACT_APP_FEATURE_FLAGS || "";

/**
 * PUBLIC_INTERFACE
 * Parses feature flags from environment and exposes helpers.
 * Expected REACT_APP_FEATURE_FLAGS format: "flagA=true,flagB=false,experiments=true"
 */
export function getAllFeatureFlags() {
  const entries = FLAGS_ENV.split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const flags = {};
  for (const entry of entries) {
    const [k, v] = entry.split("=");
    if (!k) continue;
    const val = (v || "false").toLowerCase();
    flags[k] =
      val === "true" || val === "1" || val === "yes" || val === "on";
  }
  return flags;
}

/**
 * PUBLIC_INTERFACE
 * useFeatureFlag returns boolean state of a specific feature flag.
 */
export function useFeatureFlag(name, defaultValue = false) {
  const flags = getAllFeatureFlags();
  return Object.prototype.hasOwnProperty.call(flags, name)
    ? !!flags[name]
    : defaultValue;
}
