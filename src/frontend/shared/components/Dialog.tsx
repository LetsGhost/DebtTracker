"use client";

import { X } from "lucide-react";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  actions?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "danger" | "secondary";
    disabled?: boolean;
  }[];
  cancelLabel?: string;
}

const variantStyles = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400",
  secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-100",
};

export const Dialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  actions = [],
  cancelLabel = "Cancel",
}: DialogProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {children && <div className="mb-6 text-sm text-gray-700">{children}</div>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-semibold rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200 transition-colors disabled:opacity-50"
            disabled={actions.some((a) => a.disabled)}
          >
            {cancelLabel}
          </button>

          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onOpenChange(false);
              }}
              disabled={action.disabled}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 ${
                variantStyles[action.variant || "primary"]
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
