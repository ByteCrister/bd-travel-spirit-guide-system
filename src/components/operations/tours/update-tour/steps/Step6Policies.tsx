// app/operations/tours/[tourId]/update-tour/components/steps/Step6Policies.tsx
'use client';

import React from 'react';
import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateTourPoliciesDTO, CancellationRuleDTO } from '@/types/tour.types';
import { PAYMENT_METHOD, PaymentMethod } from '@/constants/tour.const';
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
  DollarSign,
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { ValidationError } from 'yup';

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

  const formik = useFormik({
    initialValues: {
      cancellationPolicy: initialData.cancellationPolicy || {
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
        // Validate the form before submission
        await Step6PolicySchema.validate(values, { abortEarly: false });

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

  const addCancellationRule = () => {
    const rules = [...(formik.values.cancellationPolicy?.rules || [])];
    const lastRule = rules[rules.length - 1];
    rules.push({
      daysBefore: lastRule ? lastRule.daysBefore + 7 : 0,
      refundPercent: lastRule ? Math.max(lastRule.refundPercent - 20, 0) : 100,
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
    const currentMethods = formik.values.refundPolicy?.method || [];
    const newMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];
    formik.setFieldValue('refundPolicy.method', newMethods);
  };

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

  const ruleVariants = {
    hidden: { opacity: 0, height: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      height: 'auto',
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: {
      opacity: 0,
      height: 0,
      scale: 0.95,
      transition: { duration: 0.2 }
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
        <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-emerald-50/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Policies & Terms
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="pt-6 pb-8 px-6">
          <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
              {/* Cancellation Policy Section */}
              <motion.div variants={itemVariants}>
                <Collapsible open={isCancellationOpen} onOpenChange={setIsCancellationOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-slate-800">Cancellation Policy</h3>
                          <p className="text-sm text-slate-600">Define refund rules and conditions</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isCancellationOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      </motion.div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-4 p-6 bg-slate-50/50 rounded-xl border border-slate-200 space-y-6"
                    >
                      {/* Refundable Toggle */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-slate-500" />
                          <div>
                            <Label className="text-sm font-semibold text-slate-800">Refundable Tour</Label>
                            <p className="text-xs text-slate-600 mt-0.5">Allow customers to request refunds</p>
                          </div>
                        </div>
                        <Switch
                          checked={formik.values.cancellationPolicy?.refundable || true}
                          onCheckedChange={(checked) => formik.setFieldValue('cancellationPolicy.refundable', checked)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>

                      {/* Cancellation Rules */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-slate-500" />
                            <Label className="text-sm font-semibold text-slate-700">Cancellation Rules</Label>
                          </div>
                          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addCancellationRule}
                              className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Plus className="h-4 w-4" />
                              Add Rule
                            </Button>
                          </motion.div>
                        </div>

                        <AnimatePresence mode="popLayout">
                          {formik.values.cancellationPolicy?.rules?.map((rule, index) => (
                            <motion.div
                              key={index}
                              variants={ruleVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                              className="p-4 bg-white rounded-lg border border-slate-200 space-y-3"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline" className="text-xs font-medium">
                                  Rule {index + 1}
                                </Badge>
                                {formik.values.cancellationPolicy?.rules?.length > 1 && (
                                  <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeCancellationRule(index)}
                                      className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </motion.div>
                                )}
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                                    Days Before Tour
                                  </Label>
                                  <Input
                                    type="number"
                                    value={rule.daysBefore}
                                    onChange={(e) => updateCancellationRule(index, 'daysBefore', parseInt(e.target.value))}
                                    className="border-slate-300"
                                    min={0}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                                    <Percent className="h-3.5 w-3.5 text-slate-500" />
                                    Refund Percentage
                                  </Label>
                                  <div className="relative">
                                    <Input
                                      type="number"
                                      value={rule.refundPercent}
                                      onChange={(e) => updateCancellationRule(index, 'refundPercent', parseInt(e.target.value))}
                                      className="border-slate-300 pr-8"
                                      min={0}
                                      max={100}
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">%</span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded-md border border-blue-100">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <p className="text-xs text-blue-700">
                                  Cancel {rule.daysBefore}+ days before → {rule.refundPercent}% refund
                                </p>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>

              {/* Refund Policy Section */}
              <motion.div variants={itemVariants}>
                <Collapsible open={isRefundOpen} onOpenChange={setIsRefundOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-50 border border-purple-100">
                          <CreditCard className="h-5 w-5 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-base font-semibold text-slate-800">Refund Policy</h3>
                          <p className="text-sm text-slate-600">Payment methods and processing time</p>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: isRefundOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-5 w-5 text-slate-500" />
                      </motion.div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-4 p-6 bg-slate-50/50 rounded-xl border border-slate-200 space-y-6"
                    >
                      {/* Payment Methods */}
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-slate-500" />
                          Refund Methods
                        </Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.values(PAYMENT_METHOD).map((method) => {
                            const isSelected = formik.values.refundPolicy?.method?.includes(method);
                            return (
                              <motion.div
                                key={method}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <button
                                  type="button"
                                  onClick={() => togglePaymentMethod(method)}
                                  className={`w-full p-3 rounded-lg border-2 transition-all ${isSelected
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                    }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-purple-500' : 'border-slate-300'
                                      }`}>
                                      {isSelected && (
                                        <motion.div
                                          initial={{ scale: 0 }}
                                          animate={{ scale: 1 }}
                                          className="w-2 h-2 rounded-full bg-purple-500"
                                        />
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">{method}</span>
                                  </div>
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Processing Days */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-slate-500" />
                          Processing Days
                        </Label>
                        <Input
                          type="number"
                          value={formik.values.refundPolicy?.processingDays || 0}
                          onChange={(e) => formik.setFieldValue('refundPolicy.processingDays', parseInt(e.target.value))}
                          className="border-slate-300"
                          min={1}
                          placeholder="7"
                        />
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Info className="h-3.5 w-3.5" />
                          Estimated time to process refund requests
                        </p>
                      </div>
                    </motion.div>
                  </CollapsibleContent>
                </Collapsible>
              </motion.div>

              {/* Terms & Conditions */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-100">
                    <FileText className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold text-slate-800">Terms & Conditions</Label>
                    <p className="text-sm text-slate-600">Detailed terms for this tour</p>
                  </div>
                </div>
                <Textarea
                  name="terms"
                  value={formik.values.terms}
                  onChange={formik.handleChange}
                  placeholder="Enter detailed terms and conditions for this tour..."
                  rows={10}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                />
                {formik.touched.terms && formik.errors.terms && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-red-600 flex items-center gap-1"
                  >
                    <AlertCircle className="h-3 w-3" />
                    {formik.errors.terms}
                  </motion.p>
                )}
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
                        Failed to update policies
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
                        Policies updated successfully
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
                    className="px-8 py-5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/30 transition-all duration-200"
                  >
                    {mutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Update Policies
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