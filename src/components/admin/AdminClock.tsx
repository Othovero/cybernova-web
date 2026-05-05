"use client";

import { useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

export function AdminClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) return null;

  const date = now.toLocaleDateString("en-GB", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const time = now.toLocaleTimeString("en-GB", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  return (
    <div className="hidden sm:flex items-center gap-4 text-sm ml-auto">
      <div className="flex items-center gap-1.5 text-text-muted">
        <Calendar size={13} className="shrink-0" />
        <span>{date}</span>
      </div>
      <div className="flex items-center gap-1.5 font-mono font-semibold text-navy-900">
        <Clock size={13} className="text-nova-500 shrink-0" />
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
}
