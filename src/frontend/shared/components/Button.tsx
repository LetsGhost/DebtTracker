import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export const Button = ({ variant = "primary", className = "", ...props }: ButtonProps) => {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-transform duration-150 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60";

  const styleByVariant = {
    primary: "bg-[var(--brand)] text-white hover:bg-[var(--brand-strong)]",
    ghost: "bg-transparent text-[var(--text-main)] ring-1 ring-black/10 hover:bg-black/5",
  };

  return <button className={`${base} ${styleByVariant[variant]} ${className}`} {...props} />;
};
