import React, { ReactNode, useCallback, useRef, useState } from "react";
import { IonToast } from "../../lib/ionic";
import { ToastContext, ToastOptions } from "../../contexts/toastContext";

interface ToastEntry extends ToastOptions {
    id: number;
    isOpen: boolean;
}

let _idCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastEntry[]>([]);

    const show = useCallback((opts: ToastOptions) => {
        const id = ++_idCounter;
        setToasts(prev => [
            ...prev,
            {
                id,
                isOpen:   true,
                message:  opts.message,
                color:    opts.color    ?? "medium",
                duration: opts.duration ?? 3000,
                position: opts.position ?? "top",
                icon:     opts.icon,
            },
        ]);
    }, []);

    const dismiss = useCallback((id: number) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, isOpen: false } : t));
        /* Nettoyage après l'animation de sortie */
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 500);
    }, []);

    const success = useCallback((message: string, opts?: Partial<ToastOptions>) =>
        show({ message, color: "success", icon: "checkmark-circle-outline", ...opts }), [show]);

    const error = useCallback((message: string, opts?: Partial<ToastOptions>) =>
        show({ message, color: "danger", icon: "alert-circle-outline", ...opts }), [show]);

    const warning = useCallback((message: string, opts?: Partial<ToastOptions>) =>
        show({ message, color: "warning", icon: "warning-outline", ...opts }), [show]);

    const info = useCallback((message: string, opts?: Partial<ToastOptions>) =>
        show({ message, color: "medium", icon: "information-circle-outline", ...opts }), [show]);

    return (
        <ToastContext.Provider value={{ show, success, error, warning, info }}>
            {children}

            {toasts.map(t => (
                <IonToast
                    key={t.id}
                    isOpen={t.isOpen}
                    message={t.message}
                    color={t.color}
                    duration={t.duration}
                    position={t.position}
                    icon={t.icon}
                    onDidDismiss={() => dismiss(t.id)}
                    buttons={[{ icon: 'close-outline', role: 'cancel' }]}
                    style={{ '--border-radius': '12px' } as React.CSSProperties}
                />
            ))}
        </ToastContext.Provider>
    );
}
