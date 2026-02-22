"use client";

import { ReactNode, useEffect, useRef, useState } from "react";

export function Reveal({
  children,
  className = "",
  delayMs = 0,
}: {
  children: ReactNode;
  className?: string;
  delayMs?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const firedRef = useRef(false);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (reduced) {
      const raf = window.requestAnimationFrame(() => {
        firedRef.current = true;
        setInView(true);
      });
      return () => window.cancelAnimationFrame(raf);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            firedRef.current = true;
            setInView(true);
            observer.disconnect();
            break;
          }
        }
      },
      {
        root: null,
        threshold: 0.14,
        rootMargin: "40px 0px -10% 0px",
      }
    );

    observer.observe(el);

    // Safety timeout: force reveal if IntersectionObserver fails silently.
    const timer = window.setTimeout(() => {
      if (!firedRef.current) {
        firedRef.current = true;
        setInView(true);
      }
    }, 3000 + delayMs);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, [delayMs]);

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? "in-view" : ""} ${className}`}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}
