import { createContext } from "react";

export type ToastColor = "success" | "danger" | "warning" | "medium" | "primary";

export interface ToastOptions {
    message: string;
    color?: ToastColor;
    duration?: number;
    position?: "top" | "middle" | "bottom";
    icon?: string;
}

export interface ToastContextType {
    show:    (opts: ToastOptions) => void;
    success: (message: string, opts?: Partial<ToastOptions>) => void;
    error:   (message: string, opts?: Partial<ToastOptions>) => void;
    warning: (message: string, opts?: Partial<ToastOptions>) => void;
    info:    (message: string, opts?: Partial<ToastOptions>) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);
