import { toastController } from "@ionic/core";

export type ToastColor = "success" | "danger" | "warning" | "medium";

export interface ToastOptions {
  message: string;
  color?: ToastColor;
  duration?: number;
  position?: "top" | "bottom";
  icon?: string;
}

export function useToast() {
  const show = async (options: ToastOptions) => {
    const toast = await toastController.create({
      message: options.message,
      color: options.color ?? "medium",
      duration: options.duration || 3000,
      position: options.position || "top",
      icon: options.icon,
      buttons: [{ icon: "close", role: "cancel" }],
    });
    await toast.present();
  };

  const success = (message: string, opts?: Partial<ToastOptions>) =>
    show({ message, color: "success", icon: "checkmark-circle", ...opts });
  const error = (message: string, opts?: Partial<ToastOptions>) =>
    show({ message, color: "danger", icon: "alert-circle", ...opts });
  const warning = (message: string, opts?: Partial<ToastOptions>) =>
    show({ message, color: "warning", icon: "warning", ...opts });
  const info = (message: string, opts?: Partial<ToastOptions>) =>
    show({ message, color: "medium", icon: "information-circle", ...opts });

  return { show, success, error, warning, info };
}
