"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_LINKS = [
  { label: "Services",      href: "/services" },
  { label: "Case Studies",  href: "/case-studies" },
  { label: "Blog",          href: "/blog" },
  { label: "Testimonials",  href: "/testimonials" },
  { label: "Gallery",       href: "/gallery" },
];

const btnPrimary = "inline-flex items-center justify-center rounded-lg bg-nova-500 hover:bg-nova-400 text-white text-sm font-semibold tracking-wide px-4 h-9 transition-colors";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Logo height={56} />

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-navy-900 hover:text-nova-500 transition-colors rounded-md hover:bg-nova-100"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/admin" className="text-sm font-medium text-text-muted hover:text-navy-900 transition-colors">
              Admin
            </Link>
            <Link href="/contact" className={btnPrimary}>Get Protected</Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-navy-900 hover:bg-surface"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-white px-4 py-4 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-sm font-medium text-navy-900 hover:text-nova-500 hover:bg-nova-100 rounded-md transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-border mt-3 flex flex-col gap-2">
            <Link href="/admin" onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-text-muted">
              Admin Panel
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className={`${btnPrimary} w-full justify-center`}>
              Get Protected
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
