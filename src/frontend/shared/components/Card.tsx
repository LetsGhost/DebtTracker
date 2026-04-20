import { PropsWithChildren } from "react";

export const Card = ({ children }: PropsWithChildren) => (
  <div className="rounded-2xl border border-black/10 bg-(--surface) p-6 shadow-[0_14px_40px_-25px_rgba(0,0,0,0.45)]">
    {children}
  </div>
);
