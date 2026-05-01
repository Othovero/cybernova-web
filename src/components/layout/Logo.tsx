import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  height?: number;
}

export function Logo({ className, height = 48 }: LogoProps) {
  // 677×369 natural ratio → width = height × 1.835
  const width = Math.round(height * 1.835);

  return (
    <Link href="/" className={cn("inline-flex items-center shrink-0", className)}>
      <Image
        src="/logotransparent.png"
        alt="CyberNova Analytics"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </Link>
  );
}
