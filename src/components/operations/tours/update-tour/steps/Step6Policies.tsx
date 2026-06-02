'use client';

import React from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourPoliciesDTO, CancellationRuleDTO } from '@/types/tour/tour.types';
import { PAYMENT_METHOD, PaymentMethod } from '@/constants/tour/tour.const';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step6PolicySchema } from '@/utils/validators/tour/add-tour.validator';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  Percent,
  CreditCard,
  Clock,
  FileText,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toBooleanChecked } from '@/components/operations/tours/shared/NeuCheckboxIndicator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ValidationError } from 'yup';
import { FaBangladeshiTakaSign } from 'react-icons/fa6';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const NEU = {
  surface: 'bg-[#E7E5E4]',
  card: 'bg-[#E7E5E4] rounded-2xl shadow-[6px_6px_14px_#c8c6c4,-6px_-6px_14px_#ffffff]',
  cardInner: 'bg-[#E7E5E4] rounded-xl shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff]',
  raised: 'bg-[#E7E5E4] rounded-xl shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff]',
  iconBox: 'rounded-xl shadow-[3px_3px_8px_#c8c6c4,-3px_-3px_8px_#ffffff] flex items-center justify-center bg-[#E7E5E4]',
  primaryText: 'text-[#1E2938]',
  secondaryText: 'text-[#4a5568]',
  mutedText: 'text-[#718096]',
  primaryBg: 'bg-[#006666]',
  primaryColor: '#006666',
  inputBase: 'bg-[#E7E5E4] shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff] border-0 rounded-xl focus:ring-2 focus:ring-[#006666]/30 outline-none transition-all duration-200',
  labelFont: 'font-[Space_Mono,monospace] tracking-wide',
  bodyFont: 'font-[JetBrains_Mono,monospace]',
  btnPrimary: 'bg-[#E7E5E4] shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_6px_#c8c6c4,-2px_-2px_6px_#ffffff] active:shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff] transition-all duration-200 rounded-xl',
  btnSubmit: 'bg-[#006666] text-white rounded-xl shadow-[4px_4px_10px_#004d4d,-4px_-4px_10px_#008080] hover:shadow-[2px_2px_6px_#004d4d,-2px_-2px_6px_#008080] active:shadow-[inset_2px_2px_6px_#004d4d,inset_-2px_-2px_6px_#008080] transition-all duration-200',
  btnDanger: 'text-red-500 bg-[#E7E5E4] rounded-lg shadow-[3px_3px_7px_#c8c6c4,-3px_-3px_7px_#ffffff] hover:shadow-[1px_1px_4px_#c8c6c4,-1px_-1px_4px_#ffffff] active:shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff] transition-all duration-200',
  divider: 'border-t border-[#d1cfcd]',
  badge: 'bg-[#E7E5E4] shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff] border-0 text-xs rounded-md px-2.5 py-0.5',
  infoBox: 'rounded-lg shadow-[inset_2px_2px_5px_#c8c6c4,inset_-2px_-2px_5px_#ffffff]',
};

interface Step6PoliciesProps {
  tourId: string;
  initialData: UpdateTourPoliciesDTO;
}

