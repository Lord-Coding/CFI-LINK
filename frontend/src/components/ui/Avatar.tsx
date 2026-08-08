
import React, { useState } from "react";
import { IonAvatar } from "@ionic/react";
import "../../styles/ui/Avatar.css";

export type AvatarSize  = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarShape = "circle" | "rounded";

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  shape?: AvatarShape;
  color?: string;
  badge?: React.ReactNode;
  badgeColor?: string;
  className?: string;
  onClick?: () => void;
  slot?: string;
  style?: React.CSSProperties;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt        = "",
  fallback   = "?",
  size       = "md",
  shape      = "circle",
  color      = "var(--ion-color-primary)",
  badge,
  badgeColor = "var(--ion-color-success)",
  className  = "",
  onClick,
  slot,
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = !!src && !imgError;

  const rootClasses = [
    "cfi-avatar-root",
    `cfi-avatar--${size}`,
    `cfi-avatar-shape--${shape}`,
    onClick ? "cfi-avatar--clickable" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const avatarContent = (
    <>
      <IonAvatar className="cfi-avatar-inner">
        {showImage ? (
          <img src={src} alt={alt} onError={() => setImgError(true)} />
        ) : (
          <div className="cfi-avatar-fallback" aria-label={alt || fallback}>
            {fallback}
          </div>
        )}
      </IonAvatar>

      {badge && (
        <div className="cfi-avatar-badge" data-badge-color={badgeColor}>
          {badge}
        </div>
      )}
    </>
  );

  return onClick ? (
    <button type="button" className={rootClasses} data-avatar-color={color} slot={slot}>
      {avatarContent}
    </button>
  ) : (
    <div className={rootClasses} data-avatar-color={color} slot={slot}>
      {avatarContent}
    </div>
  );
};

export default Avatar;
