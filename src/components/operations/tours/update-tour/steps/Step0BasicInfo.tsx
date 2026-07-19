// app/operations/tours/[tourId]/update-tour/components/steps/Step0BasicInfo.tsx
'use client';

import { useFormik } from 'formik';
import {
  TextField,
  Chip,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourBasicInfoDTO } from '@/types/tour/tour.types';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step0BasicInfoSchema } from '@/utils/validators/tour/add-tour.validator';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { FileText, Tag, Search, CheckCircle2, AlertCircle, SaveIcon } from 'lucide-react';
import { ValidationError } from 'yup';
import { spaceMono } from '@/styles/fonts';

// ─── Neumorphism Style Constants ───────────────────────────────────────────────
const neu = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl ',
  cardInner: 'bg-[#E7E5E4] rounded-xl ',
  inputWrap: 'bg-[#E7E5E4] rounded-xl ',
  btn: 'bg-[#006666] text-white rounded-xl  hover: active: transition-all duration-200',
  btnDisabled: 'opacity-50 cursor-not-allowed ',
  iconBox: 'bg-[#E7E5E4] rounded-xl p-2.5  flex items-center justify-center',
  label: 'text-[#1E2938] font-medium text-sm font-[Space_Mono]',
  headingFont: 'font-[Space_Mono] font-semibold tracking-tight text-[#1E2938]',
  subText: 'text-[#5a6270] text-sm font-[Space_Mono]',
  chip: 'bg-[#E7E5E4] text-[#006666] rounded-lg  border border-[#006666]/20',
  alertError: 'bg-[#E7E5E4] border border-[#FF2157]/30 rounded-xl ',
  alertSuccess: 'bg-[#E7E5E4] border border-[#00A63D]/30 rounded-xl ',
  sectionDivider: 'border-t border-[#c8c6c4]/60 my-6',
};

// ─── MUI TextField Override Styles ────────────────────────────────────────────
const neuInputSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: '#E7E5E4',
    boxShadow: 'inset 3px 3px 7px #c8c6c4, inset -3px -3px 7px #ffffff',
    fontFamily: 'Space Mono, monospace',
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: '1.5px solid #006666' },
    '&.Mui-focused': { boxShadow: 'inset 3px 3px 7px #c8c6c4, inset -3px -3px 7px #ffffff' },
  },
  '& .MuiInputLabel-root': {
    fontFamily: 'Space Mono, monospace',
    color: '#5a6270',
    fontSize: '0.85rem',
    '&.Mui-focused': { color: '#006666' },
  },
  '& .MuiFormHelperText-root': {
    fontFamily: 'Space Mono, monospace',
    fontSize: '0.75rem',
  },
};

interface Step0BasicInfoProps {
  tourId: string;
  initialData: UpdateTourBasicInfoDTO;
}

