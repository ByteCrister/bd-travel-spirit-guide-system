// /operations/tours/add-tour/page.tsx
'use client';

import { useState } from 'react';
import { Formik, Form, FormikHelpers, FormikErrors } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, SaveAll, ChevronLeft, ChevronRight } from 'lucide-react';

import { CreateTourDTO } from '@/types/tour/tour.types';
import { TOUR_STATUS } from '@/constants/tour/tour.const';
import { validationSchemas } from '@/utils/validators/tour/add-tour.validator';
import { showToast } from '@/components/global/showToast';
import BasicInfoStep from './BasicInfoStep';
import BangladeshFieldsStep from './BangladeshFieldsStep';
import ContentItineraryStep from './contentItinerary-step/ContentItineraryStep';
import LogisticsStep from './LogisticsStep';
import PricingCommerceStep from './PricingCommerceStep';
import ComplianceAccessibilityStep from './ComplianceAccessibilityStep';
import PoliciesStep from './PoliciesStep';
import ReviewStep from './ReviewStep';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { tourUpdateService } from '@/utils/api/tour.update.api';

// ─── Neumorphic Design Tokens ──────────────────────────────────────────────────
const NEU_PAGE_BG = "min-h-screen bg-[#E7E5E4]";
const NEU_CARD = "rounded-2xl bg-[#E7E5E4]  border border-white/60";
const NEU_CARD_SM = "rounded-xl bg-[#E7E5E4]  border border-white/60";
const NEU_BTN_PRIMARY =
  "rounded-xl bg-[#006666] text-white font-[family-name:var(--font-space-mono)] font-bold tracking-wide " +
  " " +
  "hover: hover:bg-[#007777] " +
  "active: " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/50";
const NEU_BTN_GHOST =
  "rounded-xl bg-[#E7E5E4] text-[#1E2938] font-[family-name:var(--font-space-mono)] " +
  " " +
  "hover: " +
  "active: " +
  "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none " +
  "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006666]/40";
const NEU_BTN_ICON_ACTIVE =
  "rounded-xl w-10 h-10 flex items-center justify-center bg-[#006666] text-white " +
  "";
const NEU_BTN_ICON_DONE =
  "rounded-xl w-10 h-10 flex items-center justify-center bg-[#00A63D]/15 text-[#00A63D] " +
  "";
const NEU_BTN_ICON_DEFAULT =
  "rounded-xl w-10 h-10 flex items-center justify-center bg-[#E7E5E4] text-[#1E2938]/40 " +
  "";
const NEU_SURFACE_INSET =
  "bg-[#E7E5E4] ";
const NEU_HEADING = "font-[family-name:var(--font-space-mono)] font-bold text-[#1E2938] tracking-tight";
const NEU_LABEL = "font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#1E2938]/60 uppercase tracking-widest";
const NEU_MUTED = "font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/50";
const NEU_ICON_WELL_PRIMARY = "p-2.5 rounded-xl bg-[#006666]/10 ";
const NEU_DIVIDER = "border-[#1E2938]/10";
// ─── Constants ─────────────────────────────────────────────────────────────────
const BREADCRUMB_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Tours", href: "/operations/tours" },
  { label: "Add Tour", href: "/operations/tours/add-tour" },
];

const STEPS = [
  { label: 'Basic Information', icon: '/images/tour-review/sticky-note.png' },
  { label: 'Bangladesh Specific', icon: '/images/tour-review/earth.png' },
  { label: 'Content & Itinerary', icon: '/images/tour-review/documentation.png' },
  { label: 'Logistics', icon: '/images/tour-review/pin.png' },
  { label: 'Pricing & Commerce', icon: '/images/tour-review/reduce-cost.png' },
  { label: 'Compliance & Access', icon: '/images/tour-review/material-management.png' },
  { label: 'Policies', icon: '/images/tour-review/insurance.png' },
  { label: 'Review & Submit', icon: '/images/tour-review/code-review.png' },
];

import { GUIDE_DEFAULT, GUIDE_DEFAULT_1 } from '@/data/tour-defaults';
import toursData from '@/data/tours.json';
// INITIAL_VALUES is now determined dynamically by state

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getFirstErrorMessage<T>(errors: FormikErrors<T>): string | null {
  if (!errors || typeof errors !== "object") return null;
  for (const key in errors) {
    const value = errors[key];
    if (!value) continue;
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") return item;
        if (typeof item === "object" && item !== null) {
          const nested = getFirstErrorMessage(item as FormikErrors<unknown>);
          if (nested) return nested;
        }
      }
    }
    if (typeof value === "object") {
      const nested = getFirstErrorMessage(value as FormikErrors<unknown>);
      if (nested) return nested;
    }
  }
  return null;
}

