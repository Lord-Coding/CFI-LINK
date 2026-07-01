import { createContext } from "react";

export type ThemeMode = "light" | "dark";

export interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

export const STORAGE_KEY = "orderdeal-theme";
export const CYCLE: ThemeMode[] = ["light", "dark"];

export function getSystemPreference(): ThemeMode {
  if (typeof window === "undefined") return "light";
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (prefersDark) return "dark";
  return "light";
}

export function readStoredTheme(): ThemeMode | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && CYCLE.includes(stored as ThemeMode)) return stored as ThemeMode;
  } catch {
    // localStorage unavailable
  }
  return null;
}

export function applyTheme(mode: ThemeMode) {
  const body = document.body;
  body.classList.remove("ion-palette-dark", "ion-palette-high-contrast-dark");

  if (mode === "dark") {
    body.classList.add("ion-palette-dark");
    body.classList.add("ion-palette-dark", "ion-palette-high-contrast-dark");
  }
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
