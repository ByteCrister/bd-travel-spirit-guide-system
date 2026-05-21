"use client";

import { useFormikContext } from "formik";
import { motion, Variants } from "framer-motion";
import {
  Languages,
  Globe,
  Type,
  FileText,
  AlignLeft,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { UpdateTourContentItineraryDTO } from "@/types/tour/tour.types";

// ─── Design Tokens ────────────────────────────────────────────────────────────

const NEU = {
  // Neumorphic surfaces
  surface: "bg-[#E7E5E4]",
  surfaceDark: "dark:bg-[#1a1918]",

  // Neumorphic shadow (raised)
  raised:
    "shadow-[6px_6px_12px_#c8c6c4,-6px_-6px_12px_#ffffff] dark:shadow-[6px_6px_12px_#0d0d0c,-6px_-6px_12px_#272624]",

  // Neumorphic shadow (inset / pressed)
  inset:
    "shadow-[inset_4px_4px_8px_#c8c6c4,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#0d0d0c,inset_-4px_-4px_8px_#272624]",

  // Soft inset for inputs
  inputInset:
    "shadow-[inset_3px_3px_6px_#c8c6c4,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#0d0d0c,inset_-3px_-3px_6px_#272624]",

  // Pill / badge inset
  pillInset:
    "shadow-[inset_2px_2px_4px_#c8c6c4,inset_-2px_-2px_4px_#ffffff] dark:shadow-[inset_2px_2px_4px_#0d0d0c,inset_-2px_-2px_4px_#272624]",

  radius: "rounded-2xl",
  radiusMd: "rounded-xl",
  radiusSm: "rounded-lg",

  text: {
    primary: "text-[#1E2938] dark:text-[#e8e6e4]",
    secondary: "text-[#4a5568] dark:text-[#9a9896]",
    accent: "text-[#006666]",
    emerald: "text-emerald-700 dark:text-emerald-400",
    blue: "text-blue-700 dark:text-blue-400",
  },

  border: "border border-[#d4d2d0] dark:border-[#2a2926]",

  // Icon containers
  iconBg: {
    primary: "bg-[#006666]/10 dark:bg-[#006666]/20",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30",
    blue: "bg-blue-100 dark:bg-blue-900/30",
  },

  // Divider
  divider: "border-t border-[#d4d2d0] dark:border-[#2a2926]",

  // Font
  fontMono: 'font-["Space_Mono",monospace]',
  fontDisplay: 'font-["Space_Mono",monospace]',
};

const VARIANTS = {
  container: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  } as Variants,
  item: {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  } as Variants,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

interface FieldBlockProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  accent: "emerald" | "blue";
  multiline?: boolean;
  rows?: number;
  value: string;
  placeholder: string;
  onChange: (val: string) => void;
}

