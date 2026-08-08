import React from "react";
import { IonBadge, IonIcon } from "@ionic/react";
import "../../styles/ui/Badge.css";

export type BadgeVariant = "default"|"success"|"warning"|"danger"|"info"|"secondary"|"outline";
export type BadgeSize    = "sm"|"md"|"lg";

export interface BadgeProps {
  variant?   : BadgeVariant;
  size?      : BadgeSize;
  dot?       : boolean;
  icon?      : string;
  pill?      : boolean;
  className? : string;
  style?     : React.CSSProperties;
  onClick?   : () => void;
  children   : React.ReactNode;
  slot?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant   = "default",
  size      = "md",
  dot       = false,
  icon,
  pill      = true,
  className = "",
  style,
  slot = "",
  onClick,
  children,
}) => {
  const classes = [
    "cfi-badge",
    `cfi-badge--${variant}`,
    `cfi-badge--${size}`,
    pill    ? "cfi-badge--pill"      : "",
    onClick ? "cfi-badge--clickable" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <IonBadge
      className={classes}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      slot={slot}
    >
      {dot  && <span className="cfi-badge__dot" aria-hidden />}
      {icon && <IonIcon icon={icon} className="cfi-badge__icon" />}
      <span className="cfi-badge__text">{children}</span>
    </IonBadge>
  );
};

export default Badge;
