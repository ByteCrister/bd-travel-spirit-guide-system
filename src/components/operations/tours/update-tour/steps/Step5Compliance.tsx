'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourComplianceDTO } from '@/types/tour/tour.types';
import { AGE_SUITABILITY } from '@/constants/tour/tour.const';
import { Step5ComplianceSchema } from '@/utils/validators/tour/add-tour.validator';
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
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toBooleanChecked } from '@/components/operations/tours/shared/NeuCheckboxIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ValidationError } from 'yup';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NEU = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl ',
  cardInner: 'bg-[#E7E5E4] rounded-xl ',
  raised: 'bg-[#E7E5E4] rounded-xl ',
  pressed: '',
  iconBox: 'rounded-xl  flex items-center justify-center',
  primaryText: 'text-[#1E2938]',
  secondaryText: 'text-[#4a5568]',
  mutedText: 'text-[#718096]',
  primary: '#006666',
  primaryBg: 'bg-[#006666]',
  primaryText2: 'text-[#006666]',
  border: 'border border-[#d1cfcd]',
  inputBase: 'bg-[#E7E5E4]  border-0 rounded-xl focus:ring-2 focus:ring-[#006666]/30 outline-none transition-all duration-200',
  labelFont: 'font-[Space_Mono,monospace] tracking-wide',
  bodyFont: 'font-[JetBrains_Mono,monospace]',
  btnPrimary: 'bg-[#E7E5E4]  hover: active: transition-all duration-200 rounded-xl text-[#006666] font-semibold',
  btnSubmit: 'bg-[#006666] text-white rounded-xl  hover: active: transition-all duration-200 font-semibold',
  badge: 'rounded-lg ',
  divider: 'border-t border-[#d1cfcd]',
};

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
        await Step5ComplianceSchema.validate(values, { abortEarly: false });
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

  const updateAccessibility = (field: string, value: unknown) => {
    formik.setFieldValue(`accessibility.${field}`, value);
  };

  // ─── Animation Variants ─────────────────────────────────────────────────────
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.1 } },
  };
  const itemVariants: Variants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };
  const alertVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } },
  };

  // ─── Accessibility Tile Config ───────────────────────────────────────────────
  const accessibilityTiles = [
    {
      key: 'wheelchair',
      label: 'Wheelchair',
      sub: 'Accessible',
      icon: PersonStanding,
      active: formik.values.accessibility?.wheelchair,
      activeColor: 'text-[#006666]',
      activeBg: 'bg-[#e0f0f0]',
      activeBorder: 'ring-2 ring-[#006666]/50',
    },
    {
      key: 'familyFriendly',
      label: 'Family',
      sub: 'Friendly',
      icon: Baby,
      active: formik.values.accessibility?.familyFriendly,
      activeColor: 'text-[#b83280]',
      activeBg: 'bg-[#fce7f3]',
      activeBorder: 'ring-2 ring-[#b83280]/40',
    },
    {
      key: 'petFriendly',
      label: 'Pet',
      sub: 'Friendly',
      icon: PawPrint,
      active: formik.values.accessibility?.petFriendly,
      activeColor: 'text-[#b45309]',
      activeBg: 'bg-[#fef3c7]',
      activeBorder: 'ring-2 ring-[#b45309]/40',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`${NEU.surface} min-h-screen p-4 sm:p-6`}
    >
      <div className={`${NEU.card} p-6 sm:p-8 mx-auto w-full`}>

        {/* ── Header ───────────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
          <div
            className={`${NEU.iconBox} w-12 h-12 sm:w-14 sm:h-14`}
            style={{ background: '#E7E5E4' }}
          >
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#006666' }} />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
              Compliance & Accessibility
            </h2>
            <p className={`text-sm mt-0.5 ${NEU.mutedText} ${NEU.bodyFont}`}>
              Set tour requirements and accessibility options
            </p>
          </div>
        </motion.div>

        <form onSubmit={formik.handleSubmit} className="space-y-7">

          {/* ── License Required ─────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <div className={`${NEU.cardInner} p-5`}>
              <div className="flex items-start gap-4">
                <div className={`${NEU.iconBox} w-11 h-11 flex-shrink-0`} style={{ background: '#E7E5E4' }}>
                  <FileCheck className="w-5 h-5" style={{ color: '#006666' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                        License Requirement
                      </p>
                      <p className={`text-xs mt-0.5 ${NEU.mutedText} ${NEU.bodyFont}`}>
                        Does this tour require a special license?
                      </p>
                    </div>
                    <Checkbox
                      id="licenseRequired"
                      checked={!!formik.values.licenseRequired}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue('licenseRequired', toBooleanChecked(checked))
                      }
                      className="mt-0.5 h-5 w-5 rounded-md border-[#006666]/40 data-[state=checked]:bg-[#006666] data-[state=checked]:border-[#006666]"
                    />
                  </div>

                  <AnimatePresence>
                    {formik.values.licenseRequired && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 overflow-hidden"
                      >
                        <div className={`${NEU.badge} px-3 py-2.5 flex items-start gap-2`} style={{ background: '#e0f0f0' }}>
                          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#006666' }} />
                          <p className={`text-xs ${NEU.bodyFont}`} style={{ color: '#006666' }}>
                            Participants will be notified that a valid license is required for this tour.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Age Suitability ──────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`${NEU.iconBox} w-9 h-9`} style={{ background: '#E7E5E4' }}>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <Label className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                  Age Suitability
                </Label>
                <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                  Who is this tour appropriate for?
                </p>
              </div>
            </div>

            <Select
              value={formik.values.ageSuitability}
              onValueChange={(value) => formik.setFieldValue('ageSuitability', value)}
            >
              <SelectTrigger
                className={`${NEU.inputBase} h-12 px-4 w-full text-sm ${NEU.primaryText} ${NEU.bodyFont}`}
              >
                <SelectValue placeholder="Select age suitability" />
              </SelectTrigger>
              <SelectContent className={`${NEU.raised} border-0 ${NEU.bodyFont}`}>
                {Object.values(AGE_SUITABILITY).map((age) => (
                  <SelectItem
                    key={age}
                    value={age}
                    className={`text-sm ${NEU.primaryText} hover:bg-[#d8d6d4] rounded-lg cursor-pointer`}
                  >
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-[#006666]" />
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
                className={`text-xs text-red-600 flex items-center gap-1 ${NEU.bodyFont}`}
              >
                <AlertCircle className="h-3 w-3" />
                {formik.errors.ageSuitability}
              </motion.p>
            )}
          </motion.div>

          {/* ── Accessibility Features ───────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`${NEU.iconBox} w-9 h-9`} style={{ background: '#E7E5E4' }}>
                <PersonStanding className="w-4 h-4 text-[#006666]" />
              </div>
              <div>
                <Label className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                  Accessibility Features
                </Label>
                <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                  Specify accessibility options and amenities
                </p>
              </div>
            </div>

            {/* Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {accessibilityTiles.map(({ key, label, sub, icon: Icon, active, activeColor, activeBg, activeBorder }) => (
                <motion.button
                  key={key}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => updateAccessibility(key, !formik.values.accessibility?.[key as keyof typeof formik.values.accessibility])}
                  className={`
                    ${NEU.surface} p-4 rounded-xl transition-all duration-200 outline-none
                    ${active
                      ? ` ${activeBorder}`
                      : ' hover:'
                    }
                  `}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className={`p-2.5 rounded-lg ${active ? activeBg : 'bg-[#ddd9d7]'}`}>
                      <Icon className={`h-6 w-6 ${active ? activeColor : NEU.mutedText}`} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${active ? activeColor : NEU.primaryText} ${NEU.labelFont}`}>
                        {label}
                      </p>
                      <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>{sub}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        active
                          ? ''
                          : ''
                      }`}
                      style={{ background: active ? '#006666' : '#E7E5E4' }}
                    >
                      {active && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2 pt-1">
              <Label className={`text-xs font-bold ${NEU.secondaryText} ${NEU.labelFont} uppercase tracking-wider`}>
                Additional Accessibility Notes
              </Label>
              <Textarea
                value={formik.values.accessibility?.notes || ''}
                onChange={(e) => updateAccessibility('notes', e.target.value)}
                placeholder="Describe ramps, elevators, accessible restrooms, parking, or other relevant details..."
                rows={4}
                className={`${NEU.inputBase} w-full p-4 text-sm resize-none ${NEU.primaryText} ${NEU.bodyFont} placeholder:${NEU.mutedText}`}
              />
              <p className={`text-xs ${NEU.mutedText} flex items-center gap-1.5 ${NEU.bodyFont}`}>
                <Info className="h-3.5 w-3.5 flex-shrink-0" />
                Provide details that help participants plan appropriately
              </p>
            </div>
          </motion.div>

          {/* ── Alerts ───────────────────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {mutation.isError && (
              <motion.div key="error" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                <Alert
                  variant="destructive"
                  className={`${NEU.cardInner} border-0 bg-red-50 relative`}
                >
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className={`text-red-800 text-sm ${NEU.bodyFont}`}>
                    Failed to update compliance & accessibility information
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-7 w-7 p-0 text-red-500 hover:bg-red-100 rounded-lg"
                    onClick={() => mutation.reset()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              </motion.div>
            )}
            {mutation.isSuccess && (
              <motion.div key="success" variants={alertVariants} initial="hidden" animate="visible" exit="exit">
                <Alert className={`${NEU.cardInner} border-0 bg-green-50 relative`}>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className={`text-green-800 text-sm ${NEU.bodyFont}`}>
                    Compliance & accessibility information updated successfully
                  </AlertDescription>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 h-7 w-7 p-0 text-green-600 hover:bg-green-100 rounded-lg"
                    onClick={() => mutation.reset()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Submit ───────────────────────────────────────────────────── */}
          <motion.div variants={itemVariants} className={`flex justify-end pt-5 ${NEU.divider}`}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                disabled={mutation.isPending}
                className={`${NEU.btnSubmit} h-12 px-7 text-sm gap-2 disabled:opacity-60`}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className={NEU.labelFont}>Updating…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className={NEU.labelFont}>Update Compliance</span>
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}