// src/components/operations/tours/update-tour/steps/Step2ContentItinerary.tsx
'use client';

import { Form, Formik, FormikHelpers } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  MapPin, Calendar, CheckCircle, XCircle, Mountain, Sun,
  Users, Tag, Languages, Save, Loader2, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { UpdateTourContentItineraryDTO } from '@/types/tour/tour.types';
import { Step2ContentSchema } from '@/utils/validators/tour/add-tour.validator';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import Step2Destinations from './step2-contentItinerary/Step2Destinations';
import Step2Itinerary from './step2-contentItinerary/Step2Itinerary';
import Step2Inclusions from './step2-contentItinerary/Step2Inclusions';
import Step2Exclusions from './step2-contentItinerary/Step2Exclusions';
import Step2Difficulty from './step2-contentItinerary/Step2Difficulty';
import Step2BestSeason from './step2-contentItinerary/Step2BestSeason';
import Step2Audience from './step2-contentItinerary/Step2Audience';
import Step2Categories from './step2-contentItinerary/Step2Categories';
import Step2Translations from './step2-contentItinerary/Step2Translations';
import { showToast } from '@/components/global/showToast';
import { extractErrorMessage } from '@/utils/axios/extractErrorMessage';
import { ValidationError } from 'yup';
import { spaceMono } from '@/styles/fonts'; 

// ─── Neumorphism Style Constants ───────────────────────────────────────────────
const neu = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl shadow-[8px_8px_18px_#c8c6c4,-8px_-8px_18px_#ffffff]',
  cardInner: 'bg-[#E7E5E4] rounded-xl border border-[#c8c6c4]/50 shadow-[5px_5px_12px_#c8c6c4,-5px_-5px_12px_#ffffff] hover:shadow-[7px_7px_16px_#c8c6c4,-7px_-7px_16px_#ffffff] transition-all duration-300',
  iconBox: (color: string) =>
    `rounded-lg p-2 shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff] flex items-center justify-center ${color}`,
  badge: 'bg-[#E7E5E4] text-[#006666] text-xs px-3 py-1 rounded-lg shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff] font-[Space_Mono] border border-[#006666]/20',
  btn: 'bg-[#006666] text-white rounded-xl shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c8c6c4,-6px_-6px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] transition-all duration-200',
  btnDisabled: 'opacity-50 cursor-not-allowed bg-[#888780] rounded-xl shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff]',
  alertError: 'bg-[#E7E5E4] border border-[#FF2157]/30 rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] flex items-center gap-3 px-4 py-3',
  alertSuccess: 'bg-[#E7E5E4] border border-[#00A63D]/30 rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] flex items-center gap-3 px-4 py-3',
  headingFont: 'font-[Space_Mono] font-bold tracking-tight text-[#1E2938]',
  subText: 'text-[#5a6270] text-sm font-[Space_Mono]',
  sectionTitle: 'font-[Space_Mono] font-semibold text-[#1E2938]',
  sectionDesc: 'font-[Space_Mono] text-[#888780] text-xs',
  divider: 'border-[#c8c6c4]/60',
};

// ─── Section Definitions ──────────────────────────────────────────────────────
const sections = [
  { icon: MapPin, title: 'Destinations', description: 'Define tour destinations and locations', component: Step2Destinations, color: 'bg-[#E7E5E4] text-[#006666]' },
  { icon: Calendar, title: 'Itinerary', description: 'Day-by-day schedule and activities', component: Step2Itinerary, color: 'bg-[#E7E5E4] text-[#FE9900]' },
  { icon: CheckCircle, title: 'Inclusions', description: 'Services and amenities included', component: Step2Inclusions, color: 'bg-[#E7E5E4] text-[#00A63D]' },
  { icon: XCircle, title: 'Exclusions', description: 'Items not covered in the package', component: Step2Exclusions, color: 'bg-[#E7E5E4] text-[#FF2157]' },
  { icon: Mountain, title: 'Difficulty', description: 'Physical difficulty and skill level', component: Step2Difficulty, color: 'bg-[#E7E5E4] text-[#888780]' },
  { icon: Sun, title: 'Best Season', description: 'Optimal travel periods and weather', component: Step2BestSeason, color: 'bg-[#E7E5E4] text-[#FE9900]' },
  { icon: Users, title: 'Audience', description: 'Target demographics and groups', component: Step2Audience, color: 'bg-[#E7E5E4] text-[#006666]' },
  { icon: Tag, title: 'Categories', description: 'Tour type and classification', component: Step2Categories, color: 'bg-[#E7E5E4] text-[#888780]' },
  { icon: Languages, title: 'Translations', description: 'Multi-language content support', component: Step2Translations, color: 'bg-[#E7E5E4] text-[#006666]' },
];

