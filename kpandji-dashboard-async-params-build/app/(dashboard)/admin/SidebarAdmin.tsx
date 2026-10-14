"use client";

import Link from "next/link";
import { LayoutDashboard, MailPlus, ShieldCheck, Users } from "lucide-react";

const links = [
  { href: "/admin", label: "Vue d’ensemble", icon: LayoutDashboard },
  { href: "/admin#invitations", label: "Invitations", icon: MailPlus },
  { href: "/admin#utilisateurs", label: "Utilisateurs", icon: Users },
];

export default function SidebarAdmin({
  isOpen,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate: () => void;
}) {
  return (
    <nav aria-label="Navigation administrateur" className="flex h-full flex-col border-r border-slate-200 bg-white px-3 py-6 shadow-sm">
      <div className={`mb-7 flex items-center gap-3 px-3 ${isOpen ? "" : "lg:justify-center lg:px-0"}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className={`min-w-0 text-sm font-semibold text-slate-900 ${isOpen ? "" : "lg:hidden"}`}>
          Administration
        </span>
      </div>

      <p className={`mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${isOpen ? "" : "lg:hidden"}`}>
        Gestion
      </p>
      <div className="space-y-1">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={!isOpen ? label : undefined}
            onClick={onNavigate}
            className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${isOpen ? "" : "lg:justify-center"}`}
          >
            <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className={isOpen ? "" : "lg:hidden"}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
