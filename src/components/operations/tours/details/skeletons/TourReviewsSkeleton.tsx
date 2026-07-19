"use client";

import React from "react";
import { motion } from "framer-motion";

// ─────────────────────────────────────────────────────────────
// Neumorphism skeleton tokens
// ─────────────────────────────────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4]  border border-white/60 overflow-hidden";
const NEU_CARD_HDR = "px-6 py-4  bg-[#E7E5E4]";
const NEU_INSET_SM =
  "bg-[#E7E5E4] rounded-xl ";
const NEU_RAISED_SM =
  "bg-[#E7E5E4] rounded-xl ";

// Skeleton pulse variants on the neu surface
const SK_BASE = "animate-pulse rounded-lg bg-[#d0cecd]";
const SK_TEAL = "animate-pulse rounded-lg bg-[#006666]/15";
const SK_WARM = "animate-pulse rounded-lg bg-[#FE9900]/15";
const SK_GREEN = "animate-pulse rounded-lg bg-[#00A63D]/15";
const SK_MUTED = "animate-pulse rounded-lg bg-[#1E2938]/10";

// ─────────────────────────────────────────────────────────────
// Tiny helpers
// ─────────────────────────────────────────────────────────────
function Sk({
  h,
  w,
  cls = SK_BASE,
  round = false,
}: {
  h: string;
  w: string;
  cls?: string;
  round?: boolean;
}) {
  return <div className={`${cls} ${h} ${w} ${round ? "!rounded-full" : ""}`} />;
}

type Props = {
  rows?: number;
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
export function TourReviewsSkeleton({ rows = 4 }: Props) {
  return (
    <div className={NEU_CARD}>
      {/* ── Header ──────────────────────────────────────── */}
      <div
        className={`${NEU_CARD_HDR} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
      >
        {/* title + subtitle */}
        <div className="space-y-1.5">
          <Sk h="h-5" w="w-28" cls={SK_TEAL} />
          <Sk h="h-3" w="w-40" />
        </div>

        {/* rating summary + button */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <Sk h="h-7" w="w-14" cls={SK_WARM} />
            <Sk h="h-3" w="w-20" />
          </div>
          {/* star row */}
          <Sk h="h-4" w="w-24" cls={SK_WARM} />
          {/* filter button */}
          <div className={`${NEU_RAISED_SM} h-9 w-24`} />
        </div>
      </div>

      {/* ── Review list ─────────────────────────────────── */}
      <div className="h-[520px] overflow-y-auto p-5 space-y-4 bg-[#E7E5E4]">
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.05, duration: 0.25 }}
            className={`${NEU_RAISED_SM} p-5 space-y-4`}
          >
            {/* User row */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                {/* avatar */}
                <div
                  className={`${NEU_INSET_SM} h-12 w-12 rounded-full flex-shrink-0`}
                />
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Sk h="h-4" w="w-24" cls={SK_TEAL} />
                    <Sk h="h-4" w="w-14" cls={SK_WARM} />
                  </div>
                  <Sk h="h-3" w="w-36" />
                </div>
              </div>
              {/* score badge */}
              <div className={`${NEU_INSET_SM} h-7 w-16 flex-shrink-0`} />
            </div>

            {/* Review title */}
            <Sk h="h-4" w="w-3/4" cls={SK_MUTED} />

            {/* Comment lines */}
            <div className="space-y-1.5">
              <Sk h="h-3" w="w-full" />
              <Sk h="h-3" w="w-5/6" />
              <Sk h="h-3" w="w-2/3" />
            </div>

            {/* Footer row */}
            <div
              className={`pt-3 border-t border-[#1E2938]/10 flex items-center justify-between`}
            >
              <Sk h="h-5" w="w-16" cls={SK_GREEN} />
              <Sk h="h-5" w="w-20" cls={SK_TEAL} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Pagination footer ────────────────────────────── */}
      <div
        className={`${NEU_CARD_HDR} px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4`}
      >
        <Sk h="h-4" w="w-48" />
        <div className="flex items-center gap-2">
          {/* prev button */}
          <div className={`${NEU_RAISED_SM} h-9 w-20`} />
          {/* page numbers */}
          <div className="flex gap-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={
                  i === 0
                    ? `${NEU_INSET_SM} h-9 w-9`
                    : `${NEU_RAISED_SM} h-9 w-9`
                }
              />
            ))}
          </div>
          {/* next button */}
          <div className={`${NEU_RAISED_SM} h-9 w-20`} />
        </div>
      </div>
    </div>
  );
}