export default function Step6Policies({ tourId, initialData }: Step6PoliciesProps) {
  const queryClient = useQueryClient();
  const [isCancellationOpen, setIsCancellationOpen] = React.useState(true);
  const [isRefundOpen, setIsRefundOpen] = React.useState(false);

  const mutation = useMutation({
    mutationFn: (data: UpdateTourPoliciesDTO) =>
      tourUpdateService.updatePolicies(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
    },
  });

  const formik = useFormik<UpdateTourPoliciesDTO>({
    initialValues: {
      cancellationPolicy: initialData.cancellationPolicy ?? {
        refundable: true,
        rules: [{ daysBefore: 0, refundPercent: 0 }],
      },
      refundPolicy: initialData.refundPolicy || {
        method: [PAYMENT_METHOD.BKASH],
        processingDays: 7,
      },
      terms: initialData.terms || '',
    },
    validationSchema: Step6PolicySchema,
    onSubmit: async (values) => {
      try {
        await Step6PolicySchema.validate(values, { abortEarly: false });
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

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  const addCancellationRule = () => {
    const rules = [...(formik.values.cancellationPolicy?.rules || [])];
    const last = rules[rules.length - 1];
    rules.push({
      daysBefore: last ? last.daysBefore + 7 : 0,
      refundPercent: last ? Math.max(last.refundPercent - 20, 0) : 100,
    });
    formik.setFieldValue('cancellationPolicy.rules', rules);
  };

  const removeCancellationRule = (index: number) => {
    const rules = [...(formik.values.cancellationPolicy?.rules || [])];
    rules.splice(index, 1);
    formik.setFieldValue('cancellationPolicy.rules', rules);
  };

  const updateCancellationRule = (index: number, field: keyof CancellationRuleDTO, value: unknown) => {
    const rules = [...(formik.values.cancellationPolicy?.rules || [])];
    rules[index] = { ...rules[index], [field]: value };
    formik.setFieldValue('cancellationPolicy.rules', rules);
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = formik.values.refundPolicy?.method || [];
    const next = current.includes(method)
      ? current.filter((m) => m !== method)
      : [...current, method];
    formik.setFieldValue('refundPolicy.method', next);
  };

  // ─── Animation Variants ──────────────────────────────────────────────────────
  const containerVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -16 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };
  const ruleVariants = {
    hidden: { opacity: 0, height: 0, scale: 0.96 },
    visible: { opacity: 1, height: 'auto', scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, height: 0, scale: 0.96, transition: { duration: 0.2 } },
  };
  const alertVariants = {
    hidden: { opacity: 0, scale: 0.96, y: -8 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.96, y: -8, transition: { duration: 0.2 } },
  };

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
          <div className={`${NEU.iconBox} w-12 h-12 sm:w-14 sm:h-14`}>
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" style={{ color: '#006666' }} />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
              Policies & Terms
            </h2>
            <p className={`text-sm mt-0.5 ${NEU.mutedText} ${NEU.bodyFont}`}>
              Cancellation rules, refund methods, and tour terms
            </p>
          </div>
        </motion.div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">

          {/* ── Cancellation Policy ──────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Collapsible open={isCancellationOpen} onOpenChange={setIsCancellationOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 outline-none
                    ${isCancellationOpen
                      ? 'shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff]'
                      : 'shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_6px_#c8c6c4,-2px_-2px_6px_#ffffff]'
                    } bg-[#E7E5E4]`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${NEU.iconBox} w-9 h-9`}>
                      <Calendar className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                        Cancellation Policy
                      </p>
                      <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                        Define refund rules and conditions
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isCancellationOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className={`h-5 w-5 ${NEU.mutedText}`} />
                  </motion.div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className={`mt-3 ${NEU.cardInner} p-5 space-y-5`}
                >
                  {/* Refundable Toggle */}
                  <div className={`${NEU.raised} flex items-center justify-between p-4 gap-3`}>
                    <div className="flex items-center gap-3">
                      <FaBangladeshiTakaSign className="h-5 w-5 text-[#006666]" />
                      <div>
                        <p className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                          Refundable Tour
                        </p>
                        <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                          Allow customers to request refunds
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={formik.values.cancellationPolicy?.refundable ?? true}
                      onCheckedChange={(checked) =>
                        formik.setFieldValue(
                          'cancellationPolicy.refundable',
                          toBooleanChecked(checked)
                        )
                      }
                      className="data-[state=checked]:bg-[#006666]"
                    />
                  </div>

                  {/* Rules Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Percent className={`h-4 w-4 ${NEU.mutedText}`} />
                      <Label className={`text-sm font-bold ${NEU.secondaryText} ${NEU.labelFont}`}>
                        Cancellation Rules
                      </Label>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={addCancellationRule}
                      className={`${NEU.btnPrimary} flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#006666] ${NEU.labelFont}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Rule
                    </motion.button>
                  </div>

                  {/* Rules List */}
                  <AnimatePresence mode="popLayout">
                    {formik.values.cancellationPolicy?.rules?.map((rule, index) => (
                      <motion.div
                        key={index}
                        variants={ruleVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        layout
                        className={`${NEU.raised} p-4 space-y-3`}
                      >
                        <div className="flex items-center justify-between">
                          <Badge className={`${NEU.badge} ${NEU.labelFont} ${NEU.secondaryText} text-[10px]`}>
                            Rule {index + 1}
                          </Badge>
                          {(formik.values.cancellationPolicy?.rules?.length ?? 0) > 1 && (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeCancellationRule(index)}
                              className={`${NEU.btnDanger} h-7 w-7 flex items-center justify-center`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </motion.button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className={`text-xs font-bold ${NEU.mutedText} ${NEU.labelFont} flex items-center gap-1`}>
                              <Calendar className="h-3 w-3" /> Days Before
                            </Label>
                            <Input
                              type="number"
                              value={rule.daysBefore}
                              onChange={(e) =>
                                updateCancellationRule(index, 'daysBefore', parseInt(e.target.value))
                              }
                              min={0}
                              className={`${NEU.inputBase} h-10 px-3 text-sm w-full ${NEU.primaryText} ${NEU.bodyFont}`}
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className={`text-xs font-bold ${NEU.mutedText} ${NEU.labelFont} flex items-center gap-1`}>
                              <Percent className="h-3 w-3" /> Refund %
                            </Label>
                            <div className="relative">
                              <Input
                                type="number"
                                value={rule.refundPercent}
                                onChange={(e) =>
                                  updateCancellationRule(index, 'refundPercent', parseInt(e.target.value))
                                }
                                min={0}
                                max={100}
                                className={`${NEU.inputBase} h-10 px-3 pr-7 text-sm w-full ${NEU.primaryText} ${NEU.bodyFont}`}
                              />
                              <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${NEU.mutedText}`}>%</span>
                            </div>
                          </div>
                        </div>

                        <div className={`${NEU.infoBox} px-3 py-2 flex items-center gap-2`} style={{ background: '#e0f0f0' }}>
                          <Info className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#006666' }} />
                          <p className={`text-xs ${NEU.bodyFont}`} style={{ color: '#006666' }}>
                            Cancel {rule.daysBefore}+ days before → {rule.refundPercent}% refund
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>

          {/* ── Refund Policy ────────────────────────────────────────────── */}
          <motion.div variants={itemVariants}>
            <Collapsible open={isRefundOpen} onOpenChange={setIsRefundOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-200 outline-none bg-[#E7E5E4]
                    ${isRefundOpen
                      ? 'shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff]'
                      : 'shadow-[4px_4px_10px_#c8c6c4,-4px_-4px_10px_#ffffff] hover:shadow-[2px_2px_6px_#c8c6c4,-2px_-2px_6px_#ffffff]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`${NEU.iconBox} w-9 h-9`}>
                      <CreditCard className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                        Refund Policy
                      </p>
                      <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                        Payment methods and processing time
                      </p>
                    </div>
                  </div>
                  <motion.div
                    animate={{ rotate: isRefundOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ChevronDown className={`h-5 w-5 ${NEU.mutedText}`} />
                  </motion.div>
                </button>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.08 }}
                  className={`mt-3 ${NEU.cardInner} p-5 space-y-5`}
                >
                  {/* Payment Methods */}
                  <div className="space-y-3">
                    <Label className={`text-xs font-bold ${NEU.secondaryText} ${NEU.labelFont} uppercase tracking-wider flex items-center gap-2`}>
                      <CreditCard className="h-3.5 w-3.5" /> Refund Methods
                    </Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.values([PAYMENT_METHOD.CARD]).map((method) => {
                        const isSelected = formik.values.refundPolicy?.method?.includes(method);
                        return (
                          <motion.button
                            key={method}
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => togglePaymentMethod(method)}
                            className={`p-3 rounded-xl transition-all duration-200 outline-none flex items-center gap-2 bg-[#E7E5E4]
                              ${isSelected
                                ? 'shadow-[inset_3px_3px_8px_#c8c6c4,inset_-3px_-3px_8px_#ffffff] ring-2 ring-purple-400/50'
                                : 'shadow-[3px_3px_8px_#c8c6c4,-3px_-3px_8px_#ffffff] hover:shadow-[2px_2px_5px_#c8c6c4,-2px_-2px_5px_#ffffff]'
                              }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${isSelected
                                  ? 'bg-purple-500 shadow-[inset_1px_1px_3px_rgba(0,0,0,0.15)]'
                                  : 'shadow-[2px_2px_4px_#c8c6c4,-2px_-2px_4px_#ffffff] bg-[#E7E5E4]'
                                }`}
                            >
                              {isSelected && (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                  className="w-2 h-2 rounded-full bg-white"
                                />
                              )}
                            </div>
                            <span className={`text-sm font-bold ${isSelected ? 'text-purple-700' : NEU.secondaryText} ${NEU.labelFont}`}>
                              {method}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Processing Days */}
                  <div className="space-y-2">
                    <Label className={`text-xs font-bold ${NEU.secondaryText} ${NEU.labelFont} uppercase tracking-wider flex items-center gap-2`}>
                      <Clock className="h-3.5 w-3.5" /> Processing Days
                    </Label>
                    <Input
                      type="number"
                      value={formik.values.refundPolicy?.processingDays || 0}
                      onChange={(e) =>
                        formik.setFieldValue('refundPolicy.processingDays', parseInt(e.target.value))
                      }
                      min={1}
                      placeholder="7"
                      className={`${NEU.inputBase} h-11 px-4 text-sm w-full ${NEU.primaryText} ${NEU.bodyFont}`}
                    />
                    <p className={`text-xs ${NEU.mutedText} flex items-center gap-1.5 ${NEU.bodyFont}`}>
                      <Info className="h-3.5 w-3.5 flex-shrink-0" />
                      Estimated business days to process a refund request
                    </p>
                  </div>
                </motion.div>
              </CollapsibleContent>
            </Collapsible>
          </motion.div>

          {/* ── Terms & Conditions ───────────────────────────────────────── */}
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={`${NEU.iconBox} w-9 h-9`}>
                <FileText className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <Label className={`text-sm font-bold ${NEU.primaryText} ${NEU.labelFont}`}>
                  Terms & Conditions
                </Label>
                <p className={`text-xs ${NEU.mutedText} ${NEU.bodyFont}`}>
                  Detailed terms for this tour
                </p>
              </div>
            </div>
            <Textarea
              name="terms"
              value={formik.values.terms}
              onChange={formik.handleChange}
              placeholder="Enter detailed terms and conditions for this tour..."
              rows={10}
              className={`${NEU.inputBase} w-full p-4 text-sm resize-none ${NEU.primaryText} ${NEU.bodyFont}`}
            />
            {formik.touched.terms && formik.errors.terms && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-xs text-red-600 flex items-center gap-1 ${NEU.bodyFont}`}
              >
                <AlertCircle className="h-3 w-3" />
                {formik.errors.terms}
              </motion.p>
            )}
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
                    Failed to update policies
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
                    Policies updated successfully
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
                className={`${NEU.btnSubmit} h-12 px-7 text-sm gap-2 font-semibold disabled:opacity-60`}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className={NEU.labelFont}>Updating…</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span className={NEU.labelFont}>Update Policies</span>
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