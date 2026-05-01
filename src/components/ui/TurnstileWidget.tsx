"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

interface Props {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
}

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: object) => string;
      reset: (id: string) => void;
    };
    _turnstileWidgetId?: string;
  }
}

export default function TurnstileWidget({ onSuccess, onExpire }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  function mount() {
    if (!window.turnstile || !containerRef.current) return;
    if (window._turnstileWidgetId) return;
    window._turnstileWidgetId = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
      callback: onSuccess,
      "expired-callback": onExpire ?? (() => onSuccess("")),
      theme: "light",
    });
  }

  useEffect(() => {
    if (window.turnstile) mount();
    return () => { window._turnstileWidgetId = undefined; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        onLoad={mount}
        strategy="lazyOnload"
      />
      <div ref={containerRef} />
    </>
  );
}
