
import React from "react";
import { IonSkeletonText } from "@ionic/react";
import "../../styles/ui/Skeleton.css";

export interface SkeletonProps {
  width?     : string;
  height?    : string;
  radius?    : string;
  animated?  : boolean;
  className? : string;
  style?     : React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width     = "100%",
  height    = "16px",
  radius    = "8px",
  animated  = true,
  className = "",
  style,
}) => (
  <div
    className={["cfi-skeleton", animated ? "cfi-skeleton--animated" : "", className].filter(Boolean).join(" ")}
    style={{ width, height, borderRadius: radius, ...style }}
    aria-hidden="true"
  />
);

export interface SkeletonTextProps {
  lines?     : number;
  animated?  : boolean;
  className? : string;
  style?     : React.CSSProperties;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines     = 1,
  animated  = true,
  className = "",
  style,
}) => (
  <div className={["cfi-skeleton-text-group", className].filter(Boolean).join(" ")} style={style}>
    {Array.from({ length: lines }).map((_, i) => (
      <IonSkeletonText
        key={i}
        animated={animated}
        style={{
          width: i === lines - 1 && lines > 1 ? "70%" : "100%",
          height: "14px",
          borderRadius: "6px",
          marginBottom: i < lines - 1 ? "6px" : "0",
        }}
      />
    ))}
  </div>
);

export type SkeletonAvatarSize  = "sm"|"md"|"lg";
export type SkeletonAvatarShape = "circle"|"rounded";

export interface SkeletonAvatarProps {
  size?      : SkeletonAvatarSize;
  shape?     : SkeletonAvatarShape;
  animated?  : boolean;
  className? : string;
}

const AVATAR_SIZES: Record<SkeletonAvatarSize, string> = {
  sm: "32px",
  md: "40px",
  lg: "52px",
};

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size      = "md",
  shape     = "circle",
  animated  = true,
  className = "",
}) => {
  const dim = AVATAR_SIZES[size];
  return (
    <Skeleton
      width={dim}
      height={dim}
      radius={shape === "circle" ? "50%" : "10px"}
      animated={animated}
      className={className}
    />
  );
};

export interface SkeletonCardProps {
  animated?  : boolean;
  className? : string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  animated  = true,
  className = "",
}) => (
  <div className={["cfi-skeleton-card", className].filter(Boolean).join(" ")}>
    <Skeleton height="160px" radius="12px 12px 0 0" animated={animated} />
    <div className="cfi-skeleton-card-body">
      <Skeleton height="18px" width="60%" radius="6px" animated={animated} />
      <SkeletonText lines={2} animated={animated} style={{ marginTop: "0.5rem" }} />
      <div className="cfi-skeleton-card-footer">
        <Skeleton height="34px" width="90px" radius="10px" animated={animated} />
        <Skeleton height="34px" width="34px" radius="10px" animated={animated} />
      </div>
    </div>
  </div>
);

export interface SkeletonListItemProps {
  animated?  : boolean;
  avatar?    : boolean;
  className? : string;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  animated  = true,
  avatar    = true,
  className = "",
}) => (
  <div className={["cfi-skeleton-list-item", className].filter(Boolean).join(" ")}>
    {avatar && <SkeletonAvatar size="md" animated={animated} />}
    <div className="cfi-skeleton-list-item-body">
      <Skeleton height="14px" width="55%" radius="5px" animated={animated} />
      <Skeleton height="12px" width="80%" radius="5px" animated={animated} style={{ marginTop: "6px" }} />
    </div>
  </div>
);
