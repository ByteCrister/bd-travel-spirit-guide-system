// app/operations/tours/[tourId]/update-tour/components/steps/Step1BangladeshInfo.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourBangladeshFieldsDTO } from '@/types/tour.types';
import {
  TRAVEL_TYPE,
  DIVISION,
  ACCOMMODATION_TYPE,
  Division,
  District,
  AccommodationType,
} from '@/constants/tour.const';
import { Step1BangladeshSchema } from '@/utils/validators/add-tour.validator';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { ComboBox } from '@/components/ui/combobox';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Building2,
  Users,
  Car,
  Phone,
  Shield,
  Ambulance,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Map,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ValidationError } from 'yup';

interface Step1BangladeshInfoProps {
  tourId: string;
  initialData: UpdateTourBangladeshFieldsDTO;
}

type ComboBoxOption = {
  label: string;
  value: string;
};

export default function Step1BangladeshInfo({ tourId, initialData }: Step1BangladeshInfoProps) {
  const queryClient = useQueryClient();
  const [districtOptions, setDistrictOptions] = useState<ComboBoxOption[]>([]);

  const tourTypeOptions: ComboBoxOption[] = Object.values(TRAVEL_TYPE).map(type => ({
    label: type,
    value: type,
  }));

  const divisionOptions: ComboBoxOption[] = Object.values(DIVISION).map(div => ({
    label: div,
    value: div,
  }));

  const accommodationTypeOptions: ComboBoxOption[] = Object.values(ACCOMMODATION_TYPE).map(type => ({
    label: type,
    value: type,
  }));

  const mutation = useMutation({
    mutationFn: (data: UpdateTourBangladeshFieldsDTO) =>
      tourUpdateService.updateBangladeshFields(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
  });

  const formik = useFormik({
    initialValues: {
      tourType: initialData.tourType,
      division: initialData.division,
      district: initialData.district,
      accommodationType: initialData.accommodationType || [],
      guideIncluded: initialData.guideIncluded ?? true,
      transportIncluded: initialData.transportIncluded ?? true,
      emergencyContacts: initialData.emergencyContacts || {
        policeNumber: '',
        ambulanceNumber: '',
        fireServiceNumber: '',
        localEmergency: '',
      },
    },
    validationSchema: Step1BangladeshSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Validate the form before submission
        await Step1BangladeshSchema.validate(values, { abortEarly: false });

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
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.division) {
      const districts = getDistrictsByDivision(formik.values.division as Division);
      const districtOpts = districts.map(dist => ({
        label: dist,
        value: dist,
      }));
      setDistrictOptions(districtOpts);

      if (formik.values.district && !districts.includes(formik.values.district as District)) {
        formik.setFieldValue('district', '');
      }
    } else {
      setDistrictOptions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.division]);

  useEffect(() => {
    if (formik.values.division) {
      const districts = getDistrictsByDivision(formik.values.division as Division);
      const districtOpts = districts.map(dist => ({
        label: dist,
        value: dist,
      }));
      setDistrictOptions(districtOpts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3 }
    }
  };

  const alertVariants = {
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
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20">
              <Map className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Bangladesh Specific Information
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-6">
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tour Type */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  Tour Type <span className="text-red-500">*</span>
                </Label>
                <ComboBox
                  options={tourTypeOptions}
                  value={formik.values.tourType}
                  placeholder="Select tour type"
                  onChange={(value) => formik.setFieldValue('tourType', value)}
                />
                {formik.touched.tourType && formik.errors.tourType && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.tourType}
                  </motion.p>
                )}
              </motion.div>

              {/* Division */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Map className="h-4 w-4 text-slate-500" />
                  Division <span className="text-red-500">*</span>
                </Label>
                <ComboBox
                  options={divisionOptions}
                  value={formik.values.division}
                  placeholder="Select division"
                  onChange={(value) => formik.setFieldValue('division', value)}
                />
                {formik.touched.division && formik.errors.division && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.division}
                  </motion.p>
                )}
              </motion.div>

              {/* District */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  District <span className="text-red-500">*</span>
                </Label>
                <ComboBox
                  options={districtOptions}
                  value={formik.values.district}
                  placeholder={formik.values.division ? "Select district" : "Select division first"}
                  onChange={(value) => formik.setFieldValue('district', value)}
                  disabled={!formik.values.division}
                />
                {formik.touched.district && formik.errors.district && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 flex items-center gap-1 mt-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.district}
                  </motion.p>
                )}
              </motion.div>

              {/* Accommodation Type */}
              <motion.div variants={itemVariants} className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-slate-500" />
                  Accommodation Types
                </Label>
                <ComboBox
                  options={accommodationTypeOptions}
                  value={formik.values.accommodationType?.[0]}
                  placeholder="Select accommodation type"
                  onChange={(value) => {
                    if (value && !formik.values.accommodationType.includes(value as AccommodationType)) {
                      formik.setFieldValue('accommodationType', [...formik.values.accommodationType, value]);
                    }
                  }}
                />
                {formik.values.accommodationType.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-wrap gap-2 mt-2"
                  >
                    {formik.values.accommodationType.map((type, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <Badge
                          variant="secondary"
                          className="pl-3 pr-1 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
                        >
                          {type}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0 ml-2 hover:bg-blue-200 rounded-full"
                            onClick={() => {
                              const newTypes = formik.values.accommodationType.filter(t => t !== type);
                              formik.setFieldValue('accommodationType', newTypes);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Guide and Transport Checkboxes */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id="guideIncluded"
                    checked={formik.values.guideIncluded}
                    onCheckedChange={(checked) => formik.setFieldValue('guideIncluded', checked)}
                    className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="guideIncluded"
                    className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <Users className="h-4 w-4 text-slate-500" />
                    Guide Included
                  </Label>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center space-x-3 p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <Checkbox
                    id="transportIncluded"
                    checked={formik.values.transportIncluded}
                    onCheckedChange={(checked) => formik.setFieldValue('transportIncluded', checked)}
                    className="border-slate-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <Label
                    htmlFor="transportIncluded"
                    className="text-sm font-medium text-slate-700 cursor-pointer flex items-center gap-2 flex-1"
                  >
                    <Car className="h-4 w-4 text-slate-500" />
                    Transport Included
                  </Label>
                </div>
              </motion.div>
            </div>

            {/* Emergency Contacts Section */}
            <motion.div
              variants={itemVariants}
              className="mt-8 pt-8 border-t border-slate-200"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-red-50 border border-red-100">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800">Emergency Contacts</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Shield className="h-3.5 w-3.5 text-slate-500" />
                    Police Number
                  </Label>
                  <Input
                    name="emergencyContacts.policeNumber"
                    value={formik.values.emergencyContacts?.policeNumber || ''}
                    onChange={formik.handleChange}
                    placeholder="999"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Ambulance className="h-3.5 w-3.5 text-slate-500" />
                    Ambulance Number
                  </Label>
                  <Input
                    name="emergencyContacts.ambulanceNumber"
                    value={formik.values.emergencyContacts?.ambulanceNumber || ''}
                    onChange={formik.handleChange}
                    placeholder="16263"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Flame className="h-3.5 w-3.5 text-slate-500" />
                    Fire Service Number
                  </Label>
                  <Input
                    name="emergencyContacts.fireServiceNumber"
                    value={formik.values.emergencyContacts?.fireServiceNumber || ''}
                    onChange={formik.handleChange}
                    placeholder="102"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-2">
                  <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-500" />
                    Local Emergency
                  </Label>
                  <Input
                    name="emergencyContacts.localEmergency"
                    value={formik.values.emergencyContacts?.localEmergency || ''}
                    onChange={formik.handleChange}
                    placeholder="Local contact"
                    className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                </motion.div>
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
                  className="mt-6"
                >
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">
                      Failed to update Bangladesh information
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
                  className="mt-6"
                >
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Bangladesh information updated successfully
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
              className="flex justify-end mt-8 pt-6 border-t border-slate-200"
            >
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="px-8 py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 transition-all duration-200"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Update Bangladesh Info
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}