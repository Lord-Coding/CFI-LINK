import React from "react";
import { IonButton, IonIcon } from "../lib/ionic";
import { sunny, moon } from "../lib/ionic";
import { ThemeMode } from "../contexts/ThemeContext";
import { useTheme } from "../hooks/useTheme";


const NEXT_ICON: Record<ThemeMode, string> = {
  light:   moon,
  dark:    sunny,
};

const NEXT_LABEL: Record<ThemeMode, string> = {
  light:     "Passer en mode sombre",
  dark:      "Passer en mode sombre haute contraste",
};


interface ThemeToggleProps {
  fill?: "clear";
  className?: string;
}


const ThemeToggle: React.FC<ThemeToggleProps> = ({
  fill = "clear",
  className = "",
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <IonButton
      fill={fill}
      className={className}
      onClick={toggleTheme}
      aria-label={NEXT_LABEL[theme]}
      title={NEXT_LABEL[theme]}
    >
      <IonIcon icon={NEXT_ICON[theme]} color={ theme ? "dark" : "light" } slot="icon-only" />
    </IonButton>
  );
};

ThemeToggle.displayName = "ThemeToggle";
export { ThemeToggle };
