"use client";

import { useFormikContext } from "formik";
import { motion } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { TOUR_CATEGORIES } from "@/constants/tour/tour.const";
import { Tag } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_CHIP_DEFAULT =
  "inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-500 text-[#1E2938]/70 " +
  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] " +
  "cursor-pointer transition-all duration-200 select-none";
const NEU_CHIP_ACTIVE =
  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-600 text-white " +
  "bg-[#006666] shadow-[inset_2px_2px_5px_#004d4d,inset_-2px_-2px_5px_#008080] " +
  "cursor-pointer transition-all duration-200 select-none";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function CategoriesSection() {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();

  const selectedCount = values.categories?.length ?? 0;

  return (
    <div className="col-span-12">
      <motion.div variants={itemVariants}>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Tag className="w-4 h-4 text-[#006666]" />
          </div>
          <div className="flex-1">
            <h3 className={`${NEU_HEADING} text-base`}>Content Categories</h3>
            <p className={NEU_LABEL}>Tag your tour to help travellers find it</p>
          </div>
          {selectedCount > 0 && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="px-2.5 py-1 rounded-xl text-xs font-[family-name:var(--font-space-mono)] font-700 bg-[#006666] text-white shadow-[inset_2px_2px_4px_#004d4d]"
            >
              {selectedCount} selected
            </motion.span>
          )}
        </div>

        {/* Card */}
        <div className={`${NEU_CARD} p-5`}>
          <div className="flex flex-wrap gap-2">
            {Object.values(TOUR_CATEGORIES).map((category) => {
              const isActive = values.categories?.includes(category);
              return (
                <motion.button
                  key={category}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  className={isActive ? NEU_CHIP_ACTIVE : NEU_CHIP_DEFAULT}
                  onClick={() => {
                    const next = !isActive
                      ? [...(values.categories || []), category]
                      : (values.categories || []).filter((c) => c !== category);
                    setFieldValue("categories", next);
                  }}
                >
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                  )}
                  {category.replace(/_/g, " ")}
                </motion.button>
              );
            })}
          </div>

          {selectedCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 pt-3 border-t border-[#1E2938]/10 flex items-center justify-between"
            >
              <span className={NEU_LABEL}>{selectedCount} categor{selectedCount === 1 ? "y" : "ies"} selected</span>
              <button
                type="button"
                onClick={() => setFieldValue("categories", [])}
                className="text-xs font-[family-name:var(--font-space-mono)] text-[#FF2157]/70 hover:text-[#FF2157] transition-colors duration-150"
              >
                Clear all
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}