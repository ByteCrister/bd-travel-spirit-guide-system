// app/operations/tours/[tourId]/update-tour/components/steps/Step4Pricing.tsx
'use client';

import { useFormik } from 'formik';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  UpdateTourPricingDTO,
  DiscountDTO,
  OperatingWindowDTO,
  DepartureDTO,
  PriceDTO,
} from '@/types/tour.types';
import { CURRENCY, TOUR_DISCOUNT, PAYMENT_METHOD, Currency, TourDiscount, PaymentMethod } from '@/constants/tour.const';
import { tourUpdateService } from '@/utils/api/tour.update.api';
import { Step4PricingSchema } from '@/utils/validators/tour/add-tour.validator';

// Shadcn Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  AlertCircle,
  Plus,
  Trash2,
  CalendarIcon,
  DollarSign,
  Percent,
  Plane,
  Users,
  MapPin,
  Loader2,
  Check,
  X,
  TrendingDown,
  CalendarDays,
  Timer,
  Wallet,
  Tag,
  Gift,
  Navigation,
  CheckCircle2,
  XCircle,
  Coins,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapPickerDialog } from '@/components/global/MapPickerDialog';

interface Step4PricingProps {
  tourId: string;
  initialData: UpdateTourPricingDTO;
  onUpdateSuccess?: () => void;
}

const discountTypeLabels: Record<TourDiscount, string> = {
  [TOUR_DISCOUNT.SEASONAL]: 'Seasonal',
  [TOUR_DISCOUNT.EARLY_BIRD]: 'Early Bird',
  [TOUR_DISCOUNT.GROUP]: 'Group',
  [TOUR_DISCOUNT.PROMO]: 'Promo Code',
};

const currencyLabels: Record<Currency, string> = {
  [CURRENCY.BDT]: 'BDT (৳)',
  [CURRENCY.USD]: 'USD ($)',
  [CURRENCY.INR]: 'INR (₹)',
};

const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PAYMENT_METHOD.BKASH]: 'bKash',
  [PAYMENT_METHOD.NAGAD]: 'Nagad',
  [PAYMENT_METHOD.CARD]: 'Credit/Debit Card',
  [PAYMENT_METHOD.STRIPE]: 'Stripe',
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.BANK_TRANSFER]: 'Bank Transfer',
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Helper function to format number for display
const formatNumberForDisplay = (value: number | string): string => {
  if (value === '' || value === null || value === undefined) return '';

  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '';

  // For whole numbers, don't show decimal places
  if (Number.isInteger(num)) {
    return num.toString();
  }

  // For decimals, show up to 2 decimal places
  return num.toFixed(2).replace(/\.00$/, '');
};

// Helper function to parse input value to number
const parseInputToNumber = (value: string): number => {
  if (!value || value.trim() === '') return 0;

  // Remove commas and spaces, keep numbers and decimal point
  const cleaned = value.replace(/,/g, '').replace(/\s/g, '');

  // Handle cases like ".5" -> "0.5"
  let normalized = cleaned;
  if (cleaned.startsWith('.')) {
    normalized = '0' + cleaned;
  } else if (cleaned === '.') {
    normalized = '0';
  }

  // Parse as float
  const num = parseFloat(normalized);

  // Return 0 if NaN, otherwise return the number (don't round here)
  return isNaN(num) ? 0 : num;
};

