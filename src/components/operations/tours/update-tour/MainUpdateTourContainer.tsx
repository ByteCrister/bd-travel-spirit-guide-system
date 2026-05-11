// app/operations/tours/[tourId]/update-tour/components/MainUpdateTourContainer.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Alert,
  Container
} from '@mui/material';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';
import { Send, Loader2 } from 'lucide-react';

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
  useTourDetailStore
} from '@/store/tour-detail.store';
import { TourDetailDTO } from '@/types/tour/tour.types';
import LoadingUpdateTourContainer from './loading-skeletons/LoadingUpdateTourContainer';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { formatValidationErrors, validateTourDataStepByStep } from '@/utils/validators/tour/validateTour';
import ConfirmationAlert from './ConfirmationAlert';
import { useRouter } from 'next/navigation';
import { tourUpdateService } from '@/utils/api/tour.update.api';

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
      setActiveStep(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  const validateAndSubmit = async () => {
    if (!tourData) {
      setSaveError("No tour data available to submit");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    try {
      // Step 1: Validate the tour data
      const validationErrors = await validateTourDataStepByStep(tourData);

      if (validationErrors.length > 0) {
        const errorMessage = formatValidationErrors(validationErrors);
        setSaveError(`Validation failed:\n${errorMessage}`);
        setIsSaving(false);
        return;
      }

      // Step 2: Show confirmation dialog
      setShowConfirmation(true);
      setIsSaving(false); // IMPORTANT: Reset saving state so dialog can be interacted with

    } catch (error) {
      console.error('Error during validation:', error);
      setSaveError('Validation error occurred. Please try again.');
      setIsSaving(false);
    }
  };


  const handleConfirmSubmit = async () => {
    // Set loading state for dialog button
    setIsSaving(true);

    if (!tourData) {
      setSaveError("No tour data available to submit");
      setShowConfirmation(false);
      setIsSaving(false);
      return;
    }

    try {
      // Step 3: Submit for approval
      await tourUpdateService.submitTourForApprovalApi(tourId);

      // Success - navigate away
      router.push(`/operations/tours/${tourId}`);

    } catch (error) {
      console.error('Error submitting tour:', error);
      const message = extractErrorMessage(error);
      setSaveError(`Failed to submit tour: ${message}`);
      // Don't close dialog on error - let user retry
      setIsSaving(false);
      // Keep dialog open for retry
    } finally {
      // Only close dialog on successful submission or explicit cancel
      // setShowConfirmation(false); // Remove this line
    }
  };

  // Add this function to handle dialog close
  const handleDialogClose = () => {
    setShowConfirmation(false);
    setIsSaving(false);
  };

  if (loading[tourDetailLoadingKey(tourId)]) {
    return (
      <LoadingUpdateTourContainer />
    );
  }

  if (loading[tourDetailErrorKey(tourId)] || !tourData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" className="rounded-2xl">
            Failed to load tour data. Please try again.
          </Alert>
        </Container>
      </div>
    );
  }

  const progressPercentage = ((activeStep + 1) / steps.length) * 100;

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <HeroImageUpdate
              tourId={tourId}
              updateData={(updates: Partial<TourDetailDTO>) => updateTourLocal(tourId, updates)}
              currentHeroImage={tourData.heroImage}
            />
            <GalleryUpdate
              tourId={tourId}
              currentGallery={tourData.gallery || []}
              updateData={(updates: Partial<TourDetailDTO>) => updateTourLocal(tourId, updates)}
            />
            <Step0BasicInfo
              tourId={tourId}
              initialData={{
                title: tourData.title,
                summary: tourData.summary,
                seo: tourData.seo,
                tags: tourData.tags,
              }}
            />
          </>
        );
      case 1:
        return (
          <Step1BangladeshInfo
            tourId={tourId}
            initialData={{
              tourType: tourData.tourType,
              division: tourData.division,
              district: tourData.district,
              accommodationType: tourData.accommodationType,
              guideIncluded: tourData.guideIncluded,
              transportIncluded: tourData.transportIncluded,
              emergencyContacts: tourData.emergencyContacts,
            }}
          />
        );
      case 2:
        return (
          <>
            <Step2ContentItinerary
              tourId={tourId}
              initialData={{
                destinations: tourData.destinations,
                itinerary: tourData.itinerary,
                inclusions: tourData.inclusions,
                exclusions: tourData.exclusions,
                difficulty: tourData.difficulty,
                bestSeason: tourData.bestSeason,
                audience: tourData.audience,
                categories: tourData.categories,
                translations: tourData.translations,
              }}
            />
            <DestinationImagesManager
              tourId={tourId}
              destinations={tourData.destinations || []}
              updateData={(updates: Partial<TourDetailDTO>) => updateTourLocal(tourId, updates)}
            />
          </>
        );
      case 3:
        return (
          <Step3Logistics
            tourId={tourId}
            initialData={{
              mainLocation: tourData.mainLocation,
              transportModes: tourData.transportModes,
              pickupOptions: tourData.pickupOptions,
              meetingPoint: tourData.meetingPoint,
              packingList: tourData.packingList,
            }}
          />
        );
      case 4:
        return (
          <Step4Pricing
            tourId={tourId}
            initialData={{
              basePrice: tourData.basePrice,
              discounts: tourData.discounts,
              duration: tourData.duration,
              operatingWindows: tourData.operatingWindows,
              departures: tourData.departures,
              paymentMethods: tourData.paymentMethods,
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
    { label: "Home", href: "/" },
    { label: "Tours", href: "/operations/tours" },
    { label: tourData.title, href: `/operations/tours/${tourId}` },
    { label: "Edit Tour", href: `/operations/tours/${tourId}/update-tour` }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Breadcrumbs items={breadcrumbItems} className='pb-3.5' />

          {/* Header Section */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-3 mb-4"
            >
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
                <Image
                  src="/images/tour-review/pin.png"
                  alt="Tour location icon"
                  width={24}
                  height={24}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Edit Tour: {tourData.title}
                </h1>
                <p className="text-slate-600 mt-1">
                  Update tour details and manage content
                </p>
              </div>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative h-2 bg-slate-200 rounded-full overflow-hidden"
            >
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </motion.div>
            <div className="flex justify-between mt-2 px-1">
              <span className="text-sm font-medium text-slate-600">
                Step {activeStep + 1} of {steps.length}
              </span>
              <span className="text-sm font-medium text-indigo-600">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl shadow-blue-100/50">
              {/* Custom Stepper */}
              <div className="bg-white p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const isCompleted = index < activeStep;
                    const isCurrent = index === activeStep;

                    return (
                      <div key={step.label} className="flex items-center flex-1">
                        <motion.div
                          initial={false}
                          animate={{
                            scale: isCurrent ? 1.1 : 1,
                          }}
                          className="flex flex-col items-center relative"
                        >
                          <motion.button
                            type="button"
                            className={`
                              w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                              transition-all duration-300 relative z-10
                              ${isCompleted
                                ? 'shadow-lg shadow-green-500/30'
                                : isCurrent
                                  ? 'shadow-lg shadow-blue-500/30'
                                  : 'bg-slate-100 hover:bg-slate-200'
                              }
                            `}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => handleStepChange(index)}
                            disabled={isSaving}
                          >
                            {isCompleted ? (
                              <Image
                                src="/images/tour-review/check-mark.png"
                                alt="Completed"
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            ) : (
                              <Image
                                src={step.icon}
                                alt={step.label}
                                width={24}
                                height={24}
                                className="object-contain"
                              />
                            )}
                          </motion.button>

                          <span className={`
                            text-xs font-medium mt-2 text-center max-w-[80px] hidden lg:block
                            ${isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'}
                          `}>
                            {step.label}
                          </span>
                        </motion.div>

                        {index < steps.length - 1 && (
                          <div className="flex-1 h-1 mx-2 relative">
                            <div className="absolute inset-0 bg-slate-200 rounded-full" />
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: isCompleted ? 1 : 0 }}
                              transition={{ duration: 0.5 }}
                              style={{ transformOrigin: 'left' }}
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
                    className="px-6 pt-6"
                  >
                    <Alert
                      severity="error"
                      className="rounded-2xl"
                      onClose={() => setSaveError(null)}
                    >
                      {saveError}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Step Content */}
              <div className="p-6 lg:p-8 bg-gradient-to-br from-white to-slate-50">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStepContent()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation Buttons */}
              <div className="p-6 bg-white border-t border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: activeStep === 0 ? 1 : 1.02 }}
                    whileTap={{ scale: activeStep === 0 ? 1 : 0.98 }}
                    disabled={activeStep === 0 || isSaving}
                    onClick={handleBack}
                    className={`
                      flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                      transition-all duration-200
                      ${activeStep === 0 || isSaving
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                      }
                    `}
                  >
                    ← Back
                  </motion.button>

                  <div className="flex gap-3">
                    {activeStep < steps.length - 1 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
                          bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                          hover:from-blue-700 hover:to-indigo-700
                          shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                          transition-all duration-200"
                      >
                        Next →
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: isSaving ? 1 : 1.02 }}
                        whileTap={{ scale: isSaving ? 1 : 0.98 }}
                        disabled={isSaving}
                        onClick={() => validateAndSubmit()}
                        className={`
                            flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-semibold
                            shadow-lg transition-all duration-200
                            ${isSaving
                            ? 'bg-slate-100 text-slate-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40'
                          }
                          `}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <Send className="h-5 w-5" />
                            <span>Submit Tour</span>
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
      {/* Confirmation Alert Dialog */}
      <ConfirmationAlert
        open={showConfirmation}
        onOpenChange={handleDialogClose} 
        onConfirm={handleConfirmSubmit}
        isLoading={isSaving}
      />
    </div>
  );
}