"use client";

import { useState } from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

interface Props {
  children: React.ReactNode;
  userEmail: string;
}

export function AdminShell({ children, userEmail }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-surface">

      {/* Desktop sidebar — hidden below md */}
      <div className="hidden md:flex">
        <AdminSidebar />
      </div>

      {/* Mobile slide-over drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative z-10 shrink-0">
            <AdminSidebar />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-border px-4 sm:px-6 flex items-center gap-3 shrink-0 h-[72px]">
          <button
            className="md:hidden p-2 rounded-md text-navy-900 hover:bg-surface transition-colors shrink-0"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <p className="text-xs text-text-muted truncate min-w-0">
            Logged in as{" "}
            <span className="font-semibold text-navy-900">{userEmail}</span>
            <span className="ml-2 sm:ml-3 inline-flex items-center gap-1 text-secure font-medium">
              <ShieldCheck size={12} />
              <span className="hidden sm:inline">MFA Verified</span>
            </span>
          </p>
        </header>
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
