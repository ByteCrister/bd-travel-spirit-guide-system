// app/operations/tours/[tourId]/update-tour/components/steps/Step5Compliance.tsx
'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourComplianceDTO } from '@/types/tour.types';
import { AGE_SUITABILITY } from '@/constants/tour.const';
import { Step5ComplianceSchema } from '@/utils/validators/add-tour.validator';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  ShieldCheck,
  Users,
  PersonStanding,
  Baby,
  PawPrint,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info,
  UserCheck,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ValidationError } from 'yup';

interface Step5ComplianceProps {
  tourId: string;
  initialData: UpdateTourComplianceDTO;
}

export default function Step5Compliance({ tourId, initialData }: Step5ComplianceProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateTourComplianceDTO) =>
      tourUpdateService.updateCompliance(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
  });

  const formik = useFormik({
    initialValues: {
      licenseRequired: initialData.licenseRequired || false,
      ageSuitability: initialData.ageSuitability || AGE_SUITABILITY.ALL,
      accessibility: initialData.accessibility || {
        wheelchair: false,
        familyFriendly: false,
        petFriendly: false,
        notes: '',
      },
    },
    validationSchema: Step5ComplianceSchema,
    onSubmit: async (values) => {
      try {
        // Validate the form before submission
        await Step5ComplianceSchema.validate(values, { abortEarly: false });

        // Only submit if validation passes
        mutation.mutate(values);
      } catch (error) {
        // Handle validation errors
        if (error instanceof ValidationError) {
          const errors: { [key: string]: string } = {};
          error.inner.forEach((err) => {
            if (err.path) {
              errors[err.path] = err.message;
            }
          });
          formik.setErrors(errors);
        }
        // Don't submit on validation error
      }
    },
  });

  const updateAccessibility = (field: string, value: unknown) => {
    formik.setFieldValue(`accessibility.${field}`, value);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const alertVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: { duration: 0.2 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Card className="mb-6 border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-indigo-50/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-lg shadow-indigo-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Compliance & Accessibility
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-6">
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* License Required Section */}
              <motion.div variants={itemVariants}>
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-100">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-sm border border-indigo-200 flex-shrink-0">
                      <FileCheck className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-base font-semibold text-slate-800 mb-1">
                            License Requirement
                          </h3>
                          <p className="text-sm text-slate-600">
                            Does this tour require participants to have a special license?
                          </p>
                        </div>
                        <Checkbox
                          id="licenseRequired"
                          checked={formik.values.licenseRequired}
                          onCheckedChange={(checked) => formik.setFieldValue('licenseRequired', checked)}
                          className="border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600 h-6 w-6"
                        />
                      </div>
                      {formik.values.licenseRequired && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 p-3 bg-white rounded-lg border border-indigo-200"
                        >
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-indigo-700">
                              Participants will be notified that a valid license is required for this tour.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Age Suitability */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-slate-800">Age Suitability</Label>
                    <p className="text-sm text-slate-600">Who is this tour appropriate for?</p>
                  </div>
                </div>
                <Select
                  value={formik.values.ageSuitability}
                  onValueChange={(value) => formik.setFieldValue('ageSuitability', value)}
                >
                  <SelectTrigger className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 h-12">
                    <SelectValue placeholder="Select age suitability" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(AGE_SUITABILITY).map((age) => (
                      <SelectItem key={age} value={age}>
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-slate-500" />
                          {age}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formik.touched.ageSuitability && formik.errors.ageSuitability && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.ageSuitability}
                  </motion.p>
                )}
              </motion.div>

              {/* Accessibility Features Section */}
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-teal-50 border border-teal-100">
                    <PersonStanding className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-slate-800">Accessibility Features</Label>
                    <p className="text-sm text-slate-600">Specify accessibility options and amenities</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Wheelchair Accessible */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formik.values.accessibility?.wheelchair
                        ? 'border-teal-500 bg-teal-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      onClick={() => updateAccessibility('wheelchair', !formik.values.accessibility?.wheelchair)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`p-3 rounded-lg ${formik.values.accessibility?.wheelchair
                          ? 'bg-teal-100'
                          : 'bg-slate-100'
                          }`}>
                          <PersonStanding className={`h-6 w-6 ${formik.values.accessibility?.wheelchair
                            ? 'text-teal-600'
                            : 'text-slate-500'
                            }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${formik.values.accessibility?.wheelchair
                            ? 'text-teal-700'
                            : 'text-slate-700'
                            }`}>
                            Wheelchair
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">Accessible</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formik.values.accessibility?.wheelchair
                          ? 'border-teal-500 bg-teal-500'
                          : 'border-slate-300'
                          }`}>
                          {formik.values.accessibility?.wheelchair && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Family Friendly */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formik.values.accessibility?.familyFriendly
                        ? 'border-pink-500 bg-pink-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      onClick={() => updateAccessibility('familyFriendly', !formik.values.accessibility?.familyFriendly)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`p-3 rounded-lg ${formik.values.accessibility?.familyFriendly
                          ? 'bg-pink-100'
                          : 'bg-slate-100'
                          }`}>
                          <Baby className={`h-6 w-6 ${formik.values.accessibility?.familyFriendly
                            ? 'text-pink-600'
                            : 'text-slate-500'
                            }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${formik.values.accessibility?.familyFriendly
                            ? 'text-pink-700'
                            : 'text-slate-700'
                            }`}>
                            Family
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">Friendly</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formik.values.accessibility?.familyFriendly
                          ? 'border-pink-500 bg-pink-500'
                          : 'border-slate-300'
                          }`}>
                          {formik.values.accessibility?.familyFriendly && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Pet Friendly */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${formik.values.accessibility?.petFriendly
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      onClick={() => updateAccessibility('petFriendly', !formik.values.accessibility?.petFriendly)}
                    >
                      <div className="flex flex-col items-center gap-2 text-center">
                        <div className={`p-3 rounded-lg ${formik.values.accessibility?.petFriendly
                          ? 'bg-amber-100'
                          : 'bg-slate-100'
                          }`}>
                          <PawPrint className={`h-6 w-6 ${formik.values.accessibility?.petFriendly
                            ? 'text-amber-600'
                            : 'text-slate-500'
                            }`} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${formik.values.accessibility?.petFriendly
                            ? 'text-amber-700'
                            : 'text-slate-700'
                            }`}>
                            Pet
                          </p>
                          <p className="text-xs text-slate-600 mt-0.5">Friendly</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${formik.values.accessibility?.petFriendly
                          ? 'border-amber-500 bg-amber-500'
                          : 'border-slate-300'
                          }`}>
                          {formik.values.accessibility?.petFriendly && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle2 className="h-4 w-4 text-white" />
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Accessibility Notes */}
                <div className="space-y-2 pt-2">
                  <Label className="text-sm font-medium text-slate-700">Additional Accessibility Information</Label>
                  <Textarea
                    value={formik.values.accessibility?.notes || ''}
                    onChange={(e) => updateAccessibility('notes', e.target.value)}
                    placeholder="Describe any additional accessibility features, facilities, or requirements..."
                    rows={4}
                    className="border-slate-300 focus:border-teal-500 focus:ring-teal-500 resize-none"
                  />
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" />
                    Provide details about ramps, elevators, accessible restrooms, parking, or any other relevant information
                  </p>
                </div>
              </motion.div>

              {/* Error/Success Alerts */}
              <AnimatePresence mode="wait">
                {mutation.isError && (
                  <motion.div
                    key="error"
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">
                        Failed to update compliance & accessibility information
                      </AlertDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-red-600 hover:bg-red-100"
                        onClick={() => mutation.reset()}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Alert>
                  </motion.div>
                )}

                {mutation.isSuccess && (
                  <motion.div
                    key="success"
                    variants={alertVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Compliance & accessibility information updated successfully
                      </AlertDescription>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-6 w-6 p-0 text-green-600 hover:bg-green-100"
                        onClick={() => mutation.reset()}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.div
                variants={itemVariants}
                className="flex justify-end pt-6 border-t border-slate-200"
              >
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="px-8 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg shadow-indigo-500/30 transition-all duration-200"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Update Compliance & Accessibility
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}