// ─── Step Renderer ─────────────────────────────────────────────────────────────
function renderStepContent(step: number) {
  switch (step) {
    case 0: return <BasicInfoStep />;
    case 1: return <BangladeshFieldsStep />;
    case 2: return <ContentItineraryStep />;
    case 3: return <LogisticsStep />;
    case 4: return <PricingCommerceStep />;
    case 5: return <ComplianceAccessibilityStep />;
    case 6: return <PoliciesStep />;
    case 7: return <ReviewStep />;
    default: return null;
  }
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AddTourPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(true);
  const [tourIndex, setTourIndex] = useState(0);
  const router = useRouter();

  const currentValidationSchema = validationSchemas[activeStep];
  const isLastStep = activeStep === STEPS.length - 1;
  const progressPct = ((activeStep + 1) / STEPS.length) * 100;

  const handleNext = async (validateForm: () => Promise<FormikErrors<CreateTourDTO>>) => {
    const errors = await validateForm();
    if (Object.keys(errors).length === 0) {
      setActiveStep((p) => p + 1);
      window.scrollTo(0, 0);
      return;
    }
    const firstError = getFirstErrorMessage(errors);
    if (firstError) showToast.error(firstError);
  };

  const handleBack = () => {
    setActiveStep((p) => p - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (values: CreateTourDTO, actions: FormikHelpers<CreateTourDTO>) => {
    if (submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const processedValues = {
        ...values,
        departure: values.departure ? {
          ...values.departure,
          date: new Date(values.departure.date).toISOString(),
        } : undefined,
        status: TOUR_STATUS.DRAFT,
        operatingWindow: values.operatingWindow ? {
          startDate: new Date(values.operatingWindow.startDate).toISOString(),
          endDate: new Date(values.operatingWindow.endDate).toISOString(),
        } : undefined,
        discounts: values.discounts?.map((disc) => ({
          ...disc,
          validFrom: disc.validFrom ? new Date(disc.validFrom).toISOString() : undefined,
          validUntil: disc.validUntil ? new Date(disc.validUntil).toISOString() : undefined,
        })),
      };
      const result = await tourUpdateService.createTourApi(processedValues);
      showToast.success('Tour created successfully!');
      router.push(`/operations/tours/${encodeURIComponent(encodeId(result.id))}`);
    } catch (error: unknown) {
      console.error('Error creating tour:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create tour');
      showToast.error('Failed to create tour', extractErrorMessage(error));
    } finally {
      setSubmitting(false);
      actions.setSubmitting(false);
    }
  };

  return (
    <div className={`${NEU_PAGE_BG} py-2 px-4 sm:px-2`}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Breadcrumbs items={BREADCRUMB_ITEMS} />

          {/* ── Page Header ───────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-6 mb-8 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className={NEU_ICON_WELL_PRIMARY}>
                <Image
                  src="/images/tour-review/pin.png"
                  alt="Tour"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className={`${NEU_HEADING} text-2xl sm:text-3xl`}>Create New Tour</h1>
                <p className={NEU_MUTED}>Fill in all required fields to create an amazing tour package</p>
              </div>
            </div>
            <button
              onClick={() => {
                if (isDataLoaded) {
                  setIsDataLoaded(false);
                } else {
                  setTourIndex((prev) => (prev + 1) % ((toursData as unknown as any[])?.length || 1));
                  setIsDataLoaded(true);
                }
              }}
              className={`${NEU_BTN_GHOST} px-4 py-2 text-sm whitespace-nowrap`}
            >
              {isDataLoaded ? "Clear Form" : `Load Tour ${(tourIndex + 1) % ((toursData as unknown as any[])?.length || 1) + 1}`}
            </button>
          </motion.div>

          {/* ── Progress Bar ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <div className={`${NEU_SURFACE_INSET} rounded-full h-2.5 overflow-hidden`}>
              <motion.div
                className="h-full rounded-full bg-[#006666]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            <div className="flex justify-between mt-2 px-0.5">
              <span className={NEU_MUTED}>Step {activeStep + 1} of {STEPS.length}</span>
              <span className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#006666]">
                {Math.round(progressPct)}% Complete
              </span>
            </div>
          </motion.div>

          {/* ── Main Card ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={NEU_CARD}
          >
            {/* Step Tabs */}
            <div className="p-4 sm:p-6 border-b border-[#1E2938]/10">
              {/* Mobile: current step label */}
              <div className="flex sm:hidden items-center gap-3 mb-3">
                <div className={NEU_BTN_ICON_ACTIVE}>
                  <Image
                    src={STEPS[activeStep].icon}
                    alt={STEPS[activeStep].label}
                    width={20}
                    height={20}
                    className="object-contain brightness-[100]"
                  />
                </div>
                <span className={`${NEU_HEADING} text-sm`}>{STEPS[activeStep].label}</span>
              </div>

              {/* Desktop: full step row */}
              <div className="hidden sm:flex items-center justify-between gap-1">
                {STEPS.map((step, idx) => {
                  const isCompleted = idx < activeStep;
                  const isCurrent = idx === activeStep;
                  const stepBtnClass = isCurrent
                    ? NEU_BTN_ICON_ACTIVE
                    : isCompleted
                    ? NEU_BTN_ICON_DONE
                    : NEU_BTN_ICON_DEFAULT;

                  return (
                    <div key={step.label} className="flex items-center flex-1 min-w-0">
                      <motion.div
                        className="flex flex-col items-center"
                        animate={{ scale: isCurrent ? 1.08 : 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className={stepBtnClass}>
                          <Image
                            src={isCompleted ? "/images/tour-review/check-mark.png" : step.icon}
                            alt={step.label}
                            width={20}
                            height={20}
                            className="object-contain"
                          />
                        </div>
                        <span
                          className={`
                            text-[10px] mt-1.5 text-center max-w-[72px] leading-tight hidden lg:block
                            font-[family-name:var(--font-space-mono)] font-bold
                            ${isCurrent ? 'text-[#006666]' : isCompleted ? 'text-[#00A63D]' : 'text-[#1E2938]/30'}
                          `}
                        >
                          {step.label}
                        </span>
                      </motion.div>

                      {idx < STEPS.length - 1 && (
                        <div className="flex-1 h-0.5 mx-1 lg:mx-2 relative overflow-hidden rounded-full">
                          <div className="absolute inset-0 bg-[#1E2938]/10 rounded-full" />
                          <motion.div
                            className="absolute inset-0 bg-[#00A63D] rounded-full"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isCompleted ? 1 : 0 }}
                            transition={{ duration: 0.4 }}
                            style={{ transformOrigin: "left" }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Mobile dot indicators */}
              <div className="flex sm:hidden gap-1.5 justify-center mt-2">
                {STEPS.map((_, idx) => (
                  <div
                    key={idx}
                    className={`
                      rounded-full transition-all duration-300
                      ${idx === activeStep
                        ? 'w-5 h-2 bg-[#006666]'
                        : idx < activeStep
                        ? 'w-2 h-2 bg-[#00A63D]'
                        : 'w-2 h-2 bg-[#1E2938]/20'
                      }
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {submitError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 sm:px-8 pt-5"
                >
                  <div className={`${NEU_CARD_SM} p-4 flex items-start gap-3 border-[#FF2157]/20`}>
                    <Image
                      src="/images/tour-review/crisis.png"
                      alt="Error"
                      width={20}
                      height={20}
                      className="object-contain flex-shrink-0 mt-0.5"
                    />
                    <div>
                      <p className="font-[family-name:var(--font-space-mono)] text-xs font-bold text-[#FF2157]">
                        Submission Error
                      </p>
                      <p className="font-[family-name:var(--font-jetbrains-mono)] text-sm text-[#1E2938]/70 mt-0.5">
                        {submitError}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Formik */}
            <Formik
              initialValues={isDataLoaded ? (toursData as unknown as CreateTourDTO[])[tourIndex] : GUIDE_DEFAULT}
              validationSchema={currentValidationSchema}
              onSubmit={handleSubmit}
              validateOnMount={false}
              validateOnChange={false}
              validateOnBlur={true}
              enableReinitialize={true}
            >
              {({ validateForm, isSubmitting, submitForm }) => (
                <Form>
                  {/* Step Content */}
                  <div className="p-5 sm:p-8">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                      >
                        {renderStepContent(activeStep)}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Navigation Footer */}
                  <div className={`px-5 sm:px-8 py-5 border-t ${NEU_DIVIDER} flex items-center justify-between gap-3`}>
                    {/* Back */}
                    <button
                      type="button"
                      disabled={activeStep === 0 || isSubmitting}
                      onClick={handleBack}
                      className={`${NEU_BTN_GHOST} flex items-center gap-1.5 px-4 sm:px-6 py-2.5 text-sm`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Back</span>
                    </button>

                    {/* Step label (center, desktop) */}
                    <span className={`${NEU_LABEL} hidden sm:block`}>
                      {STEPS[activeStep].label}
                    </span>

                    {/* Next / Submit */}
                    {!isLastStep ? (
                      <button
                        type="button"
                        onClick={() => handleNext(validateForm)}
                        className={`${NEU_BTN_PRIMARY} flex items-center gap-1.5 px-5 sm:px-8 py-2.5 text-sm`}
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => submitForm()}
                        className={`
                          ${NEU_BTN_PRIMARY} flex items-center gap-2 px-5 sm:px-8 py-2.5 text-sm
                          ${submitting ? "opacity-50 cursor-not-allowed" : ""}
                        `}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving…</span>
                          </>
                        ) : (
                          <>
                            <SaveAll className="w-4 h-4" />
                            <span>Save as Draft</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </Form>
              )}
            </Formik>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}