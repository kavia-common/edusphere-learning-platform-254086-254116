import { create } from 'zustand';

const THEME_KEY = 'edusphere_theme';

/**
 * PUBLIC_INTERFACE
 * useUIStore provides global UI state (theme, layout) via Zustand.
 */
export const useUIStore = create((set, get) => ({
  theme: 'light',
  sidebarOpen: false,

  setTheme: (theme) => {
    set({ theme });
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      // ignore storage issues in restricted environments
    }
  },
  toggleSidebar: () => set({ sidebarOpen: !get().sidebarOpen }),

  initializeTheme: () => {
    let theme = 'light';
    try {
      const stored = localStorage.getItem(THEME_KEY);
      if (stored) theme = stored;
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme = 'dark';
      }
    } catch {
      // fallback to default
    }
    set({ theme });
  }
}));
