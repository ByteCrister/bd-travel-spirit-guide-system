// app/operations/tours/[tourId]/update-tour/components/steps/Step1BangladeshInfo.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourBangladeshFieldsDTO } from '@/types/tour/tour.types';
import {
  TRAVEL_TYPE,
  DIVISION,
  ACCOMMODATION_TYPE,
  Division,
  District,
  AccommodationType,
} from '@/constants/tour/tour.const';
import { Step1BangladeshSchema } from '@/utils/validators/tour/add-tour.validator';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { ComboBox } from '@/components/ui/combobox';
import { getDistrictsByDivision } from '@/utils/helpers/conversions.tour';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Building2, Users, Car, Phone, Shield,
  Ambulance, Flame, CheckCircle2, AlertCircle, Loader2, X, Map,
} from 'lucide-react';
import { ValidationError } from 'yup';
import { spaceMono } from '@/styles/fonts'; 

// ─── Neumorphism Style Constants ───────────────────────────────────────────────
const neu = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl shadow-[8px_8px_18px_#c8c6c4,-8px_-8px_18px_#ffffff]',
  cardInner: 'bg-[#E7E5E4] rounded-xl shadow-[inset_4px_4px_9px_#c8c6c4,inset_-4px_-4px_9px_#ffffff]',
  sectionBox: 'bg-[#E7E5E4] rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff]',
  iconBox: 'bg-[#E7E5E4] rounded-xl p-2.5 shadow-[4px_4px_8px_#c8c6c4,-4px_-4px_8px_#ffffff] flex items-center justify-center',
  iconBoxRed: 'bg-[#E7E5E4] rounded-xl p-2.5 shadow-[4px_4px_8px_#c8c6c4,-4px_-4px_8px_#ffffff] flex items-center justify-center',
  checkboxRow: 'bg-[#E7E5E4] rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] flex items-center gap-3 px-4 py-3 cursor-pointer select-none transition-all duration-200',
  badge: 'bg-[#E7E5E4] text-[#006666] border border-[#006666]/25 rounded-lg px-3 py-1 text-xs font-[Space_Mono] shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff] inline-flex items-center gap-1.5',
  btn: 'bg-[#006666] text-white rounded-xl shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[6px_6px_14px_#c8c6c4,-6px_-6px_14px_#ffffff] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2)] transition-all duration-200',
  btnDisabled: 'opacity-50 cursor-not-allowed bg-[#888780] rounded-xl shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff]',
  label: 'text-[#1E2938] font-medium text-sm font-[Space_Mono] flex items-center gap-1.5',
  headingFont: 'font-[Space_Mono] font-semibold tracking-tight text-[#1E2938]',
  subText: 'text-[#5a6270] text-sm font-[Space_Mono]',
  inputOverride: 'font-[Space_Mono] text-sm rounded-xl bg-[#E7E5E4] border-0 shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] focus:ring-1 focus:ring-[#006666] focus:shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] outline-none placeholder:text-[#888780]',
  alertError: 'bg-[#E7E5E4] border border-[#FF2157]/30 rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] flex items-center gap-3 px-4 py-3',
  alertSuccess: 'bg-[#E7E5E4] border border-[#00A63D]/30 rounded-xl shadow-[inset_3px_3px_7px_#c8c6c4,inset_-3px_-3px_7px_#ffffff] flex items-center gap-3 px-4 py-3',
  divider: 'border-t border-[#c8c6c4]/70 my-6',
  errorText: 'text-xs text-[#FF2157] font-[Space_Mono] flex items-center gap-1 mt-1.5',
};

interface Step1BangladeshInfoProps {
  tourId: string;
  initialData: UpdateTourBangladeshFieldsDTO;
}

type ComboBoxOption = { label: string; value: string };

