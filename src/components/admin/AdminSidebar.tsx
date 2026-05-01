"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/layout/Logo";
import { CircuitPattern } from "@/components/ui/CircuitPattern";
import {
  LayoutDashboard,
  Ticket,
  FileText,
  BarChart2,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",     href: "/admin",                icon: LayoutDashboard },
  { label: "Tickets",       href: "/admin/tickets",        icon: Ticket },
  { label: "Blog",          href: "/admin/blog",           icon: FileText },
  { label: "Testimonials",  href: "/admin/testimonials",   icon: ShieldCheck },
  { label: "Analytics",     href: "/admin/analytics",      icon: BarChart2 },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-navy-900 text-white transition-all duration-200 shrink-0 overflow-hidden",
        collapsed ? "w-16" : "w-60"
      )}
    >
      <CircuitPattern />
      {/* Logo */}
      <div className={cn("relative p-4 border-b border-white/10 flex items-center", collapsed ? "justify-center" : "gap-3")}>
        {collapsed ? (
          <ShieldCheck size={22} className="text-nova-400" />
        ) : (
          <Logo variant="light" height={48} />
        )}
      </div>

      {/* Nav */}
      <nav className="relative flex-1 p-2 space-y-0.5 mt-1">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center rounded-lg text-sm font-medium transition-colors",
                collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5",
                active
                  ? "bg-nova-500 text-white"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="relative p-2 border-t border-white/10 space-y-0.5">
        <button
          className={cn(
            "flex items-center rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/10 transition-colors w-full",
            collapsed ? "justify-center p-3" : "gap-3 px-3 py-2.5"
          )}
          title={collapsed ? "Sign Out" : undefined}
        >
          <LogOut size={17} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-[72px] z-20 flex h-6 w-6 items-center justify-center rounded-full bg-navy-700 border border-white/20 text-white/70 hover:text-white hover:bg-navy-900 transition-colors shadow-md"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>
    </aside>
  );
}
