"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  to: number;
  prefix?: string;
  suffix?: string;
  durationMs?: number;
  className?: string;
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Counts a stat up once, when it first scrolls into view.
 *
 * `animated` stays null until the observer fires, so the server renders the real
 * number and anyone without JavaScript, or with reduced motion on, keeps it.
 */
export default function CountUp({
  to,
  prefix = "",
  suffix = "",
  durationMs = 1100,
  className = "",
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [animated, setAnimated] = useState<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") return;

    let frame = 0;

    const run = () => {
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / durationMs);
        setAnimated(progress < 1 ? Math.round(easeOut(progress) * to) : null);
        if (progress < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          setAnimated(0);
          run();
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, durationMs]);

  return (
    <span ref={ref} className={`num ${className}`}>
      {prefix}
      {(animated ?? to).toLocaleString("de-DE")}
      {suffix}
    </span>
  );
}
