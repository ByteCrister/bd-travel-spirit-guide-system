"use client";

import { useFormikContext } from "formik";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { DIFFICULTY_LEVEL } from "@/constants/tour/tour.const";
import { Mountain, TrendingUp, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_CARD_HOVER =
  "hover:shadow-[10px_10px_20px_#c8c6c5,-10px_-10px_20px_#ffffff] hover:-translate-y-0.5 transition-all duration-300";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_BADGE_PRIMARY =
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-700 " +
  "bg-[#006666]/10 text-[#006666] shadow-[2px_2px_4px_#c8c6c5,-2px_-2px_4px_#ffffff]";

const DIFFICULTY_META: Record<string, { color: string; bar: string; description: string }> = {
  easy: {
    color: "text-[#00A63D]",
    bar: "bg-[#00A63D]",
    description: "Suitable for beginners & families",
  },
  moderate: {
    color: "text-[#FE9900]",
    bar: "bg-[#FE9900]",
    description: "Requires basic fitness level",
  },
  hard: {
    color: "text-[#FF2157]",
    bar: "bg-[#FF2157]",
    description: "For experienced adventurers",
  },
  extreme: {
    color: "text-[#006666]",
    bar: "bg-[#006666]",
    description: "Elite physical challenge",
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function DifficultySection() {
  const { values, errors, touched, setFieldValue } =
    useFormikContext<CreateTourDTO>();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const hasError = !!(touched.difficulty && errors.difficulty);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const current = values.difficulty
    ? DIFFICULTY_META[values.difficulty.toLowerCase()]
    : null;

  return (
    <div className="col-span-12 md:col-span-6">
      <motion.div
        variants={itemVariants}
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.2 }}
      >
        <div
          className={`${NEU_CARD} ${NEU_CARD_HOVER} p-5 relative overflow-hidden ${
            hasError ? "ring-2 ring-[#FF2157]/50" : ""
          }`}
        >
          {/* Top accent bar */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl transition-all duration-300 ${
              current ? current.bar : "bg-[#006666]/30"
            }`}
          />

          {/* Header */}
          <div className="flex items-center gap-3 mb-5 mt-1">
            <div className={NEU_ICON_WELL_PRIMARY}>
              <Mountain className="w-5 h-5 text-[#006666]" />
            </div>
            <div className="flex-1">
              <h3 className={`${NEU_HEADING} text-base`}>Difficulty Level *</h3>
              <p className={NEU_MUTED}>Select the physical challenge level</p>
            </div>
          </div>

          {/* Custom select */}
          <div ref={ref} className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl ${NEU_SURFACE_INSET} font-[family-name:var(--font-space-mono)] text-sm text-[#1E2938] focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200`}
            >
              <span
                className={
                  values.difficulty
                    ? `${current?.color} font-600`
                    : "text-[#1E2938]/40"
                }
              >
                {values.difficulty
                  ? values.difficulty.charAt(0).toUpperCase() +
                    values.difficulty.slice(1)
                  : "Select difficulty..."}
              </span>
              <motion.div
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-[#1E2938]/50" />
              </motion.div>
            </button>

            {/* Dropdown */}
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className={`absolute z-20 left-0 right-0 mt-2 rounded-xl ${NEU_CARD} p-1.5 overflow-hidden`}
              >
                {Object.values(DIFFICULTY_LEVEL).map((level) => {
                  const meta = DIFFICULTY_META[level.toLowerCase()];
                  const isSelected = values.difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => {
                        setFieldValue("difficulty", level);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isSelected
                          ? "bg-[#006666]/10"
                          : "hover:bg-[#1E2938]/5"
                      }`}
                    >
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${meta.bar} flex-shrink-0`}
                      />
                      <span
                        className={`font-[family-name:var(--font-space-mono)] text-sm font-600 ${meta.color}`}
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </span>
                      <span className={`${NEU_MUTED} text-xs ml-auto`}>
                        {meta.description}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Error message */}
          {hasError && (
            <p className="mt-1.5 text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]">
              {errors.difficulty as string}
            </p>
          )}

          {/* Selected badge */}
          {values.difficulty && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 flex items-center gap-2"
            >
              <TrendingUp className={`w-3.5 h-3.5 ${current?.color}`} />
              <span className={NEU_BADGE_PRIMARY}>
                {values.difficulty.charAt(0).toUpperCase() +
                  values.difficulty.slice(1)}{" "}
                selected
              </span>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}