'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';
import { Send, Loader2, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';

import HeroImageUpdate from './image-managers/HeroImageUpdate';
import GalleryUpdate from './image-managers/GalleryUpdate';
import Step0BasicInfo from './steps/Step0BasicInfo';
import Step1BangladeshInfo from './steps/Step1BangladeshInfo';
import Step2ContentItinerary from './steps/Step2ContentItinerary';
import DestinationImagesManager from './image-managers/DestinationImagesManager';
import Step3Logistics from './steps/Step3Logistics';
import Step4Pricing from './steps/Step4Pricing';
import Step5Compliance from './steps/Step5Compliance';
import Step6Policies from './steps/Step6Policies';
import {
  tourDetailErrorKey,
  tourDetailLoadingKey,
  useTourDetailStore,
} from '@/store/tour-detail.store';
import { TourDetailDTO } from '@/types/tour/tour.types';
import LoadingUpdateTourContainer from './loading-skeletons/LoadingUpdateTourContainer';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import {
  formatValidationErrors,
  validateTourDataStepByStep,
} from '@/utils/validators/tour/validateTour';
import ConfirmationAlert from './ConfirmationAlert';
import { useRouter } from 'next/navigation';
import { tourUpdateService } from '@/utils/api/tour.update.api';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NEU = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl ',
  cardInner: 'bg-[#E7E5E4] rounded-xl ',
  raised: 'bg-[#E7E5E4] ',
  iconBox: 'rounded-xl  flex items-center justify-center bg-[#E7E5E4]',
  primaryText: 'text-[#1E2938]',
  secondaryText: 'text-[#4a5568]',
  mutedText: 'text-[#718096]',
  labelFont: 'font-[Space_Mono,monospace] tracking-wide',
  bodyFont: 'font-[JetBrains_Mono,monospace]',
  primaryColor: '#006666',
  btnBack: [
    'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold',
    'bg-[#E7E5E4] ',
    'hover:',
    'active:',
    'disabled:opacity-40 disabled:cursor-not-allowed',
    'transition-all duration-200 text-[#4a5568]',
  ].join(' '),
  btnNext: [
    'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold',
    'bg-[#006666] text-white',
    '',
    'hover:',
    'active:',
    'transition-all duration-200',
  ].join(' '),
  btnSubmit: [
    'flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold',
    'bg-[#1E2938] text-white',
    '',
    'hover:',
    'active:',
    'disabled:opacity-50 disabled:cursor-not-allowed',
    'transition-all duration-200',
  ].join(' '),
  stepActive: [
    '',
    'ring-2 ring-[#006666]/40',
  ].join(' '),
  stepDone: '',
  stepIdle: [
    '',
    'hover:',
  ].join(' '),
  divider: 'border-t border-[#d1cfcd]',
};

// ─── Step Config ──────────────────────────────────────────────────────────────
const steps = [
  { label: 'Basic Info', icon: '/images/tour-review/sticky-note.png' },
  { label: 'Bangladesh Info', icon: '/images/tour-review/earth.png' },
  { label: 'Content & Itinerary', icon: '/images/tour-review/documentation.png' },
  { label: 'Logistics', icon: '/images/tour-review/pin.png' },
  { label: 'Pricing & Commerce', icon: '/images/tour-review/reduce-cost.png' },
  { label: 'Compliance', icon: '/images/tour-review/material-management.png' },
  { label: 'Policies', icon: '/images/tour-review/insurance.png' },
];

interface MainUpdateTourContainerProps {
  tourId: string;
}