export default function Step1BangladeshInfo({ tourId, initialData }: Step1BangladeshInfoProps) {
  const queryClient = useQueryClient();
  const [districtOptions, setDistrictOptions] = useState<ComboBoxOption[]>([]);

  const tourTypeOptions: ComboBoxOption[] = Object.values(TRAVEL_TYPE).map(t => ({ label: t, value: t }));
  const divisionOptions: ComboBoxOption[] = Object.values(DIVISION).map(d => ({ label: d, value: d }));
  const accommodationTypeOptions: ComboBoxOption[] = Object.values(ACCOMMODATION_TYPE).map(a => ({ label: a, value: a }));

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
        policeNumber: '', ambulanceNumber: '', fireServiceNumber: '', localEmergency: '',
      },
    },
    validationSchema: Step1BangladeshSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await Step1BangladeshSchema.validate(values, { abortEarly: false });
        mutation.mutate(values);
      } catch (error) {
        if (error instanceof ValidationError) {
          const errors: { [key: string]: string } = {};
          error.inner.forEach((err) => { if (err.path) errors[err.path] = err.message; });
          formik.setErrors(errors);
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (formik.values.division) {
      const districts = getDistrictsByDivision(formik.values.division as Division);
      setDistrictOptions(districts.map(d => ({ label: d, value: d })));
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
      setDistrictOptions(districts.map(d => ({ label: d, value: d })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };
  const alertVariants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`w-full ${spaceMono.className}`}>

      <div className={`${neu.card} p-1 w-full`}>
        {/* ─── Header ─── */}
        <div className="px-6 md:px-8 pt-6 md:pt-8 pb-5 border-b border-[#c8c6c4]/60">
          <div className="flex items-center gap-3">
            <div className={`${neu.iconBox}`}>
              <Map className="text-[#006666]" size={22} />
            </div>
            <div>
              <h2 className={`${neu.headingFont} text-lg`}>Bangladesh Specific Information</h2>
              <p className={neu.subText}>Location, services, and emergency contacts</p>
            </div>
          </div>
        </div>

        <div className="px-6 md:px-8 py-6 md:py-8">
          <form onSubmit={formik.handleSubmit}>
            {/* ─── Main Grid ─── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Tour Type */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className={neu.label}>
                  <MapPin size={14} className="text-[#5a6270]" />
                  Tour Type <span className="text-[#FF2157]">*</span>
                </label>
                <ComboBox
                  options={tourTypeOptions}
                  value={formik.values.tourType}
                  placeholder="Select tour type"
                  onChange={(value) => formik.setFieldValue('tourType', value)}
                />
                {formik.touched.tourType && formik.errors.tourType && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={neu.errorText}>
                    <AlertCircle size={11} />{formik.errors.tourType}
                  </motion.p>
                )}
              </motion.div>

              {/* Division */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className={neu.label}>
                  <Map size={14} className="text-[#5a6270]" />
                  Division <span className="text-[#FF2157]">*</span>
                </label>
                <ComboBox
                  options={divisionOptions}
                  value={formik.values.division}
                  placeholder="Select division"
                  onChange={(value) => formik.setFieldValue('division', value)}
                />
                {formik.touched.division && formik.errors.division && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={neu.errorText}>
                    <AlertCircle size={11} />{formik.errors.division}
                  </motion.p>
                )}
              </motion.div>

              {/* District */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className={neu.label}>
                  <MapPin size={14} className="text-[#5a6270]" />
                  District <span className="text-[#FF2157]">*</span>
                </label>
                <ComboBox
                  options={districtOptions}
                  value={formik.values.district}
                  placeholder={formik.values.division ? 'Select district' : 'Select division first'}
                  onChange={(value) => formik.setFieldValue('district', value)}
                  disabled={!formik.values.division}
                />
                {formik.touched.district && formik.errors.district && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={neu.errorText}>
                    <AlertCircle size={11} />{formik.errors.district}
                  </motion.p>
                )}
              </motion.div>

              {/* Accommodation Type */}
              <motion.div variants={itemVariants} className="flex flex-col gap-2">
                <label className={neu.label}>
                  <Building2 size={14} className="text-[#5a6270]" />
                  Accommodation Types
                </label>
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
                    className="flex flex-wrap gap-2 mt-1"
                  >
                    {formik.values.accommodationType.map((type, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <span className={neu.badge}>
                          {type}
                          <button
                            type="button"
                            onClick={() => formik.setFieldValue('accommodationType',
                              formik.values.accommodationType.filter(t => t !== type))}
                            className="hover:text-[#FF2157] transition-colors ml-0.5"
                            aria-label={`Remove ${type}`}
                          >
                            <X size={11} />
                          </button>
                        </span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </motion.div>

              {/* Guide Included */}
              <motion.div variants={itemVariants}>
                <div
                  className={`${neu.checkboxRow} ${formik.values.guideIncluded ? 'ring-1 ring-[#006666]/30' : ''}`}
                  onClick={() => formik.setFieldValue('guideIncluded', !formik.values.guideIncluded)}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0
                    ${formik.values.guideIncluded
                      ? 'bg-[#006666] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'
                      : 'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]'}`}
                  >
                    {formik.values.guideIncluded && <CheckCircle2 size={13} className="text-white" />}
                  </div>
                  <Users size={16} className="text-[#5a6270] shrink-0" />
                  <span className="text-[#1E2938] text-sm font-[Space_Mono]">Guide Included</span>
                </div>
              </motion.div>

              {/* Transport Included */}
              <motion.div variants={itemVariants}>
                <div
                  className={`${neu.checkboxRow} ${formik.values.transportIncluded ? 'ring-1 ring-[#006666]/30' : ''}`}
                  onClick={() => formik.setFieldValue('transportIncluded', !formik.values.transportIncluded)}
                >
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 shrink-0
                    ${formik.values.transportIncluded
                      ? 'bg-[#006666] shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]'
                      : 'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]'}`}
                  >
                    {formik.values.transportIncluded && <CheckCircle2 size={13} className="text-white" />}
                  </div>
                  <Car size={16} className="text-[#5a6270] shrink-0" />
                  <span className="text-[#1E2938] text-sm font-[Space_Mono]">Transport Included</span>
                </div>
              </motion.div>
            </div>

            {/* ─── Emergency Contacts ─── */}
            <motion.div variants={itemVariants} className="mt-8">
              <div className={neu.divider} />
              <div className="flex items-center gap-3 mb-6">
                <div className={`${neu.iconBoxRed}`}>
                  <Shield size={18} className="text-[#FF2157]" />
                </div>
                <div>
                  <h3 className={`${neu.headingFont} text-base`}>Emergency Contacts</h3>
                  <p className={`${neu.subText} text-xs`}>Local safety numbers for travelers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'emergencyContacts.policeNumber', icon: Shield, label: 'Police Number', placeholder: '999' },
                  { name: 'emergencyContacts.ambulanceNumber', icon: Ambulance, label: 'Ambulance Number', placeholder: '16263' },
                  { name: 'emergencyContacts.fireServiceNumber', icon: Flame, label: 'Fire Service', placeholder: '102' },
                  { name: 'emergencyContacts.localEmergency', icon: Phone, label: 'Local Emergency', placeholder: 'Local contact' },
                ].map(({ name, icon: Icon, label, placeholder }) => (
                  <motion.div key={name} variants={itemVariants} className="flex flex-col gap-2">
                    <label className={neu.label}>
                      <Icon size={13} className="text-[#5a6270]" />
                      {label}
                    </label>
                    <input
                      name={name}
                      value={(formik.values as Record<string, unknown>)[name.split('.')[0]]
                        ? (formik.values.emergencyContacts as Record<string, string>)[name.split('.')[1]]
                        : ''}
                      onChange={formik.handleChange}
                      placeholder={placeholder}
                      className={`${neu.inputOverride} w-full px-3 py-2.5`}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* ─── Alerts ─── */}
            <AnimatePresence mode="wait">
              {mutation.isError && (
                <motion.div key="error" variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="mt-6">
                  <div className={neu.alertError}>
                    <AlertCircle size={17} className="text-[#FF2157] shrink-0" />
                    <span className="text-[#FF2157] text-sm font-[Space_Mono] flex-1">Failed to update Bangladesh information</span>
                    <button type="button" onClick={() => mutation.reset()} className="text-[#FF2157] hover:opacity-70">
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
              {mutation.isSuccess && (
                <motion.div key="success" variants={alertVariants} initial="hidden" animate="visible" exit="exit" className="mt-6">
                  <div className={neu.alertSuccess}>
                    <CheckCircle2 size={17} className="text-[#00A63D] shrink-0" />
                    <span className="text-[#00A63D] text-sm font-[Space_Mono] flex-1">Bangladesh information updated successfully</span>
                    <button type="button" onClick={() => mutation.reset()} className="text-[#00A63D] hover:opacity-70">
                      <X size={15} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ─── Submit ─── */}
            <div className="flex justify-end mt-8 pt-6 border-t border-[#c8c6c4]/60">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`inline-flex items-center gap-2 px-7 py-3 text-sm font-[Space_Mono] font-medium text-white ${mutation.isPending ? neu.btnDisabled : neu.btn}`}
                >
                  {mutation.isPending ? (
                    <><Loader2 size={16} className="animate-spin" /><span>Updating...</span></>
                  ) : (
                    <><CheckCircle2 size={16} /><span>Update Bangladesh Info</span></>
                  )}
                </button>
              </motion.div>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}