import React, { useState, useEffect, useCallback } from "react";
import { ThemeMode, readStoredTheme, getSystemPreference, applyTheme, STORAGE_KEY, CYCLE, ThemeContext } from "../contexts/ThemeContext";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const initial = readStoredTheme() ?? getSystemPreference();
    applyTheme(initial); // applique immédiatement, avant le premier paint
    return initial;
  });

  const [manuallySet, setManuallySet] = useState<boolean>(
    () => readStoredTheme() !== null,
  );

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (manuallySet) return;

    const mqlDark = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      if (!manuallySet) {
        setThemeState(getSystemPreference());
      }
    };

    mqlDark.addEventListener("change", update);
    return () => {
      mqlDark.removeEventListener("change", update);
    };
  }, [manuallySet]);

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    setManuallySet(true);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(CYCLE[(CYCLE.indexOf(theme) + 1) % CYCLE.length]);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        setTheme,
        isDark: theme === "dark",
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