export default function MainUpdateTourContainer({ tourId }: MainUpdateTourContainerProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const { fetchTourDetail, updateTourLocal, tourDetails, loading } = useTourDetailStore();
  const tourData = tourDetails[tourId];
  const router = useRouter();

  useEffect(() => {
    fetchTourDetail(tourId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  const handleStepChange = (step: number) => {
    setActiveStep(step);
    window.scrollTo(0, 0);
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep((p) => p + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((p) => p - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateAndSubmit = async () => {
    if (!tourData) { setSaveError('No tour data available to submit'); return; }
    setIsSaving(true);
    setSaveError(null);
    try {
      const validationErrors = await validateTourDataStepByStep(tourData);
      if (validationErrors.length > 0) {
        setSaveError(`Validation failed:\n${formatValidationErrors(validationErrors)}`);
        setIsSaving(false);
        return;
      }
      setShowConfirmation(true);
      setIsSaving(false);
    } catch {
      setSaveError('Validation error occurred. Please try again.');
      setIsSaving(false);
    }
  };

  const handleConfirmSubmit = async () => {
    setIsSaving(true);
    if (!tourData) {
      setSaveError('No tour data available to submit');
      setShowConfirmation(false);
      setIsSaving(false);
      return;
    }
    try {
      await tourUpdateService.submitTourForApprovalApi(tourId);
      router.push(`/operations/tours/${tourId}`);
    } catch (error) {
      const message = extractErrorMessage(error);
      setSaveError(`Failed to submit tour: ${message}`);
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    setShowConfirmation(false);
    setIsSaving(false);
  };

  // ─── Loading / Error States ──────────────────────────────────────────────────
  if (loading[tourDetailLoadingKey(tourId)]) {
    return <LoadingUpdateTourContainer />;
  }

  if (loading[tourDetailErrorKey(tourId)] || !tourData) {
    return (
      <div className={`min-h-screen ${NEU.surface} flex items-center justify-center p-6`}>
        <div className={`${NEU.card} p-8 max-w-md w-full flex items-start gap-4`}>
          <div className={`${NEU.iconBox} w-10 h-10 flex-shrink-0`}>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className={`text-sm font-bold text-red-600 ${NEU.labelFont}`}>Failed to Load</p>
            <p className={`text-xs mt-1 ${NEU.mutedText} ${NEU.bodyFont}`}>
              Failed to load tour data. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = ((activeStep + 1) / steps.length) * 100;

  // ─── Step Content ─────────────────────────────────────────────────────────────
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <HeroImageUpdate
              tourId={tourId}
              updateData={(u: Partial<TourDetailDTO>) => updateTourLocal(tourId, u)}
              currentHeroImage={tourData.heroImage}
            />
            <GalleryUpdate
              tourId={tourId}
              currentGallery={tourData.gallery || []}
              updateData={(u: Partial<TourDetailDTO>) => updateTourLocal(tourId, u)}
            />
            <Step0BasicInfo
              tourId={tourId}
              initialData={{ title: tourData.title, summary: tourData.summary, seo: tourData.seo, tags: tourData.tags }}
            />
          </>
        );
      case 1:
        return (
          <Step1BangladeshInfo
            tourId={tourId}
            initialData={{
              tourType: tourData.tourType, division: tourData.division, district: tourData.district,
              accommodationType: tourData.accommodationType, guideIncluded: tourData.guideIncluded,
              transportIncluded: tourData.transportIncluded, emergencyContacts: tourData.emergencyContacts,
            }}
          />
        );
      case 2:
        return (
          <>
            <Step2ContentItinerary
              tourId={tourId}
              initialData={{
                destinations: tourData.destinations, itinerary: tourData.itinerary,
                inclusions: tourData.inclusions, exclusions: tourData.exclusions,
                difficulty: tourData.difficulty, bestSeason: tourData.bestSeason,
                audience: tourData.audience, categories: tourData.categories,
                translations: tourData.translations,
              }}
            />
            <DestinationImagesManager
              tourId={tourId}
              destinations={tourData.destinations || []}
              updateData={(u: Partial<TourDetailDTO>) => updateTourLocal(tourId, u)}
            />
          </>
        );
      case 3:
        return (
          <Step3Logistics
            tourId={tourId}
            initialData={{
              mainLocation: tourData.mainLocation, transportModes: tourData.transportModes,
              pickupOptions: tourData.pickupOptions, meetingPoint: tourData.meetingPoint,
              packingList: tourData.packingList,
            }}
          />
        );
      case 4:
        return (
          <Step4Pricing
            tourId={tourId}
            initialData={{
              basePrice: tourData.basePrice, discounts: tourData.discounts,
              duration: tourData.duration, operatingWindow: tourData.operatingWindow,
              departure: tourData.departure, paymentMethods: tourData.paymentMethods,
            }}
          />
        );
      case 5:
        return (
          <Step5Compliance
            tourId={tourId}
            initialData={{
              licenseRequired: tourData.licenseRequired,
              ageSuitability: tourData.ageSuitability,
              accessibility: tourData.accessibility,
            }}
          />
        );
      case 6:
        return (
          <Step6Policies
            tourId={tourId}
            initialData={{
              cancellationPolicy: tourData.cancellationPolicy,
              refundPolicy: tourData.refundPolicy,
              terms: tourData.terms,
            }}
          />
        );
      default:
        return null;
    }
  };

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Tours', href: '/operations/tours' },
    { label: tourData.title, href: `/operations/tours/${tourId}` },
    { label: 'Edit Tour', href: `/operations/tours/${tourId}/update-tour` },
  ];

  return (
    <div className={`min-h-screen ${NEU.surface} py-6 px-4 sm:px-6`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* ── Breadcrumbs ──────────────────────────────────────────── */}
          <Breadcrumbs items={breadcrumbItems} className="pb-4" />

          {/* ── Page Header ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className={`${NEU.iconBox} w-12 h-12 flex-shrink-0`}>
              <Image
                src="/images/tour-review/pin.png"
                alt="Tour location icon"
                width={24}
                height={24}
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <h1 className={`text-xl sm:text-2xl font-bold ${NEU.primaryText} ${NEU.labelFont} truncate`}>
                Edit Tour: {tourData.title}
              </h1>
              <p className={`text-xs mt-0.5 ${NEU.mutedText} ${NEU.bodyFont}`}>
                Update tour details and manage content
              </p>
            </div>
          </motion.div>

          {/* ── Progress Track ───────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <div
              className="relative h-2.5 rounded-full overflow-hidden"
              style={{ background: '#E7E5E4', boxShadow: 'inset 2px 2px 5px #c8c6c4, inset -2px -2px 5px #ffffff' }}
            >
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: '#006666' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                Step {activeStep + 1} of {steps.length}
              </span>
              <span className={`text-xs font-bold ${NEU.labelFont}`} style={{ color: '#006666' }}>
                {Math.round(progressPct)}% Complete
              </span>
            </div>
          </motion.div>

          {/* ── Main Card ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`${NEU.card} overflow-hidden`}
          >
            {/* Stepper */}
            <div className={`p-4 sm:p-6 ${NEU.divider}`}>
              <div className="flex items-center justify-between gap-1">
                {steps.map((step, index) => {
                  const isCompleted = index < activeStep;
                  const isCurrent = index === activeStep;

                  return (
                    <div key={step.label} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center">
                        <motion.button
                          type="button"
                          whileHover={{ scale: isSaving ? 1 : 1.05 }}
                          whileTap={{ scale: isSaving ? 1 : 0.96 }}
                          animate={{ scale: isCurrent ? 1.08 : 1 }}
                          onClick={() => !isSaving && handleStepChange(index)}
                          disabled={isSaving}
                          className={[
                            'w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center',
                            'transition-all duration-200 outline-none',
                            'bg-[#E7E5E4]',
                            isCurrent ? NEU.stepActive :
                              isCompleted ? NEU.stepDone : NEU.stepIdle,
                            isSaving ? 'cursor-not-allowed' : 'cursor-pointer',
                          ].join(' ')}
                          style={isCurrent ? { outline: `2px solid #00666640` } : {}}
                          aria-label={step.label}
                        >
                          {isCompleted ? (
                            <Image
                              src="/images/tour-review/check-mark.png"
                              alt="Completed"
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          ) : (
                            <Image
                              src={step.icon}
                              alt={step.label}
                              width={20}
                              height={20}
                              className="object-contain"
                            />
                          )}
                        </motion.button>

                        <span
                          className={[
                            'text-[10px] font-medium mt-1.5 text-center hidden lg:block max-w-[72px] leading-tight',
                            NEU.labelFont,
                            isCurrent ? 'text-[#006666]' :
                              isCompleted ? 'text-[#1E2938]' : NEU.mutedText,
                          ].join(' ')}
                        >
                          {step.label}
                        </span>
                      </div>

                      {index < steps.length - 1 && (
                        <div className="flex-1 h-1 mx-1.5 sm:mx-2 relative min-w-0">
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{ boxShadow: 'inset 1px 1px 3px #c8c6c4, inset -1px -1px 3px #ffffff', background: '#E7E5E4' }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full"
                            style={{ background: '#006666', transformOrigin: 'left' }}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: isCompleted ? 1 : 0 }}
                            transition={{ duration: 0.45 }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Error Alert */}
            <AnimatePresence>
              {saveError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-5 pt-4"
                >
                  <div
                    className={`${NEU.cardInner} flex items-start gap-3 p-4`}
                    style={{ background: '#fef2f2' }}
                  >
                    <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className={`text-xs text-red-700 flex-1 whitespace-pre-line ${NEU.bodyFont}`}>
                      {saveError}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSaveError(null)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Step Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.25 }}
                >
                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <div className={`p-4 sm:p-6 ${NEU.divider} flex items-center justify-between gap-3`}>
              {/* Back */}
              <motion.button
                type="button"
                whileHover={{ scale: activeStep === 0 || isSaving ? 1 : 1.02 }}
                whileTap={{ scale: activeStep === 0 || isSaving ? 1 : 0.97 }}
                disabled={activeStep === 0 || isSaving}
                onClick={handleBack}
                className={`${NEU.btnBack} ${NEU.labelFont}`}
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back</span>
              </motion.button>

              {/* Next / Submit */}
              <div className="flex gap-3">
                {activeStep < steps.length - 1 ? (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleNext}
                    className={`${NEU.btnNext} ${NEU.labelFont}`}
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button"
                    whileHover={{ scale: isSaving ? 1 : 1.02 }}
                    whileTap={{ scale: isSaving ? 1 : 0.97 }}
                    disabled={isSaving}
                    onClick={validateAndSubmit}
                    className={`${NEU.btnSubmit} ${NEU.labelFont}`}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Submitting…</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Tour</span>
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationAlert
        open={showConfirmation}
        onOpenChange={handleDialogClose}
        onConfirm={handleConfirmSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}