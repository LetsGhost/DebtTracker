"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Settings, UserRoundPlus, Users } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/groups", label: "Groups", icon: Users },
  { href: "/friends", label: "Friends", icon: UserRoundPlus },
  { href: "/settings", label: "Settings", icon: Settings },
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
            aria-label={link.label}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition sm:px-4 ${
              active ? "bg-(--brand) text-white shadow-md" : "bg-black/10 text-black/70 hover:bg-black/15"
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
