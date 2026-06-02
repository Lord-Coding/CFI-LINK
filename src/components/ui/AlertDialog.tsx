
import React from "react";
import {
  IonModal,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  alertCircleOutline,
  checkmarkCircleOutline,
  informationCircleOutline,
  closeOutline,
} from "ionicons/icons";
import "../../styles/ui/AlertDialog.css";

export type AlertDialogVariant = "confirm"|"danger"|"info";

export interface AlertDialogProps {
  isOpen:       boolean;
  onDismiss:    () => void;
  title:        string;
  description?: string;
  variant?:     AlertDialogVariant;
  confirmText?: string;
  cancelText?:  string;
  onConfirm?:   () => void;
  onCancel?:    () => void;
  loading?:     boolean;
  icon?:        string;
  hideCancel?:  boolean;
  className?:   string;
}

const VARIANT_ICONS: Record<AlertDialogVariant, string> = {
  confirm: checkmarkCircleOutline,
  danger:  alertCircleOutline,
  info:    informationCircleOutline,
};

const AlertDialog: React.FC<AlertDialogProps> = ({
  isOpen,
  onDismiss,
  title,
  description,
  variant     = "confirm",
  confirmText = "Confirmer",
  cancelText  = "Annuler",
  onConfirm,
  onCancel,
  loading     = false,
  icon,
  hideCancel  = false,
  className   = "",
}) => {
  const resolvedIcon = icon ?? VARIANT_ICONS[variant];

  const handleCancel = () => {
    onCancel?.();
    onDismiss();
  };

  const handleConfirm = () => {
    if (!loading) {
      onConfirm?.();
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      className={["cfi-alert-dialog-modal", className].filter(Boolean).join(" ")}
      backdropDismiss={!loading}
    >
      <div className={["cfi-alert-dialog", `cfi-alert-dialog--${variant}`].join(" ")}>

        {!loading && (
          <button className="cfi-alert-dialog__x" onClick={handleCancel} aria-label="Fermer" type="button">
            <IonIcon icon={closeOutline} />
          </button>
        )}

        <div className="cfi-alert-dialog__icon-wrap">
          <IonIcon icon={resolvedIcon} className="cfi-alert-dialog__icon" />
        </div>

        <h2 className="cfi-alert-dialog__title">{title}</h2>
        {description && (
          <p className="cfi-alert-dialog__desc">{description}</p>
        )}

        <div className="cfi-alert-dialog__actions">
          {!hideCancel && (
            <button
              className="cfi-alert-dialog__btn cfi-alert-dialog__btn--cancel"
              onClick={handleCancel}
              disabled={loading}
              type="button"
            >
              {cancelText}
            </button>
          )}
          <button
            className={["cfi-alert-dialog__btn", `cfi-alert-dialog__btn--confirm`, `cfi-alert-dialog__btn--confirm-${variant}`].join(" ")}
            onClick={handleConfirm}
            disabled={loading}
            type="button"
          >
            {loading
              ? <IonSpinner name="crescent" className="cfi-alert-dialog__spinner" />
              : confirmText}
          </button>
        </div>
      </div>
    </IonModal>
  );
};

export default AlertDialog;
