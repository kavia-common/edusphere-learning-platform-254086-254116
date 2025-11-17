# EduSphere Frontend (React)

Ocean Professional themed React app scaffold with routing, Zustand state, ErrorBoundary, feature flags, and structured logger.

## Key Features
- React Router v6 with basic pages (Home, About, NotFound)
- Ocean Professional theme with glassmorphism accents
- Zustand global UI store (theme, sidebar)
- ErrorBoundary with friendly fallback and redaction-aware logging
- Feature flags via `REACT_APP_FEATURE_FLAGS` (comma-separated `flag=value`)
- No secrets hardcoded; all configuration via environment variables

## Getting Started

1. Copy `.env.example` to `.env` and fill in values
2. Install dependencies
   - npm install
3. Start the app
   - npm start

## Project Structure
- `src/layout/Layout.jsx` — App chrome (header, nav, theme toggle)
- `src/pages/*` — Basic routed pages
- `src/state/uiStore.js` — Zustand UI state
- `src/shared/components/ErrorBoundary.jsx` — Error handling wrapper
- `src/shared/featureFlags/featureFlags.js` — Feature flag helpers
- `src/shared/utils/logger.js` — Structured logger (level via `REACT_APP_LOG_LEVEL`)
- `src/shared/config/environment.js` — Access env config
- `src/theme/ThemeProvider.jsx` — Applies current theme to document

## Environment
See `.env.example` for supported variables. Do not commit real secrets.

## Notes
- This is step 1 scaffold; future steps will integrate Supabase, auth, dashboards, realtime, and analytics.
