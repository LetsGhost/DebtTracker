"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
];

export const ModuleNav = () => {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2">
      {links.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        const Icon = link.icon;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              active ? "bg-(--brand) text-white shadow-md" : "bg-black/10 text-black/70 hover:bg-black/15"
            }`}
          >
            <Icon size={16} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
