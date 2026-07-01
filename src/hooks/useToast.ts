import { useContext } from "react";
import { ToastContext } from "../contexts/toastContext";

export type { ToastColor, ToastOptions } from "../contexts/toastContext";

/**
 * Hook pour afficher des toasts depuis n'importe quel composant.
 * Nécessite <ToastProvider> dans l'arbre (injecté dans App.tsx).
 *
 * @example
 * const toast = useToast();
 * toast.success("Sauvegardé !");
 * toast.error("Une erreur est survenue.");
 * toast.warning("Attention, champ manquant.");
 * toast.info("Mise à jour disponible.");
 * toast.show({ message: "Custom", color: "primary", duration: 5000 });
 */
export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within a <ToastProvider>");
    return ctx;
}
