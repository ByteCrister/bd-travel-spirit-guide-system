"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { FaArrowUp } from "react-icons/fa";

/* smooth easing + scroll helper */
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}
function createSmoothScrollToTop(duration = 800) {
  let rafId: number | null = null;
  let cancelled = false;
  const start = window.scrollY || window.pageYOffset;
  if (start === 0) return { cancel: () => { }, started: false };
  const startTime = performance.now();
  function step(now: number) {
    if (cancelled) return;
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    const eased = easeOutCubic(progress);
    const y = Math.round(start * (1 - eased));
    window.scrollTo(0, y);
    if (progress < 1) rafId = requestAnimationFrame(step);
    else rafId = null;
  }
  rafId = requestAnimationFrame(step);
  return {
    cancel: () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
    },
    started: true,
  };
}

/* component */
export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [mounted, setMounted] = useState(false); // track hydration

  const progressMv = useMotionValue(0);
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const spring = useSpring(progressMv, {
    stiffness: prefersReducedMotion ? 120 : 180,
    damping: prefersReducedMotion ? 26 : 22,
  });

  const dashArray = 100;
  const dashOffset = useTransform(spring, (p) => (1 - p) * dashArray);
  const scrollCancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? Math.min(1, Math.max(0, y / h)) : 0;
      setVisible(y > 320);
      progressMv.set(p);
    };

    const cancelOnUserInteraction = () => {
      if (scrollCancelRef.current) {
        scrollCancelRef.current();
        scrollCancelRef.current = null;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", cancelOnUserInteraction, { passive: true });
    window.addEventListener("touchstart", cancelOnUserInteraction, { passive: true });
    window.addEventListener("keydown", cancelOnUserInteraction, { passive: true });

    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", cancelOnUserInteraction);
      window.removeEventListener("touchstart", cancelOnUserInteraction);
      window.removeEventListener("keydown", cancelOnUserInteraction);
      if (scrollCancelRef.current) {
        scrollCancelRef.current();
        scrollCancelRef.current = null;
      }
    };
  }, [progressMv]);

  const scrollToTop = () => {
    if (scrollCancelRef.current) {
      scrollCancelRef.current();
      scrollCancelRef.current = null;
    }
    const { cancel, started } = createSmoothScrollToTop(prefersReducedMotion ? 450 : 900);
    if (started) scrollCancelRef.current = cancel;
  };

  if (!mounted) return null; // prevents server/client mismatch

  return (
    <motion.button
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title="Back to top"
      initial={{ opacity: 0, scale: 0.86, y: 18 }}
      animate={{
        opacity: visible ? 1 : 0,
        scale: visible ? 1 : 0.86,
        y: visible ? 0 : 18,
      }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.06, y: -2 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
      style={{ pointerEvents: visible ? "auto" : "none", WebkitTapHighlightColor: "transparent" }}
    >
      {/* outer container: stylized pill with blurred backdrop and subtle border */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 64, height: 64 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(135deg, rgba(8,145,122,0.12), rgba(16,185,129,0.18))",
            boxShadow: "0 12px 34px rgba(6,95,70,0.18), inset 0 1px 0 rgba(255,255,255,0.04)",
            backdropFilter: "blur(6px)",
          }}
        />

        {/* decorative halo */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1, scale: hovering ? 1.08 : 1 } : { opacity: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          style={{
            boxShadow:
              "0 6px 22px rgba(16,185,129,0.12), 0 2px 8px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.03)",
          }}
        />

        {/* central glossy icon surface (not a nested button) */}
        <div
          aria-hidden="true"
          className="relative z-20 flex items-center justify-center rounded-full"
          style={{
            width: 48,
            height: 48,
            background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(245,245,245,0.92))",
            borderRadius: 9999,
            boxShadow: "0 6px 18px rgba(6,95,70,0.12)",
          }}
        >
          <FaArrowUp className="text-emerald-700" style={{ width: 18, height: 18 }} />
        </div>

        {/* progress ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 z-10" viewBox="0 0 36 36" aria-hidden>
          <defs>
            <linearGradient id="stgGradientTop" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#86efac" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <filter id="fShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#059669" floodOpacity="0.08" />
            </filter>
          </defs>

          <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="2.6" />
          <motion.circle
            cx="18"
            cy="18"
            r="16"
            fill="none"
            stroke="url(#stgGradientTop)"
            strokeWidth="2.8"
            strokeDasharray={dashArray}
            strokeLinecap="round"
            style={{ strokeDashoffset: dashOffset }}
            filter="url(#fShadow)"
          />
        </svg>
      </div>

      <span className="sr-only">Scroll to top</span>
    </motion.button>
  );
}
