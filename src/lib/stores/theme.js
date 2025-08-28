import { writable, derived } from 'svelte/store';

const isBrowser = typeof window !== 'undefined';

export const Theme = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

function getSystemPreference() {
  if (!isBrowser) return Theme.LIGHT;

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? Theme.DARK
    : Theme.LIGHT;
}

function getInitialTheme() {
  if (!isBrowser) return Theme.SYSTEM;

  const stored = localStorage.getItem('theme-preference');
  if (stored && Object.values(Theme).includes(stored)) {
    return stored;
  }

  return Theme.SYSTEM;
}

function createSystemPreferenceStore() {
  const { subscribe, set } = writable(getSystemPreference());

  if (isBrowser) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => set(e.matches ? Theme.DARK : Theme.LIGHT);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    }
  }

  return { subscribe };
}

function createThemeStore() {
  const { subscribe, set, update } = writable(getInitialTheme());

  return {
    subscribe,

    setTheme: (theme) => {
      if (!Object.values(Theme).includes(theme)) return;

      set(theme);
      if (isBrowser) {
        localStorage.setItem('theme-preference', theme);
      }
    },

    toggle: () => {
      update(currentTheme => {
        const systemTheme = getSystemPreference();
        const resolvedTheme = currentTheme === Theme.SYSTEM ? systemTheme : currentTheme;
        const newTheme = resolvedTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;

        if (isBrowser) {
          localStorage.setItem('theme-preference', newTheme);
        }

        return newTheme;
      });
    }
  };
}

export const themePreference = createThemeStore();
export const systemPreference = createSystemPreferenceStore();

export const resolvedTheme = derived(
  [themePreference, systemPreference],
  ([preference, system]) => {
    return preference === Theme.SYSTEM ? system : preference;
  }
);