import React, { useState } from "react";
import { IonIcon } from "@ionic/react";
import {
  informationCircleOutline,
  checkmarkCircleOutline,
  warningOutline,
  alertCircleOutline,
  closeOutline,
} from "ionicons/icons";
import "../../styles/ui/Alert.css";

export type AlertVariant = "info"|"success"|"warning"|"danger";

export interface AlertProps {
  variant?     : AlertVariant;
  title?       : string;
  description? : string;
  icon?        : string;
  dismissible? : boolean;
  onDismiss?   : () => void;
  solid?       : boolean;
  className?   : string;
  style?       : React.CSSProperties;
  children?    : React.ReactNode;
}

const DEFAULT_ICONS: Record<AlertVariant, string> = {
  info:    informationCircleOutline,
  success: checkmarkCircleOutline,
  warning: warningOutline,
  danger:  alertCircleOutline,
};

const Alert: React.FC<AlertProps> = ({
  variant     = "info",
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
  solid       = false,
  className   = "",
  style,
  children,
}) => {
  const [visible, setVisible] = useState(true);
  if (!visible) return null;

  const resolvedIcon = icon ?? DEFAULT_ICONS[variant];

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  const classes = [
    "cfi-alert",
    `cfi-alert--${variant}`,
    solid ? "cfi-alert--solid" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <div role="alert" className={classes} style={style}>
      <IonIcon icon={resolvedIcon} className="cfi-alert__icon" aria-hidden />

      <div className="cfi-alert__body">
        {title       && <p className="cfi-alert__title">{title}</p>}
        {description && <p className="cfi-alert__desc">{description}</p>}
        {children    && <div className="cfi-alert__desc">{children}</div>}
      </div>

      {dismissible && (
        <button
          className="cfi-alert__close"
          onClick={handleDismiss}
          aria-label="Fermer"
          type="button"
        >
          <IonIcon icon={closeOutline} />
        </button>
      )}
    </div>
  );
};

export default Alert;
