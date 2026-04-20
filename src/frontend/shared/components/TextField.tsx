import { InputHTMLAttributes } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export const TextField = ({ label, className = "", ...props }: TextFieldProps) => (
  <label className="flex w-full flex-col gap-2 text-sm font-medium text-(--text-main)">
    <span>{label}</span>
    <input
      className={`w-full rounded-xl border border-black/15 bg-white px-3 py-2 text-sm outline-none ring-(--brand) transition focus:ring-2 ${className}`}
      {...props}
    />
  </label>
);
