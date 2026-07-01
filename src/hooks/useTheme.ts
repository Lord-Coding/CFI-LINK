import { useContext } from "react";
import { ThemeContextValue, ThemeContext } from "../contexts/ThemeContext";


export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}