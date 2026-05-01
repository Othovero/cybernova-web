"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import {
  LayoutDashboard,
  ShieldAlert,
  FileText,
  BarChart2,
  Star,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",    href: "/admin",               icon: LayoutDashboard },
  { label: "Tickets",      href: "/admin/tickets",       icon: ShieldAlert     },
  { label: "Blog",         href: "/admin/blog",          icon: FileText        },
  { label: "Testimonials", href: "/admin/testimonials",  icon: Star            },
  { label: "Analytics",    href: "/admin/analytics",     icon: BarChart2       },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-navy-900 text-white transition-[width] duration-300 ease-in-out shrink-0 overflow-hidden",
        collapsed ? "w-[68px]" : "w-60"
      )}
    >
      <CircuitPattern />

      {/* ── Logo header ── */}
      <div className="relative h-[72px] flex items-center border-b border-white/10 shrink-0 px-4">
        {collapsed ? (
          /* Collapsed: "CN" monogram badge */
          <div className="mx-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-nova-500 select-none">
            <span className="text-sm font-bold tracking-tight text-white leading-none">CN</span>
          </div>
        ) : (
          /* Expanded: full logo, constrained so it never overflows */
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/logotransparent.png"
              alt="CyberNova Analytics"
              width={120}
              height={36}
              className="object-contain object-left shrink-0"
              priority
            />
          </div>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="relative flex-1 p-2 space-y-0.5 mt-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors select-none",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-nova-500 text-white"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom: collapse toggle + sign out ── */}
      <div className="relative p-2 border-t border-white/10 space-y-0.5 shrink-0">
        {/* Sign out */}
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            title={collapsed ? "Sign Out" : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors w-full",
              collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut size={17} className="shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex items-center rounded-lg text-sm text-white/40 hover:text-white hover:bg-white/10 transition-colors w-full",
            collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
          )}
        >
          {collapsed
            ? <PanelLeftOpen  size={17} className="shrink-0" />
            : <PanelLeftClose size={17} className="shrink-0" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
