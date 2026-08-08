
import React from "react";
import { IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent } from "@ionic/react";
import "../../styles/ui/Card.css";

export type CardVariant = "default"|"flat"|"outlined";
export type CardRadius  = "sm"|"md"|"lg"|"xl";
export type CardPadding = "sm"|"md"|"lg";

export interface CardProps {
  variant?   : CardVariant;
  hoverable? : boolean;
  clickable? : boolean;
  radius?    : CardRadius;
  className? : string;
  style?     : React.CSSProperties;
  onClick?   : () => void;
  children?  : React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant   = "default",
  hoverable = false,
  clickable = false,
  radius    = "lg",
  className = "",
  style,
  onClick,
  children,
}) => {
  const classes = [
    "cfi-card",
    `cfi-card--${variant}`,
    `cfi-card--r${radius}`,
    hoverable ? "cfi-card--hover"     : "",
    clickable ? "cfi-card--clickable" : "",
    className,
  ].filter(Boolean).join(" ");

  return (
    <IonCard
      className={classes}
      style={style}
      onClick={clickable ? onClick : undefined}
      button={clickable}
    >
      {children}
    </IonCard>
  );
};

export interface CardHeaderProps {
  className?: string;
  style?:     React.CSSProperties;
  children?:  React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ className = "", style, children }) => (
  <IonCardHeader className={["cfi-card-header", className].filter(Boolean).join(" ")} style={style}>
    {children}
  </IonCardHeader>
);

export interface CardTitleProps {
  className?: string;
  style?:     React.CSSProperties;
  children?:  React.ReactNode;
}

export const CardTitle: React.FC<CardTitleProps> = ({ className = "", style, children }) => (
  <IonCardTitle className={["cfi-card-title", className].filter(Boolean).join(" ")} style={style}>
    {children}
  </IonCardTitle>
);

export interface CardDescriptionProps {
  className?: string;
  style?:     React.CSSProperties;
  children?:  React.ReactNode;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ className = "", style, children }) => (
  <IonCardSubtitle className={["cfi-card-desc", className].filter(Boolean).join(" ")} style={style}>
    {children}
  </IonCardSubtitle>
);

export interface CardContentProps {
  padding?   : CardPadding;
  className? : string;
  style?     : React.CSSProperties;
  children?  : React.ReactNode;
}

export const CardContent: React.FC<CardContentProps> = ({
  padding   = "md",
  className = "",
  style,
  children,
}) => (
  <IonCardContent
    className={["cfi-card-content", `cfi-card-content--${padding}`, className].filter(Boolean).join(" ")}
    style={style}
  >
    {children}
  </IonCardContent>
);

export interface CardFooterProps {
  align?     : "start"|"center"|"end"|"between";
  className? : string;
  style?     : React.CSSProperties;
  children?  : React.ReactNode;
}

export const CardFooter: React.FC<CardFooterProps> = ({
  align     = "end",
  className = "",
  style,
  children,
}) => (
  <div
    className={["cfi-card-footer", `cfi-card-footer--${align}`, className].filter(Boolean).join(" ")}
    style={style}
  >
    {children}
  </div>
);