export default function Step4Pricing({ tourId, initialData, onUpdateSuccess }: Step4PricingProps) {
  const queryClient = useQueryClient();
  const [mapDialogOpen, setMapDialogOpen] = useState(false);
  const [editingDepartureIndex, setEditingDepartureIndex] = useState<number | null>(null);

  const [basePriceInput, setBasePriceInput] = useState(
    initialData.basePrice?.amount?.toString() ?? ''
  );

  const mutation = useMutation({
    mutationFn: (data: UpdateTourPricingDTO) =>
      tourUpdateService.updatePricing(tourId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tour', tourId] });
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Pricing & commerce updated successfully');
      onUpdateSuccess?.();
    },
    onError: (error: Error) => {
      toast.error('Failed to update pricing', {
        description: error.message || 'Please try again',
      });
    },
  });

  const formik = useFormik<UpdateTourPricingDTO>({
    initialValues: {
      basePrice: initialData.basePrice ?? { amount: 0, currency: CURRENCY.BDT },
      discounts: initialData.discounts ?? [],
      duration: initialData.duration ?? { days: 1, nights: 0 },
      operatingWindows: initialData.operatingWindows ?? [],
      departures: initialData.departures ?? [],
      paymentMethods: initialData.paymentMethods ?? [PAYMENT_METHOD.BANK_TRANSFER],
    },
    validationSchema: Step4PricingSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: (values) => {
      mutation.mutate(values);
    },
  });

  // Helper function to get nested errors
  const getNestedError = (path: string): string | undefined => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const touched = formik.touched as any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = formik.errors as any;

    const pathParts = path.split('.');
    let currentTouched = touched;
    let currentError = errors;

    for (const part of pathParts) {
      if (currentTouched && currentTouched[part] !== undefined) {
        currentTouched = currentTouched[part];
      } else {
        currentTouched = undefined;
      }

      if (currentError && currentError[part] !== undefined) {
        currentError = currentError[part];
      } else {
        currentError = undefined;
      }
    }

    if (currentTouched && currentError) {
      return currentError.toString();
    }

    return undefined;
  };

  // Base Price management
  const updateBasePrice = (field: keyof PriceDTO, value: unknown) => {
    formik.setFieldValue(`basePrice.${field}`, value);
    formik.setFieldTouched(`basePrice.${field}`, true);
  };

  // Discounts management
  const addDiscount = () => {
    const newDiscount: DiscountDTO = {
      type: TOUR_DISCOUNT.SEASONAL,
      value: 0,
      code: '',
    };
    formik.setFieldValue('discounts', [...(formik.values.discounts ?? []), newDiscount]);
  };

  const removeDiscount = (index: number) => {
    const discounts = [...(formik.values.discounts ?? [])];
    discounts.splice(index, 1);
    formik.setFieldValue('discounts', discounts);
  };

  const updateDiscount = (index: number, field: keyof DiscountDTO, value: unknown) => {
    const discounts = [...(formik.values.discounts ?? [])];

    // Handle discount value parsing
    let processedValue = value;
    if (field === 'value' && typeof value === 'string') {
      processedValue = parseInputToNumber(value);
    }

    discounts[index] = { ...discounts[index], [field]: processedValue };
    formik.setFieldValue('discounts', discounts);
    formik.setFieldTouched(`discounts[${index}].${field}`, true);
  };

  // Operating Windows management
  const addOperatingWindow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const newWindow: OperatingWindowDTO = {
      startDate: tomorrow.toISOString(),
      endDate: nextWeek.toISOString(),
    };
    formik.setFieldValue('operatingWindows', [...(formik.values.operatingWindows ?? []), newWindow]);
  };

  const removeOperatingWindow = (index: number) => {
    const windows = [...(formik.values.operatingWindows ?? [])];
    windows.splice(index, 1);
    formik.setFieldValue('operatingWindows', windows);
  };

  const updateOperatingWindow = (index: number, field: keyof OperatingWindowDTO, value: unknown) => {
    const windows = [...(formik.values.operatingWindows ?? [])];
    windows[index] = { ...windows[index], [field]: value };
    formik.setFieldValue('operatingWindows', windows);
    formik.setFieldTouched(`operatingWindows[${index}].${field}`, true);
  };

  // Departures management
  const addDeparture = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const newDeparture: DepartureDTO = {
      date: tomorrow.toISOString(),
      seatsTotal: 1,
      seatsBooked: 0,
    };
    formik.setFieldValue('departures', [...(formik.values.departures ?? []), newDeparture]);
  };

  const removeDeparture = (index: number) => {
    const departures = [...(formik.values.departures ?? [])];
    departures.splice(index, 1);
    formik.setFieldValue('departures', departures);
  };

  const updateDeparture = (index: number, field: keyof DepartureDTO, value: unknown) => {
    const departures = [...(formik.values.departures ?? [])];

    // Handle numeric field parsing
    let processedValue = value;
    if ((field === 'seatsTotal' || field === 'seatsBooked') && typeof value === 'string') {
      processedValue = parseInt(value) || 0;
    }

    departures[index] = { ...departures[index], [field]: processedValue };
    formik.setFieldValue('departures', departures);
    formik.setFieldTouched(`departures[${index}].${field}`, true);
  };

  // Handle map selection for departure
  const handleMapSelect = (lat: number, lng: number) => {
    if (editingDepartureIndex !== null) {
      const departures = [...(formik.values.departures ?? [])];
      departures[editingDepartureIndex] = {
        ...departures[editingDepartureIndex],
        meetingCoordinates: { lat, lng }
      };
      formik.setFieldValue('departures', departures);
      formik.setFieldTouched(`departures[${editingDepartureIndex}].meetingCoordinates`, true);
    }
  };

  // Payment Methods management
  const handlePaymentMethodToggle = (method: PaymentMethod) => {
    const currentMethods = formik.values.paymentMethods || [];
    const updatedMethods = currentMethods.includes(method)
      ? currentMethods.filter(m => m !== method)
      : [...currentMethods, method];

    formik.setFieldValue('paymentMethods', updatedMethods);
  };

  // Helper to format date for display
  const formatDateForDisplay = (dateString: string): string => {
    try {
      return format(new Date(dateString), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border-2 shadow-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
          <CardHeader className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white border-b-2 border-emerald-600/20">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <CardTitle className="flex items-center gap-3 text-2xl font-bold">
                <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <DollarSign className="h-6 w-6" />
                </div>
                Pricing & Commerce
              </CardTitle>
              <CardDescription className="text-base mt-2 text-emerald-100">
                Configure tour pricing, discounts, operating schedules, and payment methods
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="p-6 bg-white/60">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              <Accordion type="multiple" defaultValue={["basePrice", "duration", "discounts", "operatingWindows", "departures", "paymentMethods"]} className="space-y-4">
                {/* Base Price Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="basePrice" className="border-2 border-emerald-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-emerald-50/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                          <Coins className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Base Price</h3>
                          <p className="text-sm text-slate-500 mt-0.5 font-normal">Set the base pricing for your tour</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice.amount">Amount *</Label>
                  <div className="relative">
                    <Input
                      id="basePrice.amount"
                      type="text"
                      inputMode="decimal"
                      placeholder="0.00"
                      value={basePriceInput}
                      onChange={(e) => {
                        const value = e.target.value;

                        // Allow only numbers + decimal
                        if (!/^\d*\.?\d*$/.test(value)) return;

                        setBasePriceInput(value);
                      }}
                      onBlur={() => {
                        const num = parseFloat(basePriceInput);

                        if (isNaN(num)) {
                          formik.setFieldError('basePrice.amount', 'Amount is required');
                          return;
                        }

                        if (num < 0) {
                          formik.setFieldError('basePrice.amount', 'Amount cannot be negative');
                          return;
                        }

                        // ✅ Save clean number to Formik
                        formik.setFieldValue('basePrice.amount', Number(num.toFixed(2)));
                        formik.setFieldTouched('basePrice.amount', true);
                      }}
                      className={cn(
                        "pr-12",
                        getNestedError('basePrice.amount') && "border-destructive"
                      )}
                    />

                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-muted-foreground">
                        {currencyLabels[(formik.values?.basePrice?.currency ?? CURRENCY.BDT)]?.split(' ')[0] || ''}
                      </span>
                    </div>
                  </div>
                  {getNestedError('basePrice.amount') ? (
                    <p className="text-sm text-destructive">{getNestedError('basePrice.amount')}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter a non-negative number (e.g., 98987 or 98987.50)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="basePrice.currency">Currency *</Label>
                  <Select
                    value={(formik.values?.basePrice?.currency ?? CURRENCY.BDT)}
                    onValueChange={(value) => updateBasePrice('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CURRENCY).map((currency) => (
                        <SelectItem key={currency} value={currency}>
                          {currencyLabels[currency]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {getNestedError('basePrice.currency') && (
                    <p className="text-sm text-destructive">{getNestedError('basePrice.currency')}</p>
                  )}
                </div>
              </div>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                {/* Duration Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="duration" className="border-2 border-teal-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-teal-50/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="p-2 rounded-lg bg-teal-100 text-teal-700">
                          <Timer className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Tour Duration</h3>
                          <p className="text-sm text-slate-500 mt-0.5 font-normal">Specify days and nights for the tour</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration.days">Days *</Label>
                  <Input
                    id="duration.days"
                    name="duration.days"
                    type="number"
                    min="1"
                    placeholder="3"
                    value={formik.values.duration?.days || 1}
                    onChange={(e) => formik.setFieldValue('duration.days', parseInt(e.target.value) || 1)}
                    onBlur={formik.handleBlur}
                    className={getNestedError('duration.days') ? "border-destructive" : ""}
                  />
                  {getNestedError('duration.days') && (
                    <p className="text-sm text-destructive">{getNestedError('duration.days')}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration.nights">Nights</Label>
                  <Input
                    id="duration.nights"
                    name="duration.nights"
                    type="number"
                    min="0"
                    placeholder="2"
                    value={formik.values.duration?.nights || 0}
                    onChange={(e) => formik.setFieldValue('duration.nights', parseInt(e.target.value) || 0)}
                    onBlur={formik.handleBlur}
                    className={getNestedError('duration.nights') ? "border-destructive" : ""}
                  />
                  {getNestedError('duration.nights') && (
                    <p className="text-sm text-destructive">{getNestedError('duration.nights')}</p>
                  )}
                </div>
              </div>
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                {/* Discounts Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="discounts" className="border-2 border-amber-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <AccordionTrigger className="flex-1 hover:no-underline hover:bg-amber-50/50 transition-colors -ml-4">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                            <Tag className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">Discounts & Promotions</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-normal">Create special offers and discount codes</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addDiscount}
                        className="shadow-sm bg-amber-600 hover:bg-amber-700 text-white ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Discount
                      </Button>
                    </div>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >

                        <Accordion type="multiple" className="w-full space-y-2">
                          <AnimatePresence>
                            {(formik.values.discounts ?? []).map((discount, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                <AccordionItem value={`discount-${index}`} className="border-2 border-amber-200 rounded-lg bg-gradient-to-br from-amber-50/50 to-white">
                                  <div className="flex items-center justify-between px-4 py-3 border-b border-amber-200">
                                    <AccordionTrigger className="flex-1 hover:no-underline hover:bg-amber-50/70 -ml-4">
                                      <div className="flex items-center gap-3 flex-1 text-left">
                                        <TrendingDown className="h-4 w-4 text-amber-600" />
                                        <span className="font-semibold text-slate-800">
                                          {discountTypeLabels[discount.type]}: {formatNumberForDisplay(discount.value)}%
                                        </span>
                                        {discount.code && (
                                          <Badge variant="outline" className="ml-2 border-amber-300 text-amber-700 bg-amber-50">
                                            <Gift className="h-3 w-3 mr-1" />
                                            {discount.code}
                                          </Badge>
                                        )}
                                      </div>
                                    </AccordionTrigger>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={removeDiscount.bind(null, index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300 ml-4"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                    <AccordionContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Discount Type *</Label>
                          <Select
                            value={discount.type}
                            onValueChange={(value) => updateDiscount(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.values(TOUR_DISCOUNT).map((type) => (
                                <SelectItem key={type} value={type}>
                                  {discountTypeLabels[type]}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {getNestedError(`discounts[${index}].type`) && (
                            <p className="text-sm text-destructive">{getNestedError(`discounts[${index}].type`)}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Discount Value (%) *</Label>
                          <div className="relative">
                            <Input
                              type="text"
                              inputMode="decimal"
                              placeholder="10.5"
                              value={formatNumberForDisplay(discount.value)}
                              onChange={(e) => updateDiscount(index, 'value', e.target.value)}
                              onBlur={() => {
                                if (discount.value !== undefined) {
                                  // Round to 1 decimal place for percentages
                                  const rounded = Math.round(discount.value * 10) / 10;
                                  updateDiscount(index, 'value', rounded);
                                }
                              }}
                              className={getNestedError(`discounts[${index}].value`) ? "border-destructive" : ""}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Percent className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          {getNestedError(`discounts[${index}].value`) && (
                            <p className="text-sm text-destructive">{getNestedError(`discounts[${index}].value`)}</p>
                          )}
                        </div>
                      </div>

                      {discount.type === TOUR_DISCOUNT.PROMO && (
                        <div className="space-y-2">
                          <Label>Promo Code *</Label>
                          <Input
                            placeholder="SUMMER2024"
                            value={discount.code || ''}
                            onChange={(e) => updateDiscount(index, 'code', e.target.value)}
                            className={getNestedError(`discounts[${index}].code`) ? "border-destructive" : ""}
                          />
                          {getNestedError(`discounts[${index}].code`) && (
                            <p className="text-sm text-destructive">{getNestedError(`discounts[${index}].code`)}</p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Valid From</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !discount.validFrom && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {discount.validFrom ? formatDateForDisplay(discount.validFrom) : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={discount.validFrom ? new Date(discount.validFrom) : undefined}
                                onSelect={(date) => updateDiscount(index, 'validFrom', date?.toISOString())}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {getNestedError(`discounts[${index}].validFrom`) && (
                            <p className="text-sm text-destructive">{getNestedError(`discounts[${index}].validFrom`)}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Valid Until</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !discount.validUntil && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {discount.validUntil ? formatDateForDisplay(discount.validUntil) : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">

                              <Calendar
                                mode="single"
                                selected={discount.validUntil ? new Date(discount.validUntil) : undefined}
                                onSelect={(date) =>
                                  updateDiscount(index, 'validUntil', date?.toISOString())
                                }
                                disabled={(date) => {
                                  const today = new Date();
                                  today.setHours(0, 0, 0, 0);

                                  const isBeforeToday = date < today;
                                  const isBeforeValidFrom =
                                    discount.validFrom
                                      ? date < new Date(discount.validFrom)
                                      : false;

                                  return isBeforeToday || isBeforeValidFrom;
                                }}
                                initialFocus
                              />

                            </PopoverContent>
                          </Popover>
                          {getNestedError(`discounts[${index}].validUntil`) && (
                            <p className="text-sm text-destructive">{getNestedError(`discounts[${index}].validUntil`)}</p>
                          )}
                        </div>
                      </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </Accordion>

                        {(formik.values.discounts ?? []).length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 border-2 border-dashed border-amber-300 rounded-lg bg-gradient-to-br from-amber-50/50 to-white hover:from-amber-50 hover:to-amber-50/50 transition-all"
                          >
                            <div className="p-3 rounded-full bg-amber-100 w-fit mx-auto mb-4">
                              <Tag className="h-8 w-8 text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-2">No discounts added</h4>
                            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                              Create special offers and promotional codes to attract more customers
                            </p>
                            <Button
                              type="button"
                              variant="default"
                              onClick={addDiscount}
                              className="shadow-md bg-amber-600 hover:bg-amber-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Discount
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                {/* Operating Windows Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="operatingWindows" className="border-2 border-blue-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <AccordionTrigger className="flex-1 hover:no-underline hover:bg-blue-50/50 transition-colors -ml-4">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                            <CalendarDays className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">Operating Windows</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-normal">Define available booking periods</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addOperatingWindow}
                        className="shadow-sm bg-blue-600 hover:bg-blue-700 text-white ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Window
                      </Button>
                    </div>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >

                        <AnimatePresence>
                          {(formik.values.operatingWindows ?? []).map((window, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card className="border-2 border-blue-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <CalendarDays className="h-4 w-4 text-blue-600" />
                                      <span className="font-semibold text-slate-800">Window {index + 1}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeOperatingWindow(index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Start Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !window.startDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {window.startDate ? formatDateForDisplay(window.startDate) : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={new Date(window.startDate)}
                                onSelect={(date) => updateOperatingWindow(index, 'startDate', date?.toISOString())}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {getNestedError(`operatingWindows[${index}].startDate`) && (
                            <p className="text-sm text-destructive">{getNestedError(`operatingWindows[${index}].startDate`)}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>End Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !window.endDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {window.endDate ? formatDateForDisplay(window.endDate) : "Select date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={new Date(window.endDate)}
                                onSelect={(date) => updateOperatingWindow(index, 'endDate', date?.toISOString())}
                                disabled={(date) =>
                                  date < new Date(new Date().setHours(0, 0, 0, 0)) ||
                                  date < new Date(window.startDate)
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          {getNestedError(`operatingWindows[${index}].endDate`) && (
                            <p className="text-sm text-destructive">{getNestedError(`operatingWindows[${index}].endDate`)}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`operatingWindows[${index}].seatsTotal`}>Total Seats</Label>
                        <Input
                          id={`operatingWindows[${index}].seatsTotal`}
                          type="number"
                          min="0"
                          placeholder="50"
                          value={window.seatsTotal || ''}
                          onChange={(e) => updateOperatingWindow(index, 'seatsTotal', parseInt(e.target.value) || 0)}
                          className={getNestedError(`operatingWindows[${index}].seatsTotal`) ? "border-destructive" : ""}
                        />
                        {getNestedError(`operatingWindows[${index}].seatsTotal`) && (
                          <p className="text-sm text-destructive">{getNestedError(`operatingWindows[${index}].seatsTotal`)}</p>
                        )}
                      </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {(formik.values.operatingWindows ?? []).length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 border-2 border-dashed border-blue-300 rounded-lg bg-gradient-to-br from-blue-50/50 to-white hover:from-blue-50 hover:to-blue-50/50 transition-all"
                          >
                            <div className="p-3 rounded-full bg-blue-100 w-fit mx-auto mb-4">
                              <CalendarDays className="h-8 w-8 text-blue-600" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-2">No operating windows added</h4>
                            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                              Define time periods when your tour is available for booking
                            </p>
                            <Button
                              type="button"
                              variant="default"
                              onClick={addOperatingWindow}
                              className="shadow-md bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Window
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                {/* Departures Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="departures" className="border-2 border-purple-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b">
                      <AccordionTrigger className="flex-1 hover:no-underline hover:bg-purple-50/50 transition-colors -ml-4">
                        <div className="flex items-center gap-3 flex-1 text-left">
                          <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                            <Plane className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-800">Departure Schedules</h3>
                            <p className="text-sm text-slate-500 mt-0.5 font-normal">Schedule specific departure dates and times</p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={addDeparture}
                        className="shadow-sm bg-purple-600 hover:bg-purple-700 text-white ml-4"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Departure
                      </Button>
                    </div>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >

                        <AnimatePresence>
                          {(formik.values.departures ?? []).map((departure, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Card className="border-2 border-purple-200 shadow-md hover:shadow-lg transition-all bg-gradient-to-br from-purple-50/50 to-white">
                                <CardContent className="p-4 space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Navigation className="h-4 w-4 text-purple-600" />
                                      <span className="font-semibold text-slate-800">Departure {index + 1}</span>
                                    </div>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeDeparture(index)}
                                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 hover:border-red-300"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>

                      <div className="space-y-2">
                        <Label>Departure Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !departure.date && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {departure.date ? formatDateForDisplay(departure.date) : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={new Date(departure.date)}
                              onSelect={(date) => updateDeparture(index, 'date', date?.toISOString())}
                              disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {getNestedError(`departures[${index}].date`) && (
                          <p className="text-sm text-destructive">{getNestedError(`departures[${index}].date`)}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`departures[${index}].seatsTotal`}>Total Seats *</Label>
                          <div className="relative">
                            <Input
                              id={`departures[${index}].seatsTotal`}
                              type="number"
                              min="1"
                              placeholder="20"
                              value={departure.seatsTotal}
                              onChange={(e) => updateDeparture(index, 'seatsTotal', e.target.value)}
                              className={getNestedError(`departures[${index}].seatsTotal`) ? "border-destructive" : ""}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          {getNestedError(`departures[${index}].seatsTotal`) && (
                            <p className="text-sm text-destructive">{getNestedError(`departures[${index}].seatsTotal`)}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`departures[${index}].meetingPoint`}>Meeting Point</Label>
                          <div className="relative">
                            <Input
                              id={`departures[${index}].meetingPoint`}
                              placeholder="Hotel lobby, airport gate, etc."
                              value={departure.meetingPoint || ''}
                              onChange={(e) => updateDeparture(index, 'meetingPoint', e.target.value)}
                              className={getNestedError(`departures[${index}].meetingPoint`) ? "border-destructive" : ""}
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </div>
                          {getNestedError(`departures[${index}].meetingPoint`) && (
                            <p className="text-sm text-destructive">{getNestedError(`departures[${index}].meetingPoint`)}</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Meeting Coordinates</Label>
                        <div className="flex gap-2">
                          <Input
                            type="text"
                            placeholder="Latitude, Longitude"
                            value={
                              departure.meetingCoordinates?.lat && departure.meetingCoordinates?.lng
                                ? `${departure.meetingCoordinates.lat.toFixed(6)}, ${departure.meetingCoordinates.lng.toFixed(6)}`
                                : ''
                            }
                            readOnly
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditingDepartureIndex(index);
                              setMapDialogOpen(true);
                            }}
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                        {getNestedError(`departures[${index}].meetingCoordinates`) && (
                          <p className="text-sm text-destructive">{getNestedError(`departures[${index}].meetingCoordinates`)}</p>
                        )}
                      </div>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {(formik.values.departures ?? []).length === 0 && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 border-2 border-dashed border-purple-300 rounded-lg bg-gradient-to-br from-purple-50/50 to-white hover:from-purple-50 hover:to-purple-50/50 transition-all"
                          >
                            <div className="p-3 rounded-full bg-purple-100 w-fit mx-auto mb-4">
                              <Plane className="h-8 w-8 text-purple-600" />
                            </div>
                            <h4 className="font-semibold text-slate-800 mb-2">No departure schedules added</h4>
                            <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
                              Schedule specific dates and times when your tour will depart
                            </p>
                            <Button
                              type="button"
                              variant="default"
                              onClick={addDeparture}
                              className="shadow-md bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add First Departure
                            </Button>
                          </motion.div>
                        )}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>

                {/* Payment Methods Section */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AccordionItem value="paymentMethods" className="border-2 border-indigo-200 rounded-lg bg-white shadow-md overflow-hidden">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-indigo-50/50 transition-colors">
                      <div className="flex items-center gap-3 flex-1 text-left">
                        <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700">
                          <Wallet className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-800">Payment Methods *</h3>
                          <p className="text-sm text-slate-500 mt-0.5 font-normal">Select accepted payment options</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-6 pt-2">
                      <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-4"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                          {Object.values(PAYMENT_METHOD).map((method) => {
                            const isSelected = (formik.values.paymentMethods ?? []).includes(method);
                            return (
                              <motion.div
                                key={method}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                  flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all
                                  ${isSelected
                                    ? 'border-indigo-500 bg-indigo-50 shadow-md'
                                    : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                                  }
                                `}
                              >
                                <Checkbox
                                  id={`payment-${method}`}
                                  checked={isSelected}
                                  onCheckedChange={() => handlePaymentMethodToggle(method)}
                                  className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                />
                                <Label
                                  htmlFor={`payment-${method}`}
                                  className={`text-sm font-medium cursor-pointer flex-1 ${
                                    isSelected ? 'text-indigo-900' : 'text-slate-700'
                                  }`}
                                >
                                  {paymentMethodLabels[method]}
                                </Label>
                                {isSelected && (
                                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                )}
                              </motion.div>
                            );
                          })}
                        </div>
                        {formik.touched.paymentMethods && formik.errors.paymentMethods && (
                          <Alert variant="destructive" className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {formik.errors.paymentMethods as string}
                            </AlertDescription>
                          </Alert>
                        )}
                      </motion.div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              </Accordion>

              {/* Error/Success Alerts */}
              <AnimatePresence>
                {mutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert variant="destructive" className="border-red-300 bg-red-50 shadow-md">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription className="font-medium">
                        Failed to update pricing: {mutation.error.message}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {mutation.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert className="border-emerald-300 bg-emerald-50 shadow-md">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <AlertDescription className="font-medium text-emerald-800">
                        Pricing & commerce updated successfully
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <CardFooter className="border-t-2 border-slate-300 px-6 py-5 bg-gradient-to-r from-slate-100 via-emerald-50 to-slate-100 mt-6">
                <div className="flex items-center justify-between w-full">
                  <div className="text-sm">
                    {Object.keys(formik.errors).length > 0 && (
                      <Alert variant="destructive" className="py-2 px-4 inline-flex items-center gap-2 border-red-300 bg-red-50">
                        <X className="h-4 w-4" />
                        <span className="font-medium text-red-800">
                          {Object.keys(formik.errors).length} validation issue(s) found
                        </span>
                      </Alert>
                    )}
                    {Object.keys(formik.errors).length === 0 && (
                      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-200">
                        <Check className="h-4 w-4" />
                        <span className="font-medium">All fields validated</span>
                      </div>
                    )}
                  </div>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={mutation.isPending || !formik.isValid}
                      className="min-w-[220px] shadow-lg hover:shadow-xl transition-all bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-semibold"
                      size="lg"
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Update Pricing & Commerce
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </CardFooter>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      <MapPickerDialog
        open={mapDialogOpen}
        onClose={() => {
          setMapDialogOpen(false);
          setEditingDepartureIndex(null);
        }}
        onSelect={handleMapSelect}
        initialPosition={
          editingDepartureIndex !== null &&
            formik.values.departures?.[editingDepartureIndex]?.meetingCoordinates
            ? [
              formik.values.departures[editingDepartureIndex].meetingCoordinates!.lat,
              formik.values.departures[editingDepartureIndex].meetingCoordinates!.lng
            ]
            : undefined
        }
      />
    </>
  );
}