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
  Users,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Dashboard",    href: "/admin",              icon: LayoutDashboard },
  { label: "Tickets",      href: "/admin/tickets",      icon: ShieldAlert     },
  { label: "Blog",         href: "/admin/blog",         icon: FileText        },
  { label: "Testimonials", href: "/admin/testimonials", icon: Star            },
  { label: "Analytics",    href: "/admin/analytics",    icon: BarChart2       },
  { label: "Team",         href: "/admin/team",         icon: Users           },
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

      {/* ── Header: logo + collapse toggle ── */}
      <div className="relative h-[72px] flex items-center border-b border-white/10 shrink-0 px-3 gap-2">
        {collapsed ? (
          /* Collapsed: only the expand icon, centred */
          <div className="flex flex-1 items-center justify-center">
            <button
              onClick={() => setCollapsed(false)}
              aria-label="Expand sidebar"
              className="flex h-8 w-8 items-center justify-center rounded-md text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftOpen size={18} />
            </button>
          </div>
        ) : (
          /* Expanded: logo left, collapse icon right */
          <>
            <div className="flex items-center min-w-0 flex-1">
              <Image
                src="/logotransparent.png"
                alt="CyberNova Analytics"
                width={118}
                height={34}
                className="object-contain object-left shrink-0"
                priority
              />
            </div>
            <button
              onClick={() => setCollapsed(true)}
              aria-label="Collapse sidebar"
              className="shrink-0 flex h-7 w-7 items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <PanelLeftClose size={16} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="relative flex-1 p-2 space-y-0.5 mt-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(href);
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
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Sign out ── */}
      <div className="relative p-2 border-t border-white/10 shrink-0">
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
      </div>
    </aside>
  );
}
