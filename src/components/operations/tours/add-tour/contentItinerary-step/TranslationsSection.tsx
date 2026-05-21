"use client";

import { useFormikContext } from "formik";
import { motion, AnimatePresence } from "framer-motion";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { useState } from "react";
import { Globe } from "lucide-react";

// ── Neumorphism style tokens ──────────────────────────────────
const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4] shadow-[8px_8px_16px_#c8c6c5,-8px_-8px_16px_#ffffff] border border-white/60";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] shadow-[inset_4px_4px_8px_#c8c6c5,inset_-4px_-4px_8px_#ffffff]";
const NEU_INPUT =
  "w-full rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm px-4 py-2.5 " +
  "shadow-[inset_3px_3px_7px_#c8c6c5,inset_-3px_-3px_7px_#ffffff] border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 shadow-[2px_2px_5px_#c8c6c5,-2px_-2px_5px_#ffffff]";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_TAB_ACTIVE =
  "px-4 py-2 rounded-xl font-[family-name:var(--font-space-mono)] text-sm font-600 text-[#006666] " +
  "bg-[#006666]/10 shadow-[inset_2px_2px_5px_#c8c6c5,inset_-2px_-2px_5px_#ffffff] transition-all duration-200";
const NEU_TAB_DEFAULT =
  "px-4 py-2 rounded-xl font-[family-name:var(--font-space-mono)] text-sm font-500 text-[#1E2938]/60 " +
  "bg-[#E7E5E4] shadow-[3px_3px_6px_#c8c6c5,-3px_-3px_6px_#ffffff] " +
  "hover:shadow-[inset_2px_2px_4px_#c8c6c5,inset_-2px_-2px_4px_#ffffff] transition-all duration-200";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const tabContentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
};

const LANGS = [
  { id: 0, key: "en", label: "English", sublabel: "EN" },
  { id: 1, key: "bn", label: "Bengali", sublabel: "বাংলা" },
] as const;

export default function TranslationsSection() {
  const { values, setFieldValue } = useFormikContext<CreateTourDTO>();
  const [tabValue, setTabValue] = useState(0);

  const currentLang = LANGS[tabValue];

  return (
    <div className="col-span-12">
      <motion.div variants={itemVariants}>
        {/* Section header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={NEU_ICON_WELL_PRIMARY}>
            <Globe className="w-4 h-4 text-[#006666]" />
          </div>
          <div>
            <h3 className={`${NEU_HEADING} text-base`}>Translations</h3>
            <p className={NEU_LABEL}>Provide content in multiple languages</p>
          </div>
        </div>

        {/* Card */}
        <div className={`${NEU_CARD} p-5`}>
          {/* Tab switcher */}
          <div className={`inline-flex gap-2 p-1.5 rounded-2xl ${NEU_SURFACE_INSET} mb-5`}>
            {LANGS.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setTabValue(lang.id)}
                className={tabValue === lang.id ? NEU_TAB_ACTIVE : NEU_TAB_DEFAULT}
              >
                {lang.label}
                <span className="ml-1.5 opacity-60">({lang.sublabel})</span>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tabValue}
              variants={tabContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="grid grid-cols-1 gap-4">
                {/* Title */}
                <div>
                  <label className={`${NEU_LABEL} block mb-2`}>
                    {currentLang.label} Title
                  </label>
                  <input
                    type="text"
                    className={NEU_INPUT}
                    placeholder={`Enter title in ${currentLang.label}...`}
                    value={
                      (values.translations as Record<string, Record<string, string>>)?.[currentLang.key]?.title || ""
                    }
                    onChange={(e) =>
                      setFieldValue(
                        `translations.${currentLang.key}.title`,
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Summary */}
                <div>
                  <label className={`${NEU_LABEL} block mb-2`}>
                    {currentLang.label} Summary
                  </label>
                  <textarea
                    rows={3}
                    className={`${NEU_INPUT} resize-none`}
                    placeholder={`Short summary in ${currentLang.label}...`}
                    value={
                      (values.translations as Record<string, Record<string, string>>)?.[currentLang.key]?.summary || ""
                    }
                    onChange={(e) =>
                      setFieldValue(
                        `translations.${currentLang.key}.summary`,
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={`${NEU_LABEL} block mb-2`}>
                    {currentLang.label} Description
                  </label>
                  <textarea
                    rows={5}
                    className={`${NEU_INPUT} resize-none`}
                    placeholder={`Full description in ${currentLang.label}...`}
                    value={
                      (values.translations as Record<string, Record<string, string>>)?.[currentLang.key]?.description || ""
                    }
                    onChange={(e) =>
                      setFieldValue(
                        `translations.${currentLang.key}.description`,
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {/* Completion indicator */}
              {(() => {
                const t = (values.translations as Record<string, Record<string, string>>)?.[currentLang.key];
                const filled = [t?.title, t?.summary, t?.description].filter(Boolean).length;
                return (
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-[#E7E5E4] shadow-[inset_1px_1px_3px_#c8c6c5,inset_-1px_-1px_3px_#ffffff]">
                      <motion.div
                        className="h-full rounded-full bg-[#006666]"
                        animate={{ width: `${(filled / 3) * 100}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                    <span className={NEU_MUTED}>{filled}/3 fields</span>
                  </div>
                );
              })()}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}