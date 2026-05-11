// /operations/tours/add-tour/page.tsx
'use client';

import { useState } from 'react';
import { Formik, Form, FormikHelpers, FormikErrors } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// Import types and constants
import { CreateTourDTO } from '@/types/tour/tour.types';
import {
    TOUR_STATUS
} from '@/constants/tour/tour.const';

// Import form steps
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
import Image from 'next/image';
import { Breadcrumbs } from '@/components/global/Breadcrumbs';
import { Loader2, SaveAll } from 'lucide-react';
import { GUIDE_DEFAULT_1 } from '@/data/tour-defaults';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { encodeId } from '@/utils/helpers/mongodb-id-conversions';
import { tourUpdateService } from '@/utils/api/tour.update.api';

const items = [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/operations/tours" },
    { label: "Add Tour", href: "/operations/tours/add-tour" }
];

const getFirstErrorMessage = <T,>(
    errors: FormikErrors<T>
): string | null => {
    if (!errors || typeof errors !== "object") return null;

    for (const key in errors) {
        const value = errors[key];

        if (!value) continue;

        if (typeof value === "string") {
            return value;
        }

        if (Array.isArray(value)) {
            for (const item of value) {
                if (typeof item === "string") {
                    return item;
                }

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
};

// Define the steps with icons (using Unicode for compatibility)
const steps = [
    { label: 'Basic Information', icon: '/images/tour-review/sticky-note.png' },
    { label: 'Bangladesh Specific', icon: '/images/tour-review/earth.png' },
    { label: 'Content & Itinerary', icon: '/images/tour-review/documentation.png' },
    { label: 'Logistics', icon: '/images/tour-review/pin.png' },
    { label: 'Pricing & Commerce', icon: '/images/tour-review/reduce-cost.png' },
    { label: 'Compliance & Accessibility', icon: '/images/tour-review/material-management.png' },
    { label: 'Policies', icon: '/images/tour-review/insurance.png' },
    { label: 'Review & Submit', icon: '/images/tour-review/code-review.png' },
];

const initialValues: CreateTourDTO = GUIDE_DEFAULT_1

export default function AddTourPage() {
    const [activeStep, setActiveStep] = useState(0)
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const router = useRouter();

    const currentValidationSchema = validationSchemas[activeStep];
    const isLastStep = activeStep === steps.length - 1;

    const handleNext = async (
        validateForm: () => Promise<FormikErrors<CreateTourDTO>>
    ) => {
        const errors = await validateForm();

        if (Object.keys(errors).length === 0) {
            setActiveStep((prev) => prev + 1);
            window.scrollTo(0, 0);
            return;
        }

        const firstError = getFirstErrorMessage(errors);

        if (firstError) {
            showToast.error(firstError);
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
        window.scrollTo(0, 0);
    };

    const handleSubmit = async (values: CreateTourDTO, actions: FormikHelpers<CreateTourDTO>) => {
        // Don't proceed if already submitting
        if (submitting) return;

        setSubmitting(true)
        setSubmitError(null);

        try {
            const processedValues = {
                ...values,
                departures: values.departures?.map(dep => ({
                    ...dep,
                    date: new Date(dep.date).toISOString(),
                })),
                status: TOUR_STATUS.DRAFT,
                operatingWindows: values.operatingWindows?.map(win => ({
                    ...win,
                    startDate: new Date(win.startDate).toISOString(),
                    endDate: new Date(win.endDate).toISOString(),
                })),
                discounts: values.discounts?.map(disc => ({
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

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return <BasicInfoStep />;
            case 1:
                return <BangladeshFieldsStep />;
            case 2:
                return <ContentItineraryStep />;
            case 3:
                return <LogisticsStep />;
            case 4:
                return <PricingCommerceStep />;
            case 5:
                return <ComplianceAccessibilityStep />;
            case 6:
                return <PoliciesStep />;
            case 7:
                return <ReviewStep />;
            default:
                return <div>Unknown step</div>;
        }
    };

    const progressPercentage = ((activeStep + 1) / steps.length) * 100;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Breadcrumbs items={items} />

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
                                    Create New Tour
                                </h1>
                                <p className="text-slate-600 mt-1">
                                    Fill in all required fields to create an amazing tour package
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
                                                    <motion.div
                                                        className={`
                                                            w-12 h-12 rounded-2xl flex items-center justify-center text-2xl
                                                            transition-all duration-300 relative z-10
                                                            ${isCompleted
                                                                ? 'bg-gradient-to-br shadow-lg shadow-green-500/30'
                                                                : isCurrent
                                                                    ? 'bg-gradient-to-br shadow-lg shadow-blue-500/30'
                                                                    : 'bg-slate-100'
                                                            }
                                                        `}
                                                        whileHover={{ scale: 1.05 }}
                                                    >
                                                        {isCompleted ?
                                                            <Image
                                                                src={`/images/tour-review/check-mark.png`}
                                                                alt="Tour location icon"
                                                                width={24}
                                                                height={24}
                                                                className="object-contain"
                                                            /> : <Image
                                                                src={step.icon}
                                                                alt="Tour location icon"
                                                                width={24}
                                                                height={24}
                                                                className="object-contain"
                                                            />}
                                                    </motion.div>

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
                                {submitError && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="px-6 pt-6"
                                    >
                                        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                                            <span className="text-xl">
                                                <Image
                                                    src="/images/tour-review/crisis.png"
                                                    alt="Tour location icon"
                                                    width={24}
                                                    height={24}
                                                    className="object-contain"
                                                />
                                            </span>
                                            <div>
                                                <h4 className="font-semibold text-red-900">Error</h4>
                                                <p className="text-sm text-red-700 mt-1">{submitError}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form Content */}
                            <Formik
                                initialValues={initialValues}
                                validationSchema={currentValidationSchema}
                                onSubmit={handleSubmit}
                                validateOnMount={false}
                                validateOnChange={false}
                                validateOnBlur={true}
                            >
                                {({ validateForm, isSubmitting, submitForm }) => (
                                    <Form>
                                        <div className="p-6 lg:p-8 bg-gradient-to-br from-white to-slate-50">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={activeStep}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    {renderStepContent(activeStep)}
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
                                                    disabled={activeStep === 0 || isSubmitting}
                                                    onClick={handleBack}
                                                    className={`
                                                        flex items-center gap-2 px-6 py-3 rounded-xl font-medium
                                                        transition-all duration-200
                                                        ${activeStep === 0 || isSubmitting
                                                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                                            : 'bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                                                        }
                                                    `}
                                                >
                                                    ← Back
                                                </motion.button>

                                                <div className="flex gap-3">
                                                    {!isLastStep ? (
                                                        <motion.button
                                                            type="button"
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => handleNext(validateForm)}
                                                            className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold
                                                                bg-gradient-to-r from-blue-600 to-indigo-600 text-white
                                                                hover:from-blue-700 hover:to-indigo-700
                                                                shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40
                                                                transition-all duration-200"
                                                        >
                                                            Next →
                                                        </motion.button>
                                                    ) : (
                                                        <>
                                                            {/* Save as Draft Button */}
                                                            <motion.button
                                                                type="button"
                                                                whileHover={{ scale: submitting ? 1 : 1.02 }}
                                                                whileTap={{ scale: submitting ? 1 : 0.98 }}
                                                                disabled={submitting}
                                                                onClick={() => {
                                                                    submitForm();
                                                                }}
                                                                className={`
                                                flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold
                                                shadow-lg transition-all duration-200
                                                ${submitting
                                                                        ? 'opacity-50 cursor-not-allowed'
                                                                        : 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800 shadow-slate-500/25 hover:shadow-xl hover:shadow-slate-500/30'
                                                                    }
                                            `}
                                                            >
                                                                {submitting ? (
                                                                    <>
                                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                                        <span>Saving...</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <SaveAll className="h-5 w-5" />
                                                                        <span>Save as Draft</span>
                                                                    </>
                                                                )}
                                                            </motion.button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}