export default function Step0BasicInfo({ tourId, initialData }: Step0BasicInfoProps) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: UpdateTourBasicInfoDTO) =>
      tourUpdateService.updateBasicInfo(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
  });

  const formik = useFormik({
    initialValues: {
      title: initialData.title || '',
      summary: initialData.summary || '',
      seo: {
        metaTitle: initialData.seo?.metaTitle || '',
        metaDescription: initialData.seo?.metaDescription || '',
      },
      tags: initialData.tags || [],
    },
    validationSchema: Step0BasicInfoSchema,
    onSubmit: async (values) => {
      try {
        await Step0BasicInfoSchema.validate(values, { abortEarly: false });
        mutation.mutate(values);
      } catch (error) {
        if (error instanceof ValidationError) {
          const errors: { [key: string]: string } = {};
          error.inner.forEach((err) => {
            if (err.path) errors[err.path] = err.message;
          });
          formik.setErrors(errors);
        }
      }
    },
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const alertVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, y: -8, transition: { duration: 0.2 } },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className={`w-full ${spaceMono.className}`}>
      <div className={`${neu.card} p-1 w-full`}>
        <div className="p-6 md:p-8">

          {/* ─── Header ─── */}
          <div className="flex items-center gap-3 mb-8">
            <div className={neu.iconBox}>
              <FileText size={20} className="text-[#006666]" />
            </div>
            <div>
              <h2 className={`${neu.headingFont} text-lg`}>Basic Information</h2>
              <p className={neu.subText}>Core details for your tour listing</p>
            </div>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <div className="flex flex-col gap-5">

              {/* ─── Tour Title ─── */}
              <motion.div variants={sectionVariants}>
                <label className={`${neu.label} block mb-2 ml-1`}>Tour Title <span className="text-[#FF2157]">*</span></label>
                <TextField
                  name="title"
                  placeholder="Enter tour title..."
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  error={formik.touched.title && Boolean(formik.errors.title)}
                  helperText={formik.touched.title && formik.errors.title}
                  fullWidth
                  sx={neuInputSx}
                />
              </motion.div>

              {/* ─── Summary ─── */}
              <motion.div variants={sectionVariants}>
                <label className={`${neu.label} block mb-2 ml-1`}>Summary</label>
                <TextField
                  name="summary"
                  placeholder="Write a short description..."
                  multiline
                  rows={3}
                  value={formik.values.summary}
                  onChange={formik.handleChange}
                  error={formik.touched.summary && Boolean(formik.errors.summary)}
                  helperText={formik.touched.summary && formik.errors.summary}
                  fullWidth
                  sx={neuInputSx}
                />
              </motion.div>

              {/* ─── SEO Section ─── */}
              <motion.div variants={sectionVariants}>
                <div className={`${neu.cardInner} p-5`}>
                  <div className="flex items-center gap-2 mb-5">
                    <Search size={16} className="text-[#006666]" />
                    <span className={`${neu.headingFont} text-sm`}>SEO Information</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={`${neu.label} block mb-2 ml-1`}>Meta Title</label>
                      <TextField
                        name="seo.metaTitle"
                        placeholder="SEO title for search engines..."
                        value={formik.values.seo.metaTitle}
                        onChange={formik.handleChange}
                        error={formik.touched.seo?.metaTitle && Boolean(formik.errors.seo?.metaTitle)}
                        helperText={formik.touched.seo?.metaTitle && formik.errors.seo?.metaTitle}
                        fullWidth
                        sx={neuInputSx}
                      />
                    </div>
                    <div>
                      <label className={`${neu.label} block mb-2 ml-1`}>Meta Description</label>
                      <TextField
                        name="seo.metaDescription"
                        placeholder="Brief description for search results..."
                        multiline
                        rows={2}
                        value={formik.values.seo.metaDescription}
                        onChange={formik.handleChange}
                        error={formik.touched.seo?.metaDescription && Boolean(formik.errors.seo?.metaDescription)}
                        helperText={formik.touched.seo?.metaDescription && formik.errors.seo?.metaDescription}
                        fullWidth
                        sx={neuInputSx}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ─── Tags ─── */}
              <motion.div variants={sectionVariants}>
                <div className="flex items-center gap-2 mb-2 ml-1">
                  <Tag size={15} className="text-[#5a6270]" />
                  <label className={neu.label}>Tags</label>
                </div>
                <Autocomplete
                  multiple
                  freeSolo
                  options={[]}
                  value={formik.values.tags}
                  onChange={(_, value) => formik.setFieldValue('tags', value)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...tagProps}
                          sx={{
                            borderRadius: '8px',
                            background: '#E7E5E4',
                            color: '#006666',
                            fontFamily: 'Space Mono, monospace',
                            fontSize: '0.78rem',
                            border: '1px solid rgba(0,102,102,0.25)',
                            boxShadow: '2px 2px 5px #c8c6c4, -2px -2px 5px #ffffff',
                            '& .MuiChip-deleteIcon': { color: '#006666' },
                          }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Type and press Enter to add tags..."
                      error={formik.touched.tags && Boolean(formik.errors.tags)}
                      helperText={formik.touched.tags && formik.errors.tags as string}
                      sx={neuInputSx}
                    />
                  )}
                />
              </motion.div>

              {/* ─── Alerts ─── */}
              <AnimatePresence mode="wait">
                {mutation.isError && (
                  <motion.div key="error" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                    <div className={`${neu.alertError} flex items-center gap-3 px-4 py-3`}>
                      <AlertCircle size={18} className="text-[#FF2157] shrink-0" />
                      <span className="text-[#FF2157] text-sm font-[Space_Mono]">Failed to update basic information</span>
                    </div>
                  </motion.div>
                )}
                {mutation.isSuccess && (
                  <motion.div key="success" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                    <div className={`${neu.alertSuccess} flex items-center gap-3 px-4 py-3`}>
                      <CheckCircle2 size={18} className="text-[#00A63D] shrink-0" />
                      <span className="text-[#00A63D] text-sm font-[Space_Mono]">Basic information updated successfully</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── Submit ─── */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className={`
                    inline-flex items-center gap-2 px-6 py-2.5 text-sm
                    font-[Space_Mono] font-medium rounded-xl
                    ${mutation.isPending ? neu.btnDisabled : neu.btn}
                  `}
                >
                  {mutation.isPending ? (
                    <>
                      <CircularProgress size={15} sx={{ color: '#fff' }} />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <SaveIcon size={16} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}