"use client";

import { Field, FieldArray, useFormikContext } from "formik";
import { CreateTourDTO } from "@/types/tour/tour.types";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiPlus, FiTag, FiSearch } from "react-icons/fi";
import { HiOutlineTag } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// ── Neumorphism Style Tokens ──────────────────────────────────
const NEU_SURFACE = "bg-[#E7E5E4]";

const NEU_CARD =
  "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_INPUT =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  " border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#006666]/50 transition-all duration-200";
const NEU_INPUT_ERROR =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] placeholder:text-[#1E2938]/40 " +
  "font-[family-name:var(--font-jetbrains-mono)] text-sm " +
  " border-none " +
  "focus:outline-none focus:ring-2 focus:ring-[#FF2157]/50 ring-2 ring-[#FF2157]/40 transition-all duration-200";

const NEU_BTN_ICON =
  "rounded-xl w-10 h-10 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/60 " +
  " " +
  "hover:text-[#006666] hover: " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BADGE =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-[family-name:var(--font-space-mono)] font-bold " +
  "bg-[#E7E5E4] text-[#1E2938] ";
const NEU_HEADING =
  "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL =
  "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED =
  "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_DIVIDER = "border-[#1E2938]/10";
const NEU_ICON_WELL =
  "p-2.5 rounded-xl bg-[#E7E5E4] ";
const NEU_ICON_WELL_PRIMARY =
  "p-2.5 rounded-xl bg-[#006666]/10 ";

export default function BasicInfoStep() {
  const { values, errors, touched } = useFormikContext<CreateTourDTO>();
  const [tagInput, setTagInput] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`space-y-8 ${NEU_SURFACE} min-h-full p-1`}
    >
      {/* Header */}
      <div className="space-y-1">
        <h2 className={`text-2xl ${NEU_HEADING}`}>Basic Information</h2>
        <p className={NEU_MUTED}>
          Provide essential details about your tour package. Fields marked with * are required.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Tour Title */}
        <div className="space-y-2">
          <Label className={NEU_LABEL}>Tour Title *</Label>
          <Field
            as={Input}
            id="title"
            name="title"
            placeholder="Enter tour title"
            className={touched.title && errors.title ? NEU_INPUT_ERROR : NEU_INPUT}
          />
          <AnimatePresence>
            {touched.title && errors.title && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]"
              >
                {errors.title}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Tour Summary */}
        <div className="space-y-2">
          <Label className={NEU_LABEL}>Tour Summary *</Label>
          <Field
            as={Textarea}
            id="summary"
            name="summary"
            placeholder="Brief description of your tour"
            rows={4}
            className={`resize-none ${touched.summary && errors.summary ? NEU_INPUT_ERROR : NEU_INPUT}`}
          />
          <AnimatePresence>
            {touched.summary && errors.summary && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-[#FF2157] font-[family-name:var(--font-jetbrains-mono)]"
              >
                {errors.summary}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* SEO Section */}
        <div className={`${NEU_CARD} overflow-hidden`}>
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className={NEU_ICON_WELL_PRIMARY}>
                <FiSearch className="h-4 w-4 text-[#006666]" />
              </div>
              <div>
                <h3 className={`text-base ${NEU_HEADING}`}>SEO Information</h3>
                <p className={`text-xs ${NEU_MUTED}`}>Optimize your tour for search engines</p>
              </div>
            </div>
          </div>

          <div className={`border-t ${NEU_DIVIDER}`} />

          <div className="p-5 space-y-5">
            <div className="space-y-2">
              <Label className={NEU_LABEL}>Meta Title</Label>
              <Field
                as={Input}
                id="metaTitle"
                name="seo.metaTitle"
                placeholder="Enter meta title for search engines"
                className={NEU_INPUT}
              />
              <p className={`text-xs ${NEU_MUTED}`}>Recommended: 50–60 characters</p>
            </div>

            <div className="space-y-2">
              <Label className={NEU_LABEL}>Meta Description</Label>
              <Field
                as={Textarea}
                id="metaDescription"
                name="seo.metaDescription"
                placeholder="Enter meta description for search engines"
                rows={3}
                className={`resize-none ${NEU_INPUT}`}
              />
              <p className={`text-xs ${NEU_MUTED}`}>Recommended: 150–160 characters</p>
            </div>
          </div>
        </div>

        {/* Tags Section */}
        <div className={`${NEU_CARD} overflow-hidden`}>
          <div className="p-5 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <div className={NEU_ICON_WELL}>
                <HiOutlineTag className="h-4 w-4 text-[#1E2938]/60" />
              </div>
              <div>
                <h3 className={`text-base ${NEU_HEADING}`}>Tour Tags</h3>
                <p className={`text-xs ${NEU_MUTED}`}>Add relevant tags to help users find your tour</p>
              </div>
            </div>
          </div>

          <div className={`border-t ${NEU_DIVIDER}`} />

          <div className="p-5">
            <FieldArray name="tags">
              {({ push, remove }) => (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a tag (max 20 characters)"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const value = tagInput.trim();
                          if (value && !values.tags?.includes(value) && value.length <= 20) {
                            push(value);
                            setTagInput("");
                          }
                        }
                      }}
                      className={`flex-1 ${NEU_INPUT}`}
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      className={NEU_BTN_ICON}
                      onClick={() => {
                        const value = tagInput.trim();
                        if (value && !values.tags?.includes(value) && value.length <= 20) {
                          push(value);
                          setTagInput("");
                        }
                      }}
                      aria-label="Add tag"
                    >
                      <FiPlus className="h-4 w-4" />
                    </motion.button>
                  </div>

                  {values.tags && values.tags.length > 0 && (
                    <motion.div layout className="flex flex-wrap gap-2 pt-1">
                      <AnimatePresence>
                        {values.tags.map((tag, index) => (
                          <motion.div
                            key={`${tag}-${index}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            layout
                          >
                            <span className={NEU_BADGE}>
                              <FiTag className="h-3 w-3 text-[#006666]" />
                              <span className="text-[#1E2938]">{tag}</span>
                              <button
                                type="button"
                                onClick={() => remove(index)}
                                className="ml-1 rounded-full hover:bg-[#c8c6c5] p-0.5 transition-colors"
                                aria-label={`Remove tag ${tag}`}
                              >
                                <svg className="h-3 w-3 text-[#1E2938]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              )}
            </FieldArray>
          </div>
        </div>
      </div>
    </motion.div>
  );
}