const FieldBlock = ({
  id,
  label,
  icon,
  accent,
  multiline,
  rows = 3,
  value,
  placeholder,
  onChange,
}: FieldBlockProps) => {
  const focusRing =
    accent === "emerald"
      ? "focus:ring-2 focus:ring-emerald-500/30 focus:ring-offset-0"
      : "focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0";

  const inputBase = [
    "w-full bg-[#E7E5E4] dark:bg-[#1a1918]",
    NEU.inputInset,
    NEU.radiusMd,
    NEU.border,
    NEU.text.primary,
    "placeholder:text-[#9a9896] dark:placeholder:text-[#6a6866]",
    "px-4 py-2.5 text-sm transition-all duration-200",
    "outline-none",
    focusRing,
    NEU.fontMono,
  ].join(" ");

  return (
    <motion.div variants={VARIANTS.item} className="space-y-2">
      <Label
        htmlFor={id}
        className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-widest ${NEU.text.secondary} ${NEU.fontMono}`}
      >
        <span
          className={`${accent === "emerald" ? NEU.text.emerald : NEU.text.blue}`}
        >
          {icon}
        </span>
        {label}
      </Label>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`${inputBase} resize-none leading-relaxed`}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={inputBase}
        />
      )}
    </motion.div>
  );
};

// ─── Language Section ─────────────────────────────────────────────────────────

interface LangSectionProps {
  lang: "bn" | "en";
  label: string;
  sublabel: string;
  accent: "emerald" | "blue";
  values: { title: string; summary: string; description: string };
  onChange: (field: "title" | "summary" | "description", val: string) => void;
}

const LangSection = ({
  lang,
  label,
  sublabel,
  accent,
  values,
  onChange,
}: LangSectionProps) => {
  const pillColor =
    accent === "emerald"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";

  const iconColor = accent === "emerald" ? NEU.text.emerald : NEU.text.blue;
  const iconBg = accent === "emerald" ? NEU.iconBg.emerald : NEU.iconBg.blue;

  return (
    <motion.div variants={VARIANTS.item} className="space-y-5">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 ${NEU.radiusMd} ${iconBg} ${NEU.raised}`}>
          <Globe className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex items-center gap-2.5">
          <h3
            className={`text-sm font-semibold ${NEU.text.primary} ${NEU.fontDisplay}`}
          >
            {label}
          </h3>
          <span
            className={`px-2 py-0.5 text-[11px] font-mono font-medium ${NEU.radiusSm} ${pillColor} ${NEU.pillInset}`}
          >
            {sublabel}
          </span>
        </div>
      </div>

      {/* Fields */}
      <div
        className={`space-y-4 pl-3 border-l-2 ${accent === "emerald" ? "border-emerald-300 dark:border-emerald-700" : "border-blue-300 dark:border-blue-700"}`}
      >
        <FieldBlock
          id={`title-${lang}`}
          label="Title"
          icon={<Type className="w-3.5 h-3.5" />}
          accent={accent}
          value={values.title}
          placeholder={
            lang === "bn" ? "শিরোনাম লিখুন" : "Enter title in English"
          }
          onChange={(v) => onChange("title", v)}
        />
        <FieldBlock
          id={`summary-${lang}`}
          label="Summary"
          icon={<FileText className="w-3.5 h-3.5" />}
          accent={accent}
          multiline
          rows={3}
          value={values.summary}
          placeholder={
            lang === "bn" ? "সংক্ষিপ্ত বিবরণ লিখুন" : "Enter summary in English"
          }
          onChange={(v) => onChange("summary", v)}
        />
        <FieldBlock
          id={`description-${lang}`}
          label="Description"
          icon={<AlignLeft className="w-3.5 h-3.5" />}
          accent={accent}
          multiline
          rows={5}
          value={values.description}
          placeholder={
            lang === "bn"
              ? "বিস্তারিত বিবরণ লিখুন"
              : "Enter description in English"
          }
          onChange={(v) => onChange("description", v)}
        />
      </div>
    </motion.div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────

const NeuDivider = () => (
  <div className="relative my-2">
    <div className={`absolute inset-0 flex items-center`}>
      <div className={`w-full ${NEU.divider}`} />
    </div>
    <div className="relative flex justify-center">
      <span
        className={`px-3 text-[10px] font-mono uppercase tracking-widest ${NEU.text.secondary} bg-[#E7E5E4] dark:bg-[#1a1918]`}
      >
        ·
      </span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Step2Translations = () => {
  const { values, setFieldValue } =
    useFormikContext<UpdateTourContentItineraryDTO>();

  const handleTranslationChange = (
    language: "bn" | "en",
    field: "title" | "summary" | "description",
    value: string,
  ) => {
    const translations = { ...values.translations };
    if (!translations[language]) {
      translations[language] = { title: "", summary: "", description: "" };
    }
    translations[language] = { ...translations[language], [field]: value };
    setFieldValue("translations", translations);
  };

  const bnValues = {
    title: values.translations?.bn?.title || "",
    summary: values.translations?.bn?.summary || "",
    description: values.translations?.bn?.description || "",
  };

  const enValues = {
    title: values.translations?.en?.title || "",
    summary: values.translations?.en?.summary || "",
    description: values.translations?.en?.description || "",
  };

  return (
    <div
      className={[
        NEU.surface,
        NEU.surfaceDark,
        NEU.radius,
        NEU.raised,
        NEU.border,
        "overflow-hidden",
        "transition-all duration-300",
        "w-full",
      ].join(" ")}
    >
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="translations" className="border-none">
          {/* ── Trigger ── */}
          <AccordionTrigger
            className={[
              "px-6 py-4 hover:no-underline",
              "group data-[state=open]:border-b",
              NEU.divider,
              "[&>svg]:hidden",
            ].join(" ")}
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3.5">
                {/* Icon */}
                <div
                  className={[
                    "p-2.5",
                    NEU.radiusMd,
                    NEU.iconBg.primary,
                    NEU.raised,
                    "transition-all duration-200",
                    "group-hover:shadow-[4px_4px_8px_#c8c6c4,-4px_-4px_8px_#ffffff] dark:group-hover:shadow-[4px_4px_8px_#0d0d0c,-4px_-4px_8px_#272624]",
                  ].join(" ")}
                >
                  <Languages className={`w-4 h-4 ${NEU.text.accent}`} />
                </div>

                {/* Title + Badge */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-sm font-semibold ${NEU.text.primary} ${NEU.fontDisplay}`}
                  >
                    Translations
                  </span>
                  <span
                    className={[
                      "px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-widest",
                      "text-[#006666] dark:text-[#00aaaa]",
                      "bg-[#006666]/10 dark:bg-[#006666]/20",
                      NEU.radiusSm,
                      NEU.pillInset,
                    ].join(" ")}
                  >
                    Multilingual
                  </span>
                </div>
              </div>

              {/* Chevron indicator */}
              <ChevronDown
                className={`w-4 h-4 ${NEU.text.secondary} transition-transform duration-300 group-data-[state=open]:rotate-180`}
              />
            </div>
          </AccordionTrigger>

          {/* ── Content ── */}
          <AccordionContent className="px-6 pb-8 pt-6">
            <motion.div
              variants={VARIANTS.container}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Bengali */}
              <LangSection
                lang="bn"
                label="Bengali"
                sublabel="বাংলা"
                accent="emerald"
                values={bnValues}
                onChange={(field, val) =>
                  handleTranslationChange("bn", field, val)
                }
              />

              <NeuDivider />

              {/* English */}
              <LangSection
                lang="en"
                label="English"
                sublabel="EN"
                accent="blue"
                values={enValues}
                onChange={(field, val) =>
                  handleTranslationChange("en", field, val)
                }
              />
            </motion.div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default Step2Translations;
