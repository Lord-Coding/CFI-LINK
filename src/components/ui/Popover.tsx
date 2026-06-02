import React, { useRef } from "react";
import { IonPopover } from "@ionic/react";
import "../../styles/ui/Popover.css";

export type PopoverSide  = "top"|"bottom"|"left"|"right";
export type PopoverAlign = "start"|"center"|"end";

export interface PopoverProps {
  isOpen          : boolean;
  onDismiss       : () => void;
  trigger         : React.ReactNode;
  width?          : string;
  side?           : PopoverSide;
  align?          : PopoverAlign;
  showArrow?      : boolean;
  dismissOnSelect?: boolean;
  className?      : string;
  children        : React.ReactNode;
}

const Popover: React.FC<PopoverProps> = ({
  isOpen,
  onDismiss,
  trigger,
  width          = "280px",
  side           = "bottom",
  align          = "center",
  showArrow      = true,
  dismissOnSelect = true,
  className      = "",
  children,
}) => {
  const triggerRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div ref={triggerRef} id="cfi-popover-trigger" className="cfi-popover-trigger-wrap">
        {trigger}
      </div>

      <IonPopover
        isOpen={isOpen}
        onDidDismiss={onDismiss}
        trigger="cfi-popover-trigger"
        triggerAction="click"
        side={side}
        alignment={align}
        arrow={showArrow}
        dismissOnSelect={dismissOnSelect}
        className={["cfi-popover", className].filter(Boolean).join(" ")}
        style={{ "--width": width } as React.CSSProperties}
        showBackdrop={false}
      >
        <div className="cfi-popover-content">
          {children}
        </div>
      </IonPopover>
    </>
  );
};

export default Popover;
