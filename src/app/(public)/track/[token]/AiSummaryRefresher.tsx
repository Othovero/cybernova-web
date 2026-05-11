"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AiSummaryRefresher() {
  const router = useRouter();
  useEffect(() => {
    const t = setTimeout(() => router.refresh(), 5000);
    return () => clearTimeout(t);
  }, [router]);
  return null;
}
