// src/components/operations/tours/update-tour/steps/Step2ContentItinerary.tsx

'use client';

import { Form, Formik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  Mountain,
  Sun,
  Users,
  Tag,
  Languages,
  Save,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  UpdateTourContentItineraryDTO,
} from '@/types/tour.types';
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

interface Step2ContentItineraryProps {
  tourId: string;
  initialData: UpdateTourContentItineraryDTO;
}

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

const sections = [
  { 
    icon: MapPin, 
    title: 'Destinations', 
    description: 'Define tour destinations and locations',
    component: Step2Destinations 
  },
  { 
    icon: Calendar, 
    title: 'Itinerary', 
    description: 'Day-by-day schedule and activities',
    component: Step2Itinerary 
  },
  { 
    icon: CheckCircle, 
    title: 'Inclusions', 
    description: 'Services and amenities included',
    component: Step2Inclusions 
  },
  { 
    icon: XCircle, 
    title: 'Exclusions', 
    description: 'Items not covered in the package',
    component: Step2Exclusions 
  },
  { 
    icon: Mountain, 
    title: 'Difficulty', 
    description: 'Physical difficulty and skill level',
    component: Step2Difficulty 
  },
  { 
    icon: Sun, 
    title: 'Best Season', 
    description: 'Optimal travel periods and weather',
    component: Step2BestSeason 
  },
  { 
    icon: Users, 
    title: 'Audience', 
    description: 'Target demographics and groups',
    component: Step2Audience 
  },
  { 
    icon: Tag, 
    title: 'Categories', 
    description: 'Tour type and classification',
    component: Step2Categories 
  },
  { 
    icon: Languages, 
    title: 'Translations', 
    description: 'Multi-language content support',
    component: Step2Translations 
  },
];

export default function Step2ContentItinerary({ 
  tourId, 
  initialData 
}: Step2ContentItineraryProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateTourContentItineraryDTO) =>
      tourUpdateService.updateContentItinerary(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <Card className="border-2 shadow-lg">
        <CardHeader className="space-y-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                Content & Itinerary
              </CardTitle>
              <CardDescription className="text-base">
                Manage tour details, schedule, and multilingual content
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              Step 2 of 5
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <Formik
            initialValues={initialValues}
            validationSchema={Step2ContentSchema}
            onSubmit={(values) => {
              mutation.mutate(values);
            }}
            enableReinitialize
          >
            {({ isSubmitting }) => (
              <Form>
                <div className="space-y-6">
                  {sections.map((section, index) => {
                    const Icon = section.icon;
                    const SectionComponent = section.component;
                    
                    return (
                      <motion.div
                        key={section.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Card className="border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-md">
                          <CardHeader className="pb-3">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-lg font-semibold">
                                  {section.title}
                                </CardTitle>
                                <CardDescription className="text-sm">
                                  {section.description}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <Separator />
                          <CardContent className="pt-4">
                            <SectionComponent />
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}

                  <AnimatePresence mode="wait">
                    {mutation.isError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert variant="destructive" className="border-red-300 dark:border-red-800">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="font-medium">
                            Failed to update content & itinerary. Please try again.
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {mutation.isSuccess && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert className="border-green-300 dark:border-green-800 bg-green-50 dark:bg-green-950/20">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <AlertDescription className="font-medium text-green-800 dark:text-green-200">
                            Content & itinerary updated successfully!
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div 
                    className="flex justify-end pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubmitting || mutation.isPending}
                      className="min-w-[200px] font-semibold"
                    >
                      {isSubmitting || mutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Content & Itinerary
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </motion.div>
  );
}