interface Step2ContentItineraryProps {
  tourId: string;
  initialData: UpdateTourContentItineraryDTO;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

const alertVariants: Variants = {
  hidden: { opacity: 0, y: -8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

export default function Step2ContentItinerary({ tourId, initialData }: Step2ContentItineraryProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateTourContentItineraryDTO) =>
      tourUpdateService.updateContentItinerary(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      showToast.success('Content & itinerary updated successfully!');
    },
    onError: (error) => {
      showToast.warning('Update Failed', extractErrorMessage(error));
    },
  });

  const initialValues = {
    destinations: initialData.destinations || [],
    itinerary: initialData.itinerary || [],
    inclusions: initialData.inclusions || [],
    exclusions: initialData.exclusions || [],
    difficulty: initialData.difficulty,
    bestSeason: initialData.bestSeason || [],
    audience: initialData.audience || [],
    categories: initialData.categories || [],
    translations: initialData.translations || { bn: {}, en: {} },
  };

  const handleSubmit = async (
    values: typeof initialValues,
    { setSubmitting }: FormikHelpers<typeof initialValues>
  ) => {
    try {
      await Step2ContentSchema.validate(values, { abortEarly: false });
      mutation.mutate(values);
    } catch (error: unknown) {
      if (error instanceof ValidationError) {
        showToast.warning('Validation Error', error.errors[0] || 'Validation error');
      } else if (error instanceof Error) {
        showToast.warning('Submission Error', error.message);
      } else {
        showToast.warning('Submission Error', 'An unknown error occurred');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`w-full ${spaceMono.className}`}>

      <div className={`${neu.card} p-1 w-full`}>
        {/* ─── Header ─── */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-[#c8c6c4]/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={neu.iconBox('bg-[#E7E5E4]')}>
              <Calendar size={22} className="text-[#006666]" />
            </div>
            <div>
              <h2 className={`${neu.headingFont} text-xl`}>Content & Itinerary</h2>
              <p className={neu.subText}>Tour details, schedule, and multilingual content</p>
            </div>
          </div>
          <span className={neu.badge}>Step 2 of 5</span>
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8">
          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="flex flex-col gap-5">
                  {/* ─── Section Cards ─── */}
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const SectionComponent = section.component;

                    return (
                      <motion.div
                        key={section.title}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.07, duration: 0.3 }}
                      >
                        <div className={neu.cardInner}>
                          {/* Section Header */}
                          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-[#c8c6c4]/50">
                            <div className={neu.iconBox(section.color)}>
                              <Icon size={17} />
                            </div>
                            <div>
                              <p className={neu.sectionTitle}>{section.title}</p>
                              <p className={neu.sectionDesc}>{section.description}</p>
                            </div>
                          </div>
                          {/* Section Content */}
                          <div className="px-5 py-5">
                            <SectionComponent />
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* ─── Alerts ─── */}
                  <AnimatePresence mode="wait">
                    {mutation.isError && (
                      <motion.div key="error" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                        <div className={neu.alertError}>
                          <AlertCircle size={17} className="text-[#FF2157] shrink-0" />
                          <span className="text-[#FF2157] text-sm font-[Space_Mono]">
                            Failed to update content & itinerary. Please try again.
                          </span>
                        </div>
                      </motion.div>
                    )}
                    {mutation.isSuccess && (
                      <motion.div key="success" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                        <div className={neu.alertSuccess}>
                          <CheckCircle2 size={17} className="text-[#00A63D] shrink-0" />
                          <span className="text-[#00A63D] text-sm font-[Space_Mono]">
                            Content & itinerary updated successfully!
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ─── Submit ─── */}
                  <motion.div
                    className="flex justify-end pt-4 border-t border-[#c8c6c4]/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.button
                      type="submit"
                      disabled={isSubmitting || mutation.isPending}
                      whileHover={!isSubmitting && !mutation.isPending ? { scale: 1.02 } : {}}
                      whileTap={!isSubmitting && !mutation.isPending ? { scale: 0.97 } : {}}
                      className={`inline-flex items-center gap-2 px-7 py-3 text-sm font-[Space_Mono] font-medium text-white
                        ${isSubmitting || mutation.isPending ? neu.btnDisabled : neu.btn}`}
                    >
                      {isSubmitting || mutation.isPending ? (
                        <><Loader2 size={16} className="animate-spin" /><span>Updating...</span></>
                      ) : (
                        <><Save size={16} /><span>Update Content & Itinerary</span></>
                      )}
                    </motion.button>
                  </motion.div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </motion.div>
  );
}