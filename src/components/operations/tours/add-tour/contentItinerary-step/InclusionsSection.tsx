"use client";

import { FieldArray, useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

// ── Neumorphic Style Tokens ──────────────────────────────────────────────────
const NEU_CARD_ITEM =
  "rounded-xl bg-[#E7E5E4]  border border-white/60";

const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  " border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";

const NEU_LABEL =
  "block font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest mb-1.5";

const NEU_BTN_PRIMARY =
  "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl " +
  "bg-[#006666] text-white font-[family-name:var(--font-space-mono)] text-sm font-bold tracking-wide " +
  " " +
  "hover: hover:bg-[#007777] " +
  "active: " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";

const NEU_BTN_ICON_DANGER =
  "w-9 h-9 flex items-center justify-center rounded-xl " +
  "bg-[#E7E5E4] text-[#FF2157] " +
  " " +
  "hover:bg-[#FF2157]/10 hover: " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF2157]/40";

const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight text-base";

const NEU_EMPTY_STATE =
  "rounded-xl bg-[#E7E5E4]  " +
  "border border-white/40 py-8 flex flex-col items-center justify-center gap-2";

// ── Animation Variants ───────────────────────────────────────────────────────
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

// ── Component ────────────────────────────────────────────────────────────────
export default function InclusionsSection() {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();

  return (
    <div className="w-full">
      {/* Section Header */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 mb-4">
        <div
          className="p-2 rounded-xl flex items-center justify-center flex-shrink-0
            "
          style={{
            background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
          }}
        >
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <h3 className={NEU_HEADING}>Inclusions</h3>
      </motion.div>

      {/* Field Array */}
      <FieldArray name="inclusions">
        {({ push, remove }) => (
          <div className="flex flex-col gap-0">
            <AnimatePresence mode="popLayout">
              {values.inclusions?.length ? (
                values.inclusions.map((item, index) => (
                  <motion.div
                    key={index}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    layout
                    className="mb-3"
                  >
                    <div className={`${NEU_CARD_ITEM} p-4`}>
                      <div className="flex flex-col gap-3">
                        {/* Label field */}
                        <div>
                          <label className={NEU_LABEL}>
                            Label <span className="text-[#FF2157]">*</span>
                          </label>
                          <input
                            type="text"
                            className={NEU_INPUT}
                            placeholder="e.g. Breakfast included"
                            value={item.label}
                            onChange={(e) =>
                              setFieldValue(
                                `inclusions[${index}].label`,
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Description field */}
                        <div>
                          <label className={NEU_LABEL}>Description</label>
                          <textarea
                            rows={2}
                            className={`${NEU_INPUT} resize-none`}
                            placeholder="Optional details..."
                            value={item.description || ""}
                            onChange={(e) =>
                              setFieldValue(
                                `inclusions[${index}].description`,
                                e.target.value
                              )
                            }
                          />
                        </div>

                        {/* Actions row */}
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className={NEU_BTN_ICON_DANGER}
                            onClick={() => remove(index)}
                            aria-label={`Remove inclusion ${index + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`${NEU_EMPTY_STATE} mb-4`}
                >
                  <CheckCircle2 className="w-8 h-8 text-[#1E2938]/20" />
                  <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/40">
                    No inclusions added yet
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Add button */}
            <button
              type="button"
              className={NEU_BTN_PRIMARY}
              onClick={() => push({ label: "", description: "" })}
            >
              <Plus className="w-4 h-4" />
              Add Inclusion
            </button>
          </div>
        )}
      </FieldArray>
    </div>
  );
}