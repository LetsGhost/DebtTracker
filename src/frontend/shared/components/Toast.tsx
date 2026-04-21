"use client";

import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: React.ReactNode; textColor: string }> = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    textColor: "text-green-900",
    icon: <CheckCircle size={20} className="text-green-600" />,
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    textColor: "text-red-900",
    icon: <AlertCircle size={20} className="text-red-600" />,
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    textColor: "text-blue-900",
    icon: <Info size={20} className="text-blue-600" />,
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    textColor: "text-yellow-900",
    icon: <AlertTriangle size={20} className="text-yellow-600" />,
  },
};

export const Toast = ({ id, message, type, duration = 4000, onClose }: ToastProps) => {
  const styles = typeStyles[type];

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => onClose(id), duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md ${styles.bg} ${styles.border} animate-in fade-in slide-in-from-top-4 duration-300`}
    >
      <div className="flex-shrink-0">{styles.icon}</div>
      <p className={`flex-1 text-sm font-medium ${styles.textColor}`}>{message}</p>
      <button
        onClick={() => onClose(id)}
        className={`flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity ${styles.textColor}`}
      >
        <X size={18} />
      </button>
    </div>
  );
};
